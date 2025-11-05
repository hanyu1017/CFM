// src/app/api/settings/targets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 取得所有減排目標
export async function GET() {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json([]);
    }

    const targets = await prisma.emissionTarget.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        targetYear: 'asc',
      },
    });

    return NextResponse.json(targets);
  } catch (error) {
    console.error('Get targets error:', error);
    return NextResponse.json(
      { error: '取得減排目標失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - 新增減排目標
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetYear,
      targetType,
      baselineYear,
      baselineValue,
      targetValue,
      description,
      status,
    } = body;

    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json(
        { error: '請先建立公司資料' },
        { status: 400 }
      );
    }

    const target = await prisma.emissionTarget.create({
      data: {
        companyId: company.id,
        targetYear: parseInt(targetYear),
        targetType,
        baselineYear: parseInt(baselineYear),
        baselineValue: parseFloat(baselineValue),
        targetValue: parseFloat(targetValue),
        description,
        status,
      },
    });

    return NextResponse.json(target);
  } catch (error) {
    console.error('Create target error:', error);
    return NextResponse.json(
      { error: '新增減排目標失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
