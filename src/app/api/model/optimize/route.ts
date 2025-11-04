// src/app/api/model/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { optimize, sensitivityAnalysis, ModelParams } from '@/lib/model';

export async function POST(request: NextRequest) {
  try {
    const params: ModelParams = await request.json();

    // 執行優化計算
    const result = optimize(params);

    // 執行簡單敏感性分析
    const sensitivityData = sensitivityAnalysis(params, 'a', [-20, -10, 0, 10, 20]);

    return NextResponse.json({
      result,
      sensitivityData,
      success: true,
    });
  } catch (error) {
    console.error('Optimization API error:', error);
    return NextResponse.json(
      { error: 'Optimization failed', success: false },
      { status: 500 }
    );
  }
}

// src/app/api/model/save-params/route.ts
export async function POST(request: NextRequest) {
  try {
    const params = await request.json();
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // 儲存參數到資料庫
    const savedParams = await prisma.modelParameter.create({
      data: {
        companyId: 'default', // 實際應用中應從 session 獲取
        ...params,
        isActive: true,
      },
    });

    return NextResponse.json({
      id: savedParams.id,
      success: true,
    });
  } catch (error) {
    console.error('Save params API error:', error);
    return NextResponse.json(
      { error: 'Failed to save parameters', success: false },
      { status: 500 }
    );
  }
}
