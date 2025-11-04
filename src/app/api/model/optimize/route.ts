// src/app/api/model/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { optimize, sensitivityAnalysis, ModelParams } from '@/lib/model';

export async function POST(request: NextRequest) {
  try {
    const params: ModelParams = await request.json();
    const result = optimize(params);
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