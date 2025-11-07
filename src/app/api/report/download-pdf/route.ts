// src/app/api/report/download-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('pdfUrl');

    console.log('========== 下載 PDF 請求 ==========');
    console.log('PDF URL:', pdfUrl);

    if (!pdfUrl) {
      return NextResponse.json({ error: '缺少 PDF URL' }, { status: 400 });
    }

    // 移除開頭的 /reports/，只保留檔名
    const filename = pdfUrl.replace('/reports/', '');
    console.log('檔名:', filename);

    // 構建完整的檔案路徑
    const filePath = path.join(process.cwd(), 'public', 'reports', filename);
    console.log('完整路徑:', filePath);

    // 檢查檔案是否存在
    if (!fs.existsSync(filePath)) {
      console.error('檔案不存在:', filePath);
      return NextResponse.json({ error: '找不到 PDF 檔案' }, { status: 404 });
    }

    // 讀取檔案
    const fileBuffer = fs.readFileSync(filePath);
    console.log('檔案大小:', fileBuffer.length, 'bytes');

    // 返回 PDF
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('下載 PDF 錯誤:', error);
    return NextResponse.json({ error: '下載失敗' }, { status: 500 });
  }
}
