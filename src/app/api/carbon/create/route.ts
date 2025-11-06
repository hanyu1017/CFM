// src/app/api/carbon/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 獲取或創建默認公司
    let company = await prisma.company.findFirst();

    if (!company) {
      company = await prisma.company.create({
        data: {
          id: 'default',
          name: '預設公司',
          industry: '未設定',
        }
      });
    }

    const data = await prisma.carbonEmission.create({
      data: {
        companyId: company.id,
        date: new Date(body.date),
        scope1: parseFloat(body.scope1) || 0,
        scope2: parseFloat(body.scope2) || 0,
        scope3: parseFloat(body.scope3) || 0,
        totalCarbon: parseFloat(body.totalCarbon) || 0,
        electricity: parseFloat(body.electricity) || 0,
        naturalGas: parseFloat(body.naturalGas) || 0,
        fuel: parseFloat(body.fuel) || 0,
        transport: parseFloat(body.transport) || 0,
        waste: parseFloat(body.waste) || 0,
        water: parseFloat(body.water) || 0,
        dataSource: body.dataSource || '手動輸入',
        verified: body.verified || false,
        notes: body.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: '碳排放數據已成功新增',
      data,
    });
  } catch (error) {
    console.error('Create carbon data error:', error);
    return NextResponse.json(
      { error: '新增碳排放數據失敗', success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
