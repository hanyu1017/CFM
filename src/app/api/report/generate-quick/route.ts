// src/app/api/report/generate-quick/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 格式化日期為 YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function POST(request: NextRequest) {
  try {
    // 自動使用上個月的資料
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    // 計算上個月的開始和結束日期
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log('=== 報告生成開始 ===');
    console.log('查詢期間:', {
      year,
      month,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    });

    // 獲取或創建默認公司
    let company = await prisma.company.findFirst();

    if (!company) {
      // 如果沒有公司記錄，創建一個默認公司
      company = await prisma.company.create({
        data: {
          id: 'default',
          name: '預設公司',
          industry: '未設定',
        }
      });
    }

    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`找到 ${carbonData.length} 筆碳排放數據`);

    const totalEmissions = carbonData.reduce((sum: number, item: { totalCarbon: number }) => sum + item.totalCarbon, 0);

    // 生成 PDF 檔案名稱和 URL
    const pdfFileName = `report_${year}_${String(month).padStart(2, '0')}_${Date.now()}.pdf`;
    const pdfUrl = `/api/report/download/${pdfFileName}`;

    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: `${year}年${month}月永續報告書`,
        reportPeriod: `${year}-${String(month).padStart(2, '0')}`,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: `本月總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e。`,
        generatedBy: 'AUTO',
        pdfUrl,
      }
    });

    // 發送 webhook 通知並等待回應
    let webhookData = null;
    try {
      const webhookUrl = 'https://primary-production-94491.up.railway.app/webhook-test/27370e56-64bd-4b60-aa48-d128d3db7049';
      const webhookPayload = {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        event: 'report.generated',
        type: 'quick',
        year: year,
        month: month,
        report: {
          id: report.id,
          title: report.title,
          period: report.reportPeriod,
          status: report.status,
          createdAt: report.createdAt.toISOString(),
          pdfUrl: report.pdfUrl,
          totalEmissions: totalEmissions.toFixed(2),
          dataCount: carbonData.length,
        },
        company: {
          id: company.id,
          name: company.name,
        },
        timestamp: new Date().toISOString(),
      };

      console.log('=== 發送 Webhook ===');
      console.log('URL:', webhookUrl);
      console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      console.log('=== Webhook 回應 ===');
      console.log('狀態碼:', webhookResponse.status);
      console.log('狀態文字:', webhookResponse.statusText);

      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text();
        console.log('回應內容:', responseText);

        try {
          webhookData = JSON.parse(responseText);
          console.log('解析後的回應資料:', JSON.stringify(webhookData, null, 2));
        } catch (parseError) {
          console.log('回應內容無法解析為 JSON，使用原始文字');
          webhookData = { rawResponse: responseText };
        }

        // 更新報告，將 webhook 資料儲存為 JSON
        await prisma.sustainabilityReport.update({
          where: { id: report.id },
          data: {
            carbonFootprint: webhookData || { webhookReceived: true },
          }
        });

        console.log('✅ Webhook 通知發送成功，資料已儲存到報告中');
      } else {
        const errorText = await webhookResponse.text();
        console.error('❌ Webhook 通知失敗');
        console.error('錯誤回應:', errorText);
      }
    } catch (webhookError) {
      // Webhook 失敗不影響主要功能
      console.error('❌ Webhook 發送異常:', webhookError);
    }

    console.log('=== 報告生成完成 ===');

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
        pdfUrl: report.pdfUrl,
        webhookData: webhookData,
      },
      success: true,
      message: '報告已成功生成！',
    });
  } catch (error) {
    console.error('❌ 快速報告生成錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', success: false },
      { status: 500 }
    );
  }
}