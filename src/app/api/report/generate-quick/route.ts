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