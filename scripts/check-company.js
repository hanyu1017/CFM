const { PrismaClient } = require('@prisma/client');

async function checkCompany() {
  const prisma = new PrismaClient();

  try {
    console.log('檢查公司記錄...');
    const companies = await prisma.company.findMany();
    console.log('找到的公司數量:', companies.length);
    companies.forEach(c => {
      console.log('公司 ID:', c.id, '名稱:', c.name);
    });

    const defaultCompany = await prisma.company.findUnique({
      where: { id: 'default' }
    });

    if (defaultCompany) {
      console.log('\n找到 default 公司:', defaultCompany);
    } else {
      console.log('\n未找到 id="default" 的公司記錄');
    }
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompany();
