'use client';

import Sidebar from './Sidebar';
import AIChat from './AIChat';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* tä */}
      <Sidebar />

      {/* ;Ågπ@ */}
      <main className="flex-1 ml-64">
        {children}
      </main>

      {/* AI qn’	 */}
      <AIChat />
    </div>
  );
}
