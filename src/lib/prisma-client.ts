// Prisma Client wrapper for build-time compatibility
// In production, this will use the actual generated Prisma client
// For development builds without generated client, this provides type stubs

let PrismaClientModule: any;

try {
  // Try to import the actual Prisma client
  PrismaClientModule = require('@prisma/client');
} catch (error) {
  // If import fails, we're in a build environment without generated client
  // This is handled by the stub types below
  console.warn('Prisma client not generated. Using type stubs for build.');
}

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

// Export PrismaClient from the actual module if available
export const PrismaClient = PrismaClientModule?.PrismaClient;
export const Prisma = PrismaClientModule?.Prisma;
