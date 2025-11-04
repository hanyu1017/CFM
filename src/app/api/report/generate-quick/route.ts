// src/app/api/report/generate-quick/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    const totalEmissions = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);

    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: 'default',
        title: `${year}年${month}月永續報告書`,
        reportPeriod: `${year}-${String(month).padStart(2, '0')}`,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: `本月總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e。`,
        generatedBy: 'AUTO',
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
    console.error('Quick report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', success: false },
      { status: 500 }
    );
  }
}