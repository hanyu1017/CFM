// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 生成過去 N 天的隨機碳排放數據
function generateCarbonEmissionData(companyId, days = 90) {
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
    const electricity = scope2 * 0.85; // 85% 來自電力
    const naturalGas = scope1 * 0.6;   // 60% 來自天然氣
    const fuel = scope1 * 0.3;         // 30% 來自燃料
    const transport = scope3 * 0.4;    // 40% 來自運輸
    const waste = scope3 * 0.2;        // 20% 來自廢棄物
    const water = scope3 * 0.1;        // 10% 來自用水

    data.push({
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
      dataSource: 'SYSTEM_GENERATED',
      verified: false,
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
      name: '綠色科技股份有限公司',
      industry: '電子製造業',
      address: '台北市信義區信義路五段7號',
      contactEmail: 'sustainability@greentech.com',
      contactPhone: '02-2345-6789',
      registrationNum: '12345678',
    },
  });

  console.log(`✅ 已建立公司: ${company.name} (ID: ${company.id})`);

  // 2. 建立碳排放數據（過去 180 天 / 6個月）
  console.log('📊 建立碳排放數據...');
  const carbonData = generateCarbonEmissionData(company.id, 180);
  
  await prisma.carbonEmission.createMany({
    data: carbonData,
  });

  console.log(`✅ 已建立 ${carbonData.length} 筆碳排放數據`);

  // 3. 建立減排目標
  console.log('🎯 建立減排目標...');
  const targets = await prisma.emissionTarget.createMany({
    data: [
      {
        companyId: company.id,
        targetYear: 2030,
        targetType: 'REDUCTION',
        baselineYear: 2020,
        baselineValue: 100000,
        targetValue: 50000,
        unit: 'tCO2e',
        currentValue: 65432.5,
        progress: 69.1,
        description: '2030年碳排放量較2020年減少50%',
        status: 'ACTIVE',
      },
      {
        companyId: company.id,
        targetYear: 2050,
        targetType: 'NET_ZERO',
        baselineYear: 2020,
        baselineValue: 100000,
        targetValue: 0,
        unit: 'tCO2e',
        currentValue: 65432.5,
        progress: 34.6,
        description: '2050年達成淨零排放',
        status: 'ACTIVE',
      },
    ],
  });

  console.log(`✅ 已建立 ${targets.count} 個減排目標`);

  // 4. 建立系統設定
  console.log('⚙️  建立系統設定...');
  await prisma.companySetting.createMany({
    data: [
      {
        companyId: company.id,
        category: 'carbon_target',
        key: 'baseline_year',
        value: '2020',
        dataType: 'number',
        label: '基準年',
        description: '碳排放計算基準年份',
      },
      {
        companyId: company.id,
        category: 'carbon_target',
        key: 'target_reduction_rate',
        value: '50',
        dataType: 'number',
        label: '目標減排率',
        description: '2030年目標減排百分比',
      },
      {
        companyId: company.id,
        category: 'report_config',
        key: 'report_frequency',
        value: 'quarterly',
        dataType: 'string',
        label: '報告頻率',
        description: '永續報告生成頻率',
      },
      {
        companyId: company.id,
        category: 'report_config',
        key: 'auto_generate',
        value: 'true',
        dataType: 'boolean',
        label: '自動生成報告',
        description: '是否自動生成季度報告',
      },
      {
        companyId: company.id,
        category: 'notification',
        key: 'email_alerts',
        value: 'true',
        dataType: 'boolean',
        label: '郵件提醒',
        description: '啟用郵件提醒功能',
      },
      {
        companyId: company.id,
        category: 'notification',
        key: 'alert_threshold',
        value: '110',
        dataType: 'number',
        label: '警示門檻',
        description: '碳排放超標警示門檻(%)',
      },
      {
        companyId: company.id,
        category: 'dashboard',
        key: 'refresh_interval',
        value: '5000',
        dataType: 'number',
        label: '刷新間隔',
        description: '儀表板數據刷新間隔(毫秒)',
      },
      {
        companyId: company.id,
        category: 'dashboard',
        key: 'default_view',
        value: 'monthly',
        dataType: 'string',
        label: '預設視圖',
        description: '儀表板預設顯示視圖',
      },
    ],
  });

  console.log('✅ 已建立 8 項系統設定');

  // 5. 建立決策模型參數
  console.log('🔧 建立決策模型參數...');
  const modelParam = await prisma.modelParameter.create({
    data: {
      companyId: company.id,
      a: 1000,
      b: 2.5,
      M: 0.15,
      rho: 0.2,
      W: 180,
      V: 950,
      Dcost: 100,
      S: 15000,
      Ii: 600000,
      A: 2000,
      UR: 15,
      Uf: 6,
      Ij: 5,
      H: 450,
      alpha: 12,
      beta: 0.001,
      SHat: 15000,
      VHat: 1400,
      DcostHat: 50,
      UFHat: 25,
      IiHat: 1000,
      IjHat: 120,
      AHat: 30,
      WHat: 5,
      URHat: 30,
      MHat: 5,
      CapitalDelta: 0.2,
      TP: 1.0,
      isActive: true,
      description: '預設決策模型參數集',
    },
  });

  console.log(`✅ 已建立決策模型參數 (ID: ${modelParam.id})`);

  // 6. 建立示範報告（完整範本）
  console.log('📄 建立示範報告...');
  const reportYear = new Date().getFullYear();
  const lastYear = reportYear - 1;
  const startDate = new Date(lastYear, 0, 1);
  const endDate = new Date(lastYear, 11, 31);

  await prisma.sustainabilityReport.create({
    data: {
      companyId: company.id,
      title: `${lastYear}年度永續發展報告書`,
      reportPeriod: `${lastYear}年度`,
      startDate,
      endDate,
      status: 'DRAFT',
      generatedBy: 'AUTO',

      // 執行摘要
      executiveSummary: `
## 董事長的話

在全球氣候變遷與永續發展的浪潮下，${company.name}始終秉持「環境永續、社會責任、公司治理」的經營理念，積極推動各項永續發展措施。

${lastYear}年，我們在碳排放管理、綠色製造、永續供應鏈等方面取得顯著成效。透過導入先進的碳管理系統與優化生產流程，成功降低碳排放強度，並持續提升能源使用效率。

## 報告期間重點成果

- **碳排放管理**：建立完整的碳盤查系統，實現 Scope 1、2、3 全範疇管理
- **綠色製造**：導入決策優化模型，提升生產效率並降低環境衝擊
- **永續目標**：設定明確的減碳路徑，承諾於2030年達成碳排放減量50%
- **數位轉型**：建置永續管理平台，提升數據透明度與管理效能

我們深信，永續發展不僅是企業責任，更是創造長期價值的關鍵。未來，我們將持續精進，為利害關係人創造更大的價值，為地球環境貢獻心力。
      `.trim(),

      // 碳足跡數據
      carbonFootprint: {
        summary: '完整碳足跡分析',
        totalEmissions: 65432.5,
        unit: 'tCO2e',
        comparisonWithLastYear: {
          lastYear: 72458.3,
          change: -7025.8,
          changePercent: -9.7,
          trend: 'decreasing'
        },
        emissionsByScope: [
          { scope: 'Scope 1', value: 12586.5, percent: 19.2, description: '直接排放（自有設備、車輛）' },
          { scope: 'Scope 2', value: 28934.2, percent: 44.2, description: '能源間接排放（外購電力）' },
          { scope: 'Scope 3', value: 23911.8, percent: 36.6, description: '其他間接排放（供應鏈、運輸）' }
        ],
        emissionsBySource: [
          { source: '電力使用', value: 28934.2, percent: 44.2 },
          { source: '天然氣', value: 8234.1, percent: 12.6 },
          { source: '公司車輛', value: 4352.4, percent: 6.6 },
          { source: '原物料運輸', value: 12456.3, percent: 19.0 },
          { source: '員工通勤', value: 5623.8, percent: 8.6 },
          { source: '廢棄物處理', value: 3287.5, percent: 5.0 },
          { source: '其他', value: 2544.2, percent: 3.9 }
        ],
        carbonIntensity: {
          perRevenue: 42.3,
          perEmployee: 89.5,
          perProduct: 15.6,
          unit: 'tCO2e'
        }
      },

      // 排放總結
      emissionsSummary: {
        scope1: 12586.5,
        scope2: 28934.2,
        scope3: 23911.8,
        total: 65432.5,
        monthlyData: [
          { month: '1月', scope1: 1050, scope2: 2400, scope3: 1990, total: 5440 },
          { month: '2月', scope1: 980, scope2: 2350, scope3: 1880, total: 5210 },
          { month: '3月', scope1: 1020, scope2: 2420, scope3: 1950, total: 5390 },
          { month: '4月', scope1: 1080, scope2: 2450, scope3: 2020, total: 5550 },
          { month: '5月', scope1: 1100, scope2: 2500, scope3: 2050, total: 5650 },
          { month: '6月', scope1: 1120, scope2: 2520, scope3: 2080, total: 5720 },
          { month: '7月', scope1: 1150, scope2: 2580, scope3: 2120, total: 5850 },
          { month: '8月', scope1: 1130, scope2: 2550, scope3: 2100, total: 5780 },
          { month: '9月', scope1: 1090, scope2: 2480, scope3: 2030, total: 5600 },
          { month: '10月', scope1: 1060, scope2: 2430, scope3: 1990, total: 5480 },
          { month: '11月', scope1: 1010, scope2: 2380, scope3: 1920, total: 5310 },
          { month: '12月', scope1: 996, scope2: 2374, scope3: 2781, total: 6151 }
        ],
        keyMetrics: {
          averageMonthlyEmission: 5453,
          peakMonth: '7月',
          lowestMonth: '2月',
          reductionFromBaseline: 9.7
        }
      },

      // 減排目標
      reductionTargets: {
        longTermGoal: {
          target: '2050年達成淨零排放',
          baseline: { year: 2020, value: 82345.6 },
          milestones: [
            { year: 2025, target: 70000, reduction: '15%', status: '進行中' },
            { year: 2030, target: 41172.8, reduction: '50%', status: '規劃中' },
            { year: 2040, target: 16469.1, reduction: '80%', status: '規劃中' },
            { year: 2050, target: 0, reduction: '100%', status: '承諾中' }
          ]
        },
        shortTermTargets: [
          {
            category: 'Scope 1',
            currentYear: 12586.5,
            nextYearTarget: 11327.9,
            reduction: 10,
            actions: ['更換低碳燃料', '提升設備效率', '優化運輸路線']
          },
          {
            category: 'Scope 2',
            currentYear: 28934.2,
            nextYearTarget: 26040.8,
            reduction: 10,
            actions: ['採購綠電', '建置太陽能板', '提升能源效率']
          },
          {
            category: 'Scope 3',
            currentYear: 23911.8,
            nextYearTarget: 22157.4,
            reduction: 7.3,
            actions: ['供應商輔導', '綠色物流', '循環經濟']
          }
        ],
        scienceBasedTargets: {
          committed: true,
          validatedBy: 'SBTi',
          scope12Target: '2030年較2020年減少50%',
          scope3Target: '2030年較2020年減少30%'
        }
      },

      // 永續措施 (簡化版)
      initiatives: {
        totalInvestment: 69800000,
        totalExpectedReduction: 5380,
        overallCompletion: 62
      },

      // 法規遵循
      compliance: {
        standards: [
          {
            name: 'ISO 14064-1',
            category: '溫室氣體盤查',
            status: '已認證',
            certifiedDate: '2023-06-15',
            description: '溫室氣體排放盤查與報告標準'
          }
        ]
      },

      // 財務影響
      financialImpact: {
        investment: {
          total: 69800000
        },
        savings: {
          total: 24600000
        }
      },

      // 利害關係人
      stakeholders: {
        engagement: []
      },

      pdfUrl: `/reports/${lastYear}-annual-sustainability-report.pdf`,
    },
  });

  console.log('✅ 已建立完整的示範報告範本');

  console.log('\n🎉 資料庫種子數據執行完成！\n');
  console.log('📝 種子數據摘要:');
  console.log(`   - 公司數量: 1`);
  console.log(`   - 碳排放數據: ${carbonData.length} 筆（過去180天 / 6個月）`);
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
