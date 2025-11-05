# 永續報告生成功能 - OpenAI + PDF 實現文檔

## 🎯 實現的需求

### 您的需求
1. **一鍵生成**：使用資料庫內上個月的碳排數據 + 公司資訊 → OpenAI API → 生成 PDF
2. **自定義生成**：根據選定時間段查找碳排數據 → OpenAI API → 生成 PDF

### 實現的功能
✅ 從資料庫查詢碳排數據和公司資訊
✅ 提交給 OpenAI API 生成專業報告內容
✅ 生成 PDF 文件並儲存
✅ 支持一鍵生成和自定義生成

---

## 📂 新增/修改的文件

### 1. 新增：PDF 生成工具
**文件**：`src/lib/pdf-generator.ts`

**功能**：
- 使用 pdfkit 庫生成 PDF
- 包含封面、目錄、數據摘要、8個章節、結束頁
- 自動格式化和排版
- 支持儲存到 public/reports 目錄

**關鍵函數**：
```typescript
// 生成 PDF
async function generatePDF(data: ReportData): Promise<Buffer>

// 儲存 PDF
async function savePDF(pdfBuffer: Buffer, filename: string): Promise<string>
```

### 2. 新增：AI 內容生成工具
**文件**：`src/lib/ai-content-generator.ts`

**功能**：
- 調用 OpenAI API 生成報告內容
- 包含 8 個專業章節
- 自動處理 API 失敗情況（使用備用內容）
- 支持繁體中文
- 符合 GRI、TCFD、CDP 等國際標準

**關鍵函數**：
```typescript
async function generateReportContent(data: CarbonDataSummary): Promise<ReportContent>
```

**生成的章節**：
1. 執行摘要（Executive Summary）
2. 碳足跡分析（Carbon Footprint Analysis）
3. 排放總結（Emissions Summary）
4. 減排目標（Reduction Targets）
5. 永續措施（Sustainability Initiatives）
6. 法規遵循（Compliance）
7. 財務影響（Financial Impact）
8. 利害關係人溝通（Stakeholder Engagement）

### 3. 更新：自定義報告生成 API
**文件**：`src/app/api/report/generate/route.ts`

**流程**：
```
① 獲取公司資料
② 查詢指定時間範圍的碳排放數據
③ 計算統計數據
④ 調用 OpenAI API 生成內容
⑤ 生成 PDF 文件
⑥ 儲存 PDF 到 public/reports
⑦ 儲存報告記錄到資料庫
⑧ 返回成功結果
```

### 4. 更新：一鍵報告生成 API
**文件**：`src/app/api/report/generate-quick/route.ts`

**流程**：
```
① 設定日期範圍（上個月的1號到月底）
② 查詢公司資料
③ 查詢上個月的碳排放數據
④ 計算統計數據
⑤ 調用 OpenAI API 生成內容
⑥ 生成 PDF 文件
⑦ 儲存 PDF
⑧ 儲存報告記錄到資料庫
⑨ 返回成功結果
```

---

## 🔄 完整生成流程

### 前端操作
```
使用者訪問 /report 頁面
    ↓
選擇生成方式：
  ├─ 一鍵生成（使用上個月數據）
  └─ 自定義報告（選擇時間範圍）
    ↓
點擊「生成報告」按鈕
    ↓
前端顯示載入狀態
    ↓
等待後端完成
    ↓
顯示成功訊息
    ↓
刷新報告列表
    ↓
可下載 PDF 文件
```

### 後端流程（詳細）

#### 步驟 1：查詢資料庫
```typescript
// 查詢公司資訊
const company = await prisma.company.findFirst();

// 查詢碳排放數據
const carbonData = await prisma.carbonEmission.findMany({
  where: {
    companyId: company.id,
    date: { gte: startDate, lte: endDate }
  }
});
```

#### 步驟 2：計算統計數據
```typescript
const totalEmissions = carbonData.reduce(...)
const scope1Total = carbonData.reduce(...)
const scope2Total = carbonData.reduce(...)
const scope3Total = carbonData.reduce(...)
const avgEmissions = totalEmissions / carbonData.length
```

#### 步驟 3：調用 OpenAI API
```typescript
const reportContent = await generateReportContent({
  companyName: company.name,
  period: '2024年10月',
  totalEmissions,
  scope1Total,
  scope2Total,
  scope3Total,
  // ...其他數據
});

// OpenAI 返回 8 個章節的內容
```

#### 步驟 4：生成 PDF
```typescript
const pdfBuffer = await generatePDF({
  company: { name, industry, address },
  reportInfo: { title, period, startDate, endDate },
  carbonData: { 統計數據 },
  content: { AI 生成的 8 個章節 }
});
```

#### 步驟 5：儲存 PDF
```typescript
// 儲存到 public/reports/report_TIMESTAMP.pdf
const pdfUrl = await savePDF(pdfBuffer, filename);
// 返回 URL: /reports/report_TIMESTAMP.pdf
```

#### 步驟 6：儲存到資料庫
```typescript
const report = await prisma.sustainabilityReport.create({
  data: {
    title, period, startDate, endDate,
    executiveSummary,  // AI 生成
    carbonFootprint,   // AI 生成
    emissionsSummary,  // AI 生成
    // ...其他 AI 生成的內容
    pdfUrl,
    totalEmissions
  }
});
```

---

## 🛠 技術細節

### 使用的庫

1. **pdfkit** - PDF 生成
   ```bash
   npm install pdfkit
   npm install @types/pdfkit --save-dev
   ```

2. **openai** - OpenAI API 客戶端（已安裝）

### 環境變數需求

```.env
# OpenAI API Key（必需）
OPENAI_API_KEY=sk-your-api-key-here

# 資料庫連接
DATABASE_URL=postgresql://...
```

### PDF 文件結構

```
📄 永續發展報告.pdf
├─ 封面頁
│  ├─ 報告標題
│  ├─ 公司名稱
│  ├─ 產業
│  ├─ 報告期間
│  └─ 生成時間
├─ 目錄頁
│  └─ 8個章節列表
├─ 碳排放數據摘要
│  ├─ 總排放量
│  ├─ 日均排放量
│  ├─ Scope 1/2/3 分析
│  └─ 主要排放源
├─ 第一章：執行摘要
├─ 第二章：碳足跡分析
├─ 第三章：排放總結
├─ 第四章：減排目標
├─ 第五章：永續措施
├─ 第六章：法規遵循
├─ 第七章：財務影響
├─ 第八章：利害關係人溝通
└─ 結束頁
```

### OpenAI Prompt 設計

**系統提示**：
```
你是一位專業的永續發展報告撰寫專家，
擅長根據碳排放數據撰寫符合國際標準的永續報告。
回覆必須是有效的 JSON 格式。
```

**用戶提示**：
```
請根據以下碳排放數據，為「公司名稱」生成一份完整、專業的永續發展報告內容。

碳排放數據：
- 總碳排放量：xxx tCO2e
- Scope 1/2/3 詳細數據
- 主要排放源

請生成以下8個章節的內容，每個章節約200-300字，
專業且具體，基於實際數據提供見解，符合國際永續報告標準。

回覆格式：JSON
```

**返回格式**：
```json
{
  "executiveSummary": "...",
  "carbonFootprint": "...",
  "emissionsSummary": "...",
  "reductionTargets": "...",
  "initiatives": "...",
  "compliance": "...",
  "financialImpact": "...",
  "stakeholders": "..."
}
```

---

## 📊 API 端點

### 1. 自定義報告生成
```
POST /api/report/generate

Request Body:
{
  "title": "2024年永續發展報告",
  "period": "2024年度",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "includeExecutiveSummary": true,
  "includeCarbonFootprint": true,
  // ...其他選項
}

Response:
{
  "success": true,
  "message": "報告已成功生成！總碳排放量：1234.56 tCO2e",
  "report": {
    "id": "report-123",
    "title": "2024年永續發展報告",
    "period": "2024年度",
    "status": "DRAFT",
    "pdfUrl": "/reports/report_1234567890.pdf",
    "totalEmissions": "1234.56",
    "createdAt": "2025-11-05T..."
  }
}
```

### 2. 一鍵報告生成
```
POST /api/report/generate-quick

Request Body:
{
  "month": 10,  // 10月
  "year": 2024
}

Response:
{
  "success": true,
  "message": "報告已成功生成！總碳排放量：123.45 tCO2e",
  "report": {
    "id": "report-123",
    "title": "公司名稱 2024年10月永續發展報告",
    "period": "2024-10",
    "status": "DRAFT",
    "pdfUrl": "/reports/report_2024_10_1234567890.pdf",
    "totalEmissions": "123.45",
    "createdAt": "2025-11-05T..."
  }
}
```

---

## 🚀 使用方式

### 方式 1：使用 Mock 數據（開發測試）

1. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

2. **訪問報告頁面**：
   ```
   http://localhost:3000/report
   ```

3. **生成報告**：
   - 點擊「一鍵生成」或「自定義報告」
   - 等待生成完成（約 5-10 秒）
   - 查看報告列表，點擊下載 PDF

**注意**：Mock 模式下沒有 OpenAI API Key，會使用備用內容生成。

### 方式 2：使用真實資料庫 + OpenAI

1. **設置環境變數**：
   ```bash
   cp .env.example .env

   # 編輯 .env
   OPENAI_API_KEY=sk-your-key-here
   DATABASE_URL=postgresql://...
   ```

2. **生成 Prisma Client**：
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **導入測試數據**：
   ```
   訪問：http://localhost:3000/api/carbon/seed
   ```

4. **生成報告**：
   - 訪問 /report 頁面
   - 選擇生成方式
   - 下載 PDF

---

## 🧪 測試範例

### 測試一鍵生成
```bash
curl -X POST http://localhost:3000/api/report/generate-quick \
  -H "Content-Type: application/json" \
  -d '{
    "month": 10,
    "year": 2024
  }'
```

### 測試自定義生成
```bash
curl -X POST http://localhost:3000/api/report/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2024年Q3永續報告",
    "period": "2024年第三季",
    "startDate": "2024-07-01",
    "endDate": "2024-09-30",
    "includeExecutiveSummary": true,
    "includeCarbonFootprint": true,
    "includeEmissionsSummary": true,
    "includeReductionTargets": true,
    "includeInitiatives": true,
    "includeCompliance": true,
    "includeFinancialImpact": true,
    "includeStakeholders": true
  }'
```

---

## ⚠️ 注意事項

### OpenAI API
- 需要有效的 API Key
- 每次調用約消耗 1000-2000 tokens
- 建議使用 gpt-3.5-turbo（成本較低）
- 如果 API 失敗，會自動使用備用內容

### PDF 生成
- 文件儲存在 `public/reports/` 目錄
- 文件名格式：`report_TIMESTAMP.pdf` 或 `report_YYYY_MM_TIMESTAMP.pdf`
- 訪問 URL：`/reports/filename.pdf`
- 確保 public/reports 目錄有寫入權限

### 數據需求
- 必須有公司資料（company 表）
- 必須有碳排放數據（carbonEmission 表）
- 碳排放數據必須在指定的時間範圍內

### 性能
- 報告生成約需 5-10 秒
- 主要時間在 OpenAI API 調用（3-5秒）
- PDF 生成約 1-2 秒

---

## 🔧 故障排除

### 問題 1：OpenAI API 失敗
**錯誤**：`Failed to generate content`

**解決方法**：
1. 檢查 `.env` 中的 `OPENAI_API_KEY` 是否正確
2. 檢查 API Key 是否有餘額
3. 檢查網路連接
4. 如無 API Key，系統會自動使用備用內容

### 問題 2：PDF 文件無法生成
**錯誤**：`Failed to save PDF`

**解決方法**：
1. 確保 `public/reports` 目錄存在
2. 檢查目錄寫入權限
3. 檢查磁碟空間

### 問題 3：無碳排放數據
**錯誤**：`所選時間範圍內無碳排放數據`

**解決方法**：
1. 確認資料庫中有碳排放數據
2. 檢查時間範圍是否正確
3. 使用 Mock 數據進行測試

---

## 📝 總結

### 完成的功能
✅ OpenAI API 整合
✅ PDF 文件生成
✅ 自定義報告生成
✅ 一鍵快速生成
✅ 8個專業章節
✅ 國際標準格式
✅ 自動備用內容

### 技術棧
- **AI**：OpenAI GPT-3.5-turbo
- **PDF**：pdfkit
- **前端**：Next.js, React
- **後端**：Next.js API Routes
- **資料庫**：Prisma + PostgreSQL（或 Mock）

### 文件位置
- `src/lib/pdf-generator.ts` - PDF 生成工具
- `src/lib/ai-content-generator.ts` - AI 內容生成工具
- `src/app/api/report/generate/route.ts` - 自定義報告 API
- `src/app/api/report/generate-quick/route.ts` - 一鍵生成 API

---

**現在您可以使用完整的 AI + PDF 報告生成功能了！** 🎉
