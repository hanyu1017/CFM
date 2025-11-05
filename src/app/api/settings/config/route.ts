// src/app/api/settings/config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 取得所有系統設定
export async function GET() {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json([]);
    }

    const settings = await prisma.companySetting.findMany({
      where: {
        companyId: company.id,
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: '取得系統設定失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
