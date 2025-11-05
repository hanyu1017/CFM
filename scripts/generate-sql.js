// scripts/generate-sql.js
// 生成 SQL 插入語句，無需 Prisma Client

const fs = require('fs');
const path = require('path');

console.log('🌱 生成 SQL 插入語句...\n');

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
console.log();

// 生成 SQL
let sql = `-- 碳排放數據導入 SQL
-- 生成時間: ${new Date().toISOString()}
-- 數據點: ${seedData.metadata.dataPoints}

-- 首先，確保有一個公司記錄
INSERT INTO "Company" (id, name, industry, address, "contactEmail", "contactPhone", "registrationNum", "createdAt", "updatedAt")
VALUES (
  'company_seed_001',
  '綠能科技股份有限公司',
  '科技製造業',
  '台北市信義區信義路五段7號',
  'contact@greentech.com.tw',
  '(02) 2345-6789',
  '12345678',
  NOW(),
  NOW()
)
ON CONFLICT ("registrationNum") DO NOTHING;

-- 清除該公司的現有碳排放數據（可選，如需保留請刪除下一行）
DELETE FROM "CarbonEmission" WHERE "companyId" = 'company_seed_001';

-- 插入碳排放數據
`;

// 生成插入語句
seedData.data.forEach((item, index) => {
  const date = new Date(item.date);
  const id = `carbon_emission_${date.getTime()}_${index}`;

  sql += `INSERT INTO "CarbonEmission" (
  id, "companyId", date,
  scope1, scope2, scope3, "totalCarbon",
  electricity, "naturalGas", fuel, transport, waste, water,
  "dataSource", verified, notes,
  "createdAt", "updatedAt"
) VALUES (
  '${id}',
  'company_seed_001',
  '${item.date}',
  ${item.scope1}, ${item.scope2}, ${item.scope3}, ${item.totalCarbon},
  ${item.electricity}, ${item.naturalGas}, ${item.fuel}, ${item.transport}, ${item.waste}, ${item.water},
  '${item.dataSource}',
  ${item.verified},
  '${item.notes}',
  NOW(),
  NOW()
);
`;
});

// 添加統計查詢
sql += `
-- 驗證插入結果
SELECT
  COUNT(*) as total_records,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  SUM("totalCarbon") as total_emissions
FROM "CarbonEmission"
WHERE "companyId" = 'company_seed_001';
`;

// 寫入文件
const outputPath = path.join(process.cwd(), 'data', 'seed-data.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');

console.log('✅ SQL 文件生成完成！');
console.log(`📄 文件位置: ${outputPath}`);
console.log();
console.log('📝 使用方法：');
console.log();
console.log('方法 1: 使用 psql 命令行');
console.log('  psql -U username -d carbon_db -f data/seed-data.sql');
console.log();
console.log('方法 2: 使用 pgAdmin 或其他資料庫工具');
console.log('  1. 開啟 data/seed-data.sql 文件');
console.log('  2. 複製 SQL 內容');
console.log('  3. 在查詢編輯器中執行');
console.log();
console.log('方法 3: 使用 Node.js pg 庫');
console.log('  npm install pg');
console.log('  npm run seed:import-pg');
console.log();
