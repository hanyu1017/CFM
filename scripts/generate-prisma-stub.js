// 创建一个基本的 Prisma 客户端 stub 用于构建
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');

// 创建一个增强的 PrismaClient mock，包含測試數據
const mockClient = `"use strict";

// Mock 數據存儲
let mockReports = [];
let mockCompany = {
  id: 'company-mock-001',
  name: '永續環保科技公司',
  industry: '製造業',
  address: '台北市信義區信義路五段7號',
  contactEmail: 'contact@example.com',
  contactPhone: '02-1234-5678',
  registrationNum: '12345678',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// 生成模擬的碳排放數據（過去365天）
function generateMockCarbonData() {
  const data = [];
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 生成隨機但合理的碳排放數據
    const baseEmission = 50 + Math.random() * 50;
    const scope1 = baseEmission * (0.3 + Math.random() * 0.1);
    const scope2 = baseEmission * (0.5 + Math.random() * 0.1);
    const scope3 = baseEmission * (0.2 + Math.random() * 0.1);

    data.push({
      id: 'emission-mock-' + i,
      companyId: mockCompany.id,
      date: date,
      scope1: parseFloat(scope1.toFixed(2)),
      scope2: parseFloat(scope2.toFixed(2)),
      scope3: parseFloat(scope3.toFixed(2)),
      totalCarbon: parseFloat((scope1 + scope2 + scope3).toFixed(2)),
      electricity: parseFloat((5000 + Math.random() * 2000).toFixed(2)),
      naturalGas: parseFloat((800 + Math.random() * 400).toFixed(2)),
      fuel: parseFloat((300 + Math.random() * 200).toFixed(2)),
      transport: parseFloat((500 + Math.random() * 300).toFixed(2)),
      waste: parseFloat((150 + Math.random() * 100).toFixed(2)),
      water: parseFloat((200 + Math.random() * 150).toFixed(2)),
      dataSource: 'Mock Data',
      verified: true,
      notes: '模擬測試數據',
      createdAt: date,
      updatedAt: date,
    });
  }

  return data;
}

const mockCarbonData = generateMockCarbonData();

class PrismaClient {
  constructor() {
    console.log('🔧 Using enhanced mock PrismaClient with test data');
    console.log('📊 Mock data: ' + mockCarbonData.length + ' carbon emission records');
    console.log('🏢 Mock company: ' + mockCompany.name);

    this.carbonEmission = {
      findMany: async (options) => {
        let results = [...mockCarbonData];

        // 處理 where 條件
        if (options && options.where) {
          if (options.where.companyId) {
            results = results.filter(d => d.companyId === options.where.companyId);
          }
          if (options.where.date) {
            if (options.where.date.gte) {
              results = results.filter(d => d.date >= new Date(options.where.date.gte));
            }
            if (options.where.date.lte) {
              results = results.filter(d => d.date <= new Date(options.where.date.lte));
            }
          }
        }

        // 處理 orderBy
        if (options && options.orderBy) {
          if (options.orderBy.date === 'asc') {
            results.sort((a, b) => a.date - b.date);
          } else if (options.orderBy.date === 'desc') {
            results.sort((a, b) => b.date - a.date);
          }
        }

        return results;
      },
      findFirst: async (options) => {
        const results = await this.carbonEmission.findMany(options);
        return results.length > 0 ? results[0] : null;
      },
      create: async (data) => {
        const newRecord = {
          id: 'emission-mock-' + Date.now(),
          ...data.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockCarbonData.push(newRecord);
        return newRecord;
      },
      update: async (data) => ({ id: data.where.id, ...data.data }),
      delete: async (data) => ({ id: data.where.id }),
      count: async () => mockCarbonData.length,
      aggregate: async () => ({ _sum: { totalCarbon: mockCarbonData.reduce((s, d) => s + d.totalCarbon, 0) } }),
    };

    this.sustainabilityReport = {
      findMany: async (options) => {
        let results = [...mockReports];

        if (options && options.where && options.where.companyId) {
          results = results.filter(r => r.companyId === options.where.companyId);
        }

        if (options && options.orderBy) {
          if (options.orderBy.createdAt === 'desc') {
            results.sort((a, b) => b.createdAt - a.createdAt);
          }
        }

        return results;
      },
      findFirst: async (options) => {
        const results = await this.sustainabilityReport.findMany(options);
        return results.length > 0 ? results[0] : null;
      },
      findUnique: async (options) => {
        return mockReports.find(r => r.id === options.where.id) || null;
      },
      create: async (options) => {
        const newReport = {
          id: 'report-mock-' + Date.now(),
          ...options.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockReports.push(newReport);
        console.log('✅ Mock report created:', newReport.title);
        return newReport;
      },
      update: async (options) => {
        const index = mockReports.findIndex(r => r.id === options.where.id);
        if (index >= 0) {
          mockReports[index] = { ...mockReports[index], ...options.data };
          return mockReports[index];
        }
        return { id: options.where.id, ...options.data };
      },
      delete: async (options) => {
        const index = mockReports.findIndex(r => r.id === options.where.id);
        if (index >= 0) {
          const deleted = mockReports[index];
          mockReports.splice(index, 1);
          return deleted;
        }
        return { id: options.where.id };
      },
    };

    this.company = {
      findFirst: async () => mockCompany,
      findMany: async () => [mockCompany],
      findUnique: async (options) => {
        return options.where.id === mockCompany.id ? mockCompany : null;
      },
      create: async (data) => {
        mockCompany = { id: 'company-mock-' + Date.now(), ...data.data };
        return mockCompany;
      },
      update: async (options) => {
        mockCompany = { ...mockCompany, ...options.data };
        return mockCompany;
      },
    };

    this.emissionTarget = {
      findMany: async () => [],
      create: async (data) => ({ id: 'target-mock-' + Date.now(), ...data.data }),
      update: async (data) => ({ id: data.where.id, ...data.data }),
      delete: async (data) => ({ id: data.where.id }),
    };

    this.companySetting = {
      findMany: async () => [],
      findFirst: async () => null,
      update: async (data) => ({ id: data.where.id, ...data.data }),
      upsert: async (data) => data.create,
    };
  }

  $connect() {
    console.log('🔌 Mock Prisma Client connected');
    return Promise.resolve();
  }

  $disconnect() {
    console.log('🔌 Mock Prisma Client disconnected');
    return Promise.resolve();
  }

  $queryRaw() {
    console.warn('⚠️  $queryRaw is not supported in mock mode');
    return Promise.resolve([]);
  }

  $executeRaw() {
    console.warn('⚠️  $executeRaw is not supported in mock mode');
    return Promise.resolve(0);
  }
}

const Prisma = {
  PrismaClient,
};

module.exports = { PrismaClient, Prisma };
`;

// 写入 mock 客户端
fs.writeFileSync(path.join(prismaClientPath, 'index.js'), mockClient);
fs.writeFileSync(path.join(prismaClientPath, 'default.js'), mockClient);

console.log('✓ Generated Prisma client stub for build');
