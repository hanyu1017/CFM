// src/components/DatabaseStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';

interface DBStatus {
  status: 'connected' | 'disconnected' | 'checking';
  message: string;
  stats?: {
    companies: number;
    carbonData: number;
    targets: number;
  };
}

export default function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState<DBStatus>({
    status: 'checking',
    message: '檢查中...',
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkDatabaseStatus();
    // 每 30 秒檢查一次
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/health/db');
      const data = await response.json();

      if (response.ok) {
        setDbStatus({
          status: 'connected',
          message: data.message,
          stats: data.stats,
        });
      } else {
        setDbStatus({
          status: 'disconnected',
          message: data.message || '連線失敗',
        });
      }
    } catch (error) {
      setDbStatus({
        status: 'disconnected',
        message: '無法連線到資料庫',
      });
    }
  };

  const getStatusColor = () => {
    switch (dbStatus.status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = () => {
    switch (dbStatus.status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4 animate-pulse" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg border transition-all min-h-[44px] sm:min-h-0 ${getStatusColor()}`}
        title={dbStatus.message}
      >
        {getStatusIcon()}
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">
          {dbStatus.status === 'connected' ? '資料庫' : '資料庫'}
        </span>
        {dbStatus.status === 'connected' && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* 詳細資訊浮動視窗 */}
      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          ></div>
          <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-12 z-50 w-auto sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">資料庫連線狀態</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className={`flex items-center gap-2 p-2 rounded ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-xs sm:text-sm font-medium">{dbStatus.message}</span>
              </div>

              {dbStatus.status === 'connected' && dbStatus.stats && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">資料統計</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-base sm:text-lg font-bold text-blue-600">
                        {dbStatus.stats.companies}
                      </p>
                      <p className="text-xs text-gray-600">公司</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-base sm:text-lg font-bold text-green-600">
                        {dbStatus.stats.carbonData}
                      </p>
                      <p className="text-xs text-gray-600">碳排數據</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <p className="text-base sm:text-lg font-bold text-purple-600">
                        {dbStatus.stats.targets}
                      </p>
                      <p className="text-xs text-gray-600">目標</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={checkDatabaseStatus}
                className="w-full px-3 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                重新檢查
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
