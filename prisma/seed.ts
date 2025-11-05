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

  // 2. 建立碳排放數據（過去180天，每日一筆）
  console.log('📊 建立碳排放數據（過去180天 / 6個月）...');
  const carbonData = generateCarbonEmissionData(company.id, 180);

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

      // 永續措施
      initiatives: {
        categories: [
          {
            name: '能源管理',
            description: '提升能源使用效率，增加再生能源佔比',
            projects: [
              {
                title: '太陽能發電系統',
                status: '執行中',
                investment: 15000000,
                expectedReduction: 1200,
                completion: 65,
                description: '於廠區屋頂建置2MW太陽能發電系統，預計年發電量240萬度'
              },
              {
                title: '空調系統優化',
                status: '已完成',
                investment: 3500000,
                actualReduction: 450,
                completion: 100,
                description: '汰換老舊空調設備，導入智慧控制系統'
              },
              {
                title: '照明系統升級',
                status: '已完成',
                investment: 1200000,
                actualReduction: 180,
                completion: 100,
                description: '全面更換LED照明，建置智慧照明管理系統'
              }
            ]
          },
          {
            name: '綠色製造',
            description: '優化生產流程，降低製程環境衝擊',
            projects: [
              {
                title: '生產參數優化',
                status: '執行中',
                investment: 8000000,
                expectedReduction: 800,
                completion: 80,
                description: '透過AI與數學模型優化生產參數，提升效率降低浪費'
              },
              {
                title: '廢熱回收系統',
                status: '規劃中',
                investment: 12000000,
                expectedReduction: 1500,
                completion: 20,
                description: '建置製程廢熱回收系統，提升能源使用效率'
              }
            ]
          },
          {
            name: '循環經濟',
            description: '推動資源循環利用，減少廢棄物產生',
            projects: [
              {
                title: '廢棄物減量計畫',
                status: '執行中',
                investment: 2500000,
                expectedReduction: 300,
                completion: 70,
                description: '推動源頭減量、分類回收、資源化處理'
              },
              {
                title: '包裝材料循環',
                status: '執行中',
                investment: 1800000,
                expectedReduction: 200,
                completion: 60,
                description: '使用可回收包材，建立包材回收機制'
              }
            ]
          },
          {
            name: '綠色運輸',
            description: '優化物流運輸，降低運輸碳排放',
            projects: [
              {
                title: '電動車隊建置',
                status: '執行中',
                investment: 25000000,
                expectedReduction: 600,
                completion: 40,
                description: '逐步汰換燃油車輛，導入電動車與充電設施'
              },
              {
                title: '路線優化系統',
                status: '已完成',
                investment: 800000,
                actualReduction: 150,
                completion: 100,
                description: '導入AI路線規劃系統，提升運輸效率'
              }
            ]
          }
        ],
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
            expiryDate: '2026-06-14',
            description: '溫室氣體排放盤查與報告標準'
          },
          {
            name: 'ISO 14001',
            category: '環境管理系統',
            status: '已認證',
            certifiedDate: '2022-03-20',
            expiryDate: '2025-03-19',
            description: '環境管理系統國際標準'
          },
          {
            name: 'ISO 50001',
            category: '能源管理系統',
            status: '執行中',
            expectedDate: '2025-12-31',
            description: '能源管理系統國際標準'
          },
          {
            name: 'CDP',
            category: '碳揭露專案',
            status: '已參與',
            score: 'B',
            year: lastYear,
            description: '國際碳揭露專案，評級B級'
          }
        ],
        regulations: [
          {
            name: '溫室氣體減量及管理法',
            authority: '環境部',
            status: '符合',
            description: '依法完成溫室氣體盤查登錄'
          },
          {
            name: '能源管理法',
            authority: '經濟部',
            status: '符合',
            description: '能源用戶登記及節能目標達成'
          }
        ],
        verificationStatus: {
          verified: true,
          verifier: '台灣檢驗科技股份有限公司 (SGS)',
          verificationDate: `${lastYear}-12-20`,
          scope: 'Scope 1, 2, 3 溫室氣體排放量',
          assuranceLevel: '合理保證等級'
        }
      },

      // 財務影響
      financialImpact: {
        investment: {
          total: 69800000,
          breakdown: [
            { category: '再生能源建置', amount: 15000000, percent: 21.5 },
            { category: '設備升級', amount: 23700000, percent: 34.0 },
            { category: '系統優化', amount: 8800000, percent: 12.6 },
            { category: '綠色運輸', amount: 25800000, percent: 37.0 },
            { category: '其他', amount: 6500000, percent: 9.3 }
          ]
        },
        savings: {
          energyCostSaving: 12500000,
          carbonCreditValue: 3200000,
          efficiencyGain: 8900000,
          total: 24600000
        },
        roi: {
          paybackPeriod: 2.8,
          irr: 18.5,
          npv: 45600000
        },
        carbonPrice: {
          internalCarbonPrice: 1500,
          unit: 'TWD/tCO2e',
          description: '公司內部碳定價機制，用於投資決策評估'
        }
      },

      // 利害關係人
      stakeholders: {
        engagement: [
          {
            group: '股東與投資人',
            concerns: ['氣候風險', '永續績效', '長期價值'],
            communicationChannels: ['年度股東會', 'ESG報告', '投資人說明會'],
            frequency: '季度',
            keyActions: [
              '定期揭露永續資訊',
              '設定科學基礎減碳目標',
              '整合財務與永續績效'
            ]
          },
          {
            group: '客戶',
            concerns: ['產品碳足跡', '綠色產品', '供應鏈透明度'],
            communicationChannels: ['客戶訪談', '產品碳標籤', '永續報告'],
            frequency: '持續',
            keyActions: [
              '提供產品碳足跡資訊',
              '開發低碳產品',
              '響應客戶永續要求'
            ]
          },
          {
            group: '員工',
            concerns: ['工作環境', '永續教育', '參與機會'],
            communicationChannels: ['內部溝通', '教育訓練', '意見調查'],
            frequency: '月度',
            keyActions: [
              '永續教育訓練計畫',
              '鼓勵員工參與減碳活動',
              '建立綠色辦公環境'
            ]
          },
          {
            group: '供應商',
            concerns: ['合作穩定', '能力建構', '共同成長'],
            communicationChannels: ['供應商大會', '輔導計畫', '定期稽核'],
            frequency: '半年度',
            keyActions: [
              '供應商碳盤查輔導',
              '綠色採購政策',
              '永續供應鏈管理'
            ]
          },
          {
            group: '政府與主管機關',
            concerns: ['法規遵循', '政策配合', '產業領導'],
            communicationChannels: ['公文往來', '產業會議', '政策參與'],
            frequency: '依需求',
            keyActions: [
              '依法完成盤查登錄',
              '參與政策研擬',
              '配合政府淨零政策'
            ]
          },
          {
            group: '社區與NGO',
            concerns: ['環境影響', '社會責任', '資訊透明'],
            communicationChannels: ['社區溝通', '公開資訊', '合作專案'],
            frequency: '半年度',
            keyActions: [
              '環境監測資訊公開',
              '社區環境改善',
              '支持環境公益活動'
            ]
          }
        ],
        materiality: {
          highPriority: [
            '溫室氣體排放管理',
            '能源效率提升',
            '氣候變遷調適',
            '綠色產品開發',
            '供應鏈永續管理'
          ],
          mediumPriority: [
            '水資源管理',
            '廢棄物減量',
            '生物多樣性',
            '員工福祉',
            '社區關係'
          ]
        }
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
