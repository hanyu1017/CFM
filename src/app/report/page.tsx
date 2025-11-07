// src/app/report/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Settings, Sparkles, CheckCircle, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmDialog, AlertDialog, Toast } from '@/components/ui/Dialog';
import { useConfirmDialog, useAlertDialog, useToast } from '@/hooks/useDialog';

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
  const [generatingPdf, setGeneratingPdf] = useState(false); // PDF 生成狀態

  // 對話框狀態管理
  const { alertState, showAlert, closeAlert } = useAlertDialog();
  const { toastState, showToast, closeToast } = useToast();

  // 獲取報告列表
  const fetchReports = async () => {
    try {
      const response = await fetch('/api/report/list', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setGeneratedReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  // 組件掛載時獲取報告列表
  useEffect(() => {
    fetchReports();
  }, []);

  // 一鍵生成報告（使用上個月數據）
  const generateQuickReport = async () => {
    setGenerating(true);
    try {
      console.log('========== 一鍵生成報告開始 ==========');
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      console.log('請求參數:', {
        month: lastMonth.getMonth() + 1,
        year: lastMonth.getFullYear(),
      });

      const response = await fetch('/api/report/generate-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: lastMonth.getMonth() + 1,
          year: lastMonth.getFullYear(),
        })
      });

      console.log('API 回應狀態:', response.status);

      if (!response.ok) {
        throw new Error('Failed to generate quick report');
      }

      const data = await response.json();
      console.log('========== 報告生成成功 ==========');
      console.log('完整回傳數據:', JSON.stringify(data, null, 2));
      console.log('報告 ID:', data.report?.id);
      console.log('報告標題:', data.report?.title);
      console.log('Webhook 數據:', data.report?.webhookData);

      // 刷新報告列表
      await fetchReports();

      // 如果有報告 ID，自動生成 PDF
      if (data.report?.id) {
        console.log('========== 開始自動生成 PDF ==========');
        console.log('報告 ID:', data.report.id);

        // 延遲一下讓用戶看到報告生成成功
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 生成 PDF（不在這裡顯示 toast，在 PDF 完成時才顯示）
        await handleGeneratePdf(data.report.id);
      }

      // 切換到歷史標籤
      setActiveTab('history');
    } catch (error) {
      console.error('========== 報告生成失敗 ==========');
      console.error('錯誤詳情:', error);
      showAlert('錯誤', '報告生成失敗，請稍後再試', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // 自定義生成報告
  const generateCustomReport = async () => {
    setGenerating(true);
    try {
      console.log('========== 自定義報告生成開始 ==========');
      console.log('配置:', JSON.stringify(config, null, 2));

      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      console.log('API 回應狀態:', response.status);

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      console.log('========== 報告生成成功 ==========');
      console.log('完整回傳數據:', JSON.stringify(data, null, 2));
      console.log('報告 ID:', data.report?.id);
      console.log('報告標題:', data.report?.title);

      // 刷新報告列表
      await fetchReports();

      // 如果有報告 ID，自動生成 PDF
      if (data.report?.id) {
        console.log('========== 開始自動生成 PDF ==========');
        console.log('報告 ID:', data.report.id);

        // 延遲一下讓用戶看到報告生成成功
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 生成 PDF（不在這裡顯示 toast，在 PDF 完成時才顯示）
        await handleGeneratePdf(data.report.id);
      }

      // 切換到歷史標籤
      setActiveTab('history');
    } catch (error) {
      console.error('========== 報告生成失敗 ==========');
      console.error('錯誤詳情:', error);
      showAlert('錯誤', '報告生成失敗，請稍後再試', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // 處理配置變更
  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 下載 PDF
  const handleDownloadPdf = async (pdfUrl: string, reportTitle: string) => {
    try {
      console.log('========== 開始下載 PDF ==========');
      console.log('PDF URL:', pdfUrl);

      // 使用下載 API endpoint
      const downloadUrl = `/api/report/download-pdf?pdfUrl=${encodeURIComponent(pdfUrl)}`;
      console.log('下載 API URL:', downloadUrl);

      const response = await fetch(downloadUrl);
      console.log('下載回應狀態:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('下載失敗:', errorData);
        throw new Error(errorData.error || '無法獲取 PDF 檔案');
      }

      const blob = await response.blob();
      console.log('PDF Blob 大小:', blob.size, 'bytes');
      console.log('PDF Blob 類型:', blob.type);

      // 創建下載連結
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('========== PDF 下載完成 ==========');
      showToast('PDF 下載成功！', 'success');
    } catch (error: any) {
      console.error('========== PDF 下載錯誤 ==========');
      console.error('錯誤:', error);
      showAlert('錯誤', '無法下載 PDF 檔案，請稍後再試', 'error');
    }
  };

  // 生成 PDF
  const handleGeneratePdf = async (reportId: string) => {
    setGeneratingPdf(true);
    try {
      console.log('========== PDF 生成開始 ==========');
      console.log('報告 ID:', reportId);
      console.log('請求時間:', new Date().toLocaleString('zh-TW'));

      const requestBody = { reportId };
      console.log('請求 Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/report/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API 回應狀態:', response.status);
      console.log('API 回應 Headers:', {
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('========== PDF 生成失敗 ==========');
        console.error('錯誤回應:', errorData);
        throw new Error(errorData.error || 'PDF 生成失敗');
      }

      // 解析 JSON 回應
      const data = await response.json();
      console.log('========== PDF 生成成功 ==========');
      console.log('回應數據:', JSON.stringify(data, null, 2));
      console.log('PDF URL:', data.pdfUrl);
      console.log('檔名:', data.filename);
      console.log('完成時間:', new Date().toLocaleString('zh-TW'));

      // 刷新報告列表
      await fetchReports();

      // 顯示成功訊息
      showToast('PDF 已成功生成並儲存！', 'success');

      // 跳轉到歷史報告頁面
      setActiveTab('history');
    } catch (error: any) {
      console.error('========== PDF 生成錯誤 ==========');
      console.error('錯誤類型:', error.name);
      console.error('錯誤訊息:', error.message);
      console.error('錯誤堆疊:', error.stack);
      showAlert('錯誤', error.message || 'PDF 生成失敗，請稍後再試', 'error');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <DashboardLayout>
      {/* AI 生成遮罩 - 專業酷炫版 */}
      {(generating || generatingPdf) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
          <style jsx>{`
            @keyframes matrix-rain {
              0% { transform: translateY(-100%); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(100vh); opacity: 0; }
            }
            @keyframes glow-pulse {
              0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.3); }
              50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(147, 51, 234, 0.6); }
            }
            @keyframes scan-line {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
            @keyframes orbit {
              0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
              100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
            }
            .matrix-rain {
              animation: matrix-rain 3s linear infinite;
            }
            .glow-pulse {
              animation: glow-pulse 2s ease-in-out infinite;
            }
            .scan-line {
              animation: scan-line 2s linear infinite;
            }
            .orbit {
              animation: orbit 4s linear infinite;
            }
          `}</style>

          {/* 背景矩陣雨效果 */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="matrix-rain absolute text-cyan-400 text-xs font-mono"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {Array(20).fill('01').map((v, j) => (
                  <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="relative">
            {/* 外圈光環 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 rounded-full border-2 border-cyan-500 opacity-20 animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full border-2 border-purple-500 opacity-30 animate-ping" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
            </div>

            {/* 主卡片 */}
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-12 rounded-3xl shadow-2xl text-center max-w-xl border border-cyan-500/30 glow-pulse overflow-hidden">
              {/* 掃描線效果 */}
              <div className="scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

              {/* 六邊形旋轉動畫 */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                {/* 外層六邊形 */}
                <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100">
                  <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="url(#grad1)" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* 中層旋轉圈 */}
                <div className="absolute inset-4 border-4 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-8 border-4 border-transparent border-b-blue-400 border-l-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

                {/* 中心脈動核心 */}
                <div className="absolute inset-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full animate-pulse flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z"/>
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
                  </svg>
                </div>

                {/* 環繞粒子 */}
                {[0, 1, 2].map((i) => (
                  <div key={i} className="orbit absolute w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" style={{ animationDelay: `${i * 1.33}s` }}></div>
                ))}
              </div>

              {/* 霓虹標題 */}
              <h3 className="text-4xl font-bold mb-4 relative">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  正在透過AI分析您的碳排放數據
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent blur-lg opacity-50 animate-pulse">
                  正在透過AI分析您的碳排放數據
                </div>
              </h3>

              {/* 狀態描述 */}
              <div className="mb-8 space-y-2">
                <p className="text-cyan-100 text-lg font-medium">
                  {generatingPdf ? '🤖 正在生成 PDF 報告...' : '📊 正在分析碳排放數據...'}
                </p>
                <p className="text-blue-200/70 text-sm">
                  {generatingPdf ? '正在調用 AI 模型進行深度分析...' : '正在處理數據並建立報告...'}
                </p>
              </div>

              {/* 動態進度指示器 */}
              <div className="mb-6">
                <div className="flex justify-center items-center gap-3 mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-pulse"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1s',
                        height: `${20 + Math.sin(i) * 12}px`
                      }}
                    ></div>
                  ))}
                </div>

                {/* 進度條 */}
                <div className="relative w-full h-2 bg-gray-700/50 rounded-full overflow-hidden border border-cyan-500/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse" style={{ width: '75%' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>

              
            </div>

            {/* 環繞粒子效果 */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + Math.random()}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 對話框組件 */}
      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      <Toast
        isOpen={toastState.isOpen}
        onClose={closeToast}
        message={toastState.message}
        type={toastState.type}
      />

      <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">永續報告書生成</h1>
        <p className="text-gray-600 mt-2">自動化生成符合國際標準的永續發展報告書</p>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickActionCard
          title="AI一鍵生成"
          description="使用上個月數據自動生成永續報告書"
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
            <ReportHistoryPanel
              reports={generatedReports}
              onRefresh={fetchReports}
              onGeneratePdf={handleGeneratePdf}
              onDownloadPdf={handleDownloadPdf}
            />
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

// 快速操作卡片
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple';
  onClick: () => void;
  disabled?: boolean;
}

function QuickActionCard({ title, description, icon, color, onClick, disabled = false }: QuickActionCardProps) {
  const colorClasses: Record<'blue' | 'green' | 'purple', string> = {
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
function ReportHistoryPanel({
  reports,
  onRefresh,
  onGeneratePdf,
  onDownloadPdf
}: {
  reports: GeneratedReport[],
  onRefresh: () => Promise<void>,
  onGeneratePdf: (reportId: string) => Promise<void>,
  onDownloadPdf: (pdfUrl: string, reportTitle: string) => Promise<void>
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reportToDelete, setReportToDelete] = useState<GeneratedReport | null>(null);

  // 對話框管理
  const { confirmState, showConfirm, closeConfirm } = useConfirmDialog();
  const { toastState, showToast, closeToast } = useToast();

  const handleDelete = async (report: GeneratedReport) => {
    setReportToDelete(report);
    showConfirm(
      '確認刪除',
      `確定要刪除報告「${report.title}」嗎？此操作無法復原。`,
      () => performDelete(report),
      'error'
    );
  };

  const performDelete = async (report: GeneratedReport) => {
    setDeleting(report.id);
    try {
      const response = await fetch(`/api/report/${report.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // 刷新報告列表
      await onRefresh();
      showToast('報告已成功刪除', 'success');
    } catch (error) {
      console.error('Failed to delete report:', error);
      showToast('刪除報告失敗，請稍後再試', 'error');
    } finally {
      setDeleting(null);
      setReportToDelete(null);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">尚無已生成的報告</p>
      </div>
    );
  }

  return (
    <>
      {/* 對話框組件 */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
      <Toast
        isOpen={toastState.isOpen}
        onClose={closeToast}
        message={toastState.message}
        type={toastState.type}
      />

      <div className="space-y-4">
        {reports.map((report) => (
        <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative">
          {/* 刪除按鈕 - 右上角 */}
          <button
            onClick={() => handleDelete(report)}
            disabled={deleting === report.id}
            className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="刪除報告"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between pr-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <StatusBadge status={report.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {report.period}
                </span>
                <span>生成於: {new Date(report.createdAt).toLocaleString('zh-TW')}</span>
              </div>

              {/* 下載按鈕 */}
              <div className="flex gap-2">
                {report.pdfUrl ? (
                  <button
                    onClick={() => onDownloadPdf(report.pdfUrl!, report.title)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下載 PDF
                  </button>
                ) : (
                  <button
                    onClick={() => onGeneratePdf(report.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    生成 PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </>
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
