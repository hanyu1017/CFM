// prisma/seed.ts
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
  console.log('🌱 開始執行資料庫種子數據...');

  // 清除現有數據（可選）
  console.log('🗑️  清除現有數據...');
  await prisma.chatMessage.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.sensitivityAnalysis.deleteMany({});
  await prisma.optimizationResult.deleteMany({});
  await prisma.modelParameter.deleteMany({});
  await prisma.sustainabilityReport.deleteMany({});
  await prisma.emissionTarget.deleteMany({});
  await prisma.companySetting.deleteMany({});
  await prisma.carbonEmission.deleteMany({});
  await prisma.company.deleteMany({});

  // 1. 建立示範公司
  console.log('🏢 建立示範公司...');
  const company = await prisma.company.create({
    data: {
      name: '綠能科技股份有限公司',
      industry: '科技製造業',
      address: '台北市信義區信義路五段7號',
      contactEmail: 'contact@greentech.com.tw',
      contactPhone: '(02) 2345-6789',
      registrationNum: '12345678',
    },
  });

  console.log(`✅ 已建立公司: ${company.name} (ID: ${company.id})`);

  // 2. 建立碳排放數據（過去90天，每日一筆）
  console.log('📊 建立碳排放數據（過去90天）...');
  const carbonData = generateCarbonEmissionData(company.id, 90);

  for (const data of carbonData) {
    await prisma.carbonEmission.create({ data });
  }

  console.log(`✅ 已建立 ${carbonData.length} 筆碳排放數據`);

  // 3. 建立減排目標
  console.log('🎯 建立減排目標...');
  const targets = await prisma.emissionTarget.createMany({
    data: [
      {
        companyId: company.id,
        targetYear: 2025,
        targetType: 'REDUCTION',
        baselineYear: 2023,
        baselineValue: 40000,
        targetValue: 36000,
        unit: 'tCO2e',
        currentValue: 38500,
        progress: 37.5,
        description: '2025年減排目標：相較於2023年基準年減少10%碳排放',
        status: 'ACTIVE',
      },
      {
        companyId: company.id,
        targetYear: 2030,
        targetType: 'REDUCTION',
        baselineYear: 2023,
        baselineValue: 40000,
        targetValue: 28000,
        unit: 'tCO2e',
        currentValue: 38500,
        progress: 12.5,
        description: '2030年減排目標：相較於2023年基準年減少30%碳排放',
        status: 'ACTIVE',
      },
      {
        companyId: company.id,
        targetYear: 2050,
        targetType: 'NET_ZERO',
        baselineYear: 2023,
        baselineValue: 40000,
        targetValue: 0,
        unit: 'tCO2e',
        currentValue: 38500,
        progress: 3.75,
        description: '2050年淨零目標：達成淨零碳排放',
        status: 'ACTIVE',
      },
    ],
  });

  console.log(`✅ 已建立 ${targets.count} 個減排目標`);

  // 4. 建立系統設定
  console.log('⚙️  建立系統設定...');
  await prisma.companySetting.createMany({
    data: [
      // 報告設定
      {
        companyId: company.id,
        category: '報告設定',
        key: 'auto_generate_monthly',
        value: 'true',
        dataType: 'boolean',
        label: '自動生成月報',
        description: '每月自動生成永續報告書',
        isActive: true,
      },
      {
        companyId: company.id,
        category: '報告設定',
        key: 'report_language',
        value: 'zh-TW',
        dataType: 'string',
        label: '報告語言',
        description: '報告生成的預設語言',
        isActive: true,
      },
      // 通知設定
      {
        companyId: company.id,
        category: '通知設定',
        key: 'email_notifications',
        value: 'true',
        dataType: 'boolean',
        label: '電子郵件通知',
        description: '啟用電子郵件通知功能',
        isActive: true,
      },
      {
        companyId: company.id,
        category: '通知設定',
        key: 'alert_threshold',
        value: '500',
        dataType: 'number',
        label: '告警閾值',
        description: '每日碳排放超過此值時發送告警（tCO2e）',
        isActive: true,
      },
      // 數據同步
      {
        companyId: company.id,
        category: '數據同步',
        key: 'sync_frequency',
        value: 'daily',
        dataType: 'string',
        label: '同步頻率',
        description: '數據同步頻率（daily, weekly, monthly）',
        isActive: true,
      },
      {
        companyId: company.id,
        category: '數據同步',
        key: 'last_sync',
        value: new Date().toISOString(),
        dataType: 'string',
        label: '上次同步時間',
        description: '最後一次數據同步時間',
        isActive: true,
      },
      // API配置
      {
        companyId: company.id,
        category: 'API配置',
        key: 'api_enabled',
        value: 'true',
        dataType: 'boolean',
        label: '啟用 API',
        description: '啟用外部 API 整合',
        isActive: true,
      },
      {
        companyId: company.id,
        category: 'API配置',
        key: 'api_rate_limit',
        value: '1000',
        dataType: 'number',
        label: 'API 速率限制',
        description: '每小時 API 請求次數限制',
        isActive: true,
      },
    ],
  });

  console.log('✅ 已建立系統設定');

  // 5. 建立決策模型參數
  console.log('🧮 建立決策模型參數...');
  const modelParam = await prisma.modelParameter.create({
    data: {
      companyId: company.id,
      description: '預設決策模型參數配置',
      isActive: true,
    },
  });

  console.log(`✅ 已建立決策模型參數 (ID: ${modelParam.id})`);

  // 6. 建立示範報告
  console.log('📄 建立示範報告...');
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

  await prisma.sustainabilityReport.create({
    data: {
      companyId: company.id,
      title: '2024年度永續發展報告書',
      reportPeriod: '2024年度',
      startDate,
      endDate,
      status: 'DRAFT',
      generatedBy: 'AUTO',
      executiveSummary: '本報告書概述本公司2024年度在環境永續、社會責任及公司治理方面的表現與成果。',
    },
  });

  console.log('✅ 已建立示範報告');

  console.log('\n🎉 資料庫種子數據執行完成！\n');
  console.log('📝 種子數據摘要:');
  console.log(`   - 公司數量: 1`);
  console.log(`   - 碳排放數據: ${carbonData.length} 筆（過去90天）`);
  console.log(`   - 減排目標: ${targets.count} 個`);
  console.log(`   - 系統設定: 8 項`);
  console.log(`   - 決策模型參數: 1 組`);
  console.log(`   - 示範報告: 1 份\n`);
}

main()
  .catch((e) => {
    console.error('❌ 種子數據執行失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
