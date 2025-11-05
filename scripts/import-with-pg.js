// scripts/import-with-pg.js
// 使用原生 pg 庫導入數據，不依賴 Prisma Client

const fs = require('fs');
const path = require('path');

// 檢查 pg 是否已安裝
let Client;
try {
  const pg = require('pg');
  Client = pg.Client;
} catch (err) {
  console.error('❌ 找不到 pg 模組');
  console.error('請先安裝: npm install pg');
  console.error('或使用: npm run seed:generate-sql 生成 SQL 文件手動執行');
  process.exit(1);
}

async function importWithPg() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🌱 開始使用 pg 導入碳排放數據...\n');

    // 連接到資料庫
    await client.connect();
    console.log('✅ 已連接到資料庫\n');

    // 讀取 JSON 數據
    const jsonPath = path.join(process.cwd(), 'data', 'carbon-emissions-seed.json');

    if (!fs.existsSync(jsonPath)) {
      console.error('❌ 找不到數據文件:', jsonPath);
      console.error('請先執行: npm run seed:generate > data/carbon-emissions-seed.json');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const seedData = JSON.parse(fileContent);

    console.log('📊 數據文件資訊:');
    console.log(`   - 數據點: ${seedData.metadata.dataPoints}`);
    console.log(`   - 時間範圍: ${seedData.metadata.dateRange.start.split('T')[0]} ~ ${seedData.metadata.dateRange.end.split('T')[0]}`);
    console.log(`   - 總碳排放: ${seedData.metadata.statistics.totalEmissions} tCO2e`);
    console.log();

    // 開始事務
    await client.query('BEGIN');

    // 1. 檢查或創建公司
    console.log('🏢 檢查公司資料...');
    const companyResult = await client.query(
      `SELECT id, name FROM "Company" WHERE "registrationNum" = $1`,
      ['12345678']
    );

    let companyId;
    if (companyResult.rows.length === 0) {
      console.log('   建立新公司...');
      const insertResult = await client.query(
        `INSERT INTO "Company" (id, name, industry, address, "contactEmail", "contactPhone", "registrationNum", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, name`,
        [
          'company_seed_001',
          '綠能科技股份有限公司',
          '科技製造業',
          '台北市信義區信義路五段7號',
          'contact@greentech.com.tw',
          '(02) 2345-6789',
          '12345678'
        ]
      );
      companyId = insertResult.rows[0].id;
      console.log(`   ✅ 已建立公司: ${insertResult.rows[0].name} (ID: ${companyId})\n`);
    } else {
      companyId = companyResult.rows[0].id;
      console.log(`   ✅ 使用現有公司: ${companyResult.rows[0].name} (ID: ${companyId})\n`);
    }

    // 2. 清除現有數據
    console.log('🗑️  清除現有碳排放數據...');
    const deleteResult = await client.query(
      `DELETE FROM "CarbonEmission" WHERE "companyId" = $1`,
      [companyId]
    );
    console.log(`   ✅ 已刪除 ${deleteResult.rowCount} 筆舊數據\n`);

    // 3. 插入新數據
    console.log('📥 開始導入數據...');
    let imported = 0;

    for (const item of seedData.data) {
      const date = new Date(item.date);
      const id = `carbon_emission_${date.getTime()}_${imported}`;

      await client.query(
        `INSERT INTO "CarbonEmission" (
          id, "companyId", date,
          scope1, scope2, scope3, "totalCarbon",
          electricity, "naturalGas", fuel, transport, waste, water,
          "dataSource", verified, notes,
          "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
        [
          id,
          companyId,
          item.date,
          item.scope1,
          item.scope2,
          item.scope3,
          item.totalCarbon,
          item.electricity,
          item.naturalGas,
          item.fuel,
          item.transport,
          item.waste,
          item.water,
          item.dataSource,
          item.verified,
          item.notes
        ]
      );

      imported++;
      if (imported % 10 === 0) {
        process.stdout.write(`\r   進度: ${imported}/${seedData.data.length} (${Math.round(imported / seedData.data.length * 100)}%)`);
      }
    }

    console.log(`\r   進度: ${imported}/${seedData.data.length} (100%)`);
    console.log('\n✅ 數據導入完成！\n');

    // 提交事務
    await client.query('COMMIT');

    // 4. 驗證結果
    const countResult = await client.query(
      `SELECT COUNT(*) as count FROM "CarbonEmission" WHERE "companyId" = $1`,
      [companyId]
    );

    const dateRangeResult = await client.query(
      `SELECT MIN(date) as earliest, MAX(date) as latest FROM "CarbonEmission" WHERE "companyId" = $1`,
      [companyId]
    );

    console.log('📝 導入結果摘要:');
    console.log(`   - 總筆數: ${countResult.rows[0].count}`);
    console.log(`   - 最早日期: ${dateRangeResult.rows[0].earliest.toISOString().split('T')[0]}`);
    console.log(`   - 最新日期: ${dateRangeResult.rows[0].latest.toISOString().split('T')[0]}`);
    console.log(`   - 公司ID: ${companyId}`);
    console.log();

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 導入失敗:', error.message);
    console.error('\n詳細錯誤:');
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
}

// 執行導入
importWithPg()
  .then(() => {
    console.log('🎉 所有操作完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('發生錯誤:', error.message);
    process.exit(1);
  });
