// scripts/fix-prisma.js
// 檢查和修復 Prisma Client 問題

const fs = require('fs');
const path = require('path');

console.log('🔍 檢查 Prisma Client 狀態...\n');

// 檢查 Prisma Client 目錄
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
const prismaClientExists = fs.existsSync(prismaClientPath);

console.log(`📁 .prisma/client 目錄: ${prismaClientExists ? '✅ 存在' : '❌ 不存在'}`);

if (prismaClientExists) {
  const files = fs.readdirSync(prismaClientPath);
  console.log(`📄 文件數量: ${files.length}`);
  console.log(`📄 文件列表: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}\n`);
}

// 檢查 @prisma/client
const atPrismaPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
const atPrismaExists = fs.existsSync(atPrismaPath);

console.log(`📁 @prisma/client 目錄: ${atPrismaExists ? '✅ 存在' : '❌ 不存在'}\n`);

// 檢查 schema.prisma
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schemaExists = fs.existsSync(schemaPath);

console.log(`📁 prisma/schema.prisma: ${schemaExists ? '✅ 存在' : '❌ 不存在'}\n`);

// 建議
console.log('💡 建議的修復步驟：\n');
console.log('1. 清除 Prisma Client:');
console.log('   rmdir /s /q node_modules\\.prisma (Windows)');
console.log('   rm -rf node_modules/.prisma (macOS/Linux)');
console.log('');
console.log('2. 重新生成 Prisma Client:');
console.log('   npx prisma generate');
console.log('');
console.log('3. 或者使用替代方案:');
console.log('   npm run seed:import-simple');
console.log('');
