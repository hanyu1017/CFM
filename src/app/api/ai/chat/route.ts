// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `你是一個專業的永續發展和碳排放管理助手。`;

    // 將系統提示添加到消息數組的開頭
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: allMessages,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      response: assistantMessage,
      success: true,
    });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json({
      response: '抱歉，我暫時無法回應。',
      success: false,
    });
  }
}