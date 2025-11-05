// scripts/import-seed-data.js
// 將生成的 JSON 數據導入到資料庫

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importCarbonData() {
  try {
    console.log('🌱 開始導入碳排放數據...\n');

    // 讀取 JSON 文件
    const jsonPath = path.join(process.cwd(), 'data', 'carbon-emissions-seed.json');

    if (!fs.existsSync(jsonPath)) {
      console.error('❌ 找不到數據文件:', jsonPath);
      console.error('請先執行: node scripts/generate-seed-data.js > data/carbon-emissions-seed.json');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const seedData = JSON.parse(fileContent);

    console.log('📊 數據文件資訊:');
    console.log(`   - 數據點: ${seedData.metadata.dataPoints}`);
    console.log(`   - 時間範圍: ${seedData.metadata.dateRange.start.split('T')[0]} ~ ${seedData.metadata.dateRange.end.split('T')[0]}`);
    console.log(`   - 總碳排放: ${seedData.metadata.statistics.totalEmissions} tCO2e`);
    console.log();

    // 檢查是否已有公司
    let company = await prisma.company.findFirst();

    if (!company) {
      console.log('🏢 建立示範公司...');
      company = await prisma.company.create({
        data: {
          name: '綠能科技股份有限公司',
          industry: '科技製造業',
          address: '台北市信義區信義路五段7號',
          contactEmail: 'contact@greentech.com.tw',
          contactPhone: '(02) 2345-6789',
          registrationNum: '12345678',
        },
      });
      console.log(`✅ 已建立公司: ${company.name} (ID: ${company.id})\n`);
    } else {
      console.log(`🏢 使用現有公司: ${company.name} (ID: ${company.id})\n`);
    }

    // 清除該公司的現有碳排放數據（可選）
    console.log('🗑️  清除現有碳排放數據...');
    const deleted = await prisma.carbonEmission.deleteMany({
      where: { companyId: company.id },
    });
    console.log(`✅ 已刪除 ${deleted.count} 筆舊數據\n`);

    // 導入新數據
    console.log('📥 開始導入數據...');
    let imported = 0;
    const batchSize = 50;

    for (let i = 0; i < seedData.data.length; i += batchSize) {
      const batch = seedData.data.slice(i, i + batchSize);

      await prisma.carbonEmission.createMany({
        data: batch.map((item) => ({
          companyId: company.id,
          date: new Date(item.date),
          scope1: item.scope1,
          scope2: item.scope2,
          scope3: item.scope3,
          totalCarbon: item.totalCarbon,
          electricity: item.electricity,
          naturalGas: item.naturalGas,
          fuel: item.fuel,
          transport: item.transport,
          waste: item.waste,
          water: item.water,
          dataSource: item.dataSource,
          verified: item.verified,
          notes: item.notes,
        })),
      });

      imported += batch.length;
      process.stdout.write(`\r   進度: ${imported}/${seedData.data.length} (${Math.round(imported / seedData.data.length * 100)}%)`);
    }

    console.log('\n\n✅ 數據導入完成！\n');

    // 驗證導入結果
    const count = await prisma.carbonEmission.count({
      where: { companyId: company.id },
    });

    const earliest = await prisma.carbonEmission.findFirst({
      where: { companyId: company.id },
      orderBy: { date: 'asc' },
    });

    const latest = await prisma.carbonEmission.findFirst({
      where: { companyId: company.id },
      orderBy: { date: 'desc' },
    });

    console.log('📝 導入結果摘要:');
    console.log(`   - 總筆數: ${count}`);
    console.log(`   - 最早日期: ${earliest?.date.toISOString().split('T')[0]}`);
    console.log(`   - 最新日期: ${latest?.date.toISOString().split('T')[0]}`);
    console.log(`   - 公司ID: ${company.id}`);
    console.log();

  } catch (error) {
    console.error('❌ 導入失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行導入
importCarbonData()
  .then(() => {
    console.log('🎉 所有操作完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('發生錯誤:', error);
    process.exit(1);
  });
