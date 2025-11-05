// src/app/api/carbon/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成模擬數據（當資料庫為空時使用）
function generateMockData() {
  const carbonData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const scope1 = Math.random() * 50 + 40;
    const scope2 = Math.random() * 80 + 100;
    const scope3 = Math.random() * 100 + 150;
    return {
      date: date.toISOString().split('T')[0],
      scope1,
      scope2,
      scope3,
      total: scope1 + scope2 + scope3,
    };
  });

  return {
    carbonData,
    metrics: {
      currentEmission: 345.6,
      todayReduction: 12.3,
      monthlyTarget: 10000,
      efficiency: 87.5,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    // 解析查詢參數
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // 設定日期範圍（預設為過去30天）
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 設定時間為當天的開始和結束
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // 查詢公司資料（使用第一家公司）
    const company = await prisma.company.findFirst();

    if (!company) {
      const mockData = generateMockData();
      return NextResponse.json({
        ...mockData,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        success: true,
        message: '使用模擬數據（尚無公司資料）',
      });
    }

    // 查詢碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        date: true,
        scope1: true,
        scope2: true,
        scope3: true,
        totalCarbon: true,
        electricity: true,
        naturalGas: true,
        fuel: true,
        transport: true,
        waste: true,
        water: true,
      },
    });

    // 如果數據庫沒有數據，返回模擬數據
    if (!carbonData || carbonData.length === 0) {
      const mockData = generateMockData();
      return NextResponse.json({
        ...mockData,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        success: true,
        message: '使用模擬數據（尚無碳排放數據）',
      });
    }

    // 格式化數據
    const formattedData = carbonData.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      scope1: Number(item.scope1.toFixed(2)),
      scope2: Number(item.scope2.toFixed(2)),
      scope3: Number(item.scope3.toFixed(2)),
      total: Number(item.totalCarbon.toFixed(2)),
      electricity: Number(item.electricity.toFixed(2)),
      naturalGas: Number(item.naturalGas.toFixed(2)),
      fuel: Number(item.fuel.toFixed(2)),
      transport: Number(item.transport.toFixed(2)),
      waste: Number(item.waste.toFixed(2)),
      water: Number(item.water.toFixed(2)),
    }));

    // 計算即時指標
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = await prisma.carbonEmission.findFirst({
      where: {
        companyId: company.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayData = await prisma.carbonEmission.findFirst({
      where: {
        companyId: company.id,
        date: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // 計算當月數據
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyData = await prisma.carbonEmission.aggregate({
      where: {
        companyId: company.id,
        date: {
          gte: monthStart,
          lte: today,
        },
      },
      _sum: {
        totalCarbon: true,
      },
    });

    const currentEmission = todayData?.totalCarbon || (carbonData.length > 0 ? carbonData[carbonData.length - 1].totalCarbon : 0);
    const todayReduction = yesterdayData && todayData
      ? yesterdayData.totalCarbon - todayData.totalCarbon
      : 0;
    const monthlyTotal = monthlyData._sum.totalCarbon || 0;
    const monthlyTarget = 10000; // 可以從設定中讀取
    const efficiency = monthlyTarget > 0
      ? Math.max(0, Math.min(100, (1 - monthlyTotal / monthlyTarget) * 100))
      : 0;

    return NextResponse.json({
      carbonData: formattedData,
      metrics: {
        currentEmission: Number(currentEmission.toFixed(2)),
        todayReduction: Number(todayReduction.toFixed(2)),
        monthlyTarget,
        efficiency: Number(efficiency.toFixed(2)),
      },
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      success: true,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    const mockData = generateMockData();
    return NextResponse.json({
      ...mockData,
      success: true,
      error: 'Failed to fetch data, using mock data',
    });
  } finally {
    await prisma.$disconnect();
  }
}
