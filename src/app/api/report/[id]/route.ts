// src/app/api/report/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 取得單一報告
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.sustainabilityReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json(
        { error: '找不到該報告' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: '取得報告失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - 刪除報告
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.sustainabilityReport.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '報告已刪除',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: '刪除報告失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
