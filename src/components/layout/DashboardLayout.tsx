'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import DatabaseStatus from '../DatabaseStatus';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-pattern bg-overlay">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 w-full relative z-10">
        {/* 頂部導航欄 - 移動端 */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="開啟選單"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">碳智匯</h1>
          <div className="ml-auto">
            <DatabaseStatus />
          </div>
        </div>

        {/* 資料庫狀態顯示在右上角 - 桌面端 */}
        <div className="hidden lg:block fixed top-4 right-4 z-30">
          <DatabaseStatus />
        </div>

        {/* 主要內容區域 */}
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
