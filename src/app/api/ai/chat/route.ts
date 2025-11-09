// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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
    });

    console.log('📨 [API] Webhook 回應狀態:', webhookResponse.status, webhookResponse.statusText);
    console.log('📋 [API] Webhook 回應 headers:', Object.fromEntries(webhookResponse.headers.entries()));

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ [API] Webhook 錯誤回應內容:', errorText);
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const responseData = await webhookResponse.json();
    console.log('📥 [API] Webhook 完整響應資料:', JSON.stringify(responseData, null, 2));
    console.log('🔍 [API] 響應資料類型:', typeof responseData);
    console.log('🔍 [API] 響應資料鍵值:', Object.keys(responseData));

    // 檢查回傳的資料結構並提取 AI 回應
    const aiResponse = responseData.response || responseData.answer || responseData;

    console.log('🤖 [API] 提取的 AI 回應內容:', aiResponse);
    console.log('🤖 [API] AI 回應類型:', typeof aiResponse);

    const finalResponse = {
      response: aiResponse,
      success: true,
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