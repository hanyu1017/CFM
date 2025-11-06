'use client';

import { useState, useEffect } from 'react';

export default function TestPDFPage() {
  const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // 載入報告列表
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch('/api/report/list');
      const data = await response.json();
      console.log('可用的報告:', data);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('載入報告列表失敗:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // 頁面載入時自動獲取報告列表
  useEffect(() => {
    loadReports();
  }, []);

  const testPDFGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('開始測試 PDF 生成，報告 ID:', reportId);

      // 調用 PDF 生成 API
      const response = await fetch('/api/report/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });

      console.log('API 回應狀態:', response.status);
      console.log('API 回應 headers:', Object.fromEntries(response.headers.entries()));

      if (response.headers.get('content-type')?.includes('application/pdf')) {
        // 成功生成 PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        setResult({
          success: true,
          message: 'PDF 生成成功！',
          pdfUrl: url,
          blobSize: blob.size,
        });

        console.log('PDF Blob 大小:', blob.size);
      } else {
        // 可能是錯誤訊息
        const text = await response.text();
        console.log('API 回應內容:', text);

        try {
          const json = JSON.parse(text);
          setResult(json);
        } catch {
          setResult({ rawResponse: text });
        }
      }
    } catch (err: any) {
      console.error('測試失敗:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('測試 Webhook...');

      const webhookUrl = 'https://primary-production-94491.up.railway.app/webhook/27370e56-64bd-4b60-aa48-d128d3db7049';
      const webhookPayload = {
        start_date: '2024-10-01',
        end_date: '2024-10-31',
        event: 'test',
        type: 'manual_test',
        report: {
          id: 'test-123',
          title: '測試報告',
          totalEmissions: '100.50',
          dataCount: 10,
        },
        company: {
          id: 'test-company',
          name: '測試公司',
        },
        timestamp: new Date().toISOString(),
      };

      console.log('發送 Webhook 請求:', webhookPayload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      console.log('Webhook 回應狀態:', response.status);

      const responseText = await response.text();
      console.log('Webhook 原始回應:', responseText);

      // 檢查編碼
      console.log('回應文字長度:', responseText.length);
      console.log('前 100 個字符:', responseText.substring(0, 100));

      try {
        const json = JSON.parse(responseText);
        console.log('Webhook 解析後的 JSON:', json);
        setResult({
          success: true,
          webhookData: json,
          rawResponse: responseText,
          encoding: {
            textLength: responseText.length,
            firstChars: responseText.substring(0, 100),
          },
        });
      } catch (parseError: any) {
        console.error('JSON 解析失敗:', parseError);
        setResult({
          success: false,
          error: 'JSON 解析失敗',
          rawResponse: responseText,
        });
      }
    } catch (err: any) {
      console.error('Webhook 測試失敗:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        📋 PDF 生成測試頁面
      </h1>

      {/* Webhook 測試區 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #0ea5e9'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
          🔗 測試 Webhook
        </h2>
        <p style={{ marginBottom: '15px', color: '#64748b' }}>
          先測試 Webhook 是否正常返回中文數據
        </p>
        <button
          onClick={testWebhook}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#94a3b8' : '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '測試中...' : '測試 Webhook'}
        </button>
      </div>

      {/* 可用報告列表 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fefce8',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #eab308'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            📋 可用的報告列表
          </h2>
          <button
            onClick={loadReports}
            disabled={loadingReports}
            style={{
              padding: '8px 16px',
              backgroundColor: loadingReports ? '#94a3b8' : '#eab308',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loadingReports ? 'not-allowed' : 'pointer',
            }}
          >
            {loadingReports ? '載入中...' : '🔄 重新載入'}
          </button>
        </div>

        {reports.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>
            {loadingReports ? '載入中...' : '沒有找到報告，請先生成一個報告'}
          </p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {reports.map((report, index) => (
              <div
                key={report.id}
                onClick={() => setReportId(report.id)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: reportId === report.id ? '#fef08a' : '#ffffff',
                  border: reportId === report.id ? '2px solid #eab308' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (reportId !== report.id) {
                    e.currentTarget.style.backgroundColor = '#fefce8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (reportId !== report.id) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {report.title}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  ID: {report.id} | 期間: {report.reportPeriod} | 狀態: {report.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF 生成測試區 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #10b981'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
          📄 測試 PDF 生成
        </h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            報告 ID:
          </label>
          <input
            type="text"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="輸入報告 ID 或從上面列表點選"
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '16px',
            }}
          />
          {reportId && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#059669' }}>
              ✓ 已選擇報告 ID: {reportId}
            </p>
          )}
        </div>
        <button
          onClick={testPDFGeneration}
          disabled={loading || !reportId}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || !reportId ? '#94a3b8' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading || !reportId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '生成中...' : '生成 PDF'}
        </button>
      </div>

      {/* 錯誤顯示 */}
      {error && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626', marginBottom: '10px' }}>
            ❌ 錯誤
          </h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px' }}>
            {error}
          </pre>
        </div>
      )}

      {/* 結果顯示 */}
      {result && (
        <div style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            📊 測試結果
          </h3>

          {/* PDF 預覽 */}
          {result.pdfUrl && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                PDF 預覽：
              </h4>
              <a
                href={result.pdfUrl}
                download={`report_${reportId}.pdf`}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  marginRight: '10px',
                }}
              >
                📥 下載 PDF
              </a>
              <a
                href={result.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
              >
                🔍 在新標籤中查看
              </a>
            </div>
          )}

          {/* JSON 顯示 */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
              完整數據（JSON）：
            </h4>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '13px',
              lineHeight: '1.6',
              maxHeight: '500px',
              overflow: 'auto',
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {/* 原始回應 */}
          {result.rawResponse && (
            <div style={{
              backgroundColor: '#fffbeb',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #fbbf24',
              marginTop: '15px',
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                原始回應文字：
              </h4>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '13px',
                lineHeight: '1.6',
                maxHeight: '300px',
                overflow: 'auto',
              }}>
                {result.rawResponse}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 使用說明 */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '2px solid #f59e0b',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          💡 使用說明
        </h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>先點擊「測試 Webhook」查看返回的中文數據是否正確</li>
          <li>檢查瀏覽器控制台（F12）的詳細日誌</li>
          <li>輸入一個有效的報告 ID 來測試 PDF 生成</li>
          <li>下載 PDF 並檢查中文顯示是否正常</li>
          <li>查看此頁面顯示的所有數據和編碼信息</li>
        </ol>
      </div>
    </div>
  );
}
