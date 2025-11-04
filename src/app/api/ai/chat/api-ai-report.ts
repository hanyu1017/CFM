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
      response: '抱歉，我暫時無法回應。請稍後再試。如果問題持續，請檢查 API 配置。',
      success: false,
    });
  }
}

// src/app/api/report/generate-quick/route.ts
export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json();
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // 獲取指定月份的碳排放數據
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    // 計算總排放量
    const totalEmissions = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);
    const avgScope1 = carbonData.reduce((sum, item) => sum + item.scope1, 0) / carbonData.length;
    const avgScope2 = carbonData.reduce((sum, item) => sum + item.scope2, 0) / carbonData.length;
    const avgScope3 = carbonData.reduce((sum, item) => sum + item.scope3, 0) / carbonData.length;

    // 創建報告記錄
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: 'default',
        title: `${year}年${month}月永續報告書`,
        reportPeriod: `${year}-${String(month).padStart(2, '0')}`,
        startDate,
        endDate,
        status: 'DRAFT',
        executiveSummary: `本月總碳排放量為 ${totalEmissions.toFixed(2)} tCO2e。`,
        carbonFootprint: {
          totalEmissions,
          scope1: avgScope1,
          scope2: avgScope2,
          scope3: avgScope3,
        },
        generatedBy: 'AUTO',
      }
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
      },
      success: true,
    });
  } catch (error) {
    console.error('Quick report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', success: false },
      { status: 500 }
    );
  }
}

// src/app/api/report/generate/route.ts
export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // 創建自定義報告
    const report = await prisma.sustainabilityReport.create({
      data: {
        companyId: 'default',
        title: config.title,
        reportPeriod: config.period,
        startDate: new Date(config.startDate),
        endDate: new Date(config.endDate),
        status: 'DRAFT',
        executiveSummary: config.includeExecutiveSummary ? '報告摘要...' : null,
        generatedBy: 'MANUAL',
      }
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        period: report.reportPeriod,
        status: report.status,
        createdAt: report.createdAt,
      },
      success: true,
    });
  } catch (error) {
    console.error('Generate report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', success: false },
      { status: 500 }
    );
  }
}
