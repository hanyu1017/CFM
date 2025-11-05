// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `你是一個專業的永續發展和碳排放管理助手。
你可以協助用戶：
1. 解答碳排放相關問題
2. 提供減排建議和策略
3. 解釋永續發展指標
4. 分析碳排放數據
5. 介紹環境法規和標準

請提供專業、準確且實用的建議。`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0]?.message?.content || '抱歉，我無法生成回應。';

    return NextResponse.json({
      response: assistantMessage,
      success: true,
    });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json({
      response: '抱歉，AI 服務暫時無法使用。請確認 OPENAI_API_KEY 已正確配置。',
      success: false,
    }, { status: 500 });
  }
}