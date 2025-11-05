# 🔧 故障排除指南

如果您在導入碳排放數據時遇到問題，請按照以下步驟操作。

## ❌ 錯誤：Cannot find module '#main-entry-point'

這是 Prisma Client 生成問題。

### 解決方案 1: 重新生成 Prisma Client（推薦）

```powershell
# Windows PowerShell

# 1. 刪除舊的 Prisma Client
rmdir /s /q node_modules\.prisma

# 2. 重新生成
npx prisma generate

# 3. 再次嘗試導入
npm run seed:import
```

### 解決方案 2: 使用 pg 庫導入（不依賴 Prisma Client）

```powershell
# 1. 安裝 pg 庫
npm install pg

# 2. 設置資料庫連接
$env:DATABASE_URL="postgresql://username:password@localhost:5432/carbon_db"

# 3. 使用 pg 導入
npm run seed:import-pg
```

這個方法**不需要 Prisma Client**，直接使用 PostgreSQL 原生驅動。

### 解決方案 3: 生成 SQL 文件手動執行

如果上述方法都不行，可以生成 SQL 文件手動執行：

```powershell
# 1. 生成 SQL 文件
npm run seed:generate-sql

# 2. 使用 psql 執行（如果已安裝）
psql -U your_username -d carbon_db -f data/seed-data.sql

# 或者使用 pgAdmin 等圖形工具：
# - 開啟 data/seed-data.sql
# - 複製內容到查詢編輯器
# - 執行查詢
```

---

## ❌ 錯誤：Cannot find module '@prisma/client'

### 解決方案

```powershell
# 確保已安裝依賴
npm install

# 生成 Prisma Client
npx prisma generate
```

---

## ❌ 錯誤：找不到數據文件

完整錯誤訊息：
```
❌ 找不到數據文件: C:\...\data\carbon-emissions-seed.json
```

### 解決方案

```powershell
# 生成數據文件
npm run seed:generate > data/carbon-emissions-seed.json

# 檢查文件是否存在
dir data\carbon-emissions-seed.json

# 然後重新導入
npm run seed:import-pg
```

---

## ❌ 資料庫連接錯誤

完整錯誤訊息：
```
Error: connect ECONNREFUSED
```

### 檢查清單

1. **PostgreSQL 是否正在運行？**
   ```powershell
   # 檢查 PostgreSQL 服務（Windows）
   Get-Service postgresql*

   # 或檢查端口是否開啟
   netstat -an | findstr :5432
   ```

2. **DATABASE_URL 是否正確設置？**
   ```powershell
   # 檢查環境變數
   echo $env:DATABASE_URL

   # 正確格式應該是：
   # postgresql://username:password@localhost:5432/database_name
   ```

3. **資料庫是否存在？**
   ```sql
   -- 使用 psql 或 pgAdmin 連接並檢查
   \l  -- 列出所有資料庫
   ```

4. **用戶權限是否正確？**
   ```sql
   -- 確保用戶有權限訪問資料庫
   GRANT ALL PRIVILEGES ON DATABASE carbon_db TO your_username;
   ```

---

## ❌ 權限錯誤

### Windows 特定問題

如果遇到文件權限問題：

```powershell
# 以管理員身份運行 PowerShell
# 右鍵點擊 PowerShell -> 以管理員身份執行

# 然後重新執行命令
```

---

## 🔍 診斷工具

### 檢查 Prisma Client 狀態

```powershell
npm run prisma:fix
```

這個命令會檢查：
- Prisma Client 是否存在
- 文件結構是否正確
- 並提供修復建議

---

## 📋 完整重置流程

如果所有方法都不行，嘗試完全重置：

```powershell
# 1. 清除所有生成的文件
rmdir /s /q node_modules\.prisma
rmdir /s /q node_modules\@prisma

# 2. 重新安裝依賴
npm install

# 3. 生成 Prisma Client
npx prisma generate

# 4. 推送資料庫結構
$env:DATABASE_URL="postgresql://username:password@localhost:5432/carbon_db"
npx prisma db push

# 5. 使用 pg 方法導入（最可靠）
npm install pg
npm run seed:import-pg
```

---

## 🆘 仍然無法解決？

### 方法 A: 使用 SQL 文件（100% 可靠）

這是最可靠的方法，不依賴任何 Node.js 庫：

```powershell
# 1. 生成 SQL 文件
npm run seed:generate-sql

# 2. 手動執行 SQL
# 使用任何 PostgreSQL 客戶端工具執行 data/seed-data.sql
```

### 方法 B: 檢查 Node.js 版本

```powershell
# 檢查 Node.js 版本
node --version

# 本專案需要 Node.js >= 18.0.0
# 如果版本過低，請升級
```

### 方法 C: 使用 Prisma Studio

```powershell
# 啟動 Prisma Studio
npm run prisma:studio

# 在瀏覽器中手動添加數據
# 或使用 Studio 的導入功能
```

---

## 📊 驗證導入成功

成功導入後，使用以下命令驗證：

```sql
-- 連接到資料庫並執行

-- 檢查記錄數量
SELECT COUNT(*) FROM "CarbonEmission";

-- 檢查日期範圍
SELECT MIN(date) as earliest, MAX(date) as latest
FROM "CarbonEmission";

-- 檢查總碳排放
SELECT SUM("totalCarbon") as total_emissions
FROM "CarbonEmission";
```

預期結果：
- 記錄數量：180
- 日期範圍：約 6 個月
- 總排放：約 69,539 tCO2e

---

## 💡 推薦方法排序

根據可靠性和易用性：

1. ✅ **使用 pg 庫**（不依賴 Prisma Client）
   ```powershell
   npm install pg
   npm run seed:import-pg
   ```

2. ✅ **生成 SQL 文件手動執行**（最可靠）
   ```powershell
   npm run seed:generate-sql
   # 然後使用 psql 或 pgAdmin 執行
   ```

3. ⚠️ **修復 Prisma Client**（可能需要多次嘗試）
   ```powershell
   rmdir /s /q node_modules\.prisma
   npx prisma generate
   npm run seed:import
   ```

4. ⚠️ **使用 Prisma Studio**（手動，適合小量數據）
   ```powershell
   npm run prisma:studio
   ```

---

## 📞 獲取幫助

如果仍然遇到問題：

1. 查看詳細文檔：`data/README.md`
2. 查看快速開始：`QUICK_START.md`
3. 檢查錯誤日誌的詳細訊息
4. 在 GitHub 提交 Issue（包含錯誤訊息和環境資訊）

---

**記住：使用 `npm run seed:import-pg` 是最可靠的方法！** ✨
