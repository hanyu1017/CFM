// src/app/api/report/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

const prisma = new PrismaClient();

// 註冊中文字體（使用 Google Fonts 的 Noto Sans TC）
Font.register({
  family: 'Noto Sans TC',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosanstc/v35/-nFuOG829Oofr2wohFbTp9i9kwMvFI.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/notosanstc/v35/-nFvOG829Oofr2wohFbTp9i9kwMPBZf1bw.ttf',
      fontWeight: 700,
    },
  ],
});

// 定義樣式
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Noto Sans TC',
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
  badge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 10,
    padding: '4 8',
    borderRadius: 4,
    marginLeft: 8,
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

// PDF 文檔組件
interface PDFDocumentProps {
  report: any;
  carbonData: any[];
  webhookData: any;
  company: any;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ report, carbonData, webhookData, company }) => {
  const totalEmissions = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 標題區域 */}
        <View style={styles.header}>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.subtitle}>
            {company.name} | 永續發展報告書
          </Text>
          <Text style={styles.subtitle}>
            報告期間：{formatDate(report.startDate)} - {formatDate(report.endDate)}
          </Text>
          <Text style={styles.subtitle}>
            生成時間：{formatDate(report.createdAt)}
          </Text>
        </View>

        {/* 執行摘要 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 執行摘要</Text>
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              {report.executiveSummary || `本報告涵蓋 ${report.reportPeriod} 期間的永續發展成果與碳排放數據分析。`}
            </Text>
          </View>
        </View>

        {/* 碳排放總覽 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 碳排放總覽</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>總碳排放量</Text>
                <Text style={styles.value}>{totalEmissions.toFixed(2)} tCO2e</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>數據筆數</Text>
                <Text style={styles.value}>{carbonData.length} 筆</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>平均每日排放</Text>
                <Text style={styles.value}>
                  {carbonData.length > 0 ? (totalEmissions / carbonData.length).toFixed(2) : '0.00'} tCO2e
                </Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>報告狀態</Text>
                <Text style={styles.value}>{report.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 頁腳 */}
        <Text style={styles.footer}>
          {company.name} | 第 1 頁 | 機密文件
        </Text>
      </Page>

      {/* 第二頁：詳細數據 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>詳細碳排放數據</Text>
        </View>

        {/* 碳排放數據表格 */}
        {carbonData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 每日碳排放明細</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>日期</Text>
                <Text style={styles.tableCell}>類別</Text>
                <Text style={styles.tableCell}>排放量 (tCO2e)</Text>
              </View>
              {carbonData.slice(0, 15).map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {formatDate(item.date)}
                  </Text>
                  <Text style={styles.tableCell}>{item.category}</Text>
                  <Text style={styles.tableCell}>{item.totalCarbon.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            {carbonData.length > 15 && (
              <Text style={styles.text}>... 及其他 {carbonData.length - 15} 筆數據</Text>
            )}
          </View>
        )}

        {/* 頁腳 */}
        <Text style={styles.footer}>
          {company.name} | 第 2 頁 | 機密文件
        </Text>
      </Page>

      {/* 第三頁：AI 分析 */}
      {webhookData?.aiAnalysis && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>🤖 AI 智能分析</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>分析結果</Text>
            {splitLongText(
              typeof webhookData.aiAnalysis === 'string'
                ? webhookData.aiAnalysis
                : JSON.stringify(webhookData.aiAnalysis, null, 2),
              800
            ).map((paragraph, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.longText}>{paragraph}</Text>
              </View>
            ))}
          </View>

          {/* 頁腳 */}
          <Text style={styles.footer}>
            {company.name} | 第 3 頁 | 機密文件
          </Text>
        </Page>
      )}

      {/* 第四頁：Webhook 完整數據 */}
      {webhookData && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>📡 系統數據記錄</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>完整 Webhook 數據</Text>
            {webhookData.summary && (
              <View style={styles.card}>
                <Text style={styles.label}>數據摘要</Text>
                {splitLongText(webhookData.summary, 600).map((paragraph, index) => (
                  <Text key={index} style={styles.longText}>{paragraph}</Text>
                ))}
              </View>
            )}

            {webhookData.insights && (
              <View style={styles.card}>
                <Text style={styles.label}>關鍵洞察</Text>
                {splitLongText(
                  typeof webhookData.insights === 'string'
                    ? webhookData.insights
                    : JSON.stringify(webhookData.insights, null, 2),
                  600
                ).map((paragraph, index) => (
                  <Text key={index} style={styles.longText}>{paragraph}</Text>
                ))}
              </View>
            )}

            {webhookData.recommendations && (
              <View style={styles.card}>
                <Text style={styles.label}>改善建議</Text>
                {splitLongText(
                  typeof webhookData.recommendations === 'string'
                    ? webhookData.recommendations
                    : JSON.stringify(webhookData.recommendations, null, 2),
                  600
                ).map((paragraph, index) => (
                  <Text key={index} style={styles.longText}>{paragraph}</Text>
                ))}
              </View>
            )}
          </View>

          {/* 頁腳 */}
          <Text style={styles.footer}>
            {company.name} | 第 4 頁 | 機密文件
          </Text>
        </Page>
      )}
    </Document>
  );
};

// 格式化日期為 YYYY-MM-DD
function formatDateYYYYMMDD(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: '缺少報告 ID', success: false },
        { status: 400 }
      );
    }

    // 獲取報告數據
    const report = await prisma.sustainabilityReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: '找不到報告', success: false },
        { status: 404 }
      );
    }

    // 獲取公司數據
    const company = await prisma.company.findUnique({
      where: { id: report.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: '找不到公司資料', success: false },
        { status: 404 }
      );
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
      const webhookUrl = 'https://primary-production-94491.up.railway.app/webhook/27370e56-64bd-4b60-aa48-d128d3db7049';
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

      console.log('發送 Webhook 以獲取 AI 分析...');
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text();
        try {
          webhookData = JSON.parse(responseText);
          console.log('成功獲取 Webhook AI 分析數據');
        } catch {
          webhookData = { rawResponse: responseText };
        }
      }
    } catch (webhookError) {
      console.error('Webhook 請求失敗:', webhookError);
    }

    // 生成 PDF
    const pdfDoc = PDFDocument({ report, carbonData, webhookData, company });
    const pdfBuffer = await pdf(pdfDoc).toBuffer();

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
    return NextResponse.json(
      { error: 'PDF 生成失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
