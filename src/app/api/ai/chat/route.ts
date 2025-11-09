// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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

    console.log('📝 [API] 消息數量:', messages.length);

    // 檢查 API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ [API] OPENAI_API_KEY 未設置');
      return NextResponse.json({
        response: '系統配置錯誤：缺少 OpenAI API 密鑰',
        success: false,
      }, { status: 500 });
    }
    console.log('✅ [API] OPENAI_API_KEY 已設置');

    const systemPrompt = `你是一個專業的永續發展和碳排放管理助手。你可以幫助用戶查詢碳排放數據、分析趨勢、提供減排建議，並回答關於永續發展的問題。`;

    // 轉換消息格式，將 system prompt 作為第一條消息
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    console.log('🤖 [API] 準備調用 OpenAI API');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    console.log('✅ [API] OpenAI API 響應:', {
      id: response.id,
      model: response.model,
      choices: response.choices.length,
      finishReason: response.choices[0]?.finish_reason,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    console.log('💬 [API] 助手回應長度:', assistantMessage.length);

    return NextResponse.json({
      response: assistantMessage,
      success: true,
    });
  } catch (error) {
    console.error('❌ [API] AI Chat 錯誤 - 詳細信息:');
    console.error('錯誤類型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('錯誤消息:', error instanceof Error ? error.message : error);
    console.error('完整錯誤:', error);

    if (error instanceof Error && 'status' in error) {
      console.error('HTTP 狀態:', (error as any).status);
    }

    return NextResponse.json({
      response: '抱歉，我暫時無法回應。請檢查控制台以獲取詳細錯誤信息。',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}