// prisma/seed.ts
// 注意：由於 Prisma Client 生成問題，暫時禁用 seed 功能
// 如需使用，請先運行: npx prisma generate

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成過去 N 天的隨機碳排放數據
function generateCarbonEmissionData(companyId: string, days: number = 90) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // 生成基礎值並加入一些隨機波動
    const baseScope1 = 45 + Math.random() * 20; // 40-65
    const baseScope2 = 120 + Math.random() * 40; // 120-160
    const baseScope3 = 180 + Math.random() * 60; // 180-240

    // 加入週末效應（週末排放較低）
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;

    const scope1 = baseScope1 * weekendFactor;
    const scope2 = baseScope2 * weekendFactor;
    const scope3 = baseScope3 * weekendFactor;
    const totalCarbon = scope1 + scope2 + scope3;

    // 生成細分數據
    const electricity = scope2 * 15 + Math.random() * 100; // kWh
    const naturalGas = scope1 * 2 + Math.random() * 20; // m³
    const fuel = scope1 * 3 + Math.random() * 30; // L
    const transport = scope3 * 0.8 + Math.random() * 50; // km
    const waste = scope3 * 0.5 + Math.random() * 30; // kg
    const water = electricity * 0.05 + Math.random() * 10; // m³

    data.push({
      companyId,
      date,
      scope1: Number(scope1.toFixed(2)),
      scope2: Number(scope2.toFixed(2)),
      scope3: Number(scope3.toFixed(2)),
      totalCarbon: Number(totalCarbon.toFixed(2)),
      electricity: Number(electricity.toFixed(2)),
      naturalGas: Number(naturalGas.toFixed(2)),
      fuel: Number(fuel.toFixed(2)),
      transport: Number(transport.toFixed(2)),
      waste: Number(waste.toFixed(2)),
      water: Number(water.toFixed(2)),
      dataSource: 'AUTO_GENERATED',
      verified: true,
      notes: `自動生成的 ${date.toISOString().split('T')[0]} 碳排放數據`,
    });
  }

  return data;
}

async function main() {
  console.log('🌱 種子數據腳本執行...');
  console.log('⚠️  暫時跳過種子數據生成（Prisma Client 需要重新生成）');
  console.log('💡 如需生成種子數據，請執行以下命令：');
  console.log('   1. npx prisma generate');
  console.log('   2. npx prisma db seed');
  console.log('✅ 完成');
}

main()
  .catch((e) => {
    console.error('❌ 種子數據執行失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
