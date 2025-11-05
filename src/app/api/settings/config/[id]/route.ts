// src/app/api/settings/config/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - 更新系統設定
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { value, label, description } = body;

    const setting = await prisma.companySetting.update({
      where: { id: params.id },
      data: {
        value,
        label,
        description,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json(
      { error: '更新系統設定失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
