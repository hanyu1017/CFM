// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Droplets, Wind, Calendar } from 'lucide-react';
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
  }, []);

  // 模擬實時數據更新
  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardData(startDate, endDate);
    }
    const interval = setInterval(() => {
      updateRealtimeData();
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const fetchDashboardData = async (start?: string, end?: string) => {
    try {
      const startParam = start || startDate;
      const endParam = end || endDate;
      const url = `/api/carbon/dashboard?startDate=${startParam}&endDate=${endParam}`;
      const response = await fetch(url);
      const data = await response.json();
      setCarbonData(data.carbonData);
      setMetrics(data.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // 使用模擬數據
      loadMockData();
    }
  };

  const updateRealtimeData = async () => {
    try {
      const response = await fetch('/api/carbon/realtime');
      const data = await response.json();
      setMetrics(prev => ({
        ...prev,
        currentEmission: data.currentEmission,
        efficiency: data.efficiency,
      }));
    } catch (error) {
      console.error('Failed to update realtime data:', error);
    }
  };

  const loadMockData = () => {
    // 模擬數據
    const mockData: CarbonData[] = Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${String(i + 1).padStart(2, '0')}`,
      scope1: Math.random() * 100 + 50,
      scope2: Math.random() * 150 + 100,
      scope3: Math.random() * 200 + 150,
      total: 0,
    })).map(item => ({
      ...item,
      total: item.scope1 + item.scope2 + item.scope3,
    }));

    setCarbonData(mockData);
    setMetrics({
      currentEmission: 245.6,
      todayReduction: 12.3,
      monthlyTarget: 5000,
      efficiency: 87.5,
    });
    setLoading(false);
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
  const avgMonthly = monthlyTotal / (carbonData.length || 1);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">碳排放監控儀表板</h1>
        <p className="text-gray-600 mt-2">即時監控企業碳排放數據與趨勢分析</p>
      </div>

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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              查詢
            </button>
          </div>

          {/* 快速選擇按鈕 */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center mr-2">快速選擇：</span>
            <button
              onClick={() => setQuickDateRange(7)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              過去7天
            </button>
            <button
              onClick={() => setQuickDateRange(30)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              過去30天
            </button>
            <button
              onClick={() => setQuickDateRange(90)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              過去90天
            </button>
            <button
              onClick={() => setQuickDateRange('year')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              今年
            </button>
          </div>
        </div>
      </div>

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
          title="月度目標達成率"
          value={((monthlyTotal / metrics.monthlyTarget) * 100).toFixed(0)}
          unit="%"
          trend={8.1}
          icon={<Zap className="w-6 h-6" />}
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
        {/* 月度趨勢圖 */}
        <ChartCard title="月度碳排放趨勢">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={carbonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scope1" stroke="#3b82f6" name="範疇一" />
              <Line type="monotone" dataKey="scope2" stroke="#10b981" name="範疇二" />
              <Line type="monotone" dataKey="scope3" stroke="#f59e0b" name="範疇三" />
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
      <ChartCard title="月度總排放量對比">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={carbonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
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
          <SummaryItem label="年度總排放" value={monthlyTotal.toFixed(0)} unit="tCO2e" />
          <SummaryItem label="月均排放" value={avgMonthly.toFixed(0)} unit="tCO2e" />
          <SummaryItem label="最高月份" value={Math.max(...carbonData.map(d => d.total)).toFixed(0)} unit="tCO2e" />
          <SummaryItem label="最低月份" value={Math.min(...carbonData.map(d => d.total)).toFixed(0)} unit="tCO2e" />
        </div>
      </div>
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
