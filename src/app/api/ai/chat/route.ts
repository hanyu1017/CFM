// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `你是一個專業的永續發展和碳排放管理助手。`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

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