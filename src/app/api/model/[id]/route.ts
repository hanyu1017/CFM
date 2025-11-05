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

// PUT - 更新模型
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, parameters } = body;

    const updatedModel = await prisma.modelParameter.update({
      where: { id: params.id },
      data: {
        description: name || description,
        // 基本參數
        a: parseFloat(parameters.a),
        b: parseFloat(parameters.b),
        M: parseFloat(parameters.M),
        rho: parseFloat(parameters.rho),
        W: parseFloat(parameters.W),
        V: parseFloat(parameters.V),
        Dcost: parseFloat(parameters.Dcost),
        S: parseFloat(parameters.S),
        Ii: parseFloat(parameters.Ii),
        // 綠色製造參數
        A: parseFloat(parameters.A),
        UR: parseFloat(parameters.UR),
        Uf: parseFloat(parameters.Uf),
        Ij: parseFloat(parameters.Ij),
        H: parseFloat(parameters.H),
        alpha: parseFloat(parameters.alpha),
        beta: parseFloat(parameters.beta),
        // 不確定性參數
        SHat: parseFloat(parameters.SHat),
        VHat: parseFloat(parameters.VHat),
        DcostHat: parseFloat(parameters.DcostHat),
        UFHat: parseFloat(parameters.UFHat),
        IiHat: parseFloat(parameters.IiHat),
        IjHat: parseFloat(parameters.IjHat),
        AHat: parseFloat(parameters.AHat),
        WHat: parseFloat(parameters.WHat),
        URHat: parseFloat(parameters.URHat),
        MHat: parseFloat(parameters.MHat),
        CapitalDelta: parseFloat(parameters.CapitalDelta),
        TP: parseFloat(parameters.TP),
      },
    });

    return NextResponse.json({
      success: true,
      message: '模型已更新',
      model: updatedModel,
    });
  } catch (error) {
    console.error('Update model error:', error);
    return NextResponse.json(
      { error: '更新模型失敗' },
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
