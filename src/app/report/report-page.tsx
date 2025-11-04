// src/app/report/page.tsx
'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Settings, Sparkles, CheckCircle } from 'lucide-react';

interface ReportConfig {
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  includeExecutiveSummary: boolean;
  includeCarbonFootprint: boolean;
  includeEmissionsSummary: boolean;
  includeReductionTargets: boolean;
  includeInitiatives: boolean;
  includeCompliance: boolean;
  includeFinancialImpact: boolean;
  includeStakeholders: boolean;
}

interface GeneratedReport {
  id: string;
  title: string;
  period: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
  docxUrl?: string;
}

export default function ReportPage() {
  const [config, setConfig] = useState<ReportConfig>({
    title: '永續發展報告書',
    period: '2024年度',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    includeExecutiveSummary: true,
    includeCarbonFootprint: true,
    includeEmissionsSummary: true,
    includeReductionTargets: true,
    includeInitiatives: true,
    includeCompliance: true,
    includeFinancialImpact: true,
    includeStakeholders: true,
  });

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // 一鍵生成報告（使用上個月數據）
  const generateQuickReport = async () => {
    setGenerating(true);
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const response = await fetch('/api/report/generate-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: lastMonth.getMonth() + 1,
          year: lastMonth.getFullYear(),
        })
      });

      const data = await response.json();
      setGeneratedReports(prev => [data.report, ...prev]);
      alert('報告生成成功！');
    } catch (error) {
      console.error('Failed to generate quick report:', error);
      alert('報告生成失敗，請稍後再試');
    } finally {
      setGenerating(false);
    }
  };

  // 自定義生成報告
  const generateCustomReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      setGeneratedReports(prev => [data.report, ...prev]);
      setActiveTab('history');
      alert('報告生成成功！');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('報告生成失敗，請稍後再試');
    } finally {
      setGenerating(false);
    }
  };

  // 處理配置變更
  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">永續報告書生成系統</h1>
        <p className="text-gray-600 mt-2">自動化生成符合國際標準的永續發展報告書</p>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickActionCard
          title="一鍵生成"
          description="使用上個月數據自動生成標準報告"
          icon={<Sparkles className="w-8 h-8" />}
          color="blue"
          onClick={generateQuickReport}
          disabled={generating}
        />
        <QuickActionCard
          title="自定義報告"
          description="選擇特定期間和內容項目"
          icon={<Settings className="w-8 h-8" />}
          color="green"
          onClick={() => setActiveTab('create')}
        />
        <QuickActionCard
          title="報告歷史"
          description="查看和下載已生成的報告"
          icon={<FileText className="w-8 h-8" />}
          color="purple"
          onClick={() => setActiveTab('history')}
        />
      </div>

      {/* 標籤導航 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <TabButton
            active={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
            label="創建報告"
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            label="報告歷史"
          />
        </div>

        <div className="p-6">
          {activeTab === 'create' && (
            <CreateReportPanel
              config={config}
              onConfigChange={handleConfigChange}
              onGenerate={generateCustomReport}
              generating={generating}
            />
          )}

          {activeTab === 'history' && (
            <ReportHistoryPanel reports={generatedReports} />
          )}
        </div>
      </div>
    </div>
  );
}

// 快速操作卡片
function QuickActionCard({ title, description, icon, color, onClick, disabled = false }: any) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colorClasses[color]} text-white rounded-lg p-6 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </button>
  );
}

// 標籤按鈕
function TabButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

// 創建報告面板
function CreateReportPanel({ config, onConfigChange, onGenerate, generating }: any) {
  const contentSections = [
    { key: 'includeExecutiveSummary', label: '執行摘要', description: '高階管理層的報告概述' },
    { key: 'includeCarbonFootprint', label: '碳足跡分析', description: '完整的碳排放數據分析' },
    { key: 'includeEmissionsSummary', label: '排放總結', description: 'Scope 1/2/3 排放彙整' },
    { key: 'includeReductionTargets', label: '減排目標', description: '短中長期減碳目標與進度' },
    { key: 'includeInitiatives', label: '永續措施', description: '已實施的永續發展計畫' },
    { key: 'includeCompliance', label: '法規遵循', description: '相關環境法規符合性說明' },
    { key: 'includeFinancialImpact', label: '財務影響', description: '永續投資與成本效益分析' },
    { key: 'includeStakeholders', label: '利害關係人', description: '利害關係人溝通與議合' },
  ];

  return (
    <div className="space-y-6">
      {/* 基本設定 */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              報告標題
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => onConfigChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              報告期間
            </label>
            <input
              type="text"
              value={config.period}
              onChange={(e) => onConfigChange('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始日期
            </label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => onConfigChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束日期
            </label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => onConfigChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 內容選擇 */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">報告內容選擇</h3>
        <div className="space-y-3">
          {contentSections.map((section) => (
            <label key={section.key} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config[section.key]}
                onChange={(e) => onConfigChange(section.key, e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">{section.label}</p>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 生成按鈕 */}
      <div className="flex gap-4">
        <button
          onClick={onGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          <FileText className="w-5 h-5" />
          {generating ? '生成中...' : '生成報告'}
        </button>
      </div>
    </div>
  );
}

// 報告歷史面板
function ReportHistoryPanel({ reports }: { reports: GeneratedReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">尚無已生成的報告</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <StatusBadge status={report.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {report.period}
                </span>
                <span>生成於: {new Date(report.createdAt).toLocaleString('zh-TW')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {report.pdfUrl && (
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              )}
              {report.docxUrl && (
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  DOCX
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 狀態標籤
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
    REVIEW: { label: '審核中', color: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: '已核准', color: 'bg-green-100 text-green-800' },
    PUBLISHED: { label: '已發布', color: 'bg-blue-100 text-blue-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
