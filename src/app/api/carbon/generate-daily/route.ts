// src/app/api/carbon/generate-daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成隨機數據的輔助函數
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 生成單日的碳排數據
function generateDailyData(companyId: string, date: Date) {
  const electricity = randomBetween(1000, 5000); // kWh
  const naturalGas = randomBetween(100, 500); // m³
  const fuel = randomBetween(50, 300); // L
  const transport = randomBetween(200, 2000); // km
  const waste = randomBetween(100, 800); // kg
  const water = randomBetween(50, 300); // m³

  // 計算碳排放 (使用簡化的排放因子)
  const scope1 = naturalGas * 0.002 + fuel * 0.0027; // 直接排放
  const scope2 = electricity * 0.0005; // 電力間接排放
  const scope3 = transport * 0.0002 + waste * 0.0003; // 其他間接排放
  const totalCarbon = scope1 + scope2 + scope3;

  return {
    companyId,
    date,
    scope1: parseFloat(scope1.toFixed(2)),
    scope2: parseFloat(scope2.toFixed(2)),
    scope3: parseFloat(scope3.toFixed(2)),
    totalCarbon: parseFloat(totalCarbon.toFixed(2)),
    electricity: parseFloat(electricity.toFixed(2)),
    naturalGas: parseFloat(naturalGas.toFixed(2)),
    fuel: parseFloat(fuel.toFixed(2)),
    transport: parseFloat(transport.toFixed(2)),
    waste: parseFloat(waste.toFixed(2)),
    water: parseFloat(water.toFixed(2)),
    dataSource: '系統自動生成',
    verified: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    // 獲取或創建默認公司
    let company = await prisma.company.findFirst();

    if (!company) {
      company = await prisma.company.create({
        data: {
          id: 'default',
          name: '預設公司',
          industry: '未設定',
        }
      });
    }

    // 找到最新的碳排放記錄
    const latestRecord = await prisma.carbonEmission.findFirst({
      where: { companyId: company.id },
      orderBy: { date: 'desc' },
    });

    // 計算開始日期
    let startDate: Date;
    if (latestRecord) {
      // 從最新記錄的下一天開始
      startDate = new Date(latestRecord.date);
      startDate.setDate(startDate.getDate() + 1);
    } else {
      // 如果沒有記錄，從30天前開始
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // 結束日期是今天
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    // 計算需要生成的天數
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) {
      return NextResponse.json({
        success: true,
        message: '資料已是最新，無需生成',
        totalDays: 0,
        generated: 0,
      });
    }

    // 生成每一天的數據
    const carbonData = [];
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      carbonData.push(generateDailyData(company.id, currentDate));
    }

    // 批次插入數據
    const result = await prisma.carbonEmission.createMany({
      data: carbonData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `成功生成 ${result.count} 筆碳排放數據`,
      totalDays: daysDiff + 1,
      generated: result.count,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error('Generate daily carbon data error:', error);
    return NextResponse.json(
      { error: '生成每日碳排放數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
