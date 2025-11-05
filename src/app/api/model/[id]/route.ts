// src/app/api/model/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 取得單一模型
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const model = await prisma.modelParameter.findUnique({
      where: { id: params.id },
      include: {
        results: {
          orderBy: {
            calculatedAt: 'desc',
          },
        },
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: '找不到該模型' },
        { status: 404 }
      );
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error('Get model error:', error);
    return NextResponse.json(
      { error: '取得模型失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - 刪除模型
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.modelParameter.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '模型已刪除',
    });
  } catch (error) {
    console.error('Delete model error:', error);
    return NextResponse.json(
      { error: '刪除模型失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
