// Custom Prisma client module for build compatibility
// This re-exports from the generated client or provides stubs

export type ReportStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  registrationNum?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarbonEmission {
  id: string;
  companyId: string;
  date: Date;
  scope1: any;
  scope2: any;
  scope3: any;
  totalCarbon: any;
  electricity: any;
  naturalGas: any;
  fuel: any;
  transport: any;
  waste: any;
  water: any;
  dataSource?: string | null;
  verified: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SustainabilityReport {
  id: string;
  companyId: string;
  title: string;
  reportPeriod: string;
  startDate: Date;
  endDate: Date;
  status: ReportStatus;
  executiveSummary?: string | null;
  carbonFootprint?: string | null;
  emissionsSummary?: string | null;
  reductionTargets?: string | null;
  initiatives?: string | null;
  compliance?: string | null;
  financialImpact?: string | null;
  stakeholders?: string | null;
  htmlContent?: string | null;
  totalEmissions?: number | null;
  pdfUrl?: string | null;
  docxUrl?: string | null;
  generatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

export class PrismaClient {
  declare company: {
    findFirst: (args?: any) => Promise<Company | null>;
    findMany: (args?: any) => Promise<Company[]>;
    create: (args: any) => Promise<Company>;
    update: (args: any) => Promise<Company>;
    delete: (args: any) => Promise<Company>;
    aggregate: (args: any) => Promise<any>;
    count: (args?: any) => Promise<number>;
    findUnique: (args: any) => Promise<Company | null>;
    upsert: (args: any) => Promise<Company>;
    updateMany: (args: any) => Promise<{ count: number }>;
    deleteMany: (args?: any) => Promise<{ count: number }>;
    createMany: (args: any) => Promise<{ count: number }>;
  };

  declare carbonEmission: {
    findFirst: (args?: any) => Promise<CarbonEmission | null>;
    findMany: (args?: any) => Promise<CarbonEmission[]>;
    create: (args: any) => Promise<CarbonEmission>;
    createMany: (args: any) => Promise<{ count: number }>;
    update: (args: any) => Promise<CarbonEmission>;
    delete: (args: any) => Promise<CarbonEmission>;
    deleteMany: (args?: any) => Promise<{ count: number }>;
    aggregate: (args: any) => Promise<any>;
    count: (args?: any) => Promise<number>;
    findUnique: (args: any) => Promise<CarbonEmission | null>;
    upsert: (args: any) => Promise<CarbonEmission>;
    updateMany: (args: any) => Promise<{ count: number }>;
  };

  declare sustainabilityReport: {
    findFirst: (args?: any) => Promise<SustainabilityReport | null>;
    findMany: (args?: any) => Promise<SustainabilityReport[]>;
    create: (args: any) => Promise<SustainabilityReport>;
    update: (args: any) => Promise<SustainabilityReport>;
    delete: (args: any) => Promise<SustainabilityReport>;
    aggregate: (args: any) => Promise<any>;
    count: (args?: any) => Promise<number>;
    findUnique: (args: any) => Promise<SustainabilityReport | null>;
    upsert: (args: any) => Promise<SustainabilityReport>;
    updateMany: (args: any) => Promise<{ count: number }>;
    deleteMany: (args?: any) => Promise<{ count: number }>;
    createMany: (args: any) => Promise<{ count: number }>;
  };

  declare $connect: () => Promise<void>;
  declare $disconnect: () => Promise<void>;
  declare $executeRaw: (query: any, ...values: any[]) => Promise<any>;
  declare $queryRaw: (query: any, ...values: any[]) => Promise<any>;

  constructor() {
    // This will be replaced at runtime with actual Prisma client
    try {
      const { PrismaClient: ActualPrismaClient } = require('.prisma/client');
      return new ActualPrismaClient() as any;
    } catch (e) {
      throw new Error('@prisma/client did not initialize yet. Please run "prisma generate"');
    }
  }
}

export namespace Prisma {
  export type TransactionClient = any;
}
