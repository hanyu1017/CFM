// src/app/api/report/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 格式化日期為 YYYY-MM-DD
function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
        generatedBy: 'MANUAL',
      },
    });

    console.log('✅ 報告已建立，ID:', report.id);
    console.log('📝 提示：Webhook 將在 PDF 生成時調用');

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
      },
      success: true,
      message: '報告已成功生成！',
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
