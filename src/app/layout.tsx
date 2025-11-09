import type { Metadata } from 'next';
import './globals.css';
import FloatingAI from '@/components/ai-chat/FloatingAI';

export const metadata: Metadata = {
  title: '碳排管理系統 | CFM System',
  description: '專業的永續碳排管理與監控平台 - 協助企業達成淨零目標，符合國際永續標準',
  keywords: '碳排放, 碳管理, 永續發展, 淨零排放, ESG, 綠色製造',
  authors: [{ name: 'CFM System' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <FloatingAI />
      </body>
    </html>
  );
}
