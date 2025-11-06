// src/app/api/carbon/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 禁用路由緩存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 獲取或創建默認公司
    let company = await prisma.company.findFirst();

    if (!company) {
      company = await prisma.company.create({
        data: {
          id: 'default',
          name: '預設公司',
          industry: '未設定',
        }
      });
    }

    // 構建查詢條件
    const where: any = {
      companyId: company.id,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 查詢總數
    const total = await prisma.carbonEmission.count({ where });

    // 查詢數據
    const data = await prisma.carbonEmission.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data,
      total,
      limit,
    });
  } catch (error) {
    console.error('List carbon data error:', error);
    return NextResponse.json(
      { error: '獲取碳排放數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
