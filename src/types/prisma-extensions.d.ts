// Type extensions for Prisma models
// This file extends the Prisma types to include fields that are defined in the schema
// but not yet generated in the Prisma client

import { Prisma } from '@prisma/client'

declare module '@prisma/client' {
  interface SustainabilityReportCreateInput {
    htmlContent?: string | null
    totalEmissions?: number | null
    carbonFootprint?: string | null
    emissionsSummary?: string | null
    reductionTargets?: string | null
    initiatives?: string | null
    compliance?: string | null
    financialImpact?: string | null
    stakeholders?: string | null
  }

  interface SustainabilityReportUncheckedCreateInput {
    htmlContent?: string | null
    totalEmissions?: number | null
    carbonFootprint?: string | null
    emissionsSummary?: string | null
    reductionTargets?: string | null
    initiatives?: string | null
    compliance?: string | null
    financialImpact?: string | null
    stakeholders?: string | null
  }
}
