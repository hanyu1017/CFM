// src/app/api/webhook/carbon-query/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 提取 n8n webhook 發送的數據
    const {
      query,
      user_id,
      username,
      chat_id,
      timestamp,
    } = body;

    console.log('📨 Carbon Query Webhook 接收到請求:', {
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

    if (n8nWebhookUrl) {
      try {
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

        const webhookData = await webhookResponse.json();
        console.log('✅ N8N Webhook 回應:', webhookData);

        // 返回 n8n 的回應給前端
        return NextResponse.json({
          success: true,
          message: 'Query processed successfully',
          data: webhookData,
        });
      } catch (webhookError) {
        console.error('❌ N8N Webhook 錯誤:', webhookError);

        // 即使 webhook 失敗，也返回成功響應
        return NextResponse.json({
          success: true,
          message: 'Query received but webhook failed',
          error: webhookError instanceof Error ? webhookError.message : 'Unknown error',
        });
      }
    }

    // 如果沒有配置 webhook URL，直接返回成功
    return NextResponse.json({
      success: true,
      message: 'Query received',
      data: {
        query,
        user_id,
        username,
        chat_id,
        timestamp,
      },
    });

  } catch (error) {
    console.error('❌ Carbon Query Webhook 錯誤:', error);

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
