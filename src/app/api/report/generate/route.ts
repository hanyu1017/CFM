// src/app/api/report/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

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

    // 獲取日期區間的碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: {
          gte: new Date(config.startDate),
          lte: new Date(config.endDate),
        }
      }
    });

    const totalEmissions = carbonData.reduce((sum: number, item: { totalCarbon: number }) => sum + item.totalCarbon, 0);

    // 發送 webhook 通知
    try {
      const webhookUrl = 'https://primary-production-94491.up.railway.app/webhook-test/27370e56-64bd-4b60-aa48-d128d3db7049';
      const webhookPayload = {
        event: 'report.generated',
        type: 'custom', // 自定義生成
        dateRange: {
          startDate: config.startDate,
          endDate: config.endDate,
          period: config.period,
        },
        report: {
          id: report.id,
          title: report.title,
          period: report.reportPeriod,
          status: report.status,
          createdAt: report.createdAt.toISOString(),
          pdfUrl: report.pdfUrl,
          totalEmissions: totalEmissions.toFixed(2),
          dataCount: carbonData.length,
          sections: {
            executiveSummary: config.includeExecutiveSummary,
            carbonFootprint: config.includeCarbonFootprint,
            emissionsSummary: config.includeEmissionsSummary,
            reductionTargets: config.includeReductionTargets,
            initiatives: config.includeInitiatives,
            compliance: config.includeCompliance,
            financialImpact: config.includeFinancialImpact,
            stakeholders: config.includeStakeholders,
          },
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
