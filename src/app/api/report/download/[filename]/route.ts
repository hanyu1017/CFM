// src/app/api/report/download/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 示範 PDF 下載（實際應該從檔案系統或雲端儲存讀取）
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // 這裡使用一個示範的 PDF 內容
    // 實際應該從儲存系統讀取真實的 PDF 檔案
    const pdfContent = generateDemoPDF(params.filename);

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${params.filename}"`,
      },
    });
  } catch (error) {
    console.error('Download PDF error:', error);
    return NextResponse.json(
      { error: 'PDF 下載失敗' },
      { status: 500 }
    );
  }
}

// 生成示範 PDF（實際應使用 PDF 生成庫如 pdfkit 或 puppeteer）
function generateDemoPDF(filename: string): Buffer {
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
/Length 100
>>
stream
BT
/F1 24 Tf
100 700 Td
(CFM Sustainability Report) Tj
0 -30 Td
(Filename: ${filename}) Tj
ET
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
