// src/app/api/carbon/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const carbonData = await prisma.carbonEmission.findMany({
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        scope1: true,
        scope2: true,
        scope3: true,
        totalCarbon: true,
      }
    });

    const formattedData = carbonData.map(item => ({
      date: item.date.toISOString().slice(0, 7),
      scope1: item.scope1,
      scope2: item.scope2,
      scope3: item.scope3,
      total: item.totalCarbon,
    }));

    const currentMonth = carbonData[carbonData.length - 1];
    const previousMonth = carbonData[carbonData.length - 2];
    
    const metrics = {
      currentEmission: currentMonth?.totalCarbon || 0,
      todayReduction: previousMonth 
        ? previousMonth.totalCarbon - currentMonth.totalCarbon
        : 0,
      monthlyTarget: 5000,
      efficiency: 87.5,
    };

    return NextResponse.json({
      carbonData: formattedData,
      metrics,
      success: true,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', success: false },
      { status: 500 }
    );
  }
}