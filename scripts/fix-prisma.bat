@echo off
REM scripts/fix-prisma.bat
REM Windows批處理腳本用於修復 Prisma 問題

echo.
echo 🔧 開始修復 Prisma 設置...
echo.

REM 步驟 1: 清理
echo 1️⃣ 清理現有安裝...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo    ✅ 已刪除 node_modules\.prisma
)
if exist "node_modules\@prisma" (
    rmdir /s /q "node_modules\@prisma"
    echo    ✅ 已刪除 node_modules\@prisma
)
echo.

REM 步驟 2: 重新安裝 Prisma
echo 2️⃣ 重新安裝 Prisma 包...
call npm install @prisma/client@6.18.0 --save
call npm install prisma@6.18.0 --save-dev
echo.

REM 步驟 3: 生成 Prisma Client
echo 3️⃣ 生成 Prisma Client...
call npx prisma generate
echo.

REM 步驟 4: 測試
echo 4️⃣ 測試 Prisma Client...
echo const { PrismaClient } = require('@prisma/client'); > test-prisma.js
echo const prisma = new PrismaClient(); >> test-prisma.js
echo console.log('✅ Prisma Client 載入成功！'); >> test-prisma.js
echo prisma.$disconnect(); >> test-prisma.js

call node test-prisma.js
del test-prisma.js
echo.

echo ✨ 修復完成！現在可以執行: npm run prisma:seed
pause
