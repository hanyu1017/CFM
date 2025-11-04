// src/app/api/model/save-params/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();

    // 儲存參數到資料庫
    const savedParams = await prisma.modelParameter.create({
      data: {
        companyId: 'default', // 實際應用中應從 session 獲取
        ...params,
        isActive: true,
      },
    });

    return NextResponse.json({
      id: savedParams.id,
      success: true,
    });
  } catch (error) {
    console.error('Save params API error:', error);
    return NextResponse.json(
      { error: 'Failed to save parameters', success: false },
      { status: 500 }
    );
  }
}
