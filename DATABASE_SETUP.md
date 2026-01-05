# 資料庫設置指南

本文件說明如何設置資料庫並載入範例數據。

## 前置需求

確保您已經設置好 `DATABASE_URL` 環境變數。

## 步驟 1: 生成 Prisma Client

```bash
npx prisma generate
```

## 步驟 2: 推送 Schema 到資料庫

```bash
npx prisma db push
```

這將會：
- 創建所有必要的資料表
- 建立索引和關聯

## 步驟 3: 執行種子數據

```bash
npm run prisma:seed
```

或

```bash
npx ts-node prisma/seed.ts
```

### 種子數據包含：

1. **示範公司**
   - 公司名稱: 綠能科技股份有限公司
   - 產業: 科技製造業
   - 包含完整的聯絡資訊

2. **碳排放數據**
   - 過去 90 天的每日數據
   - 包含 Scope 1, 2, 3 排放
   - 細分數據：電力、天然氣、燃料、運輸、廢棄物、用水

3. **減排目標**
   - 2025 年目標：減少 10%
   - 2030 年目標：減少 30%
   - 2050 年目標：淨零排放

4. **系統設定**
   - 報告設定（2項）
   - 通知設定（2項）
   - 數據同步（2項）
   - API配置（2項）

5. **決策模型參數**
   - 預設參數配置

6. **示範報告**
   - 2024年度碳盤查與管理報告（草稿）

## 步驟 4: 驗證數據

使用 Prisma Studio 檢查數據：

```bash
npm run prisma:studio
```

瀏覽器會自動開啟 `http://localhost:5555`，您可以在這裡查看和編輯資料。

## API Endpoints

### 儀表板 API
- `GET /api/carbon/dashboard?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - 支援日期範圍查詢
  - 預設返回過去 30 天數據

### 設定 API

#### 公司資料
- `GET /api/settings/company` - 取得公司資料
- `POST /api/settings/company` - 新增或更新公司資料

#### 減排目標
- `GET /api/settings/targets` - 取得所有目標
- `POST /api/settings/targets` - 新增目標
- `PUT /api/settings/targets/[id]` - 更新目標
- `DELETE /api/settings/targets/[id]` - 刪除目標

#### 系統配置
- `GET /api/settings/config` - 取得所有配置
- `PUT /api/settings/config/[id]` - 更新配置

## 前端功能

### 儀表板頁面
- ✅ 日期範圍選擇器
- ✅ 快速過濾按鈕（7天、30天、90天、今年）
- ✅ 即時指標卡片
- ✅ 互動式圖表（趨勢圖、圓餅圖、柱狀圖）

### 設定頁面
- ✅ 公司資料管理（新增/編輯）
- ✅ 減排目標管理（新增/編輯/刪除）
- ✅ 系統配置管理（編輯）
- ✅ 完整的錯誤處理和用戶反饋

## 疑難排解

### 問題：Prisma Client 生成失敗
**解決方案：**
```bash
rm -rf node_modules/.prisma
npm run prisma:generate
```

### 問題：資料庫連線失敗
**解決方案：**
1. 檢查 `.env` 文件中的 `DATABASE_URL`
2. 確保資料庫服務正在運行
3. 驗證連線字串格式

### 問題：種子數據執行失敗
**解決方案：**
1. 確保先執行 `npx prisma db push`
2. 檢查 `ts-node` 是否已安裝
3. 查看錯誤訊息並修正數據格式

## 資料庫 Schema 概覽

- `Company` - 公司基本資料
- `CarbonEmission` - 碳排放數據（按日）
- `EmissionTarget` - 減排目標
- `CompanySetting` - 系統配置
- `ModelParameter` - 決策模型參數
- `OptimizationResult` - 優化結果
- `SensitivityAnalysis` - 敏感性分析
- `SustainabilityReport` - 碳盤查與管理報告
- `ChatMessage` - AI 對話記錄
- `AuditLog` - 系統日誌

詳細的 Schema 定義請參考 `prisma/schema.prisma`。
