// src/app/api/report/generate/route.ts
// 自定義報告生成 API - 使用 OpenAI 生成內容並產生 PDF

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateReportContent } from '@/lib/ai-content-generator';
import { generatePDF, savePDF } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    console.log('📝 開始生成自定義報告：', config.title);

    // ① 獲取公司資料
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: '請先建立公司資料', success: false },
        { status: 400 }
      );
    }

    console.log('🏢 公司資料：', company.name);

    // ② 查詢指定時間範圍的碳排放數據
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);

    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    if (carbonData.length === 0) {
      return NextResponse.json({
        error: `所選時間範圍（${config.startDate} 至 ${config.endDate}）內無碳排放數據`,
        success: false,
      }, { status: 400 });
    }

    console.log(`📊 查詢到 ${carbonData.length} 筆碳排放數據`);

    // ③ 計算統計數據
    const totalEmissions = carbonData.reduce((sum, item) => sum + Number(item.totalCarbon), 0);
    const avgEmissions = totalEmissions / carbonData.length;
    const scope1Total = carbonData.reduce((sum, item) => sum + Number(item.scope1), 0);
    const scope2Total = carbonData.reduce((sum, item) => sum + Number(item.scope2), 0);
    const scope3Total = carbonData.reduce((sum, item) => sum + Number(item.scope3), 0);
    const electricityTotal = carbonData.reduce((sum, item) => sum + Number(item.electricity || 0), 0);
    const naturalGasTotal = carbonData.reduce((sum, item) => sum + Number(item.naturalGas || 0), 0);
    const fuelTotal = carbonData.reduce((sum, item) => sum + Number(item.fuel || 0), 0);

    console.log(`💨 總碳排放量：${totalEmissions.toFixed(2)} tCO2e`);

    // ④ 使用 OpenAI 生成報告內容
    console.log('🤖 調用 AI 生成報告內容...');

    const reportContent = await generateReportContent({
      companyName: company.name,
      period: config.period,
      startDate: config.startDate,
      endDate: config.endDate,
      totalEmissions,
      avgEmissions,
      scope1Total,
      scope2Total,
      scope3Total,
      electricityTotal,
      naturalGasTotal,
      fuelTotal
    });

    console.log('✅ AI 內容生成完成');

    // ⑤ 生成 PDF 文件
    console.log('📄 生成 PDF 文件...');

    const pdfBuffer = await generatePDF({
      company: {
        name: company.name,
        industry: company.industry || undefined,
        address: company.address || undefined
      },
      reportInfo: {
        title: config.title,
        period: config.period,
        startDate: config.startDate,
        endDate: config.endDate
      },
      carbonData: {
        totalEmissions,
        scope1Total,
        scope2Total,
        scope3Total,
        avgEmissions,
        electricityTotal,
        naturalGasTotal,
        fuelTotal
      },
      content: reportContent
    });

    // ⑥ 儲存 PDF 文件
    const pdfFileName = `report_${Date.now()}.pdf`;
    const pdfUrl = await savePDF(pdfBuffer, pdfFileName);

    console.log(`💾 PDF 已儲存：${pdfUrl}`);

    // ⑦ 儲存報告到資料庫
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: config.title,
        reportPeriod: config.period,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: reportContent.executiveSummary,
        carbonFootprint: reportContent.carbonFootprint,
        emissionsSummary: reportContent.emissionsSummary,
        reductionTargets: reportContent.reductionTargets,
        initiatives: reportContent.initiatives,
        compliance: reportContent.compliance,
        financialImpact: reportContent.financialImpact,
        stakeholders: reportContent.stakeholders,
        totalEmissions,
        pdfUrl,
        generatedBy: 'AI_CUSTOM',
      },
    });

    console.log('✅ 報告生成完成：', report.id);

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        pdfUrl: report.pdfUrl,
        totalEmissions: totalEmissions.toFixed(2),
      },
      success: true,
      message: `報告已成功生成！總碳排放量：${totalEmissions.toFixed(2)} tCO2e`,
    });

  } catch (error) {
    console.error('❌ Generate report API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '生成報告失敗',
        success: false
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
