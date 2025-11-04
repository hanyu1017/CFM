// src/app/api/report/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: 'default',
        title: config.title,
        reportPeriod: config.period,
        startDate: new Date(config.startDate),
        endDate: new Date(config.endDate),
        status: 'DRAFT',
        executiveSummary: config.includeExecutiveSummary ? '報告摘要...' : null,
        generatedBy: 'MANUAL',
      }
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
      },
      success: true,
    });
  } catch (error) {
    console.error('Generate report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', success: false },
      { status: 500 }
    );
  }
}