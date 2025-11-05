// src/app/api/model/save-params/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();

    // 獲取或創建默認公司
    let company = await prisma.company.findFirst();

    if (!company) {
      // 如果沒有公司記錄，創建一個默認公司
      company = await prisma.company.create({
        data: {
          id: 'default',
          name: '預設公司',
          industry: '未設定',
        }
      });
    }

    const savedParams = await prisma.modelParameter.create({
      data: {
        companyId: company.id,
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