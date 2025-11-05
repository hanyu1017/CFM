# 永續報告生成邏輯完整解析

## 🔍 問題根源

**報告無法生成的原因：使用了 Mock Prisma Client，沒有真實資料庫數據**

當前系統使用的是 Mock PrismaClient（位於 `scripts/generate-prisma-stub.js`），這個 mock 實現有以下限制：

```javascript
this.company = {
  findFirst: async () => null,  // ❌ 永遠返回 null
  // ...
};
```

## 📊 報告生成流程圖

```
前端 (report/page.tsx)
    ↓
    ① 使用者點擊「生成報告」
    ↓
    ② 發送 POST 請求到 /api/report/generate
    ↓
後端 (api/report/generate/route.ts)
    ↓
    ③ 查詢公司資料 (company.findFirst)
    ↓
    ④ 如果沒有公司資料 → 返回 400 錯誤 ❌
    ↓
    ⑤ 查詢碳排放數據 (carbonEmission.findMany)
    ↓
    ⑥ 計算統計數據 (總排放量、範疇1/2/3)
    ↓
    ⑦ 生成報告內容 (8個章節)
    ↓
    ⑧ 儲存報告到資料庫 (sustainabilityReport.create)
    ↓
    ⑨ 返回成功訊息
    ↓
前端
    ↓
    ⑩ 顯示成功對話框
    ↓
    ⑪ 重新載入報告列表
```

## 🚫 當前失敗點

### 步驟③：查詢公司資料失敗

```typescript
// src/app/api/report/generate/route.ts:12
const company = await prisma.company.findFirst();
if (!company) {
  return NextResponse.json(
    { error: '請先建立公司資料', success: false },  // ❌ 這裡失敗！
    { status: 400 }
  );
}
```

**原因**：Mock PrismaClient 的 `company.findFirst()` 永遠返回 `null`

## 🔧 完整的報告生成邏輯詳解

### 1️⃣ 前端：使用者觸發生成

**文件**：`src/app/report/page.tsx`

```typescript
const generateCustomReport = async () => {
  setGenerating(true);  // 顯示載入狀態

  try {
    // 發送 POST 請求
    const response = await fetch('/api/report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)  // 發送報告配置
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    const data = await response.json();

    // 刷新報告列表
    await fetchReports();

    // 顯示成功訊息
    showModal({
      title: '報告生成成功',
      message: data.message,
      type: 'success',
    });
  } catch (error) {
    // 顯示錯誤訊息
    showModal({
      title: '報告生成失敗',
      message: '報告生成失敗，請稍後再試',
      type: 'error',
    });
  } finally {
    setGenerating(false);
  }
};
```

**發送的數據格式**：
```json
{
  "title": "永續發展報告書",
  "period": "2024年度",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "includeExecutiveSummary": true,
  "includeCarbonFootprint": true,
  "includeEmissionsSummary": true,
  "includeReductionTargets": true,
  "includeInitiatives": true,
  "includeCompliance": true,
  "includeFinancialImpact": true,
  "includeStakeholders": true
}
```

### 2️⃣ 後端：處理報告生成請求

**文件**：`src/app/api/report/generate/route.ts`

#### 步驟 A：解析請求

```typescript
const config = await request.json();
```

#### 步驟 B：查詢公司資料（❌ 當前失敗點）

```typescript
const company = await prisma.company.findFirst();
if (!company) {
  return NextResponse.json(
    { error: '請先建立公司資料', success: false },
    { status: 400 }
  );
}
```

**必需條件**：資料庫中必須有至少一筆公司資料

#### 步驟 C：查詢碳排放數據

```typescript
const startDate = new Date(config.startDate);
const endDate = new Date(config.endDate);

const carbonData = await prisma.carbonEmission.findMany({
  where: {
    companyId: company.id,
    date: { gte: startDate, lte: endDate }  // 查詢指定期間的數據
  },
  orderBy: { date: 'asc' }
});
```

**查詢條件**：
- 公司 ID 匹配
- 日期在指定範圍內（startDate 到 endDate）

#### 步驟 D：計算統計數據

```typescript
const totalEmissions = carbonData.reduce((sum, item) =>
  sum + Number(item.totalCarbon), 0
);

const scope1Total = carbonData.reduce((sum, item) =>
  sum + Number(item.scope1), 0
);

const scope2Total = carbonData.reduce((sum, item) =>
  sum + Number(item.scope2), 0
);

const scope3Total = carbonData.reduce((sum, item) =>
  sum + Number(item.scope3), 0
);
```

**計算內容**：
- 總碳排放量（tCO2e）
- 範疇一總排放量（直接排放）
- 範疇二總排放量（能源間接排放）
- 範疇三總排放量（其他間接排放）

#### 步驟 E：生成報告內容

根據使用者選擇的章節，生成對應的文字內容：

```typescript
executiveSummary: config.includeExecutiveSummary
  ? `本報告書涵蓋 ${config.period} 期間之永續發展成果。
     期間內總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e，
     展現本公司對環境永續發展的承諾與努力。`
  : undefined,

carbonFootprint: config.includeCarbonFootprint
  ? `本期間碳足跡分析顯示總排放量為 ${totalEmissions.toFixed(2)} tCO2e。
     主要排放源包括直接排放、能源使用及供應鏈活動。`
  : undefined,

emissionsSummary: config.includeEmissionsSummary
  ? `範疇一（直接排放）：${scope1Total.toFixed(2)} tCO2e
     （${totalEmissions > 0 ? (scope1Total/totalEmissions*100).toFixed(1) : 0}%）
     範疇二（能源間接排放）：${scope2Total.toFixed(2)} tCO2e
     （${totalEmissions > 0 ? (scope2Total/totalEmissions*100).toFixed(1) : 0}%）
     範疇三（其他間接排放）：${scope3Total.toFixed(2)} tCO2e
     （${totalEmissions > 0 ? (scope3Total/totalEmissions*100).toFixed(1) : 0}%）`
  : undefined,

// ... 其他章節
```

**報告章節**：
1. 執行摘要（Executive Summary）
2. 碳足跡分析（Carbon Footprint）
3. 排放總結（Emissions Summary）
4. 減排目標（Reduction Targets）
5. 永續措施（Sustainability Initiatives）
6. 法規遵循（Compliance）
7. 財務影響（Financial Impact）
8. 利害關係人（Stakeholder Engagement）

#### 步驟 F：儲存報告到資料庫

```typescript
const report = await prisma.sustainabilityReport.create({
  data: {
    companyId: company.id,
    title: config.title,
    reportPeriod: config.period,
    startDate,
    endDate,
    status: 'DRAFT',
    executiveSummary: '...',
    carbonFootprint: '...',
    emissionsSummary: '...',
    reductionTargets: '...',
    initiatives: '...',
    compliance: '...',
    financialImpact: '...',
    stakeholders: '...',
    totalEmissions,
    pdfUrl,
    generatedBy: 'MANUAL',
  },
});
```

#### 步驟 G：返回成功結果

```typescript
return NextResponse.json({
  report: {
    id: report.id,
    title: report.title,
    period: report.reportPeriod,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    pdfUrl: report.pdfUrl,
  },
  success: true,
  message: '報告已成功生成！您可以在報告歷史中查看和下載。',
});
```

## 🐛 Mock PrismaClient 的問題

**文件**：`scripts/generate-prisma-stub.js`

```javascript
class PrismaClient {
  constructor() {
    console.warn('Using mock PrismaClient - database operations will not work');

    this.company = {
      findFirst: async () => null,  // ❌ 永遠返回 null
      // ...
    };

    this.carbonEmission = {
      findMany: async () => [],  // ❌ 永遠返回空陣列
      // ...
    };

    this.sustainabilityReport = {
      findMany: async () => [],
      create: async (data) => ({  // ✅ 這個可以工作
        id: 'mock-id',
        ...data.data,
        createdAt: new Date()
      }),
      // ...
    };
  }
}
```

### Mock Client 的限制

1. ❌ 無法查詢真實數據
2. ❌ `company.findFirst()` 永遠返回 `null`
3. ❌ `carbonEmission.findMany()` 永遠返回 `[]`
4. ⚠️ `sustainabilityReport.create()` 會返回假數據，但不會真正儲存

## ✅ 解決方案

### 方案 1：使用真實資料庫（推薦）

1. **設置環境變數**：
   ```bash
   cp .env.example .env
   ```

2. **編輯 .env 文件**：
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/carbon_management"
   ```

3. **生成真實的 Prisma Client**：
   ```bash
   npx prisma generate
   ```

4. **推送資料庫結構**：
   ```bash
   npx prisma db push
   ```

5. **導入測試數據**：
   訪問 `http://localhost:3000/api/carbon/seed`

### 方案 2：改進 Mock Client（臨時方案）

修改 `scripts/generate-prisma-stub.js` 讓它返回假數據：

```javascript
this.company = {
  findFirst: async () => ({
    id: 'company-001',
    name: '測試公司',
    industry: '製造業',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  // ...
};

this.carbonEmission = {
  findMany: async (options) => {
    // 返回一些假的碳排放數據
    return [
      {
        id: 'emission-001',
        companyId: 'company-001',
        date: new Date('2024-01-15'),
        scope1: 100,
        scope2: 200,
        scope3: 50,
        totalCarbon: 350,
        electricity: 5000,
        naturalGas: 1000,
        fuel: 500,
        transport: 800,
        waste: 200,
        water: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // ... 更多假數據
    ];
  },
  // ...
};
```

## 📝 測試步驟

### 使用真實資料庫

1. 設置資料庫連接
2. 運行開發伺服器：`npm run dev`
3. 訪問：`http://localhost:3000/api/carbon/seed` 導入測試數據
4. 訪問：`http://localhost:3000/report`
5. 點擊「自定義報告」
6. 填寫報告資訊
7. 點擊「生成報告」

### 使用 Mock 數據

1. 修改 `scripts/generate-prisma-stub.js`
2. 重新運行：`node scripts/generate-prisma-stub.js`
3. 重啟開發伺服器
4. 測試報告生成

## 🎯 檢查清單

在生成報告前，確保：

- [ ] 資料庫中有公司資料（至少一筆）
- [ ] 資料庫中有碳排放數據
- [ ] 碳排放數據的日期範圍包含報告期間
- [ ] Prisma Client 正常運作（不是 mock）
- [ ] 開發伺服器正在運行

## 🔍 除錯方法

### 1. 檢查資料庫連接

訪問：`http://localhost:3000/api/health/db`

預期結果：
```json
{
  "status": "connected",
  "message": "資料庫連線成功"
}
```

如果返回 `"status": "disconnected"`，說明使用的是 mock client。

### 2. 查看瀏覽器控制台

開啟瀏覽器開發者工具 → Console 標籤

查看是否有錯誤訊息：
- `Failed to generate report`
- `請先建立公司資料`
- 網路請求失敗

### 3. 查看 Network 標籤

查看 `/api/report/generate` 請求：
- Status Code：應該是 200
- Response：查看錯誤訊息

## 📚 相關文件

- `src/app/report/page.tsx` - 報告頁面（前端）
- `src/app/api/report/generate/route.ts` - 報告生成 API
- `src/app/api/report/list/route.ts` - 報告列表 API
- `scripts/generate-prisma-stub.js` - Mock Prisma Client
- `prisma/schema.prisma` - 資料庫結構

## 💡 關鍵要點

1. **Mock Prisma Client** 不能用於生產環境，只能用於建構
2. **報告生成需要真實數據**：公司資料 + 碳排放數據
3. **數據查詢流程**：公司 → 碳排放 → 計算統計 → 生成內容 → 儲存報告
4. **如果沒有資料庫**：需要修改 mock client 返回假數據
5. **最佳實踐**：使用真實的 PostgreSQL 資料庫

## ❓ 常見問題

### Q: 為什麼顯示「請先建立公司資料」？
A: 因為 mock client 的 `company.findFirst()` 返回 `null`。需要使用真實資料庫或修改 mock。

### Q: 報告列表是空的？
A: Mock client 的 `sustainabilityReport.findMany()` 返回空陣列。需要真實資料庫。

### Q: 生成報告後看不到內容？
A: 雖然 mock client 會返回假的報告 ID，但數據並未真正儲存。需要真實資料庫。

### Q: 如何添加測試數據？
A: 訪問 `/api/carbon/seed` API 端點，或使用 Prisma Studio：`npx prisma studio`
