// src/app/api/settings/company/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 取得公司資料
export async function GET() {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      // 如果沒有公司資料，返回空的預設資料
      return NextResponse.json({
        name: '',
        industry: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        registrationNum: '',
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: '取得公司資料失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - 新增或更新公司資料
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry, address, contactEmail, contactPhone, registrationNum } = body;

    // 檢查是否已有公司資料
    const existingCompany = await prisma.company.findFirst();

    let company;
    if (existingCompany) {
      // 更新現有公司資料
      company = await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          name,
          industry,
          address,
          contactEmail,
          contactPhone,
          registrationNum,
        },
      });
    } else {
      // 建立新公司資料
      company = await prisma.company.create({
        data: {
          name,
          industry,
          address,
          contactEmail,
          contactPhone,
          registrationNum,
        },
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Save company error:', error);
    return NextResponse.json(
      { error: '儲存公司資料失敗' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
