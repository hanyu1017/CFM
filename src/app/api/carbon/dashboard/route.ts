// src/app/api/carbon/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 獲取最近12個月的碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true,
        scope1: true,
        scope2: true,
        scope3: true,
        totalCarbon: true,
      }
    });

    // 格式化數據
    const formattedData = carbonData.map(item => ({
      date: item.date.toISOString().slice(0, 7), // YYYY-MM
      scope1: item.scope1,
      scope2: item.scope2,
      scope3: item.scope3,
      total: item.totalCarbon,
    }));

    // 計算實時指標
    const currentMonth = carbonData[carbonData.length - 1];
    const previousMonth = carbonData[carbonData.length - 2];
    
    const metrics = {
      currentEmission: currentMonth?.totalCarbon || 0,
      todayReduction: previousMonth 
        ? previousMonth.totalCarbon - currentMonth.totalCarbon
        : 0,
      monthlyTarget: 5000,
      efficiency: 87.5,
    };

    return NextResponse.json({
      carbonData: formattedData,
      metrics,
      success: true,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', success: false },
      { status: 500 }
    );
  }
}

// src/app/api/carbon/realtime/route.ts
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
