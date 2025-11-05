// 创建一个基本的 Prisma 客户端 stub 用于构建
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');

// 创建一个简单的 PrismaClient mock
const mockClient = `"use strict";

class PrismaClient {
  constructor() {
    console.warn('Using mock PrismaClient - database operations will not work');
    this.carbonEmission = {
      findMany: async () => [],
      create: async (data) => ({ id: 'mock-id', ...data.data }),
      update: async (data) => ({ id: data.where.id, ...data.data }),
      delete: async (data) => ({ id: data.where.id }),
    };
    this.sustainabilityReport = {
      findMany: async () => [],
      create: async (data) => ({ id: 'mock-id', ...data.data, createdAt: new Date() }),
      update: async (data) => ({ id: data.where.id, ...data.data }),
      delete: async (data) => ({ id: data.where.id }),
    };
    this.company = {
      findFirst: async () => null,
      create: async (data) => ({ id: 'mock-id', ...data.data }),
      update: async (data) => ({ id: data.where.id, ...data.data }),
    };
    this.emissionTarget = {
      findMany: async () => [],
      create: async (data) => ({ id: 'mock-id', ...data.data }),
      update: async (data) => ({ id: data.where.id, ...data.data }),
      delete: async (data) => ({ id: data.where.id }),
    };
    this.setting = {
      findMany: async () => [],
      update: async (data) => ({ id: data.where.id, ...data.data }),
    };
  }
  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
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
