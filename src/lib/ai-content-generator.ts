// src/lib/ai-content-generator.ts
// AI 內容生成工具函數

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
});

export interface CarbonDataSummary {
  companyName: string;
  period: string;
  startDate: string;
  endDate: string;
  totalEmissions: number;
  avgEmissions: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  electricityTotal?: number;
  naturalGasTotal?: number;
  fuelTotal?: number;
}

export interface ReportContent {
  executiveSummary: string;
  carbonFootprint: string;
  emissionsSummary: string;
  reductionTargets: string;
  initiatives: string;
  compliance: string;
  financialImpact: string;
  stakeholders: string;
}

export async function generateReportContent(data: CarbonDataSummary): Promise<ReportContent> {
  const {
    companyName,
    period,
    startDate,
    endDate,
    totalEmissions,
    avgEmissions,
    scope1Total,
    scope2Total,
    scope3Total,
    electricityTotal,
    naturalGasTotal,
    fuelTotal
  } = data;

  // 計算百分比
  const scope1Percent = ((scope1Total / totalEmissions) * 100).toFixed(1);
  const scope2Percent = ((scope2Total / totalEmissions) * 100).toFixed(1);
  const scope3Percent = ((scope3Total / totalEmissions) * 100).toFixed(1);

  // 構建碳排放數據摘要
  const carbonSummary = `
公司名稱：${companyName}
報告期間：${period}（${startDate} 至 ${endDate}）

碳排放數據：
- 總碳排放量：${totalEmissions.toFixed(2)} tCO2e
- 日均排放量：${avgEmissions.toFixed(2)} tCO2e

範疇排放：
- Scope 1 (直接排放)：${scope1Total.toFixed(2)} tCO2e (${scope1Percent}%)
- Scope 2 (能源間接排放)：${scope2Total.toFixed(2)} tCO2e (${scope2Percent}%)
- Scope 3 (其他間接排放)：${scope3Total.toFixed(2)} tCO2e (${scope3Percent}%)

${electricityTotal ? `主要排放源：
- 電力使用：${electricityTotal.toFixed(2)} kWh
${naturalGasTotal ? `- 天然氣：${naturalGasTotal.toFixed(2)} m³` : ''}
${fuelTotal ? `- 燃料消耗：${fuelTotal.toFixed(2)} L` : ''}` : ''}
`.trim();

  const prompt = `你是一位專業的永續發展報告撰寫專家，擅長撰寫符合 GRI、TCFD、CDP 等國際標準的永續報告。

請根據以下碳排放數據，為「${companyName}」生成一份完整、專業的永續發展報告內容。

${carbonSummary}

請生成以下8個章節的內容。每個章節應該：
- 約 200-300 字
- 專業且具體
- 基於實際數據提供見解
- 符合國際永續報告標準
- 使用繁體中文撰寫

章節要求：

1. **執行摘要 (Executive Summary)**
   - 總結報告期間的整體表現
   - 突出關鍵數據和成果
   - 說明公司的永續承諾

2. **碳足跡分析 (Carbon Footprint Analysis)**
   - 詳細分析碳排放來源
   - 比較各範疇的排放比例
   - 識別主要排放源

3. **排放總結 (Emissions Summary)**
   - 詳細說明 Scope 1/2/3 的排放情況
   - 分析排放趨勢
   - 與行業基準比較（如適用）

4. **減排目標 (Reduction Targets)**
   - 設定短中長期減碳目標
   - 說明達成目標的路徑
   - 參考科學基礎目標（SBTi）

5. **永續措施 (Sustainability Initiatives)**
   - 列出已實施的永續項目
   - 說明各項目的成效
   - 規劃未來的措施

6. **法規遵循 (Compliance)**
   - 說明遵循的環境法規
   - 符合的國際標準
   - 揭露政策與程序

7. **財務影響 (Financial Impact)**
   - 分析永續投資的成本
   - 評估節能減碳的效益
   - 說明對企業價值的影響

8. **利害關係人溝通 (Stakeholder Engagement)**
   - 識別關鍵利害關係人
   - 說明溝通策略
   - 回應利害關係人關注

請以 JSON 格式回覆，確保所有字段都填寫完整：

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

重要：請確保內容專業、具體，並基於提供的實際數據撰寫。`;

  try {
    // 檢查是否有 API Key
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ 未設置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY，使用預設內容');
      return generateFallbackContent(data);
    }

    // 調用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位專業的永續發展報告撰寫專家，擅長根據碳排放數據撰寫符合國際標準的永續報告。回覆必須是有效的 JSON 格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    try {
      const reportContent = JSON.parse(aiResponse);

      // 驗證所有必需字段都存在
      const requiredFields = [
        'executiveSummary',
        'carbonFootprint',
        'emissionsSummary',
        'reductionTargets',
        'initiatives',
        'compliance',
        'financialImpact',
        'stakeholders'
      ];

      const missingFields = requiredFields.filter(field => !reportContent[field]);

      if (missingFields.length > 0) {
        console.warn(`⚠️ AI 回應缺少字段：${missingFields.join(', ')}，使用預設內容`);
        return generateFallbackContent(data);
      }

      console.log('✅ AI 成功生成報告內容');
      return reportContent;

    } catch (parseError) {
      console.error('❌ 解析 AI 回應失敗：', parseError);
      console.error('AI 回應內容：', aiResponse);
      return generateFallbackContent(data);
    }

  } catch (error) {
    console.error('❌ 調用 OpenAI API 失敗：', error);
    return generateFallbackContent(data);
  }
}

// 備用內容生成（當 AI 不可用時）
function generateFallbackContent(data: CarbonDataSummary): ReportContent {
  const {
    companyName,
    period,
    totalEmissions,
    avgEmissions,
    scope1Total,
    scope2Total,
    scope3Total,
  } = data;

  const scope1Percent = ((scope1Total / totalEmissions) * 100).toFixed(1);
  const scope2Percent = ((scope2Total / totalEmissions) * 100).toFixed(1);
  const scope3Percent = ((scope3Total / totalEmissions) * 100).toFixed(1);

  return {
    executiveSummary: `${companyName}在${period}期間的碳排放總量為${totalEmissions.toFixed(2)} tCO2e，日均排放量為${avgEmissions.toFixed(2)} tCO2e。本報告書詳細記錄了公司在此期間的碳排放情況，並展現我們對環境永續發展的承諾與努力。我們持續致力於減少碳排放，提升能源效率，並實施各項永續措施，以達成我們的長期減碳目標。`,

    carbonFootprint: `本期間的碳足跡分析顯示，總碳排放量為${totalEmissions.toFixed(2)} tCO2e。主要排放源包括直接排放（Scope 1）、能源使用（Scope 2）以及供應鏈相關活動（Scope 3）。透過詳細的碳足跡分析，我們識別出關鍵的排放源，為未來的減排策略提供重要依據。`,

    emissionsSummary: `碳排放範疇分析如下：Scope 1（直接排放）為${scope1Total.toFixed(2)} tCO2e，占總排放量的${scope1Percent}%；Scope 2（能源間接排放）為${scope2Total.toFixed(2)} tCO2e，占${scope2Percent}%；Scope 3（其他間接排放）為${scope3Total.toFixed(2)} tCO2e，占${scope3Percent}%。這些數據為我們的減排策略提供了明確的方向。`,

    reductionTargets: `${companyName}承諾在2030年前減少30%的碳排放量，並於2050年達成淨零排放目標。短期目標包括提升能源效率20%、增加再生能源使用比例至30%。中期目標著重於優化生產流程、導入低碳技術。長期目標則是透過全面性的碳中和策略，達成淨零排放的願景。`,

    initiatives: `已實施的永續措施包括：導入ISO 50001能源管理系統、推動綠色採購政策、優化生產流程以減少能源消耗、實施廢棄物減量與回收計畫、推廣員工環保教育訓練。這些措施不僅減少了碳排放，也提升了整體營運效率，為公司創造長期價值。`,

    compliance: `${companyName}嚴格遵守所有適用的環境保護相關法規，包括溫室氣體盤查與登錄作業要點、環境影響評估法規定，並符合 ISO 14064-1 溫室氣體盤查標準及 GRI 永續報告標準。我們建立完善的環境管理系統，確保所有營運活動符合法規要求並持續改進。`,

    financialImpact: `永續投資為公司帶來顯著效益。透過節能設備投資，年度能源成本降低15%；營運效率提升帶來的成本節約約佔營收的2%；品牌永續形象提升吸引更多綠色投資人。預期長期將帶來更顯著的財務效益與市場競爭優勢，同時降低氣候變遷相關的營運風險。`,

    stakeholders: `${companyName}持續與多元利害關係人進行溝通與議合，包括員工、客戶、供應商、投資人、主管機關及在地社區。透過定期的永續報告書、利害關係人問卷調查、供應商永續評估、社區溝通會議等方式，了解並回應各方關注議題，共同推動永續發展目標，建立長期夥伴關係。`
  };
}
