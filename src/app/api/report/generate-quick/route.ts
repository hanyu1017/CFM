// src/app/api/report/generate-quick/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

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
      }
    });

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

    // 發送 webhook 通知
    try {
      const webhookUrl = 'https://primary-production-94491.up.railway.app/webhook-test/68b2cbd2-2114-4693-9b39-64bcf9dc3a16';
      const webhookPayload = {
        event: 'report.generated',
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

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        console.log('Webhook notification sent successfully');
      } else {
        console.error('Webhook notification failed:', webhookResponse.status, webhookResponse.statusText);
      }
    } catch (webhookError) {
      // Webhook 失敗不影響主要功能
      console.error('Failed to send webhook notification:', webhookError);
    }

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
        pdfUrl: report.pdfUrl,
      },
      success: true,
      message: '報告已成功生成！',
    });
  } catch (error) {
    console.error('Quick report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', success: false },
      { status: 500 }
    );
  }
}