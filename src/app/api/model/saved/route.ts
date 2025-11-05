// src/app/api/model/saved/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 取得所有已儲存的模型
export async function GET() {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json([]);
    }

    const models = await prisma.modelParameter.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        results: {
          orderBy: {
            calculatedAt: 'desc',
          },
          take: 1, // 只取最新的一筆結果
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error('Get saved models error:', error);
    return NextResponse.json(
      { error: '取得已儲存模型失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
