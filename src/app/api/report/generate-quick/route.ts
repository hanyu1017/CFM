// src/app/api/report/generate-quick/route.ts
// 一鍵快速報告生成 API - 使用上個月數據，OpenAI 生成內容並產生 PDF

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateReportContent } from '@/lib/ai-content-generator';
import { generatePDF, savePDF } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json();

    console.log(`📝 開始生成快速報告：${year}年${month}月`);

    // ① 設定日期範圍（指定月份的1號到月底）
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // ② 查詢公司資料
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({
        error: '尚無公司資料，請先建立公司資訊',
        success: false,
      }, { status: 400 });
    }

    console.log('🏢 公司資料：', company.name);

    // ③ 查詢碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    if (carbonData.length === 0) {
      return NextResponse.json({
        error: `${year}年${month}月無碳排放數據，請確認資料庫中有該期間的數據`,
        success: false,
      }, { status: 400 });
    }

    console.log(`📊 查詢到 ${carbonData.length} 筆碳排放數據`);

    // ④ 計算碳排放統計數據
    const totalEmissions = carbonData.reduce((sum, item) => sum + Number(item.totalCarbon), 0);
    const avgEmissions = totalEmissions / carbonData.length;
    const scope1Total = carbonData.reduce((sum, item) => sum + Number(item.scope1), 0);
    const scope2Total = carbonData.reduce((sum, item) => sum + Number(item.scope2), 0);
    const scope3Total = carbonData.reduce((sum, item) => sum + Number(item.scope3), 0);
    const electricityTotal = carbonData.reduce((sum, item) => sum + Number(item.electricity || 0), 0);
    const naturalGasTotal = carbonData.reduce((sum, item) => sum + Number(item.naturalGas || 0), 0);
    const fuelTotal = carbonData.reduce((sum, item) => sum + Number(item.fuel || 0), 0);

    console.log(`💨 總碳排放量：${totalEmissions.toFixed(2)} tCO2e`);

    // ⑤ 使用 OpenAI 生成報告內容
    console.log('🤖 調用 AI 生成報告內容...');

    const reportContent = await generateReportContent({
      companyName: company.name,
      period: `${year}年${month}月`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
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

    // ⑥ 生成 PDF 文件
    console.log('📄 生成 PDF 文件...');

    const reportTitle = `${company.name} ${year}年${month}月永續發展報告`;

    const pdfBuffer = await generatePDF({
      company: {
        name: company.name,
        industry: company.industry || undefined,
        address: company.address || undefined
      },
      reportInfo: {
        title: reportTitle,
        period: `${year}年${month}月`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
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

    // ⑦ 儲存 PDF 文件
    const pdfFileName = `report_${year}_${String(month).padStart(2, '0')}_${Date.now()}.pdf`;
    const pdfUrl = await savePDF(pdfBuffer, pdfFileName);

    console.log(`💾 PDF 已儲存：${pdfUrl}`);

    // ⑧ 儲存報告到資料庫
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: reportTitle,
        reportPeriod: `${year}-${String(month).padStart(2, '0')}`,
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
        generatedBy: 'AI_QUICK',
      },
    });

    console.log('✅ 報告生成完成：', report.id);

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
        pdfUrl: report.pdfUrl,
        totalEmissions: totalEmissions.toFixed(2),
      },
      message: `報告已成功生成！總碳排放量：${totalEmissions.toFixed(2)} tCO2e`,
      success: true,
    });

  } catch (error) {
    console.error('❌ Quick report API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '報告生成失敗，請檢查設定或稍後再試',
      success: false,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
