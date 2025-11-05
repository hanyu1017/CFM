// scripts/diagnose-prisma.js
const fs = require('fs');
const path = require('path');

console.log('🔍 診斷 Prisma 設置...\n');

// 檢查 1: node_modules/@prisma/client 是否存在
const prismaClientPath = path.join(__dirname, '../node_modules/@prisma/client');
console.log('1️⃣ 檢查 @prisma/client 包:');
if (fs.existsSync(prismaClientPath)) {
  console.log('   ✅ @prisma/client 存在於', prismaClientPath);
} else {
  console.log('   ❌ @prisma/client 不存在');
  console.log('   🔧 解決: 執行 npm install @prisma/client');
}

// 檢查 2: node_modules/.prisma/client 是否存在
const generatedClientPath = path.join(__dirname, '../node_modules/.prisma/client');
console.log('\n2️⃣ 檢查生成的 Prisma Client:');
if (fs.existsSync(generatedClientPath)) {
  console.log('   ✅ 生成的 client 存在於', generatedClientPath);

  // 檢查關鍵文件
  const indexPath = path.join(generatedClientPath, 'index.js');
  const defaultPath = path.join(generatedClientPath, 'default.js');

  if (fs.existsSync(indexPath)) {
    console.log('   ✅ index.js 存在');
  } else {
    console.log('   ❌ index.js 不存在');
  }

  if (fs.existsSync(defaultPath)) {
    console.log('   ✅ default.js 存在');
    // 檢查文件內容
    try {
      const content = fs.readFileSync(defaultPath, 'utf8');
      if (content.includes('#main-entry-point')) {
        console.log('   ⚠️  發現 #main-entry-point 引用（這可能是問題所在）');
      }
    } catch (e) {
      console.log('   ⚠️  無法讀取 default.js');
    }
  } else {
    console.log('   ❌ default.js 不存在');
  }
} else {
  console.log('   ❌ 生成的 client 不存在');
  console.log('   🔧 解決: 執行 npx prisma generate');
}

// 檢查 3: schema.prisma 是否存在
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
console.log('\n3️⃣ 檢查 Prisma schema:');
if (fs.existsSync(schemaPath)) {
  console.log('   ✅ schema.prisma 存在');
} else {
  console.log('   ❌ schema.prisma 不存在');
}

// 檢查 4: DATABASE_URL 環境變量
console.log('\n4️⃣ 檢查環境變量:');
if (process.env.DATABASE_URL) {
  console.log('   ✅ DATABASE_URL 已設置');
  console.log('   📝 值:', process.env.DATABASE_URL.substring(0, 20) + '...');
} else {
  console.log('   ⚠️  DATABASE_URL 未設置（seed 可能需要）');
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    console.log('   ℹ️  .env.local 存在，但環境變量未加載');
  } else {
    console.log('   ⚠️  .env.local 不存在');
  }
}

// 檢查 5: package.json 依賴
console.log('\n5️⃣ 檢查 package.json:');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const prismaVersion = packageJson.devDependencies?.prisma;
  const clientVersion = packageJson.dependencies?.['@prisma/client'];

  console.log('   📦 prisma 版本:', prismaVersion || '未安裝');
  console.log('   📦 @prisma/client 版本:', clientVersion || '未安裝');

  if (prismaVersion !== clientVersion) {
    console.log('   ⚠️  警告: prisma 和 @prisma/client 版本不一致！');
  }
}

// 建議
console.log('\n💡 建議的修復步驟:');
console.log('   1. 刪除 node_modules 和 package-lock.json');
console.log('      Remove-Item -Recurse -Force node_modules, package-lock.json');
console.log('   ');
console.log('   2. 重新安裝依賴');
console.log('      npm install');
console.log('   ');
console.log('   3. 生成 Prisma Client');
console.log('      npx prisma generate');
console.log('   ');
console.log('   4. 執行 seed');
console.log('      npm run prisma:seed');
console.log('');
