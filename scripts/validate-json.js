// scripts/validate-json.js
// 驗證和修復 JSON 文件

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'data', 'carbon-emissions-seed.json');

console.log('🔍 檢查 JSON 文件...\n');

if (!fs.existsSync(jsonPath)) {
  console.error('❌ 找不到文件:', jsonPath);
  console.error('請先運行: npm run seed:generate-clean');
  process.exit(1);
}

const fileContent = fs.readFileSync(jsonPath, 'utf-8');

console.log(`📄 文件大小: ${fileContent.length} 字符`);
console.log(`📄 文件前 100 字符: ${fileContent.substring(0, 100)}`);
console.log();

// 嘗試找到 JSON 的開始位置
const jsonStart = fileContent.indexOf('{');
const jsonEnd = fileContent.lastIndexOf('}') + 1;

if (jsonStart === -1 || jsonEnd === 0) {
  console.error('❌ 無法找到有效的 JSON 結構');
  console.error('建議重新生成: npm run seed:generate-clean');
  process.exit(1);
}

console.log(`📊 JSON 開始位置: ${jsonStart}`);
console.log(`📊 JSON 結束位置: ${jsonEnd}`);

if (jsonStart > 0) {
  console.log(`⚠️  檢測到 JSON 前有 ${jsonStart} 個字符的額外內容`);
  console.log(`   內容: ${fileContent.substring(0, jsonStart)}`);
  console.log();
}

if (jsonEnd < fileContent.length) {
  console.log(`⚠️  檢測到 JSON 後有 ${fileContent.length - jsonEnd} 個字符的額外內容`);
  console.log(`   內容: ${fileContent.substring(jsonEnd, Math.min(jsonEnd + 100, fileContent.length))}`);
  console.log();
}

// 提取純 JSON
const pureJson = fileContent.substring(jsonStart, jsonEnd);

console.log('🔧 嘗試解析 JSON...');
try {
  const data = JSON.parse(pureJson);
  console.log('✅ JSON 格式有效！\n');

  console.log('📊 數據摘要:');
  console.log(`   - 數據點: ${data.metadata.dataPoints}`);
  console.log(`   - 時間範圍: ${data.metadata.dateRange.start.split('T')[0]} ~ ${data.metadata.dateRange.end.split('T')[0]}`);
  console.log(`   - 總碳排放: ${data.metadata.statistics.totalEmissions} tCO2e`);
  console.log();

  // 如果有額外內容，提供修復選項
  if (jsonStart > 0 || jsonEnd < fileContent.length) {
    console.log('🔧 檢測到額外內容，正在自動修復...');

    // 備份原文件
    const backupPath = jsonPath + '.backup';
    fs.writeFileSync(backupPath, fileContent, 'utf-8');
    console.log(`📦 原文件已備份到: ${backupPath}`);

    // 寫入純 JSON
    fs.writeFileSync(jsonPath, pureJson, 'utf-8');
    console.log(`✅ 已修復並保存純 JSON 文件`);
    console.log();
    console.log('🎉 現在可以運行: npm run seed:import-pg');
  } else {
    console.log('✅ JSON 文件完全正常，可以直接使用');
    console.log('🎉 運行: npm run seed:import-pg');
  }

} catch (error) {
  console.error('❌ JSON 解析失敗:', error.message);
  console.error('\n建議操作：');
  console.error('1. 重新生成文件: npm run seed:generate-clean');
  console.error('2. 或檢查文件內容是否正確');
  process.exit(1);
}
