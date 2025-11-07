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
      }
    });

    console.log('✅ 報告已建立，ID:', report.id);
    console.log('📝 提示：Webhook 將在 PDF 生成時調用，避免重複調用');

    console.log('=== 報告生成完成 ===');

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
        totalEmissions: totalEmissions.toFixed(2),
        dataCount: carbonData.length,
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