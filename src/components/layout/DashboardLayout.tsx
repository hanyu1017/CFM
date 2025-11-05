'use client';

import Sidebar from './Sidebar';
import AIChat from './AIChat';
import DatabaseStatus from '../DatabaseStatus';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* 資料庫狀態顯示在右上角 */}
        <div className="fixed top-4 right-4 z-30">
          <DatabaseStatus />
        </div>
        {children}
      </main>
      <AIChat />
    </div>
  );
}
