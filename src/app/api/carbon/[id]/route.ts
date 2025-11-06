// src/app/api/carbon/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - 更新碳排放數據
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const data = await prisma.carbonEmission.update({
      where: { id: params.id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        scope1: body.scope1 !== undefined ? parseFloat(body.scope1) : undefined,
        scope2: body.scope2 !== undefined ? parseFloat(body.scope2) : undefined,
        scope3: body.scope3 !== undefined ? parseFloat(body.scope3) : undefined,
        totalCarbon: body.totalCarbon !== undefined ? parseFloat(body.totalCarbon) : undefined,
        electricity: body.electricity !== undefined ? parseFloat(body.electricity) : undefined,
        naturalGas: body.naturalGas !== undefined ? parseFloat(body.naturalGas) : undefined,
        fuel: body.fuel !== undefined ? parseFloat(body.fuel) : undefined,
        transport: body.transport !== undefined ? parseFloat(body.transport) : undefined,
        waste: body.waste !== undefined ? parseFloat(body.waste) : undefined,
        water: body.water !== undefined ? parseFloat(body.water) : undefined,
        dataSource: body.dataSource,
        verified: body.verified,
        notes: body.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: '碳排放數據已成功更新',
      data,
    });
  } catch (error) {
    console.error('Update carbon data error:', error);
    return NextResponse.json(
      { error: '更新碳排放數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - 刪除碳排放數據
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.carbonEmission.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '碳排放數據已成功刪除',
    });
  } catch (error) {
    console.error('Delete carbon data error:', error);
    return NextResponse.json(
      { error: '刪除碳排放數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
