// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

// 設置代理（如果環境變數中有的話）
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
if (proxyUrl) {
  const proxyAgent = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(proxyAgent);
  console.log('✅ [API] 使用代理:', proxyUrl.replace(/:.*@/, ':***@')); // 隱藏密碼
}

const WEBHOOK_URL = 'https://primary-production-94491.up.railway.app/webhook/carbon-query';

export async function POST(request: NextRequest) {
  console.log('🔵 [API] AI Chat 端點收到請求');

  try {
    const body = await request.json();
    console.log('📦 [API] 請求 body:', JSON.stringify(body, null, 2));

    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ [API] 無效的消息格式:', messages);
      return NextResponse.json({
        response: '無效的請求格式',
        success: false,
      }, { status: 400 });
    }

    // 取得使用者最後一條訊息
    const userMessage = messages[messages.length - 1].content;

    // 準備 webhook payload
    const webhookPayload = {
      query: userMessage,
      user_id: uuidv4(),
      username: 'Test',
      chat_id: uuidv4(),
      timestamp: new Date().toISOString()
    };

    console.log('📤 [API] 發送查詢到 webhook:', webhookPayload);

    // 發送請求到 webhook
    console.log('🌐 [API] 開始發送 POST 請求到 webhook URL:', WEBHOOK_URL);

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(60000), // 60秒超時
    });

    console.log('📨 [API] Webhook 回應狀態:', webhookResponse.status, webhookResponse.statusText);
    console.log('📋 [API] Webhook 回應 headers:', Object.fromEntries(webhookResponse.headers.entries()));

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ [API] Webhook 錯誤回應內容:', errorText);
      console.error('❌ [API] Webhook URL:', WEBHOOK_URL);
      console.error('❌ [API] Webhook Payload:', JSON.stringify(webhookPayload, null, 2));

      // 返回詳細錯誤給前端
      return NextResponse.json({
        response: `Webhook 錯誤 (${webhookResponse.status}): ${errorText}`,
        success: false,
        error: errorText,
        debug: {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          url: WEBHOOK_URL,
          payload: webhookPayload
        }
      }, { status: 200 }); // 返回 200 讓前端可以正常處理
    }

    const responseData = await webhookResponse.json();
    console.log('📥 [API] Webhook 完整響應資料:', JSON.stringify(responseData, null, 2));
    console.log('🔍 [API] 響應資料類型:', typeof responseData);
    console.log('🔍 [API] 響應資料鍵值:', Object.keys(responseData));

    // 按照 Telegram bot 的邏輯處理回應
    // 檢查 webhook 是否返回 success 標記
    const webhookSuccess = responseData.success !== undefined ? responseData.success : true;

    console.log('🔍 [API] Webhook success 標記:', webhookSuccess);

    if (!webhookSuccess) {
      // Webhook 返回失敗
      const errorMessage = responseData.error || responseData.message || '查詢失敗';
      console.error('❌ [API] Webhook 返回失敗:', errorMessage);

      return NextResponse.json({
        response: errorMessage,
        success: false,
        error: errorMessage,
      }, { status: 200 }); // 返回 200 但 success: false
    }

    // 提取 AI 回應內容 (按照 Telegram bot 的邏輯)
    let aiResponse = responseData.response || responseData.answer || '';

    console.log('🤖 [API] 提取的 response 字段:', aiResponse);
    console.log('🤖 [API] response 類型:', typeof aiResponse);

    // 如果 response 是物件，轉換為字串
    if (typeof aiResponse === 'object' && aiResponse !== null) {
      console.log('⚠️ [API] response 是物件，嘗試提取文字內容');
      aiResponse = JSON.stringify(aiResponse, null, 2);
    }

    // 如果沒有 response，嘗試使用整個 responseData
    if (!aiResponse || aiResponse.trim() === '') {
      console.log('⚠️ [API] 沒有找到 response 字段，使用整個響應資料');
      // 排除一些元數據字段
      const { success, timestamp, ...contentData } = responseData;
      aiResponse = JSON.stringify(contentData, null, 2);
    }

    // 構建額外的資料摘要（如果有 data 字段）
    const data = responseData.data;
    if (data && typeof data === 'object') {
      console.log('📊 [API] 找到額外的 data 字段:', data);
      let dataSummary = '\n\n📊 數據摘要\n';

      if (data.total_emissions) {
        dataSummary += `• 總排放量: ${data.total_emissions.toLocaleString()} 噸CO₂e\n`;
      }
      if (data.record_count) {
        dataSummary += `• 記錄數量: ${data.record_count} 筆\n`;
      }
      if (data.date_range) {
        dataSummary += `• 時間範圍: ${data.date_range}\n`;
      }

      // 如果有數據摘要，附加到回應中
      if (dataSummary !== '\n\n📊 數據摘要\n') {
        aiResponse += dataSummary;
      }
    }

    // 添加建議（如果有）
    if (responseData.suggestions) {
      console.log('💡 [API] 找到建議:', responseData.suggestions);
      aiResponse += `\n\n💡 建議\n${responseData.suggestions}`;
    }

    console.log('🤖 [API] 最終 AI 回應內容:', aiResponse);

    const finalResponse = {
      response: aiResponse,
      success: true,
      data: responseData.data, // 保留原始 data 供前端使用
    };

    console.log('📤 [API] 準備返回給前端的資料:', JSON.stringify(finalResponse, null, 2));

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('❌ [API] AI Chat 錯誤 - 詳細信息:');
    console.error('錯誤類型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('錯誤消息:', error instanceof Error ? error.message : error);
    console.error('完整錯誤:', error);

    return NextResponse.json({
      response: '抱歉，我暫時無法回應。請檢查控制台以獲取詳細錯誤信息。',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}