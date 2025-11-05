// src/app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 嘗試執行簡單的查詢來測試連線
    await prisma.$queryRaw`SELECT 1`;

    // 獲取資料庫統計（使用安全的方式）
    const stats: Record<string, number> = {};

    try {
      stats.companies = await prisma.company.count();
    } catch (e) {
      stats.companies = 0;
    }

    try {
      stats.carbonData = await prisma.carbonEmission.count();
    } catch (e) {
      stats.carbonData = 0;
    }

    return NextResponse.json({
      status: 'connected',
      message: '資料庫連線正常',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'disconnected',
        message: '資料庫連線失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
