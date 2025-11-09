// src/app/api/webhook/carbon-query/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔵 [Webhook] Carbon Query 端點收到請求');

  try {
    const body = await request.json();
    console.log('📦 [Webhook] 請求 body:', JSON.stringify(body, null, 2));

    // 提取 n8n webhook 發送的數據
    const {
      query,
      user_id,
      username,
      chat_id,
      timestamp,
    } = body;

    console.log('📨 [Webhook] Carbon Query 接收到請求:', {
      query,
      user_id,
      username,
      chat_id,
      timestamp,
    });

    // 這裡可以添加你的業務邏輯
    // 例如：記錄查詢、觸發其他處理流程等

    // 如果需要將數據發送到外部 n8n webhook
    const n8nWebhookUrl = process.env.N8N_CARBON_QUERY_WEBHOOK_URL;
    console.log('🔍 [Webhook] N8N URL 配置:', n8nWebhookUrl ? '已設置' : '未設置');

    if (n8nWebhookUrl) {
      try {
        console.log('📤 [Webhook] 準備發送到 N8N:', n8nWebhookUrl);

        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            user_id,
            username,
            chat_id,
            timestamp: timestamp || new Date().toISOString(),
          }),
        });

        console.log('📥 [Webhook] N8N 響應狀態:', webhookResponse.status, webhookResponse.statusText);

        const webhookData = await webhookResponse.json();
        console.log('✅ [Webhook] N8N 回應數據:', webhookData);

        // 返回 n8n 的回應給前端
        return NextResponse.json({
          success: true,
          message: 'Query processed successfully',
          data: webhookData,
        });
      } catch (webhookError) {
        console.error('❌ [Webhook] N8N Webhook 錯誤 - 詳細信息:');
        console.error('錯誤類型:', webhookError instanceof Error ? webhookError.constructor.name : typeof webhookError);
        console.error('錯誤消息:', webhookError instanceof Error ? webhookError.message : webhookError);
        console.error('完整錯誤:', webhookError);

        // 即使 webhook 失敗，也返回成功響應
        return NextResponse.json({
          success: true,
          message: 'Query received but webhook failed',
          error: webhookError instanceof Error ? webhookError.message : 'Unknown error',
        });
      }
    }

    // 如果沒有配置 webhook URL，直接返回成功
    console.log('ℹ️ [Webhook] 沒有配置 N8N URL，直接返回成功');
    return NextResponse.json({
      success: true,
      message: 'Query received (no N8N webhook configured)',
      data: {
        query,
        user_id,
        username,
        chat_id,
        timestamp,
      },
    });

  } catch (error) {
    console.error('❌ [Webhook] Carbon Query 錯誤 - 詳細信息:');
    console.error('錯誤類型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('錯誤消息:', error instanceof Error ? error.message : error);
    console.error('完整錯誤:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// 支援 GET 請求用於測試
export async function GET() {
  return NextResponse.json({
    message: 'Carbon Query Webhook endpoint is active',
    method: 'POST',
    expectedFields: ['query', 'user_id', 'username', 'chat_id', 'timestamp'],
  });
}
