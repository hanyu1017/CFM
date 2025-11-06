// src/app/api/report/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// 註冊中文字體 - 使用思源黑體（Source Han Sans）
// 讀取字體文件並轉換為 base64
const fontDir = path.join(process.cwd(), 'public', 'fonts');
const regularFontPath = path.join(fontDir, 'SourceHanSansCN-Regular.otf');
const boldFontPath = path.join(fontDir, 'SourceHanSansCN-Bold.otf');

// 讀取字體文件並轉換為 data URI
const regularFontBuffer = fs.readFileSync(regularFontPath);
const boldFontBuffer = fs.readFileSync(boldFontPath);
const regularFontBase64 = regularFontBuffer.toString('base64');
const boldFontBase64 = boldFontBuffer.toString('base64');

Font.register({
  family: 'SourceHanSans',
  fonts: [
    {
      src: `data:font/otf;base64,${regularFontBase64}`,
      fontWeight: 'normal',
    },
    {
      src: `data:font/otf;base64,${boldFontBase64}`,
      fontWeight: 'bold',
    },
  ],
});

// 設置斷字規則
Font.registerHyphenationCallback((word) => [word]);

// 定義樣式
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'SourceHanSans',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '3 solid #2563eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '2 solid #e2e8f0',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 1.6,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    border: '1 solid #e2e8f0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  highlight: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeft: '4 solid #2563eb',
  },
  highlightText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 700,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  longText: {
    fontSize: 10,
    lineHeight: 1.8,
    color: '#334155',
    marginBottom: 8,
    textAlign: 'justify',
  },
});

// 格式化日期
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 分段處理長文字，避免截斷
function splitLongText(text: string, maxLength: number = 500): string[] {
  if (!text) return [];
  const paragraphs: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      paragraphs.push(remaining);
      break;
    }

    // 尋找適當的斷點（句號、逗號、空格）
    let breakPoint = maxLength;
    const punctuation = ['。', '！', '？', '\n', '，', '；', ' '];

    for (let i = maxLength; i > maxLength - 100 && i > 0; i--) {
      if (punctuation.includes(remaining[i])) {
        breakPoint = i + 1;
        break;
      }
    }

    paragraphs.push(remaining.substring(0, breakPoint).trim());
    remaining = remaining.substring(breakPoint).trim();
  }

  return paragraphs;
}

// 格式化日期為 YYYY-MM-DD
function formatDateYYYYMMDD(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 創建 PDF 文檔
function createPDFDocument(report: any, carbonData: any[], webhookData: any, company: any) {
  const totalEmissions = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);

  const pages = [];

  // 第一頁：標題和總覽
  pages.push(
    React.createElement(
      Page,
      { size: 'A4', style: styles.page, key: 'page-1' },
      // 標題區域
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, report.title),
        React.createElement(Text, { style: styles.subtitle }, `${company.name} | 永續發展報告書`),
        React.createElement(Text, { style: styles.subtitle }, `報告期間：${formatDate(report.startDate)} - ${formatDate(report.endDate)}`),
        React.createElement(Text, { style: styles.subtitle }, `生成時間：${formatDate(report.createdAt)}`)
      ),
      // 執行摘要
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, '📋 執行摘要'),
        React.createElement(
          View,
          { style: styles.highlight },
          React.createElement(
            Text,
            { style: styles.highlightText },
            report.executiveSummary || `本報告涵蓋 ${report.reportPeriod} 期間的永續發展成果與碳排放數據分析。`
          )
        )
      ),
      // 碳排放總覽
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, '🌍 碳排放總覽'),
        React.createElement(
          View,
          { style: styles.card },
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(
              View,
              { style: styles.column },
              React.createElement(Text, { style: styles.label }, '總碳排放量'),
              React.createElement(Text, { style: styles.value }, `${totalEmissions.toFixed(2)} tCO2e`)
            ),
            React.createElement(
              View,
              { style: styles.column },
              React.createElement(Text, { style: styles.label }, '數據筆數'),
              React.createElement(Text, { style: styles.value }, `${carbonData.length} 筆`)
            )
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(
              View,
              { style: styles.column },
              React.createElement(Text, { style: styles.label }, '平均每日排放'),
              React.createElement(
                Text,
                { style: styles.value },
                `${carbonData.length > 0 ? (totalEmissions / carbonData.length).toFixed(2) : '0.00'} tCO2e`
              )
            ),
            React.createElement(
              View,
              { style: styles.column },
              React.createElement(Text, { style: styles.label }, '報告狀態'),
              React.createElement(Text, { style: styles.value }, report.status)
            )
          )
        )
      ),
      // 頁腳
      React.createElement(Text, { style: styles.footer }, `${company.name} | 第 1 頁 | 機密文件`)
    )
  );

  // 第二頁：詳細數據
  if (carbonData.length > 0) {
    const tableRows = carbonData.slice(0, 15).map((item, index) =>
      React.createElement(
        View,
        { style: styles.tableRow, key: `row-${index}` },
        React.createElement(Text, { style: [styles.tableCell, { flex: 1.5 }] }, formatDate(item.date)),
        React.createElement(Text, { style: styles.tableCell }, item.category),
        React.createElement(Text, { style: styles.tableCell }, item.totalCarbon.toFixed(2))
      )
    );

    pages.push(
      React.createElement(
        Page,
        { size: 'A4', style: styles.page, key: 'page-2' },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.title }, '詳細碳排放數據')
        ),
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, '📊 每日碳排放明細'),
          React.createElement(
            View,
            { style: styles.table },
            React.createElement(
              View,
              { style: [styles.tableRow, styles.tableHeader] },
              React.createElement(Text, { style: [styles.tableCell, { flex: 1.5 }] }, '日期'),
              React.createElement(Text, { style: styles.tableCell }, '類別'),
              React.createElement(Text, { style: styles.tableCell }, '排放量 (tCO2e)')
            ),
            ...tableRows
          ),
          carbonData.length > 15
            ? React.createElement(Text, { style: styles.text }, `... 及其他 ${carbonData.length - 15} 筆數據`)
            : null
        ),
        React.createElement(Text, { style: styles.footer }, `${company.name} | 第 2 頁 | 機密文件`)
      )
    );
  }

  // 第三頁：AI 分析
  if (webhookData?.aiAnalysis) {
    const analysisText =
      typeof webhookData.aiAnalysis === 'string'
        ? webhookData.aiAnalysis
        : JSON.stringify(webhookData.aiAnalysis, null, 2);

    const paragraphs = splitLongText(analysisText, 800).map((paragraph, index) =>
      React.createElement(
        View,
        { style: styles.card, key: `analysis-${index}` },
        React.createElement(Text, { style: styles.longText }, paragraph)
      )
    );

    pages.push(
      React.createElement(
        Page,
        { size: 'A4', style: styles.page, key: 'page-3' },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.title }, '🤖 AI 智能分析')
        ),
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, '分析結果'),
          ...paragraphs
        ),
        React.createElement(Text, { style: styles.footer }, `${company.name} | 第 3 頁 | 機密文件`)
      )
    );
  }

  // 第四頁：Webhook 完整數據
  if (webhookData) {
    const webhookSections = [];

    if (webhookData.summary) {
      const summaryParagraphs = splitLongText(webhookData.summary, 600).map((paragraph, index) =>
        React.createElement(Text, { style: styles.longText, key: `summary-${index}` }, paragraph)
      );

      webhookSections.push(
        React.createElement(
          View,
          { style: styles.card, key: 'summary' },
          React.createElement(Text, { style: styles.label }, '數據摘要'),
          ...summaryParagraphs
        )
      );
    }

    if (webhookData.insights) {
      const insightsText =
        typeof webhookData.insights === 'string'
          ? webhookData.insights
          : JSON.stringify(webhookData.insights, null, 2);

      const insightsParagraphs = splitLongText(insightsText, 600).map((paragraph, index) =>
        React.createElement(Text, { style: styles.longText, key: `insights-${index}` }, paragraph)
      );

      webhookSections.push(
        React.createElement(
          View,
          { style: styles.card, key: 'insights' },
          React.createElement(Text, { style: styles.label }, '關鍵洞察'),
          ...insightsParagraphs
        )
      );
    }

    if (webhookData.recommendations) {
      const recommendationsText =
        typeof webhookData.recommendations === 'string'
          ? webhookData.recommendations
          : JSON.stringify(webhookData.recommendations, null, 2);

      const recommendationsParagraphs = splitLongText(recommendationsText, 600).map((paragraph, index) =>
        React.createElement(Text, { style: styles.longText, key: `recommendations-${index}` }, paragraph)
      );

      webhookSections.push(
        React.createElement(
          View,
          { style: styles.card, key: 'recommendations' },
          React.createElement(Text, { style: styles.label }, '改善建議'),
          ...recommendationsParagraphs
        )
      );
    }

    if (webhookSections.length > 0) {
      pages.push(
        React.createElement(
          Page,
          { size: 'A4', style: styles.page, key: 'page-4' },
          React.createElement(
            View,
            { style: styles.header },
            React.createElement(Text, { style: styles.title }, '📡 系統數據記錄')
          ),
          React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, '完整 Webhook 數據'),
            ...webhookSections
          ),
          React.createElement(Text, { style: styles.footer }, `${company.name} | 第 4 頁 | 機密文件`)
        )
      );
    }
  }

  return React.createElement(Document, {}, ...pages);
}

export async function POST(request: NextRequest) {
  try {
    console.log('========== PDF 生成開始 ==========');
    const body = await request.json();
    const { reportId } = body;
    console.log('請求的報告 ID:', reportId);

    if (!reportId) {
      return NextResponse.json({ error: '缺少報告 ID', success: false }, { status: 400 });
    }

    // 獲取報告數據
    const report = await prisma.sustainabilityReport.findUnique({
      where: { id: reportId },
    });
    console.log('報告資料:', {
      id: report?.id,
      title: report?.title,
      period: report?.reportPeriod,
    });

    if (!report) {
      return NextResponse.json({ error: '找不到報告', success: false }, { status: 404 });
    }

    // 獲取公司數據
    const company = await prisma.company.findUnique({
      where: { id: report.companyId },
    });
    console.log('公司資料:', {
      id: company?.id,
      name: company?.name,
      nameLength: company?.name?.length,
      nameBytes: Buffer.from(company?.name || '', 'utf8').toString('hex'),
    });

    if (!company) {
      return NextResponse.json({ error: '找不到公司資料', success: false }, { status: 404 });
    }

    // 獲取碳排放數據
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        companyId: company.id,
        date: {
          gte: report.startDate,
          lte: report.endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const totalEmissions = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);

    // 發送 webhook 並獲取 AI 分析
    let webhookData = null;
    try {
      const webhookUrl =
        'https://primary-production-94491.up.railway.app/webhook/27370e56-64bd-4b60-aa48-d128d3db7049';
      const webhookPayload = {
        start_date: formatDateYYYYMMDD(report.startDate),
        end_date: formatDateYYYYMMDD(report.endDate),
        event: 'report.pdf_generation',
        type: 'pdf',
        report: {
          id: report.id,
          title: report.title,
          period: report.reportPeriod,
          status: report.status,
          totalEmissions: totalEmissions.toFixed(2),
          dataCount: carbonData.length,
        },
        company: {
          id: company.id,
          name: company.name,
        },
        timestamp: new Date().toISOString(),
      };

      console.log('========== 發送 Webhook ==========');
      console.log('Webhook URL:', webhookUrl);
      console.log('Webhook Payload:', JSON.stringify(webhookPayload, null, 2));

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      console.log('Webhook 回應狀態:', webhookResponse.status);
      console.log('Webhook 回應 headers:', Object.fromEntries(webhookResponse.headers.entries()));

      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text();
        console.log('========== Webhook 原始回應 ==========');
        console.log('回應長度:', responseText.length);
        console.log('前 200 字符:', responseText.substring(0, 200));
        console.log('回應的 hex 編碼（前 100 bytes）:', Buffer.from(responseText.substring(0, 50), 'utf8').toString('hex'));

        try {
          webhookData = JSON.parse(responseText);
          console.log('========== Webhook 解析後的數據 ==========');
          console.log('數據類型:', typeof webhookData);
          console.log('數據鍵:', Object.keys(webhookData));

          if (webhookData.aiAnalysis) {
            console.log('AI 分析類型:', typeof webhookData.aiAnalysis);
            console.log('AI 分析前 100 字符:', String(webhookData.aiAnalysis).substring(0, 100));
            console.log('AI 分析 hex（前 50 bytes）:',
              Buffer.from(String(webhookData.aiAnalysis).substring(0, 50), 'utf8').toString('hex')
            );
          }

          console.log('完整 webhookData:', JSON.stringify(webhookData, null, 2));
        } catch (parseError) {
          console.error('JSON 解析失敗:', parseError);
          webhookData = { rawResponse: responseText };
        }
      } else {
        console.error('Webhook 請求失敗，狀態碼:', webhookResponse.status);
      }
    } catch (webhookError) {
      console.error('========== Webhook 請求異常 ==========');
      console.error('錯誤:', webhookError);
    }

    // 生成 PDF
    console.log('========== 開始生成 PDF ==========');
    console.log('傳入 createPDFDocument 的數據:');
    console.log('- Report title:', report.title);
    console.log('- Company name:', company.name);
    console.log('- Carbon data count:', carbonData.length);
    console.log('- Webhook data:', webhookData ? 'Yes' : 'No');

    const pdfDoc = createPDFDocument(report, carbonData, webhookData, company);
    console.log('PDF Document 創建成功');

    // 使用 renderToReadableStream 生成 PDF
    const pdfInstance = pdf(pdfDoc);
    console.log('PDF Instance 創建成功');

    // 將 PDF 轉換為 Blob，然後轉為 ArrayBuffer
    const pdfBlob = await pdfInstance.toBlob();
    console.log('PDF Blob 大小:', pdfBlob.size, 'bytes');

    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    console.log('PDF Buffer 大小:', pdfBuffer.length, 'bytes');

    console.log('========== PDF 生成完成 ==========');

    // 返回 PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report_${report.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF 生成錯誤:', error);
    return NextResponse.json({ error: 'PDF 生成失敗', success: false }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
