// src/app/api/carbon/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成隨機數據的輔助函數
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 生成單月的碳排數據
function generateMonthlyData(companyId: string, date: Date) {
  const electricity = randomBetween(50000, 150000); // kWh
  const naturalGas = randomBetween(5000, 15000); // m³
  const fuel = randomBetween(2000, 8000); // L
  const transport = randomBetween(10000, 50000); // km
  const waste = randomBetween(5000, 20000); // kg
  const water = randomBetween(1000, 5000); // m³

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
    dataSource: '系統生成範例數據',
    verified: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { months = 12 } = await request.json();

    // 獲取或創建公司
    let company = await prisma.company.findFirst();

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: '綠能科技股份有限公司',
          industry: '製造業',
          address: '台北市信義區信義路五段7號',
          contactEmail: 'contact@greentech.com.tw',
          contactPhone: '02-2345-6789',
          registrationNum: '12345678',
        },
      });
    }

    // 生成過去N個月的數據
    const carbonData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      carbonData.push(generateMonthlyData(company.id, date));
    }

    // 批次插入數據
    const result = await prisma.carbonEmission.createMany({
      data: carbonData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `成功生成 ${result.count} 筆碳排數據`,
      companyId: company.id,
      companyName: company.name,
      dataGenerated: result.count,
    });
  } catch (error) {
    console.error('Carbon data seed error:', error);
    return NextResponse.json(
      { error: '生成碳排數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 清空現有碳排數據
export async function DELETE() {
  try {
    const result = await prisma.carbonEmission.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `已刪除 ${result.count} 筆碳排數據`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Delete carbon data error:', error);
    return NextResponse.json(
      { error: '刪除碳排數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
