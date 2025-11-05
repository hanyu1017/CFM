// src/app/api/report/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // 獲取公司資料
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: '請先建立公司資料', success: false },
        { status: 400 }
      );
    }

    // 生成示範 PDF URL（實際應該生成真實的 PDF 檔案）
    const pdfFileName = `report_${Date.now()}.pdf`;
    const pdfUrl = `/api/report/download/${pdfFileName}`;

    // 建立報告
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: config.title,
        reportPeriod: config.period,
        startDate: new Date(config.startDate),
        endDate: new Date(config.endDate),
        status: 'DRAFT',
        executiveSummary: config.includeExecutiveSummary
          ? `本報告書涵蓋 ${config.period} 期間之永續發展成果。`
          : undefined,
        carbonFootprint: config.includeCarbonFootprint
          ? { summary: '碳足跡分析' }
          : undefined,
        emissionsSummary: config.includeEmissionsSummary
          ? { scope1: 0, scope2: 0, scope3: 0 }
          : undefined,
        reductionTargets: config.includeReductionTargets
          ? { targets: [] }
          : undefined,
        initiatives: config.includeInitiatives
          ? { list: [] }
          : undefined,
        compliance: config.includeCompliance
          ? { standards: [] }
          : undefined,
        financialImpact: config.includeFinancialImpact
          ? { investment: 0 }
          : undefined,
        stakeholders: config.includeStakeholders
          ? { groups: [] }
          : undefined,
        pdfUrl,
        generatedBy: 'MANUAL',
      },
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        pdfUrl: report.pdfUrl,
      },
      success: true,
      message: '報告已成功生成！您可以在報告歷史中查看和下載。',
    });
  } catch (error) {
    console.error('Generate report API error:', error);
    return NextResponse.json(
      { error: '生成報告失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
