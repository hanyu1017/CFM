// src/app/api/model/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - 儲存決策模型參數
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parameters, result } = body;

    // 獲取公司 ID
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: '請先建立公司資料' },
        { status: 400 }
      );
    }

    // 儲存模型參數
    const modelParam = await prisma.modelParameter.create({
      data: {
        companyId: company.id,
        description: name || description || '未命名模型',
        isActive: true,
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
      },
    });

    // 如果有計算結果，也儲存
    if (result) {
      await prisma.optimizationResult.create({
        data: {
          parameterId: modelParam.id,
          optimalProfit: result.optimalProfit || 0,
          optimalP: result.optimalP || 0,
          optimalTf: result.optimalTf || 0,
          optimalTR: result.optimalTR || 0,
          optimalG: result.optimalG || 0,
          totalCycle: result.totalCycle || 0,
          totalRevenue: result.totalRevenue,
          totalCost: result.totalCost,
          demand: result.demand,
          carbonReduction: result.carbonReduction,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '模型已成功儲存',
      model: modelParam,
    });
  } catch (error) {
    console.error('Save model error:', error);
    return NextResponse.json(
      { error: '儲存模型失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
