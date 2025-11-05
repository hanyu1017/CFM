# Prisma Client Setup

## Important: Generating Prisma Client

After pulling this branch, you MUST run the following command to regenerate the Prisma client with the updated schema:

```bash
npx prisma generate
```

This will generate the TypeScript types for the updated `SustainabilityReport` model which now includes:
- `htmlContent` field (String, optional) - for HTML-formatted reports
- `totalEmissions` field (Float, optional) - for total carbon emissions
- Updated field types for carbonFootprint, emissionsSummary, etc. (changed from Json to String)

## In Production Environments

The build process requires a properly generated Prisma client. Ensure your CI/CD pipeline includes:

```bash
npm install
npx prisma generate
npm run build
```

## Schema Changes

The following fields were added/modified in the `SustainabilityReport` model:
- Added: `htmlContent`, `totalEmissions`
- Modified: `carbonFootprint`, `emissionsSummary`, `reductionTargets`, `initiatives`, `compliance`, `financialImpact`, `stakeholders` (Json → String)
