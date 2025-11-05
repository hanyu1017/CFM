#!/usr/bin/env node
// Setup script to create Prisma client type stubs for builds without prisma generate
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Prisma client type stubs...');

// Type definitions content
const typeDefinitions = `/* eslint-disable @typescript-eslint/no-unused-vars */

import * as runtime from '@prisma/client/runtime/library'

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

export declare class PrismaClient {
  company: {
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

  carbonEmission: {
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

  sustainabilityReport: {
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

  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $executeRaw: (query: any, ...values: any[]) => Promise<any>;
  $queryRaw: (query: any, ...values: any[]) => Promise<any>;
}

export declare class PrismaClientExtends<
  ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
> {
  $extends: { extArgs: ExtArgs } & (<
    R extends runtime.Types.Extensions.UserArgs['result'] = {},
    M extends runtime.Types.Extensions.UserArgs['model'] = {},
    Q extends runtime.Types.Extensions.UserArgs['query'] = {},
    C extends runtime.Types.Extensions.UserArgs['client'] = {},
    Args extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.InternalArgs<R, M, {}, C>,
  >(
    args:
      | ((client: PrismaClientExtends<ExtArgs>) => { $extends: { extArgs: Args } })
      | { name?: string }
      | { result?: R & runtime.Types.Extensions.UserArgs['result'] }
      | { model?: M & runtime.Types.Extensions.UserArgs['model'] }
      | { query?: Q & runtime.Types.Extensions.UserArgs['query'] }
      | { client?: C & runtime.Types.Extensions.UserArgs['client'] },
  ) => PrismaClientExtends<Args & ExtArgs> & Args['client'])

  $transaction<R>(
    fn: (prisma: Omit<this, runtime.ITXClientDenyList>) => Promise<R>,
    options?: { maxWait?: number; timeout?: number; isolationLevel?: string },
  ): Promise<R>
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: string },
  ): Promise<runtime.Types.Utils.UnwrapTuple<P>>
}

export declare const dmmf: any
export declare type dmmf = any

export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T
export declare type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

export namespace Prisma {
  export type TransactionClient = any

  export function defineExtension<
    R extends runtime.Types.Extensions.UserArgs['result'] = {},
    M extends runtime.Types.Extensions.UserArgs['model'] = {},
    Q extends runtime.Types.Extensions.UserArgs['query'] = {},
    C extends runtime.Types.Extensions.UserArgs['client'] = {},
    Args extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.InternalArgs<R, M, {}, C>,
  >(
    args:
      | ((client: PrismaClientExtends) => { $extends: { extArgs: Args } })
      | { name?: string }
      | { result?: R & runtime.Types.Extensions.UserArgs['result'] }
      | { model?: M & runtime.Types.Extensions.UserArgs['model'] }
      | { query?: Q & runtime.Types.Extensions.UserArgs['query'] }
      | { client?: C & runtime.Types.Extensions.UserArgs['client'] },
  ): (client: any) => PrismaClientExtends<Args>

  export type Extension = runtime.Types.Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = runtime.Types.Public.Args
  export import Payload = runtime.Types.Public.Payload
  export import Result = runtime.Types.Public.Result
  export import Exact = runtime.Types.Public.Exact
  export import PrismaPromise = runtime.Types.Public.PrismaPromise

  export const prismaVersion: {
    client: string
    engine: string
  }
}
`;

try {
  // Create .prisma/client directory if it doesn't exist
  const prismaClientDir = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  if (!fs.existsSync(prismaClientDir)) {
    fs.mkdirSync(prismaClientDir, { recursive: true });
    console.log('✅ Created .prisma/client directory');
  }

  // Write the type definition file
  const defaultDtsPath = path.join(prismaClientDir, 'default.d.ts');
  fs.writeFileSync(defaultDtsPath, typeDefinitions);
  console.log('✅ Created .prisma/client/default.d.ts');

  // Update @prisma/client/default.d.ts
  const prismaClientPackageDir = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  if (fs.existsSync(prismaClientPackageDir)) {
    fs.writeFileSync(path.join(prismaClientPackageDir, 'default.d.ts'), typeDefinitions);
    console.log('✅ Updated @prisma/client/default.d.ts');
  }

  // Create index.d.ts that exports from default
  const indexDts = `export * from './default';\nexport { PrismaClient, Prisma } from './default';\n`;

  if (fs.existsSync(prismaClientPackageDir)) {
    fs.writeFileSync(path.join(prismaClientPackageDir, 'index.d.ts'), indexDts);
    console.log('✅ Updated @prisma/client/index.d.ts');
  }

  fs.writeFileSync(path.join(prismaClientDir, 'index.d.ts'), indexDts);
  console.log('✅ Created .prisma/client/index.d.ts');

  console.log('\n✨ Prisma type stubs setup complete!');
  console.log('ℹ️  Note: For production, run "npx prisma generate" to create the full client\n');
} catch (error) {
  console.error('❌ Error setting up Prisma types:', error.message);
  // Don't fail the installation
  process.exit(0);
}
