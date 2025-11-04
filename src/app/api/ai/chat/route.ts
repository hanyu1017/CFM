// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // 構建系統提示
    const systemPrompt = `你是一個專業的永續發展和碳排放管理助手。你的職責是：
1. 幫助用戶理解碳排放數據和趨勢
2. 提供減排建議和最佳實踐
3. 回答有關永續發展的問題
4. 協助解讀決策模型結果
5. 提供法規遵循指導

請以專業、友善的態度回答，並盡可能提供具體、可行的建議。`;

    // 調用 Claude API
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
    
    // 返回備用回應
    return NextResponse.json({
      response: '抱歉，我暫時無法回應。請稍後再試。',
      success: false,
    });
  }
}
