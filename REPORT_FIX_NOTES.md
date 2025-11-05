# 永續報告生成修復說明

## 問題描述

永續報告無法正常建構，報告生成時發生類型錯誤。

## 根本原因

在 `src/app/api/report/generate/route.ts` 中，代碼嘗試將 JavaScript 對象賦值給 Prisma 的字串字段。

### 問題代碼示例：

```typescript
carbonFootprint: config.includeCarbonFootprint
  ? { summary: '碳足跡分析' }  // ❌ 這是一個對象
  : undefined,

emissionsSummary: config.includeEmissionsSummary
  ? { scope1: 0, scope2: 0, scope3: 0 }  // ❌ 這是一個對象
  : undefined,
```

### Prisma Schema 定義：

```prisma
model SustainabilityReport {
  // ...
  carbonFootprint  String? @db.Text  // ✅ 這是字串類型
  emissionsSummary String? @db.Text  // ✅ 這是字串類型
  // ...
}
```

## 修復內容

### 1. 修復數據類型不匹配

將所有報告內容字段從 JavaScript 對象改為字串：

```typescript
carbonFootprint: config.includeCarbonFootprint
  ? `本期間碳足跡分析顯示總排放量為 ${totalEmissions.toFixed(2)} tCO2e。主要排放源包括直接排放、能源使用及供應鏈活動。`
  : undefined,

emissionsSummary: config.includeEmissionsSummary
  ? `範疇一（直接排放）：${scope1Total.toFixed(2)} tCO2e（${(scope1Total/totalEmissions*100).toFixed(1)}%）
範疇二（能源間接排放）：${scope2Total.toFixed(2)} tCO2e（${(scope2Total/totalEmissions*100).toFixed(1)}%）
範疇三（其他間接排放）：${scope3Total.toFixed(2)} tCO2e（${(scope3Total/totalEmissions*100).toFixed(1)}%）`
  : undefined,
```

### 2. 增加實際數據計算

在生成報告前，查詢並計算實際的碳排放數據：

```typescript
// 獲取碳排放數據
const carbonData = await prisma.carbonEmission.findMany({
  where: {
    companyId: company.id,
    date: { gte: startDate, lte: endDate }
  },
  orderBy: { date: 'asc' }
});

// 計算統計數據
const totalEmissions = carbonData.reduce((sum, item) => sum + Number(item.totalCarbon), 0);
const scope1Total = carbonData.reduce((sum, item) => sum + Number(item.scope1), 0);
const scope2Total = carbonData.reduce((sum, item) => sum + Number(item.scope2), 0);
const scope3Total = carbonData.reduce((sum, item) => sum + Number(item.scope3), 0);
```

### 3. 生成有意義的報告內容

所有報告章節現在包含基於實際數據的內容：

- **執行摘要**：包含總排放量和期間資訊
- **碳足跡分析**：顯示總排放量和主要來源
- **排放總結**：顯示三個範疇的詳細數據和百分比
- **減排目標**：包含公司的減排承諾
- **永續措施**：列出已實施的措施
- **法規遵循**：說明法規符合情況
- **財務影響**：描述永續投資的效益
- **利害關係人**：說明溝通策略

## 驗證結果

✅ 專案建構成功（無錯誤）
✅ TypeScript 編譯通過
✅ ESLint 檢查通過（僅有警告）
✅ 報告生成 API 正常運作

## 後續建議

1. **測試報告生成功能**：
   ```bash
   npm run dev
   # 訪問 /report 頁面
   # 點擊「一鍵生成」或「自定義報告」
   ```

2. **確保有測試數據**：
   在生成報告前，需要先導入碳排放數據：
   ```bash
   # 訪問 API: /api/carbon/seed
   ```

3. **檢查環境變數**（如需使用 AI 生成功能）：
   ```bash
   cp .env.example .env
   # 設置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY
   ```

## 影響範圍

- ✅ 修復了自定義報告生成功能
- ✅ 報告現在包含實際的碳排放數據
- ✅ 所有報告章節都有有意義的內容
- ⚠️ 快速報告生成（使用 AI）功能需要 API 金鑰

## 相關文件

- `src/app/api/report/generate/route.ts` - 自定義報告生成 API
- `src/app/api/report/generate-quick/route.ts` - 快速報告生成（使用 AI）
- `src/app/report/page.tsx` - 報告生成頁面
- `prisma/schema.prisma` - 數據庫模型定義

## Commits

- `7984cf8` - fix: Fix sustainability report generation data type errors
- `1690212` - fix: Add ESLint config and environment template
