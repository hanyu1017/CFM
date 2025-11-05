// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Wind, Calendar, AlertCircle, Database } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface CarbonData {
  date: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

interface RealtimeMetrics {
  currentEmission: number;
  todayReduction: number;
  monthlyTarget: number;
  efficiency: number;
}

export default function DashboardPage() {
  const [carbonData, setCarbonData] = useState<CarbonData[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    currentEmission: 0,
    todayReduction: 0,
    monthlyTarget: 0,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [querying, setQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 日期範圍狀態
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 日期格式化函數
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 獲取預設日期範圍（過去30天）
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: formatDate(start),
      endDate: formatDate(end)
    };
  };

  // 快速選擇日期範圍
  const setQuickDateRange = (days: number | 'year') => {
    const end = new Date();
    const start = new Date();

    if (days === 'year') {
      start.setMonth(0, 1); // 今年1月1日
    } else {
      start.setDate(start.getDate() - days);
    }

    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setStartDate(startStr);
    setEndDate(endStr);
    fetchDashboardData(startStr, endStr);
  };

  // 初始化預設日期
  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    fetchDashboardData(defaultStart, defaultEnd);
  }, []);

  const fetchDashboardData = async (start?: string, end?: string) => {
    try {
      setQuerying(true);
      setError(null);
      setMessage(null);

      const startParam = start || startDate;
      const endParam = end || endDate;
      const url = `/api/carbon/dashboard?startDate=${startParam}&endDate=${endParam}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success === false) {
        setError(data.message || '查詢失敗');
        setCarbonData([]);
        setMetrics({
          currentEmission: 0,
          todayReduction: 0,
          monthlyTarget: data.metrics?.monthlyTarget || 10000,
          efficiency: 0,
        });
      } else {
        setCarbonData(data.carbonData || []);
        setMetrics(data.metrics || {
          currentEmission: 0,
          todayReduction: 0,
          monthlyTarget: 10000,
          efficiency: 0,
        });

        if (data.carbonData && data.carbonData.length > 0) {
          setMessage(`成功載入 ${data.carbonData.length} 筆碳排放數據`);
        }
      }

      setLoading(false);
      setQuerying(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('無法連接到伺服器，請檢查網路連接');
      setCarbonData([]);
      setLoading(false);
      setQuerying(false);
    }
  };

  // 顏色配置
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // 計算範圍數據
  const scopeData = carbonData.length > 0 ? [
    { name: 'Scope 1', value: carbonData[carbonData.length - 1].scope1, color: '#3b82f6' },
    { name: 'Scope 2', value: carbonData[carbonData.length - 1].scope2, color: '#10b981' },
    { name: 'Scope 3', value: carbonData[carbonData.length - 1].scope3, color: '#f59e0b' },
  ] : [];

  const monthlyTotal = carbonData.reduce((sum, item) => sum + item.total, 0);
  const avgMonthly = carbonData.length > 0 ? monthlyTotal / carbonData.length : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入儀表板數據...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 relative">
        {/* 查詢遮罩 */}
        {querying && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 font-medium">正在查詢數據...</p>
            </div>
          </div>
        )}

        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">碳排放監控儀表板</h1>
          <p className="text-gray-600 mt-2">即時監控企業碳排放數據與趨勢分析</p>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <p className="font-medium text-red-800">查詢失敗</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-sm mt-2">
                  請確認：
                  <br />• 資料庫已正確配置
                  <br />• 已導入碳排放數據（執行：<code className="bg-red-100 px-1 rounded">npm run seed:import-pg</code>）
                  <br />• 所選日期範圍內有數據
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 成功訊息 */}
        {message && !error && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-800">{message}</p>
            </div>
          </div>
        )}

        {/* 日期範圍選擇器 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* 日期輸入區域 */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  開始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  結束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => fetchDashboardData(startDate, endDate)}
                disabled={querying}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {querying ? '查詢中...' : '查詢'}
              </button>
            </div>

            {/* 快速選擇按鈕 */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">快速選擇：</span>
              <button
                onClick={() => setQuickDateRange(7)}
                disabled={querying}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                過去7天
              </button>
              <button
                onClick={() => setQuickDateRange(30)}
                disabled={querying}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                過去30天
              </button>
              <button
                onClick={() => setQuickDateRange(90)}
                disabled={querying}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                過去90天
              </button>
              <button
                onClick={() => setQuickDateRange(180)}
                disabled={querying}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                過去180天
              </button>
              <button
                onClick={() => setQuickDateRange('year')}
                disabled={querying}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                今年
              </button>
            </div>
          </div>
        </div>

        {/* 空狀態提示 */}
        {!error && carbonData.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded">
            <div className="flex items-start">
              <Database className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">查詢範圍內無數據</h3>
                <p className="text-yellow-800 mb-3">
                  在 <strong>{startDate}</strong> 至 <strong>{endDate}</strong> 期間沒有找到碳排放數據。
                </p>
                <div className="text-yellow-800 text-sm space-y-1">
                  <p className="font-medium">建議操作：</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>調整查詢日期範圍</li>
                    <li>點擊上方快速選擇按鈕（如「過去180天」）</li>
                    <li>或導入碳排放數據到資料庫</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 只有數據時才顯示圖表 */}
        {carbonData.length > 0 && (
          <>
            {/* 關鍵指標卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="當前排放量"
                value={metrics.currentEmission.toFixed(1)}
                unit="tCO2e"
                trend={-5.2}
                icon={<Activity className="w-6 h-6" />}
                color="blue"
              />
              <MetricCard
                title="今日減排量"
                value={metrics.todayReduction.toFixed(1)}
                unit="tCO2e"
                trend={12.3}
                icon={<TrendingDown className="w-6 h-6" />}
                color="green"
              />
              <MetricCard
                title="平均每日排放"
                value={avgMonthly.toFixed(1)}
                unit="tCO2e"
                trend={8.1}
                icon={<Activity className="w-6 h-6" />}
                color="yellow"
              />
              <MetricCard
                title="能源效率"
                value={metrics.efficiency.toFixed(1)}
                unit="%"
                trend={3.5}
                icon={<Wind className="w-6 h-6" />}
                color="purple"
              />
            </div>

            {/* 圖表區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 趨勢圖 */}
              <ChartCard title="碳排放趨勢圖">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={carbonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="scope1" stroke="#3b82f6" name="範疇一" strokeWidth={2} />
                    <Line type="monotone" dataKey="scope2" stroke="#10b981" name="範疇二" strokeWidth={2} />
                    <Line type="monotone" dataKey="scope3" stroke="#f59e0b" name="範疇三" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 範圍分布圓餅圖 */}
              <ChartCard title="排放範圍分布">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scopeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* 總排放量柱狀圖 */}
            <ChartCard title="總排放量對比">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8b5cf6" name="總排放量 (tCO2e)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 數據摘要 */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">數據摘要</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryItem label="期間總排放" value={monthlyTotal.toFixed(0)} unit="tCO2e" />
                <SummaryItem label="平均每日" value={avgMonthly.toFixed(0)} unit="tCO2e" />
                <SummaryItem label="最高單日" value={Math.max(...carbonData.map(d => d.total)).toFixed(0)} unit="tCO2e" />
                <SummaryItem label="最低單日" value={Math.min(...carbonData.map(d => d.total)).toFixed(0)} unit="tCO2e" />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// 指標卡片組件
interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  trend: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function MetricCard({ title, value, unit, trend, icon, color }: MetricCardProps) {
  const colorClasses: Record<'blue' | 'green' | 'yellow' | 'purple', string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

// 圖表卡片組件
function ChartCard({ title, children }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

// 摘要項目組件
function SummaryItem({ label, value, unit }: any) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
}
