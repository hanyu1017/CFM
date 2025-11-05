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

    // 獲取碳排放數據以生成報告內容
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);

    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    // 計算統計數據
    const totalEmissions = carbonData.reduce((sum, item) => sum + Number(item.totalCarbon), 0);
    const scope1Total = carbonData.reduce((sum, item) => sum + Number(item.scope1), 0);
    const scope2Total = carbonData.reduce((sum, item) => sum + Number(item.scope2), 0);
    const scope3Total = carbonData.reduce((sum, item) => sum + Number(item.scope3), 0);

    // 生成示範 PDF URL（實際應該生成真實的 PDF 檔案）
    const pdfFileName = `report_${Date.now()}.pdf`;
    const pdfUrl = `/api/report/download/${pdfFileName}`;

    // 建立報告
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: config.title,
        reportPeriod: config.period,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: config.includeExecutiveSummary
          ? `本報告書涵蓋 ${config.period} 期間之永續發展成果。期間內總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e，展現本公司對環境永續發展的承諾與努力。`
          : undefined,
        carbonFootprint: config.includeCarbonFootprint
          ? `本期間碳足跡分析顯示總排放量為 ${totalEmissions.toFixed(2)} tCO2e。主要排放源包括直接排放、能源使用及供應鏈活動。`
          : undefined,
        emissionsSummary: config.includeEmissionsSummary
          ? `範疇一（直接排放）：${scope1Total.toFixed(2)} tCO2e（${totalEmissions > 0 ? (scope1Total/totalEmissions*100).toFixed(1) : 0}%）\n範疇二（能源間接排放）：${scope2Total.toFixed(2)} tCO2e（${totalEmissions > 0 ? (scope2Total/totalEmissions*100).toFixed(1) : 0}%）\n範疇三（其他間接排放）：${scope3Total.toFixed(2)} tCO2e（${totalEmissions > 0 ? (scope3Total/totalEmissions*100).toFixed(1) : 0}%）`
          : undefined,
        reductionTargets: config.includeReductionTargets
          ? `本公司承諾在2030年前減少30%的碳排放量，並於2050年達成淨零排放目標。短期目標包括提升能源效率、增加再生能源使用比例。`
          : undefined,
        initiatives: config.includeInitiatives
          ? `已實施的永續措施包括：導入能源管理系統、推動綠色採購政策、優化生產流程、實施廢棄物減量計畫。`
          : undefined,
        compliance: config.includeCompliance
          ? `本公司嚴格遵守環境保護相關法規，包括溫室氣體盤查標準、環境影響評估規定，並符合國際永續報告標準。`
          : undefined,
        financialImpact: config.includeFinancialImpact
          ? `永續投資帶來能源成本降低、營運效率提升及品牌價值增加。預期長期將帶來顯著的財務效益與競爭優勢。`
          : undefined,
        stakeholders: config.includeStakeholders
          ? `本公司持續與員工、客戶、供應商、投資人及社區等利害關係人溝通，共同推動永續發展目標，建立夥伴關係。`
          : undefined,
        totalEmissions,
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
