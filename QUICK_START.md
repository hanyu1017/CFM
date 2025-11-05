# 🚀 快速開始指南 - 碳排放數據導入

這個指南將幫助您快速導入過去 6 個月的碳排放數據到您的資料庫。

## 📋 前置需求

1. Node.js >= 18.0.0
2. PostgreSQL 資料庫（已設置並運行）
3. 已克隆此專案並安裝依賴

## ⚡ 快速開始（3 步驟）

### 步驟 1: 設置資料庫連接

在您的終端中設置 `DATABASE_URL` 環境變數：

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://username:password@localhost:5432/carbon_db"
```

**macOS / Linux / Git Bash:**
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/carbon_db"
```

> 💡 將 `username`、`password` 和 `carbon_db` 替換為您的實際資料庫資訊

### 步驟 2: 初始化資料庫結構

```bash
# 生成 Prisma Client
npx prisma generate

# 將 schema 推送到資料庫
npx prisma db push
```

### 步驟 3: 導入數據

#### 方法 A: 使用 pg 庫（推薦，最可靠）

```bash
# 安裝 pg 庫（如果尚未安裝）
npm install pg

# 導入數據（不依賴 Prisma Client）
npm run seed:import-pg
```

#### 方法 B: 生成 SQL 文件手動執行（100% 可靠）

```bash
# 1. 生成 SQL 文件
npm run seed:generate-sql

# 2. 使用 psql 執行
psql -U username -d carbon_db -f data/seed-data.sql

# 或使用 pgAdmin 等圖形工具開啟並執行 data/seed-data.sql
```

#### 方法 C: 使用 Prisma Client（可能需要修復）

```bash
# 如果遇到錯誤，先重新生成 Prisma Client
rmdir /s /q node_modules\.prisma  # Windows
npx prisma generate

# 然後導入
npm run seed:import
```

> 💡 **建議**: 如果遇到 Prisma Client 錯誤，使用方法 A 或 B

## ✅ 驗證導入

導入成功後，您應該看到類似以下的輸出：

```
🌱 開始導入碳排放數據...

📊 數據文件資訊:
   - 數據點: 180
   - 時間範圍: 2025-05-10 ~ 2025-11-05
   - 總碳排放: 69539.46 tCO2e

🏢 使用現有公司: 綠能科技股份有限公司 (ID: xxx)

🗑️  清除現有碳排放數據...
✅ 已刪除 0 筆舊數據

📥 開始導入數據...
   進度: 180/180 (100%)

✅ 數據導入完成！

📝 導入結果摘要:
   - 總筆數: 180
   - 最早日期: 2025-05-10
   - 最新日期: 2025-11-05
   - 公司ID: xxx

🎉 所有操作完成！
```

## 🎯 查看數據

### 方法 1: 使用 Prisma Studio

```bash
npm run prisma:studio
```

這將打開一個網頁界面，您可以在瀏覽器中查看所有數據。

### 方法 2: 啟動應用程式

```bash
npm run dev
```

然後訪問 http://localhost:3000/dashboard 查看儀表板。

## 🔧 進階選項

### 自定義數據生成

如果您想生成不同天數的數據：

1. 編輯 `scripts/generate-seed-data.js`
2. 修改第 5 行的 `generateCarbonEmissionData(180)` 中的數字
3. 重新生成：`npm run seed:generate > data/carbon-emissions-seed.json`
4. 導入：`npm run seed:import`

### 使用 Prisma Seed 腳本

如果您更喜歡使用 TypeScript 版本：

```bash
npm run prisma:seed
```

這會直接生成並導入 180 天的數據到資料庫。

## ❓ 常見問題

### Q: 出現 "Cannot find module '#main-entry-point'" 錯誤

**A:** 這是 Prisma Client 生成問題。使用以下解決方案：

**推薦解決方案**：使用 pg 庫（不依賴 Prisma Client）
```bash
npm install pg
npm run seed:import-pg
```

或者重新生成 Prisma Client：
```bash
rmdir /s /q node_modules\.prisma
npx prisma generate
npm run seed:import
```

### Q: 導入時出現 "找不到數據文件" 錯誤

**A:** 確保 `data/carbon-emissions-seed.json` 文件存在。如果不存在，運行：
```bash
npm run seed:generate > data/carbon-emissions-seed.json
```

### Q: 出現 "Cannot find module '@prisma/client'" 錯誤

**A:** 運行 `npx prisma generate` 來生成 Prisma Client。或使用 `npm run seed:import-pg` 避免此問題。

### Q: 資料庫連接失敗

**A:** 檢查：
1. PostgreSQL 是否正在運行
2. `DATABASE_URL` 是否正確設置
3. 資料庫憑證是否正確
4. 資料庫是否已創建

### Q: 導入會覆蓋現有數據嗎？

**A:** 是的，導入腳本會先刪除該公司的所有碳排放數據，然後導入新數據。如果要保留現有數據，請先備份。

### Q: 可以導入到不同的公司嗎？

**A:** 可以。編輯 `scripts/import-seed-data.js`，修改公司查詢邏輯或創建新公司。

## 📊 數據說明

導入的數據包含：
- **180 天**的每日碳排放記錄
- **Scope 1/2/3** 排放分類
- **細分數據**：電力、天然氣、燃料、運輸、廢棄物、用水
- **真實特性**：週末效應、季節性變化

## 🎨 前端功能

儀表板支持以下日期篩選功能：
- 快速選擇：7天、30天、90天、180天
- 自定義日期範圍
- 實時數據更新（每 5 秒）

API 端點：
```
GET /api/carbon/dashboard?startDate=2025-05-10&endDate=2025-11-05
```

## 📚 更多資訊

- 詳細文檔：[data/README.md](./data/README.md)
- Prisma 文檔：https://www.prisma.io/docs
- 專案 README：[README.md](./README.md)

## 💡 提示

1. 首次使用建議使用預先生成的數據（更快）
2. 在生產環境前先在測試環境中試用
3. 定期備份資料庫
4. 查看 `data/README.md` 了解更多選項

## 🆘 需要幫助？

如果遇到問題：
1. 檢查終端的錯誤訊息
2. 確認所有前置需求已滿足
3. 查看 [data/README.md](./data/README.md) 的詳細說明
4. 提交 Issue 到 GitHub

---

**祝您使用愉快！** 🌱
