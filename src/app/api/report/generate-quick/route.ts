// src/app/api/report/generate-quick/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json();

    // 設定日期範圍（前一個月的1號到月底）
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // 查詢公司資料
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({
        error: '尚無公司資料，請先導入數據',
        success: false,
      }, { status: 400 });
    }

    // 查詢碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    if (carbonData.length === 0) {
      return NextResponse.json({
        error: `${year}年${month}月無碳排放數據，請先導入數據`,
        success: false,
      }, { status: 400 });
    }

    // 計算碳排放統計數據
    const totalEmissions = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.totalCarbon), 0);
    const avgEmissions = totalEmissions / carbonData.length;
    const scope1Total = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.scope1), 0);
    const scope2Total = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.scope2), 0);
    const scope3Total = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.scope3), 0);
    const electricityTotal = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.electricity), 0);
    const naturalGasTotal = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.naturalGas), 0);
    const fuelTotal = carbonData.reduce((sum: number, item: typeof carbonData[number]) => sum + Number(item.fuel), 0);

    // 使用 OpenAI 生成報告內容（8個章節，每個約200字）
    const carbonSummary = `
報告期間：${year}年${month}月（${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}）
總碳排放量：${totalEmissions.toFixed(2)} tCO2e
日均排放量：${avgEmissions.toFixed(2)} tCO2e
- Scope 1 (直接排放)：${scope1Total.toFixed(2)} tCO2e (${(scope1Total/totalEmissions*100).toFixed(1)}%)
- Scope 2 (能源間接排放)：${scope2Total.toFixed(2)} tCO2e (${(scope2Total/totalEmissions*100).toFixed(1)}%)
- Scope 3 (其他間接排放)：${scope3Total.toFixed(2)} tCO2e (${(scope3Total/totalEmissions*100).toFixed(1)}%)
主要排放源：
- 電力使用：${electricityTotal.toFixed(2)} kWh
- 天然氣：${naturalGasTotal.toFixed(2)} m³
- 燃料消耗：${fuelTotal.toFixed(2)} L
`.trim();

    const prompt = `你是一位專業的永續發展報告撰寫專家。請根據以下碳排放數據，生成一份完整的永續發展報告，包含8個章節。每個章節應該約200字，專業且具體。

碳排放數據摘要：
${carbonSummary}

請生成以下8個章節的內容（每個章節約200字）：

1. 執行摘要 (Executive Summary)
2. 碳足跡分析 (Carbon Footprint Analysis)
3. 排放總結 (Emissions Summary)
4. 減排目標 (Reduction Targets)
5. 永續措施 (Sustainability Initiatives)
6. 法規遵循 (Compliance)
7. 財務影響 (Financial Impact)
8. 利害關係人溝通 (Stakeholder Engagement)

請以 JSON 格式回覆，結構如下：
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

    // 調用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位專業的永續發展報告撰寫專家，擅長根據碳排放數據撰寫符合國際標準的永續報告。每個章節應該約200字，內容專業、具體且有見地。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // 解析 AI 回應
    let reportContent;
    try {
      reportContent = JSON.parse(aiResponse);
    } catch (parseError) {
      // 如果解析失敗，使用基本模板
      console.error('Failed to parse AI response:', parseError);
      reportContent = {
        executiveSummary: `本報告涵蓋 ${year}年${month}月的碳排放數據。總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e，日均排放量為 ${avgEmissions.toFixed(2)} tCO2e。`,
        carbonFootprint: `碳足跡分析顯示主要排放來源為 Scope 2（${(scope2Total/totalEmissions*100).toFixed(1)}%），其次是 Scope 1（${(scope1Total/totalEmissions*100).toFixed(1)}%）。`,
        emissionsSummary: `Scope 1: ${scope1Total.toFixed(2)} tCO2e, Scope 2: ${scope2Total.toFixed(2)} tCO2e, Scope 3: ${scope3Total.toFixed(2)} tCO2e`,
        reductionTargets: '制定短中長期減碳目標，力求在2030年前減少30%碳排放。',
        initiatives: '實施能源管理系統、推動再生能源使用、優化生產流程。',
        compliance: '符合國家環保法規及國際碳排放標準要求。',
        financialImpact: '永續投資帶來長期成本節約及企業價值提升。',
        stakeholders: '持續與利害關係人溝通，共同推動永續發展目標。'
      };
    }

    // 生成 HTML 報告
    const htmlContent = generateReportHTML({
      title: `${company.name || '公司'} ${year}年${month}月永續發展報告`,
      period: `${year}年${month}月`,
      dateRange: `${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}`,
      carbonSummary,
      content: reportContent,
    });

    // 儲存報告到資料庫
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: company.id,
        title: `${year}年${month}月永續發展報告`,
        reportPeriod: `${year}-${String(month).padStart(2, '0')}`,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: reportContent.executiveSummary || '',
        carbonFootprint: reportContent.carbonFootprint || '',
        emissionsSummary: reportContent.emissionsSummary || '',
        reductionTargets: reportContent.reductionTargets || '',
        initiatives: reportContent.initiatives || '',
        compliance: reportContent.compliance || '',
        financialImpact: reportContent.financialImpact || '',
        stakeholders: reportContent.stakeholders || '',
        htmlContent: htmlContent,
        generatedBy: 'AI',
        totalEmissions: totalEmissions,
      } as any
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
        pdfUrl: `/api/report/${report.id}`,
        htmlContent: htmlContent,
      },
      message: `報告已成功生成！總碳排放量：${totalEmissions.toFixed(2)} tCO2e`,
      success: true,
    });
  } catch (error) {
    console.error('Quick report API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '報告生成失敗，請檢查 OpenAI API 配置或稍後再試',
      success: false,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 生成 HTML 報告
function generateReportHTML(data: {
  title: string;
  period: string;
  dateRange: string;
  carbonSummary: string;
  content: any;
}) {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body {
      font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 {
      color: #2c5f2d;
      border-bottom: 3px solid #2c5f2d;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #2c5f2d;
      margin-top: 40px;
      margin-bottom: 15px;
      font-size: 1.5em;
    }
    .meta {
      background: #f0f7f0;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary {
      background: #e8f5e9;
      padding: 20px;
      border-left: 4px solid #2c5f2d;
      margin: 20px 0;
      white-space: pre-line;
    }
    .section {
      margin-bottom: 30px;
      text-align: justify;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>${data.title}</h1>

  <div class="meta">
    <strong>報告期間：</strong>${data.period}<br>
    <strong>數據範圍：</strong>${data.dateRange}<br>
    <strong>生成時間：</strong>${new Date().toLocaleString('zh-TW')}
  </div>

  <div class="summary">
    <strong>碳排放數據摘要</strong>
    ${data.carbonSummary}
  </div>

  <div class="section">
    <h2>一、執行摘要</h2>
    <p>${data.content.executiveSummary}</p>
  </div>

  <div class="section">
    <h2>二、碳足跡分析</h2>
    <p>${data.content.carbonFootprint}</p>
  </div>

  <div class="section">
    <h2>三、排放總結</h2>
    <p>${data.content.emissionsSummary}</p>
  </div>

  <div class="section">
    <h2>四、減排目標</h2>
    <p>${data.content.reductionTargets}</p>
  </div>

  <div class="section">
    <h2>五、永續措施</h2>
    <p>${data.content.initiatives}</p>
  </div>

  <div class="section">
    <h2>六、法規遵循</h2>
    <p>${data.content.compliance}</p>
  </div>

  <div class="section">
    <h2>七、財務影響</h2>
    <p>${data.content.financialImpact}</p>
  </div>

  <div class="section">
    <h2>八、利害關係人溝通</h2>
    <p>${data.content.stakeholders}</p>
  </div>

  <div class="footer">
    <p>本報告由 AI 自動生成，數據來源於碳排放管理系統</p>
    <p>© ${new Date().getFullYear()} 碳排放管理系統 Carbon Footprint Management</p>
  </div>
</body>
</html>
  `.trim();
}