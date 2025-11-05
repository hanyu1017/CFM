# 報告生成功能升級指南

本指南說明如何將報告生成功能升級為使用 OpenAI API 生成內容並輸出 PDF。

## 📦 第一步：安裝依賴

```bash
# 安裝 OpenAI SDK
npm install openai

# 安裝 PDF 生成庫
npm install jspdf

# 或使用 pdfkit（Node.js 環境）
npm install pdfkit
```

## 🔑 第二步：配置環境變數

在 `.env.local` 文件中添加：

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# 或使用其他 API（可選）
# ANTHROPIC_API_KEY=your-anthropic-key
```

## 🎯 第三步：測試 OpenAI 連接

運行以下命令測試 API 連接：

```bash
# 啟動開發服務器
npm run dev

# 測試 AI Chat 功能
# 訪問 http://localhost:3000 並使用 AI 助手
```

## 📝 功能說明

### 1. AI Chat（已完成）

AI Chat 已更新為使用 OpenAI API：
- ✅ 文件：`src/app/api/ai/chat/route.ts`
- ✅ 使用 GPT-3.5-turbo 模型
- ✅ 專業的碳排放管理助手提示詞

### 2. 統一確認對話框（已完成）

創建了替代 alert 和 confirm 的對話框組件：
- ✅ 文件：`src/components/ui/ConfirmModal.tsx`
- ✅ 支持 info、success、warning、error 四種類型
- ✅ 支持 ESC 鍵關閉
- ✅ 優雅的動畫效果

使用方法：

```typescript
import { useConfirmModal } from '@/components/ui/ConfirmModal';

function MyComponent() {
  const { showModal, ModalComponent } = useConfirmModal();

  const handleAction = () => {
    showModal({
      title: '確認操作',
      message: '確定要執行此操作嗎？',
      type: 'warning',
      onConfirm: () => {
        // 執行操作
      },
    });
  };

  return (
    <>
      <button onClick={handleAction}>執行操作</button>
      <ModalComponent />
    </>
  );
}
```

### 3. 報告生成 API（需更新）

#### 更新 `src/app/api/report/generate-quick/route.ts`

詳見下方完整代碼。

## 📄 完整實現代碼

### 報告生成 API（使用 OpenAI + PDF）

創建文件：`src/app/api/report/generate-quick/route.ts`

```typescript
// src/app/api/report/generate-quick/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// 使用 OpenAI 生成報告內容
async function generateReportContent(carbonData: any[], startDate: Date, endDate: Date) {
  const totalEmissions = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);
  const avgDaily = totalEmissions / carbonData.length;

  const scope1Total = carbonData.reduce((sum, item) => sum + item.scope1, 0);
  const scope2Total = carbonData.reduce((sum, item) => sum + item.scope2, 0);
  const scope3Total = carbonData.reduce((sum, item) => sum + item.scope3, 0);

  const prompt = `作為永續發展報告專家，請根據以下碳排放數據生成一份專業的報告內容。每個部分約200字。

資料期間：${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}
數據天數：${carbonData.length} 天

碳排放數據統計：
- 總碳排放：${totalEmissions.toFixed(2)} tCO2e
- 平均每日：${avgDaily.toFixed(2)} tCO2e
- Scope 1 (直接排放)：${scope1Total.toFixed(2)} tCO2e
- Scope 2 (能源間接排放)：${scope2Total.toFixed(2)} tCO2e
- Scope 3 (其他間接排放)：${scope3Total.toFixed(2)} tCO2e

請生成以下報告章節（每章節約200字）：

1. 執行摘要 (Executive Summary)
2. 碳足跡分析 (Carbon Footprint)
3. 排放總結 (Emissions Summary)
4. 減排目標建議 (Reduction Targets)
5. 永續措施建議 (Sustainability Initiatives)
6. 法規遵循說明 (Compliance)
7. 財務影響分析 (Financial Impact)
8. 利害關係人溝通 (Stakeholders)

請以 JSON 格式返回，格式如下：
{
  "executiveSummary": "...",
  "carbonFootprint": "...",
  "emissionsSummary": "...",
  "reductionTargets": "...",
  "initiatives": "...",
  "compliance": "...",
  "financialImpact": "...",
  "stakeholders": "..."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一個專業的永續發展報告撰寫專家。請提供詳細、專業且符合國際標準的報告內容。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    return JSON.parse(content);
  } catch (error) {
    // 如果無法解析 JSON，返回預設內容
    return {
      executiveSummary: content.substring(0, 200),
      carbonFootprint: `總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e`,
      emissionsSummary: `Scope 1: ${scope1Total.toFixed(2)}, Scope 2: ${scope2Total.toFixed(2)}, Scope 3: ${scope3Total.toFixed(2)}`,
      reductionTargets: '建議設定短中長期減碳目標',
      initiatives: '實施節能減碳措施',
      compliance: '符合相關環境法規',
      financialImpact: '投資回報分析',
      stakeholders: '利害關係人溝通',
    };
  }
}

// 生成簡單的 PDF（使用 HTML 轉 PDF 或純文本）
async function generatePDF(reportData: any, carbonData: any[]) {
  // 這裡創建一個簡單的 HTML 內容
  // 實際應用中可以使用 jspdf、pdfkit 等庫

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    .section { margin-bottom: 30px; }
    .stats { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-item { margin: 10px 0; }
  </style>
</head>
<body>
  <h1>${reportData.title}</h1>
  <p><strong>報告期間：</strong>${reportData.reportPeriod}</p>
  <p><strong>生成日期：</strong>${new Date().toLocaleDateString('zh-TW')}</p>

  <div class="stats">
    <h3>碳排放數據摘要</h3>
    <div class="stat-item"><strong>數據天數：</strong>${carbonData.length} 天</div>
    <div class="stat-item"><strong>總碳排放：</strong>${carbonData.reduce((s, i) => s + i.totalCarbon, 0).toFixed(2)} tCO2e</div>
    <div class="stat-item"><strong>平均每日：</strong>${(carbonData.reduce((s, i) => s + i.totalCarbon, 0) / carbonData.length).toFixed(2)} tCO2e</div>
  </div>

  <div class="section">
    <h2>執行摘要</h2>
    <p>${reportData.executiveSummary || reportData.content?.executiveSummary || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>碳足跡分析</h2>
    <p>${reportData.carbonFootprint || reportData.content?.carbonFootprint || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>排放總結</h2>
    <p>${reportData.emissionsSummary || reportData.content?.emissionsSummary || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>減排目標</h2>
    <p>${reportData.reductionTargets || reportData.content?.reductionTargets || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>永續措施</h2>
    <p>${reportData.initiatives || reportData.content?.initiatives || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>法規遵循</h2>
    <p>${reportData.compliance || reportData.content?.compliance || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>財務影響</h2>
    <p>${reportData.financialImpact || reportData.content?.financialImpact || '暫無內容'}</p>
  </div>

  <div class="section">
    <h2>利害關係人</h2>
    <p>${reportData.stakeholders || reportData.content?.stakeholders || '暫無內容'}</p>
  </div>
</body>
</html>
  `;

  // 保存 HTML 文件（可以後續轉換為 PDF）
  const publicDir = path.join(process.cwd(), 'public', 'reports');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filename = `report-${Date.now()}.html`;
  const filepath = path.join(publicDir, filename);
  fs.writeFileSync(filepath, htmlContent, 'utf-8');

  return `/reports/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json();

    // 計算前一個月的日期範圍
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 獲取公司資料
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({
        error: '找不到公司資料',
        success: false,
      }, { status: 404 });
    }

    // 查詢碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    if (carbonData.length === 0) {
      return NextResponse.json({
        error: '查詢期間內無碳排放數據',
        success: false,
      }, { status: 404 });
    }

    // 使用 OpenAI 生成報告內容
    const aiContent = await generateReportContent(carbonData, startDate, endDate);

    // 創建報告記錄
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: `${year}年${month}月永續發展報告書`,
        reportPeriod: `${year}-${String(month).padStart(2, '0')}`,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: aiContent.executiveSummary,
        carbonFootprint: JSON.stringify({
          total: carbonData.reduce((s, i) => s + i.totalCarbon, 0),
          scope1: carbonData.reduce((s, i) => s + i.scope1, 0),
          scope2: carbonData.reduce((s, i) => s + i.scope2, 0),
          scope3: carbonData.reduce((s, i) => s + i.scope3, 0),
        }),
        emissionsSummary: JSON.stringify(aiContent.emissionsSummary),
        reductionTargets: JSON.stringify(aiContent.reductionTargets),
        initiatives: JSON.stringify(aiContent.initiatives),
        compliance: JSON.stringify(aiContent.compliance),
        financialImpact: JSON.stringify(aiContent.financialImpact),
        stakeholders: JSON.stringify(aiContent.stakeholders),
        generatedBy: 'AUTO',
      },
    });

    // 生成 PDF/HTML
    const pdfUrl = await generatePDF({
      ...report,
      content: aiContent,
    }, carbonData);

    // 更新報告 URL
    await prisma.sustainabilityReport.update({
      where: { id: report.id },
      data: { pdfUrl },
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
        pdfUrl,
      },
      message: `報告已成功生成！\n\n數據期間：${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}\n數據筆數：${carbonData.length} 筆\n\n您可以在報告歷史中查看和下載。`,
      success: true,
    });
  } catch (error) {
    console.error('Quick report API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '報告生成失敗',
      success: false,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

## 🎨 更新報告頁面使用確認對話框

### 更新 `src/app/report/page.tsx`

將所有 `alert` 和 `confirm` 替換為 `ConfirmModal`：

```typescript
// 在文件頂部添加導入
import { useConfirmModal } from '@/components/ui/ConfirmModal';

// 在組件內部
const { showModal, ModalComponent } = useConfirmModal();

// 替換 alert
alert('成功') // ❌
showModal({
  title: '成功',
  message: '操作已完成',
  type: 'success',
  showCancel: false,
}) // ✅

// 替換 confirm
if (confirm('確定刪除？')) { } // ❌
showModal({
  title: '確認刪除',
  message: '確定要刪除此報告嗎？此操作無法復原。',
  type: 'warning',
  onConfirm: () => {
    // 執行刪除
  },
}) // ✅

// 在 return 的最後添加
return (
  <DashboardLayout>
    {/* 其他內容 */}
    <ModalComponent />
  </DashboardLayout>
);
```

## ✅ 測試清單

1. **測試 AI Chat**
   - [ ] 訪問首頁，打開 AI 助手
   - [ ] 詢問碳排放相關問題
   - [ ] 確認收到 OpenAI 的回應

2. **測試確認對話框**
   - [ ] 點擊任何需要確認的操作
   - [ ] 確認不再出現 browser alert
   - [ ] 測試 ESC 鍵關閉
   - [ ] 測試點擊背景關閉

3. **測試報告生成**
   - [ ] 點擊「一鍵生成」按鈕
   - [ ] 確認使用前一個月數據
   - [ ] 確認報告內容由 OpenAI 生成
   - [ ] 確認可以下載 PDF/HTML

## 🚨 常見問題

### Q: OpenAI API 報錯怎麼辦？

**A:** 檢查以下事項：
1. `OPENAI_API_KEY` 是否正確設置
2. API Key 是否有效且有額度
3. 網絡連接是否正常
4. 查看控制台錯誤訊息

### Q: PDF 無法生成？

**A:** 當前版本生成的是 HTML 文件：
1. HTML 文件保存在 `public/reports/` 目錄
2. 可以使用瀏覽器打開並列印為 PDF
3. 後續可集成專業的 PDF 庫（如 pdfkit、puppeteer）

### Q: 生成的內容不符合預期？

**A:** 調整提示詞（prompt）：
1. 編輯 `generate-quick/route.ts` 中的 `prompt`
2. 增加更多上下文和要求
3. 調整 `temperature` 參數（0.1-1.0）

## 📚 進階功能

### 1. 使用更強大的模型

```typescript
// 將 gpt-3.5-turbo 升級為 gpt-4
model: 'gpt-4'
```

### 2. 添加圖表到 PDF

```typescript
// 使用 chart.js + canvas 生成圖表
// 將圖表轉換為圖片
// 嵌入到 PDF 中
```

### 3. 支持多語言報告

```typescript
// 在提示詞中指定語言
const prompt = `Generate report in ${language}...`;
```

## 🎯 下一步

1. 安裝依賴：`npm install openai jspdf`
2. 配置 API Key
3. 測試所有功能
4. 根據需求調整提示詞
5. 優化 PDF 輸出格式

---

**需要幫助？** 查看 [OpenAI API 文檔](https://platform.openai.com/docs/api-reference)
