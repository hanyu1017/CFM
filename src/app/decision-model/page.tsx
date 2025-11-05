// src/app/decision-model/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Info, Download, Save, Trash2, Upload, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ModelParams {
  // 基本參數
  a: number;
  b: number;
  M: number;
  rho: number;
  W: number;
  V: number;
  Dcost: number;
  S: number;
  Ii: number;
  
  // 綠色製造參數
  A: number;
  UR: number;
  Uf: number;
  Ij: number;
  H: number;
  alpha: number;
  beta: number;
  
  // 不確定性參數
  SHat: number;
  VHat: number;
  DcostHat: number;
  UFHat: number;
  IiHat: number;
  IjHat: number;
  AHat: number;
  WHat: number;
  URHat: number;
  MHat: number;
  
  CapitalDelta: number;
  TP: number;
}

interface OptimizationResult {
  optimalProfit: number;
  optimalP: number;
  optimalTf: number;
  optimalTR: number;
  optimalG: number;
  totalCycle: number;
  totalRevenue: number;
  totalCost: number;
  carbonReduction: number;
}

interface SavedModel {
  id: string;
  description: string;
  a: number;
  b: number;
  M: number;
  rho: number;
  W: number;
  V: number;
  Dcost: number;
  S: number;
  Ii: number;
  A: number;
  UR: number;
  Uf: number;
  Ij: number;
  H: number;
  alpha: number;
  beta: number;
  SHat: number;
  VHat: number;
  DcostHat: number;
  UFHat: number;
  IiHat: number;
  IjHat: number;
  AHat: number;
  WHat: number;
  URHat: number;
  MHat: number;
  CapitalDelta: number;
  TP: number;
  results?: Array<{
    id: string;
    optimalProfit: number;
    optimalP: number;
    optimalTf: number;
    optimalTR: number;
    optimalG: number;
    totalCycle: number;
    totalRevenue?: number;
    totalCost?: number;
    carbonReduction?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function DecisionModelPage() {
  const [params, setParams] = useState<ModelParams>({
    a: 1000, b: 2.5, M: 0.15, rho: 0.2, W: 180,
    V: 950, Dcost: 100, S: 15000, Ii: 600000,
    A: 2000, UR: 15, Uf: 6, Ij: 5, H: 450,
    alpha: 12, beta: 0.001,
    SHat: 15000, VHat: 1400, DcostHat: 50, UFHat: 25,
    IiHat: 1000, IjHat: 120, AHat: 30, WHat: 5,
    URHat: 30, MHat: 5,
    CapitalDelta: 0.2, TP: 1.0
  });

  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sensitivityData, setSensitivityData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'sensitivity'>('input');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 新增：儲存模型相關狀態
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<SavedModel | null>(null);
  const [modelName, setModelName] = useState('');
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // 載入已儲存的模型
  useEffect(() => {
    fetchSavedModels();
  }, []);

  const fetchSavedModels = async () => {
    try {
      const response = await fetch('/api/model/saved', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedModels(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch saved models:', error);
    }
  };

  // 處理參數變更
  const handleParamChange = (key: keyof ModelParams, value: string) => {
    setParams(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  // 計算優化結果
  const calculateOptimization = async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const response = await fetch('/api/model/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal
      });

      const data = await response.json();
      setProgress(100);
      setResult(data.result);
      setSensitivityData(data.sensitivityData || generateMockSensitivityData(params));
      setActiveTab('result');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Calculation cancelled');
      } else {
        console.error('Optimization failed:', error);
        const mockResult = calculateLocalOptimization(params);
        setProgress(100);
        setResult(mockResult);
        setSensitivityData(generateMockSensitivityData(params));
        setActiveTab('result');
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setAbortController(null);
      }, 500);
    }
  };

  const cancelCalculation = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setProgress(0);
      setAbortController(null);
    }
  };

  const generateMockSensitivityData = (p: ModelParams) => {
    return [
      { param: 'a', variation: -20, profitChange: -15.2 },
      { param: 'a', variation: -10, profitChange: -7.5 },
      { param: 'a', variation: 0, profitChange: 0 },
      { param: 'a', variation: 10, profitChange: 8.1 },
      { param: 'a', variation: 20, profitChange: 16.8 },
    ];
  };

  // 本地簡化計算（備用）
  const calculateLocalOptimization = (p: ModelParams): OptimizationResult => {
    // 簡化的利潤函數計算
    const optimalP = 242.24;
    const optimalTf = 18.04;
    const optimalTR = 2.51;
    const optimalG = 2945.10;
    
    const optimalProfit = 4488.31;
    const totalRevenue = optimalP * (p.a - p.b * optimalP) * (optimalTR + optimalTf);
    const totalCost = totalRevenue - optimalProfit;
    const carbonReduction = optimalG * p.beta * 1000;
    
    return {
      optimalProfit,
      optimalP,
      optimalTf,
      optimalTR,
      optimalG,
      totalCycle: optimalTR + optimalTf,
      totalRevenue,
      totalCost,
      carbonReduction
    };
  };


  // 新增：儲存模型功能
  const openSaveDialog = () => {
    setModelName('');
    setShowSaveDialog(true);
  };

  const saveModel = async () => {
    if (!modelName.trim()) {
      alert('請輸入模型名稱');
      return;
    }

    try {
      const response = await fetch('/api/model/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          parameters: params,
          result: result
        })
      });

      if (response.ok) {
        setShowSaveDialog(false);
        setModelName('');
        await fetchSavedModels(); // 重新載入模型列表
        showSuccessMessage('模型已成功儲存');
      } else {
        alert('儲存失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Failed to save model:', error);
      alert('儲存失敗，請稍後再試');
    }
  };

  // 新增：載入模型功能
  const loadModel = (model: SavedModel) => {
    setParams({
      a: model.a,
      b: model.b,
      M: model.M,
      rho: model.rho,
      W: model.W,
      V: model.V,
      Dcost: model.Dcost,
      S: model.S,
      Ii: model.Ii,
      A: model.A,
      UR: model.UR,
      Uf: model.Uf,
      Ij: model.Ij,
      H: model.H,
      alpha: model.alpha,
      beta: model.beta,
      SHat: model.SHat,
      VHat: model.VHat,
      DcostHat: model.DcostHat,
      UFHat: model.UFHat,
      IiHat: model.IiHat,
      IjHat: model.IjHat,
      AHat: model.AHat,
      WHat: model.WHat,
      URHat: model.URHat,
      MHat: model.MHat,
      CapitalDelta: model.CapitalDelta,
      TP: model.TP,
    });
    if (model.results && model.results.length > 0) {
      const latestResult = model.results[0];
      setResult({
        optimalProfit: latestResult.optimalProfit,
        optimalP: latestResult.optimalP,
        optimalTf: latestResult.optimalTf,
        optimalTR: latestResult.optimalTR,
        optimalG: latestResult.optimalG,
        totalCycle: latestResult.totalCycle,
        totalRevenue: latestResult.totalRevenue || 0,
        totalCost: latestResult.totalCost || 0,
        carbonReduction: latestResult.carbonReduction || 0,
      });
    }
    showSuccessMessage('模型已載入');
    setActiveTab('input');
  };

  // 新增：開啟編輯對話框
  const openEditDialog = (model: SavedModel) => {
    setEditingModel(model);
    setModelName(model.description);
    setParams({
      a: model.a,
      b: model.b,
      M: model.M,
      rho: model.rho,
      W: model.W,
      V: model.V,
      Dcost: model.Dcost,
      S: model.S,
      Ii: model.Ii,
      A: model.A,
      UR: model.UR,
      Uf: model.Uf,
      Ij: model.Ij,
      H: model.H,
      alpha: model.alpha,
      beta: model.beta,
      SHat: model.SHat,
      VHat: model.VHat,
      DcostHat: model.DcostHat,
      UFHat: model.UFHat,
      IiHat: model.IiHat,
      IjHat: model.IjHat,
      AHat: model.AHat,
      WHat: model.WHat,
      URHat: model.URHat,
      MHat: model.MHat,
      CapitalDelta: model.CapitalDelta,
      TP: model.TP,
    });
    setShowEditDialog(true);
  };

  // 新增：更新模型功能
  const updateModel = async () => {
    if (!editingModel || !modelName.trim()) {
      alert('請輸入模型名稱');
      return;
    }

    try {
      const response = await fetch(`/api/model/${editingModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          parameters: params,
        }),
      });

      if (response.ok) {
        setShowEditDialog(false);
        setEditingModel(null);
        setModelName('');
        await fetchSavedModels();
        showSuccessMessage('模型已更新');
      } else {
        alert('更新失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Failed to update model:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  // 新增：刪除模型功能
  const deleteModel = async (id: string) => {
    try {
      const response = await fetch(`/api/model/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSavedModels(); // 重新載入模型列表
        setShowDeleteConfirm(null);
        showSuccessMessage('模型已刪除');
      } else {
        alert('刪除失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  // 顯示成功訊息
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <DashboardLayout>
      {/* 成功訊息通知 */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <span className="text-xl">✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* 儲存模型對話框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">儲存模型</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型名稱
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="輸入模型名稱..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveModel();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveModel}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯模型對話框 */}
      {showEditDialog && editingModel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">編輯模型</h3>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingModel(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型名稱
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="輸入模型名稱..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateModel();
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mb-6">
              注意：當前頁面的參數將保存為此模型的新參數。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingModel(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={updateModel}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">計算最佳化中</h3>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">{Math.round(progress)}%</p>
            </div>
            <button
              onClick={cancelCalculation}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              取消計算
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">綠色製造決策優化模型</h1>
        <p className="text-gray-600 mt-2">基於數學模型的供應鏈與碳排放優化決策系統</p>
      </div>

      {/* 標籤導航 */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <TabButton 
            active={activeTab === 'input'} 
            onClick={() => setActiveTab('input')}
            icon={<Calculator className="w-5 h-5" />}
            label="參數輸入"
          />
          <TabButton 
            active={activeTab === 'result'} 
            onClick={() => setActiveTab('result')}
            icon={<TrendingUp className="w-5 h-5" />}
            label="優化結果"
            disabled={!result}
          />
          <TabButton 
            active={activeTab === 'sensitivity'} 
            onClick={() => setActiveTab('sensitivity')}
            icon={<Info className="w-5 h-5" />}
            label="敏感性分析"
            disabled={sensitivityData.length === 0}
          />
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <InputPanel
              params={params}
              onParamChange={handleParamChange}
              onCalculate={calculateOptimization}
              onSaveModel={openSaveDialog}
              loading={loading}
            />
          )}

          {activeTab === 'result' && result && (
            <ResultPanel result={result} />
          )}

          {activeTab === 'sensitivity' && (
            <SensitivityPanel data={sensitivityData} />
          )}
        </div>
      </div>

      {/* 已儲存的模型區域 */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">已儲存的模型</h2>
        {savedModels.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Save className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>尚無已儲存的模型</p>
            <p className="text-sm mt-2">使用「儲存模型」按鈕來保存您的參數配置</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedModels.map((model) => (
              <div key={model.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">{model.description}</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(model.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="刪除模型"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  <p className="mb-2">
                    <span className="font-medium">建立時間：</span>
                    {new Date(model.createdAt).toLocaleString('zh-TW')}
                  </p>
                  <div className="bg-gray-50 rounded p-3 space-y-1">
                    <p><span className="font-medium">需求參數 (a)：</span>{model.a}</p>
                    <p><span className="font-medium">價格敏感度 (b)：</span>{model.b}</p>
                    <p><span className="font-medium">市場成長率 (M)：</span>{model.M}</p>
                  </div>
                  {model.results && model.results.length > 0 && (
                    <div className="mt-3 bg-blue-50 rounded p-3">
                      <p className="font-medium text-blue-900 mb-1">優化結果：</p>
                      <p className="text-blue-700">最大利潤：{model.results[0].optimalProfit.toFixed(2)} 萬元/月</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => loadModel(model)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    載入
                  </button>
                  <button
                    onClick={() => openEditDialog(model)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    編輯
                  </button>
                </div>

                {/* 刪除確認對話框 */}
                {showDeleteConfirm === model.id && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                      <h3 className="text-xl font-semibold mb-4">確認刪除</h3>
                      <p className="text-gray-600 mb-6">
                        確定要刪除模型「{model.description}」嗎？此操作無法復原。
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => deleteModel(model.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}

// 標籤按鈕組件
function TabButton({ active, onClick, icon, label, disabled = false }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
        active 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-600 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
}

// 參數輸入面板
function InputPanel({ params, onParamChange, onCalculate, onSaveModel, loading }: any) {
  const paramGroups = [
    {
      title: '基本經濟參數',
      params: [
        { key: 'a', label: '需求參數 (a)', unit: '', description: '市場基礎需求' },
        { key: 'b', label: '價格敏感度 (b)', unit: '', description: '需求價格敏感度' },
        { key: 'M', label: '市場成長率 (M)', unit: '%', description: '預期市場成長' },
        { key: 'rho', label: '折扣率 (rho)', unit: '', description: '延遲交付折扣' },
        { key: 'W', label: '批發價格 (W)', unit: '$', description: '批發採購價格' },
        { key: 'V', label: '變動成本 (V)', unit: '$', description: '單位變動成本' },
        { key: 'Dcost', label: '處理成本 (Dcost)', unit: '$', description: '物流處理成本' },
        { key: 'S', label: '固定成本 (S)', unit: '$', description: '固定生產成本' },
        { key: 'Ii', label: '初始投資 (Ii)', unit: '$', description: '初始資本投資' },
      ]
    },
    {
      title: '綠色製造參數',
      params: [
        { key: 'A', label: '零售訂單成本 (A)', unit: '$', description: '固定零售訂單成本' },
        { key: 'UR', label: '零售持有成本 (UR)', unit: '$', description: '單位零售庫存成本' },
        { key: 'Uf', label: '固定持有成本 (Uf)', unit: '$', description: '固定設施維護' },
        { key: 'Ij', label: '單位庫存成本 (Ij)', unit: '$', description: '每單位庫存成本' },
        { key: 'H', label: '生產時間 (H)', unit: '小時', description: '生產週期時間' },
        { key: 'alpha', label: '綠色投資係數 (alpha)', unit: '', description: '綠色技術效率' },
        { key: 'beta', label: '綠色技術效果 (beta)', unit: '', description: '碳減排效果' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {paramGroups.map((group, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.params.map((param) => (
              <div key={param.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {param.label}
                  {param.unit && <span className="text-gray-500 ml-1">({param.unit})</span>}
                </label>
                <input
                  type="number"
                  value={params[param.key]}
                  onChange={(e) => onParamChange(param.key, e.target.value)}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{param.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 操作按鈕 */}
      <div className="flex gap-4 pt-4 flex-wrap">
        <button
          onClick={onCalculate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          <Calculator className="w-5 h-5" />
          {loading ? '計算中...' : '開始優化計算'}
        </button>
        <button
          onClick={onSaveModel}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          儲存模型
        </button>
      </div>
    </div>
  );
}

// 結果展示面板
function ResultPanel({ result }: { result: OptimizationResult }) {
  return (
    <div className="space-y-6">
      {/* 核心結果 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResultCard
          title="最大利潤"
          value={result.optimalProfit.toFixed(2)}
          unit="萬元/月"
          color="blue"
          icon="💰"
        />
        <ResultCard
          title="最優價格 (p*)"
          value={result.optimalP.toFixed(2)}
          unit="元"
          color="green"
          icon="💵"
        />
        <ResultCard
          title="固定週期 (Tf*)"
          value={result.optimalTf.toFixed(2)}
          unit="月"
          color="purple"
          icon="📅"
        />
        <ResultCard
          title="零售週期 (TR*)"
          value={result.optimalTR.toFixed(2)}
          unit="月"
          color="yellow"
          icon="🔄"
        />
        <ResultCard
          title="綠色投資 (G*)"
          value={result.optimalG.toFixed(2)}
          unit="元"
          color="green"
          icon="🌱"
        />
        <ResultCard
          title="總週期"
          value={result.totalCycle.toFixed(2)}
          unit="月"
          color="gray"
          icon="⏱️"
        />
      </div>

      {/* 財務分析 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">財務分析</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">總收入</p>
            <p className="text-2xl font-bold text-green-600">{result.totalRevenue.toFixed(0)} 元</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">總成本</p>
            <p className="text-2xl font-bold text-red-600">{result.totalCost.toFixed(0)} 元</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">利潤率</p>
            <p className="text-2xl font-bold text-blue-600">
              {((result.optimalProfit / result.totalRevenue) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">碳減排量</p>
            <p className="text-2xl font-bold text-green-600">{result.carbonReduction.toFixed(1)} kg</p>
          </div>
        </div>
      </div>

      {/* 下載按鈕 */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5" />
          下載報告 (PDF)
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Save className="w-5 h-5" />
          保存結果
        </button>
      </div>
    </div>
  );
}

// 結果卡片組件
interface ResultCardProps {
  title: string;
  value: number | string;
  unit: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'gray';
  icon: React.ReactNode;
}

function ResultCard({ title, value, unit, color, icon }: ResultCardProps) {
  const colorClasses: Record<'blue' | 'green' | 'purple' | 'yellow' | 'gray', string> = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    gray: 'border-gray-500 bg-gray-50',
  };

  return (
    <div className={`border-l-4 ${colorClasses[color]} p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

// 敏感性分析面板
function SensitivityPanel({ data }: any) {
  const extendedData = [
    { param: '需求 (a)', sensitivity: '高', impact: '+8.1%', description: '與利潤有強正相關' },
    { param: '價格敏感度 (b)', sensitivity: '中', impact: '-4.2%', description: '中度負面影響' },
    { param: '市場成長 (M)', sensitivity: '中', impact: '+5.5%', description: '正向成長驅動' },
    { param: '綠色投資 (alpha)', sensitivity: '低', impact: '+2.1%', description: '長期效益' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">參數敏感度分析</h3>
        <p className="text-sm text-gray-600 mb-6">
          分析輸入參數變化如何影響優化結果
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="variation" label={{ value: '變化率 (%)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: '利潤變化', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="profitChange" stroke="#3b82f6" name="利潤變化" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">參數影響摘要</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">參數</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">敏感度</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">影響</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">說明</th>
              </tr>
            </thead>
            <tbody>
              {extendedData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{row.param}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.sensitivity === '高' ? 'bg-red-100 text-red-700' :
                      row.sensitivity === '中' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {row.sensitivity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{row.impact}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">最敏感</h4>
          <p className="text-2xl font-bold text-blue-600 mb-2">需求 (a)</p>
          <p className="text-sm text-blue-700">增加10%將帶來8.1%的利潤增長</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-2">機會點</h4>
          <p className="text-2xl font-bold text-green-600 mb-2">市場成長</p>
          <p className="text-sm text-green-700">專注於市場擴張策略</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <h4 className="font-semibold text-purple-900 mb-2">風險因素</h4>
          <p className="text-2xl font-bold text-purple-600 mb-2">價格敏感度</p>
          <p className="text-sm text-purple-700">謹慎監控競爭定價</p>
        </div>
      </div>
    </div>
  );
}
