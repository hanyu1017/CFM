// src/app/api/carbon/realtime/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 模擬實時數據更新
    const currentEmission = 245.6 + (Math.random() - 0.5) * 10;
    const efficiency = 87.5 + (Math.random() - 0.5) * 2;

    return NextResponse.json({
      currentEmission,
      efficiency,
      timestamp: new Date().toISOString(),
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch realtime data', success: false },
      { status: 500 }
    );
  }
}
