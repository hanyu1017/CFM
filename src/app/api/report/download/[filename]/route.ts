// src/app/api/report/download/[filename]/route.ts
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 從檔案名稱提取報告期間資訊
function parseFilename(filename: string): { year: number; month: number } | null {
  // 檔案名稱格式: report_YYYY_MM_timestamp.pdf
  const match = filename.match(/report_(\d{4})_(\d{2})_\d+\.pdf/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2])
    };
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    console.log('=== PDF 下載請求 ===');
    console.log('檔案名稱:', params.filename);

    // 解析檔案名稱獲取期間資訊
    const periodInfo = parseFilename(params.filename);

    let reportData = null;
    if (periodInfo) {
      // 查詢對應期間的報告
      const reportPeriod = `${periodInfo.year}-${String(periodInfo.month).padStart(2, '0')}`;
      console.log('查詢報告期間:', reportPeriod);

      const report = await prisma.sustainabilityReport.findFirst({
        where: {
          reportPeriod: reportPeriod,
          generatedBy: 'AUTO'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (report) {
        console.log('找到報告:', report.id);
        console.log('Webhook 資料:', report.carbonFootprint);

        reportData = {
          id: report.id,
          title: report.title,
          period: report.reportPeriod,
          startDate: report.startDate,
          endDate: report.endDate,
          executiveSummary: report.executiveSummary,
          webhookData: report.carbonFootprint,
          createdAt: report.createdAt
        };
      } else {
        console.log('未找到對應的報告記錄');
      }
    }

    // 生成包含資料的 PDF
    const pdfContent = generateDemoPDF(params.filename, reportData);

    // 將 Buffer 轉換為 Uint8Array，這是 Response 可接受的類型
    const uint8Array = new Uint8Array(pdfContent);

    console.log('✅ PDF 生成成功');

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${params.filename}"`,
      },
    });
  } catch (error) {
    console.error('❌ PDF 下載錯誤:', error);
    return new Response(JSON.stringify({ error: 'PDF 下載失敗' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// 生成包含資料的 PDF
function generateDemoPDF(filename: string, reportData: any): Buffer {
  // 格式化日期
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW');
  };

  // 準備顯示的內容
  let contentLines = [
    '(CFM Sustainability Report) Tj',
    '0 -30 Td',
    `(Filename: ${filename}) Tj`,
    '0 -30 Td',
  ];

  if (reportData) {
    contentLines.push('0 -40 Td');
    contentLines.push(`(Title: ${reportData.title || 'N/A'}) Tj`);
    contentLines.push('0 -25 Td');
    contentLines.push(`(Period: ${reportData.period || 'N/A'}) Tj`);
    contentLines.push('0 -25 Td');
    contentLines.push(`(Start Date: ${formatDate(reportData.startDate)}) Tj`);
    contentLines.push('0 -25 Td');
    contentLines.push(`(End Date: ${formatDate(reportData.endDate)}) Tj`);
    contentLines.push('0 -25 Td');
    contentLines.push(`(Summary: ${reportData.executiveSummary || 'N/A'}) Tj`);

    // 如果有 webhook 資料，顯示
    if (reportData.webhookData) {
      contentLines.push('0 -40 Td');
      contentLines.push('(Webhook Data Received:) Tj');
      contentLines.push('0 -25 Td');

      const webhookDataStr = JSON.stringify(reportData.webhookData);
      // PDF 有字串長度限制，截取前 200 字元
      const truncatedData = webhookDataStr.length > 200
        ? webhookDataStr.substring(0, 200) + '...'
        : webhookDataStr;

      contentLines.push(`(${truncatedData}) Tj`);
    }

    contentLines.push('0 -40 Td');
    contentLines.push(`(Generated: ${formatDate(reportData.createdAt)}) Tj`);
  } else {
    contentLines.push('0 -40 Td');
    contentLines.push('(No report data available) Tj');
  }

  const streamContent = `BT
/F1 12 Tf
50 750 Td
${contentLines.join('\n')}
ET`;

  const streamLength = streamContent.length;

  // 這是一個最小的 PDF 檔案結構
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
492
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}
