// Prisma Client stub for build-time type checking
// The actual Prisma client will be generated in production with `prisma generate`

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
  scope1: number;
  scope2: number;
  scope3: number;
  totalCarbon: number;
  electricity: number;
  naturalGas: number;
  fuel: number;
  transport: number;
  waste: number;
  water: number;
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
  company: {
    findFirst: (args?: any) => Promise<Company | null>;
    findMany: (args?: any) => Promise<Company[]>;
    create: (args: any) => Promise<Company>;
    update: (args: any) => Promise<Company>;
    delete: (args: any) => Promise<Company>;
  };

  carbonEmission: {
    findFirst: (args?: any) => Promise<CarbonEmission | null>;
    findMany: (args?: any) => Promise<CarbonEmission[]>;
    create: (args: any) => Promise<CarbonEmission>;
    createMany: (args: any) => Promise<{ count: number }>;
    update: (args: any) => Promise<CarbonEmission>;
    delete: (args: any) => Promise<CarbonEmission>;
    deleteMany: (args?: any) => Promise<{ count: number }>;
  };

  sustainabilityReport: {
    findFirst: (args?: any) => Promise<SustainabilityReport | null>;
    findMany: (args?: any) => Promise<SustainabilityReport[]>;
    create: (args: any) => Promise<SustainabilityReport>;
    update: (args: any) => Promise<SustainabilityReport>;
    delete: (args: any) => Promise<SustainabilityReport>;
  };

  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $executeRaw: (query: any, ...values: any[]) => Promise<any>;
  $queryRaw: (query: any, ...values: any[]) => Promise<any>;

  constructor() {
    throw new Error('@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.');
  }
}

export namespace Prisma {
  export type TransactionClient = any;
}
