// src/app/api/model/save-params/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();

    const savedParams = await prisma.modelParameter.create({
      data: {
        companyId: 'default',
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