import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '碳排管理系統',
  description: '專業的永續碳排管理與監控平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
