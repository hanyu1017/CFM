// src/app/api/settings/targets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - 更新減排目標
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const target = await prisma.emissionTarget.update({
      where: { id: params.id },
      data: {
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
    console.error('Update target error:', error);
    return NextResponse.json(
      { error: '更新減排目標失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - 刪除減排目標
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.emissionTarget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: '已刪除減排目標' });
  } catch (error) {
    console.error('Delete target error:', error);
    return NextResponse.json(
      { error: '刪除減排目標失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
