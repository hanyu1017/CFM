// src/app/api/report/list/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 禁用路由緩存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - 取得所有報告
export async function GET() {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json([]);
    }

    const reports = await prisma.sustainabilityReport.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: '取得報告列表失敗',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : typeof error
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
