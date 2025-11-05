# scripts/fix-prisma.ps1
# PowerShell 腳本用於修復 Prisma 問題

Write-Host "🔧 開始修復 Prisma 設置..." -ForegroundColor Cyan
Write-Host ""

# 步驟 1: 清理
Write-Host "1️⃣ 清理現有安裝..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma"
    Write-Host "   ✅ 已刪除 node_modules\.prisma" -ForegroundColor Green
}
if (Test-Path "node_modules\@prisma") {
    Remove-Item -Recurse -Force "node_modules\@prisma"
    Write-Host "   ✅ 已刪除 node_modules\@prisma" -ForegroundColor Green
}

Write-Host ""

# 步驟 2: 重新安裝 Prisma
Write-Host "2️⃣ 重新安裝 Prisma 包..." -ForegroundColor Yellow
npm install @prisma/client@6.18.0 --save
npm install prisma@6.18.0 --save-dev

Write-Host ""

# 步驟 3: 生成 Prisma Client
Write-Host "3️⃣ 生成 Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""

# 步驟 4: 測試
Write-Host "4️⃣ 測試 Prisma Client..." -ForegroundColor Yellow
$testScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('✅ Prisma Client 載入成功！');
prisma.`$disconnect();
"@

$testScript | Out-File -FilePath "test-prisma.js" -Encoding UTF8
node test-prisma.js
Remove-Item "test-prisma.js"

Write-Host ""
Write-Host "✨ 修復完成！現在可以執行: npm run prisma:seed" -ForegroundColor Green
