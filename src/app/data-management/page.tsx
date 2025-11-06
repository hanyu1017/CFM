// src/app/data-management/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, Edit2, Trash2, Search, Sparkles, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmDialog, AlertDialog, Toast } from '@/components/ui/Dialog';
import { useConfirmDialog, useAlertDialog, useToast } from '@/hooks/useDialog';

interface CarbonData {
  id: string;
  date: string;
  scope1: number;
  scope2: number;
  scope3: number;
  totalCarbon: number;
  electricity: number;
  naturalGas: number;
  fuel: number;
  transport: number;
  waste: number;
  water: number;
  dataSource?: string;
  verified: boolean;
  notes?: string;
}

export default function DataManagementPage() {
  const [data, setData] = useState<CarbonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });

  // 查詢參數
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 編輯狀態
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CarbonData>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<Partial<CarbonData>>({
    date: new Date().toISOString().split('T')[0],
    scope1: 0,
    scope2: 0,
    scope3: 0,
    totalCarbon: 0,
    electricity: 0,
    naturalGas: 0,
    fuel: 0,
    transport: 0,
    waste: 0,
    water: 0,
    dataSource: '手動輸入',
    verified: false,
  });

  // 對話框狀態
  const { confirmState, showConfirm, closeConfirm } = useConfirmDialog();
  const { alertState, showAlert, closeAlert } = useAlertDialog();
  const { toastState, showToast, closeToast } = useToast();

  // 獲取數據列表
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/api/carbon/list?limit=50';
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');

      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showAlert('錯誤', '獲取數據失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 查詢功能
  const handleSearch = () => {
    fetchData();
  };

  // 重置查詢
  const handleResetSearch = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchData(), 0);
  };

  // 自動生成數據
  const handleGenerateDaily = async () => {
    showConfirm(
      '確認生成數據',
      '系統將自動生成從最新記錄到今天的每日碳排放數據，確定要繼續嗎？',
      async () => {
        setGenerating(true);
        try {
          const response = await fetch('/api/carbon/generate-daily', {
            method: 'POST',
          });

          if (!response.ok) throw new Error('Failed to generate data');

          const result = await response.json();

          // 模擬進度條效果
          setGeneratingProgress({ current: 0, total: result.totalDays });
          for (let i = 0; i <= result.totalDays; i++) {
            await new Promise(resolve => setTimeout(resolve, 30));
            setGeneratingProgress({ current: i, total: result.totalDays });
          }

          showToast(result.message || `成功生成 ${result.generated} 筆數據`, 'success');
          fetchData();
        } catch (error) {
          console.error('Failed to generate data:', error);
          showAlert('錯誤', '生成數據失敗', 'error');
        } finally {
          setGenerating(false);
          setGeneratingProgress({ current: 0, total: 0 });
        }
      }
    );
  };

  // 新增數據
  const handleAdd = async () => {
    try {
      const response = await fetch('/api/carbon/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      if (!response.ok) throw new Error('Failed to create data');

      showToast('數據已成功新增', 'success');
      setShowAddModal(false);
      setAddForm({
        date: new Date().toISOString().split('T')[0],
        scope1: 0,
        scope2: 0,
        scope3: 0,
        totalCarbon: 0,
        electricity: 0,
        naturalGas: 0,
        fuel: 0,
        transport: 0,
        waste: 0,
        water: 0,
        dataSource: '手動輸入',
        verified: false,
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create data:', error);
      showAlert('錯誤', '新增數據失敗', 'error');
    }
  };

  // 開始編輯
  const handleStartEdit = (item: CarbonData) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // 保存編輯
  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/carbon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update data');

      showToast('數據已成功更新', 'success');
      setEditingId(null);
      setEditForm({});
      fetchData();
    } catch (error) {
      console.error('Failed to update data:', error);
      showAlert('錯誤', '更新數據失敗', 'error');
    }
  };

  // 刪除數據
  const handleDelete = (id: string) => {
    showConfirm(
      '確認刪除',
      '確定要刪除這筆碳排放數據嗎？此操作無法復原。',
      async () => {
        try {
          const response = await fetch(`/api/carbon/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete data');

          showToast('數據已成功刪除', 'success');
          fetchData();
        } catch (error) {
          console.error('Failed to delete data:', error);
          showAlert('錯誤', '刪除數據失敗', 'error');
        }
      },
      'error'
    );
  };

  return (
    <DashboardLayout>
      {/* 對話框組件 */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
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

      {/* 新增數據模態框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">新增碳排放數據</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <AddEditForm data={addForm} onChange={setAddForm} />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 p-6">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8" />
            資料管理
          </h1>
          <p className="text-gray-600 mt-2">管理和查看碳排放數據</p>
        </div>

        {/* 功能按鈕區 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新增數據
            </button>
            <button
              onClick={handleGenerateDaily}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? '生成中...' : '自動生成每日數據'}
            </button>
          </div>

          {/* 生成進度條 */}
          {generating && generatingProgress.total > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  生成進度: {generatingProgress.current} / {generatingProgress.total}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round((generatingProgress.current / generatingProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(generatingProgress.current / generatingProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 查詢區 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">日期查詢</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              查詢
            </button>
            <button
              onClick={handleResetSearch}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
          </div>
        </div>

        {/* 數據表格 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總碳排放</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope 1</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope 2</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope 3</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電力</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">天然氣</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">數據來源</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      載入中...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      無數據
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {editingId === item.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={editForm.date?.split('T')[0] || ''}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.totalCarbon || 0}
                              onChange={(e) => setEditForm({ ...editForm, totalCarbon: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.scope1 || 0}
                              onChange={(e) => setEditForm({ ...editForm, scope1: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.scope2 || 0}
                              onChange={(e) => setEditForm({ ...editForm, scope2: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.scope3 || 0}
                              onChange={(e) => setEditForm({ ...editForm, scope3: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.electricity || 0}
                              onChange={(e) => setEditForm({ ...editForm, electricity: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.naturalGas || 0}
                              onChange={(e) => setEditForm({ ...editForm, naturalGas: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editForm.dataSource || ''}
                              onChange={(e) => setEditForm({ ...editForm, dataSource: e.target.value })}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                保存
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                取消
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.totalCarbon.toFixed(2)} tCO2e
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.scope1.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.scope2.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.scope3.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.electricity.toFixed(2)} kWh</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.naturalGas.toFixed(2)} m³</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.dataSource || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="text-blue-600 hover:text-blue-800"
                                title="編輯"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
                                title="刪除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 顯示記錄總數 */}
        {!loading && data.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            顯示 {data.length} 筆記錄
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// 新增/編輯表單組件
function AddEditForm({ data, onChange }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
        <input
          type="date"
          value={data.date?.split('T')[0] || ''}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">總碳排放 (tCO2e)</label>
        <input
          type="number"
          step="0.01"
          value={data.totalCarbon || 0}
          onChange={(e) => onChange({ ...data, totalCarbon: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scope 1 (tCO2e)</label>
        <input
          type="number"
          step="0.01"
          value={data.scope1 || 0}
          onChange={(e) => onChange({ ...data, scope1: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scope 2 (tCO2e)</label>
        <input
          type="number"
          step="0.01"
          value={data.scope2 || 0}
          onChange={(e) => onChange({ ...data, scope2: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scope 3 (tCO2e)</label>
        <input
          type="number"
          step="0.01"
          value={data.scope3 || 0}
          onChange={(e) => onChange({ ...data, scope3: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">電力 (kWh)</label>
        <input
          type="number"
          step="0.01"
          value={data.electricity || 0}
          onChange={(e) => onChange({ ...data, electricity: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">天然氣 (m³)</label>
        <input
          type="number"
          step="0.01"
          value={data.naturalGas || 0}
          onChange={(e) => onChange({ ...data, naturalGas: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">燃料 (L)</label>
        <input
          type="number"
          step="0.01"
          value={data.fuel || 0}
          onChange={(e) => onChange({ ...data, fuel: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">運輸 (km)</label>
        <input
          type="number"
          step="0.01"
          value={data.transport || 0}
          onChange={(e) => onChange({ ...data, transport: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">廢棄物 (kg)</label>
        <input
          type="number"
          step="0.01"
          value={data.waste || 0}
          onChange={(e) => onChange({ ...data, waste: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">用水 (m³)</label>
        <input
          type="number"
          step="0.01"
          value={data.water || 0}
          onChange={(e) => onChange({ ...data, water: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">數據來源</label>
        <input
          type="text"
          value={data.dataSource || ''}
          onChange={(e) => onChange({ ...data, dataSource: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
