// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, Target, Settings as SettingsIcon } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface CompanyData {
  id?: string;
  name: string;
  industry: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  registrationNum: string;
}

interface EmissionTarget {
  id?: string;
  targetYear: number;
  targetType: string;
  baselineYear: number;
  baselineValue: number;
  targetValue: number;
  description: string;
  status: string;
}

interface Setting {
  id?: string;
  category: string;
  key: string;
  value: string;
  label: string;
  description: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'targets' | 'settings'>('company');
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    industry: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    registrationNum: '',
  });
  const [targets, setTargets] = useState<EmissionTarget[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'company') {
        const response = await fetch('/api/settings/company');
        if (!response.ok) {
          throw new Error('無法取得公司資料');
        }
        const data = await response.json();
        if (data) {
          setCompanyData(data);
        }
      } else if (activeTab === 'targets') {
        const response = await fetch('/api/settings/targets');
        if (!response.ok) {
          throw new Error('無法取得減排目標資料');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setTargets(data);
        }
      } else {
        const response = await fetch('/api/settings/config');
        if (!response.ok) {
          throw new Error('無法取得系統配置資料');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('載入資料失敗:', error);
      alert(`載入資料時發生錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
        <p className="text-gray-600 mt-2">管理公司資料、減排目標與系統配置</p>
      </div>

      {/* 分頁導航 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <TabButton
            active={activeTab === 'company'}
            onClick={() => setActiveTab('company')}
            icon={<Building2 className="w-5 h-5" />}
            label="公司資料"
          />
          <TabButton
            active={activeTab === 'targets'}
            onClick={() => setActiveTab('targets')}
            icon={<Target className="w-5 h-5" />}
            label="減排目標"
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<SettingsIcon className="w-5 h-5" />}
            label="系統配置"
          />
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activeTab === 'company' && (
                <CompanyPanel
                  data={companyData}
                  onChange={setCompanyData}
                  onSave={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/settings/company', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(companyData),
                      });

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || '儲存失敗');
                      }

                      const savedData = await response.json();
                      setCompanyData(savedData);
                      alert('✓ 公司資料已成功儲存！');
                    } catch (error) {
                      console.error('儲存公司資料失敗:', error);
                      alert(`儲存失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              )}

              {activeTab === 'targets' && (
                <TargetsPanel
                  targets={targets}
                  loading={loading}
                  onAdd={async (target: EmissionTarget) => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/settings/targets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(target),
                      });

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || '新增失敗');
                      }

                      const data = await response.json();
                      setTargets([...targets, data]);
                      alert('✓ 減排目標已成功新增！');
                      return true; // 表示成功
                    } catch (error) {
                      console.error('新增減排目標失敗:', error);
                      alert(`新增失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
                      return false; // 表示失敗
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onUpdate={async (id: string, target: EmissionTarget) => {
                    setLoading(true);
                    try {
                      const response = await fetch(`/api/settings/targets/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(target),
                      });

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || '更新失敗');
                      }

                      const updatedData = await response.json();
                      setTargets(targets.map(t => t.id === id ? updatedData : t));
                      alert('✓ 減排目標已成功更新！');
                      return true;
                    } catch (error) {
                      console.error('更新減排目標失敗:', error);
                      alert(`更新失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
                      return false;
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onDelete={async (id: string) => {
                    if (!confirm('確定要刪除此減排目標嗎？此操作無法復原。')) {
                      return false;
                    }

                    setLoading(true);
                    try {
                      const response = await fetch(`/api/settings/targets/${id}`, {
                        method: 'DELETE',
                      });

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || '刪除失敗');
                      }

                      setTargets(targets.filter(t => t.id !== id));
                      alert('✓ 減排目標已成功刪除！');
                      return true;
                    } catch (error) {
                      console.error('刪除減排目標失敗:', error);
                      alert(`刪除失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
                      return false;
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPanel
                  settings={settings}
                  loading={loading}
                  onUpdate={async (id: string, setting: Setting) => {
                    setLoading(true);
                    try {
                      const response = await fetch(`/api/settings/config/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(setting),
                      });

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || '更新失敗');
                      }

                      const updatedData = await response.json();
                      setSettings(settings.map(s => s.id === id ? updatedData : s));
                      alert('✓ 系統配置已成功更新！');
                      return true;
                    } catch (error) {
                      console.error('更新系統配置失敗:', error);
                      alert(`更新失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
                      return false;
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

// 分頁按鈕
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// 公司資料面板
interface CompanyPanelProps {
  data: CompanyData;
  onChange: (data: CompanyData) => void;
  onSave: () => void;
}

function CompanyPanel({ data, onChange, onSave }: CompanyPanelProps) {
  const handleChange = (key: keyof CompanyData, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="公司名稱"
          value={data.name}
          onChange={(v: string) => handleChange('name', v)}
          placeholder="輸入公司名稱"
        />
        <FormField
          label="產業類別"
          value={data.industry}
          onChange={(v: string) => handleChange('industry', v)}
          placeholder="例如：製造業、科技業"
        />
        <FormField
          label="公司地址"
          value={data.address}
          onChange={(v: string) => handleChange('address', v)}
          placeholder="輸入完整地址"
          fullWidth
        />
        <FormField
          label="聯絡信箱"
          value={data.contactEmail}
          onChange={(v: string) => handleChange('contactEmail', v)}
          type="email"
          placeholder="email@example.com"
        />
        <FormField
          label="聯絡電話"
          value={data.contactPhone}
          onChange={(v: string) => handleChange('contactPhone', v)}
          type="tel"
          placeholder="(02) 1234-5678"
        />
        <FormField
          label="統一編號"
          value={data.registrationNum}
          onChange={(v: string) => handleChange('registrationNum', v)}
          placeholder="8位數統編"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          儲存設定
        </button>
      </div>
    </div>
  );
}

// 減排目標面板
function TargetsPanel({ targets, loading, onAdd, onUpdate, onDelete }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmissionTarget>({
    targetYear: new Date().getFullYear() + 5,
    targetType: 'REDUCTION',
    baselineYear: new Date().getFullYear(),
    baselineValue: 0,
    targetValue: 0,
    description: '',
    status: 'ACTIVE',
  });

  const handleSubmit = async () => {
    if (editingId) {
      const success = await onUpdate(editingId, formData);
      if (success) {
        setEditingId(null);
        resetForm();
      }
    } else {
      const success = await onAdd(formData);
      if (success) {
        setIsAdding(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      targetYear: new Date().getFullYear() + 5,
      targetType: 'REDUCTION',
      baselineYear: new Date().getFullYear(),
      baselineValue: 0,
      targetValue: 0,
      description: '',
      status: 'ACTIVE',
    });
  };

  return (
    <div className="space-y-6">
      {/* 新增按鈕 */}
      {!isAdding && !editingId && (
        <button
          onClick={() => setIsAdding(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          新增減排目標
        </button>
      )}

      {/* 新增/編輯表單 */}
      {(isAdding || editingId) && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? '編輯減排目標' : '新增減排目標'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              label="目標年度"
              type="number"
              value={formData.targetYear}
              onChange={(v: string) => setFormData({ ...formData, targetYear: parseInt(v) })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目標類型
              </label>
              <select
                value={formData.targetType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, targetType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="NET_ZERO">淨零排放</option>
                <option value="REDUCTION">絕對減量</option>
                <option value="INTENSITY">強度減量</option>
              </select>
            </div>
            <FormField
              label="基準年度"
              type="number"
              value={formData.baselineYear}
              onChange={(v: string) => setFormData({ ...formData, baselineYear: parseInt(v) })}
            />
            <FormField
              label="基準值 (tCO2e)"
              type="number"
              value={formData.baselineValue}
              onChange={(v: string) => setFormData({ ...formData, baselineValue: parseFloat(v) })}
            />
            <FormField
              label="目標值 (tCO2e)"
              type="number"
              value={formData.targetValue}
              onChange={(v: string) => setFormData({ ...formData, targetValue: parseFloat(v) })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                狀態
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">進行中</option>
                <option value="ACHIEVED">已達成</option>
                <option value="DELAYED">延遲</option>
                <option value="CANCELLED">已取消</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? '儲存中...' : '儲存'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 目標列表 */}
      <div className="space-y-4">
        {targets.map((target: EmissionTarget) => (
          <div key={target.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    {target.targetYear} - {target.targetType === 'NET_ZERO' ? '淨零排放' : target.targetType === 'REDUCTION' ? '絕對減量' : '強度減量'}
                  </h3>
                  <StatusBadge status={target.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">基準年度</p>
                    <p className="font-semibold">{target.baselineYear}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">基準值</p>
                    <p className="font-semibold">{target.baselineValue} tCO2e</p>
                  </div>
                  <div>
                    <p className="text-gray-600">目標值</p>
                    <p className="font-semibold">{target.targetValue} tCO2e</p>
                  </div>
                  <div>
                    <p className="text-gray-600">減量比例</p>
                    <p className="font-semibold text-green-600">
                      {((1 - target.targetValue / target.baselineValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                {target.description && (
                  <p className="text-sm text-gray-600 mt-2">{target.description}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingId(target.id!);
                    setFormData(target);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(target.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 系統配置面板
function SettingsPanel({ settings, loading, onUpdate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const categories = ['報告設定', '通知設定', '數據同步', 'API配置'];

  const handleEdit = (setting: Setting) => {
    setEditingId(setting.id!);
    setEditValue(setting.value);
  };

  const handleSave = async (setting: Setting) => {
    const success = await onUpdate(setting.id, { ...setting, value: editValue });
    if (success) {
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categorySettings = settings.filter((s: Setting) => s.category === category);
        if (categorySettings.length === 0) return null;

        return (
          <div key={category} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{category}</h3>
            <div className="space-y-4">
              {categorySettings.map((setting: Setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {setting.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingId === setting.id ? editValue : setting.value}
                      onChange={(e) => {
                        if (editingId === setting.id) {
                          setEditValue(e.target.value);
                        } else {
                          handleEdit(setting);
                          setEditValue(e.target.value);
                        }
                      }}
                      disabled={loading}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {editingId === setting.id && (
                      <>
                        <button
                          onClick={() => handleSave(setting)}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {loading ? '儲存中...' : '儲存'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={loading}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          取消
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 表單欄位元件
function FormField({ label, value, onChange, type = 'text', placeholder = '', fullWidth = false }: any) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

// 狀態標籤
function StatusBadge({ status }: { status: string }) {
  const statusConfig: any = {
    ACTIVE: { label: '進行中', color: 'bg-blue-100 text-blue-800' },
    ACHIEVED: { label: '已達成', color: 'bg-green-100 text-green-800' },
    DELAYED: { label: '延遲', color: 'bg-yellow-100 text-yellow-800' },
    CANCELLED: { label: '已取消', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// 載入動畫
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
