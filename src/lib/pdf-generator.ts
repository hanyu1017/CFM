// src/lib/pdf-generator.ts
// PDF 生成工具函數

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportData {
  company: {
    name: string;
    industry?: string;
    address?: string;
  };
  reportInfo: {
    title: string;
    period: string;
    startDate: string;
    endDate: string;
  };
  carbonData: {
    totalEmissions: number;
    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    avgEmissions: number;
    electricityTotal?: number;
    naturalGasTotal?: number;
    fuelTotal?: number;
  };
  content: {
    executiveSummary: string;
    carbonFootprint: string;
    emissionsSummary: string;
    reductionTargets: string;
    initiatives: string;
    compliance: string;
    financialImpact: string;
    stakeholders: string;
  };
}

export async function generatePDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    try {
      // 封面頁
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .text(data.reportInfo.title, { align: 'center' });

      doc.moveDown(2);

      doc.fontSize(16)
         .font('Helvetica')
         .text(data.company.name, { align: 'center' });

      if (data.company.industry) {
        doc.fontSize(12)
           .text(data.company.industry, { align: 'center' });
      }

      doc.moveDown(3);

      doc.fontSize(14)
         .text(`報告期間：${data.reportInfo.period}`, { align: 'center' });

      doc.fontSize(12)
         .text(`${data.reportInfo.startDate} 至 ${data.reportInfo.endDate}`, { align: 'center' });

      doc.moveDown(2);

      doc.fontSize(10)
         .text(`生成時間：${new Date().toLocaleString('zh-TW')}`, { align: 'center' });

      // 新頁 - 目錄
      doc.addPage();
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('目錄', { underline: true });

      doc.moveDown(1);

      const chapters = [
        '一、執行摘要',
        '二、碳足跡分析',
        '三、排放總結',
        '四、減排目標',
        '五、永續措施',
        '六、法規遵循',
        '七、財務影響',
        '八、利害關係人溝通'
      ];

      doc.fontSize(12)
         .font('Helvetica');

      chapters.forEach((chapter, index) => {
        doc.text(`${chapter} ............................................. ${index + 3}`, {
          continued: false
        });
      });

      // 新頁 - 碳排放數據摘要
      doc.addPage();
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('碳排放數據摘要', { underline: true });

      doc.moveDown(1);

      doc.fontSize(12)
         .font('Helvetica');

      // 總排放量
      doc.font('Helvetica-Bold')
         .text('總碳排放量：', { continued: true })
         .font('Helvetica')
         .text(`${data.carbonData.totalEmissions.toFixed(2)} tCO2e`);

      doc.text('日均排放量：', { continued: true })
         .font('Helvetica')
         .text(`${data.carbonData.avgEmissions.toFixed(2)} tCO2e`);

      doc.moveDown(0.5);

      // Scope 1/2/3
      const scope1Percent = ((data.carbonData.scope1Total / data.carbonData.totalEmissions) * 100).toFixed(1);
      const scope2Percent = ((data.carbonData.scope2Total / data.carbonData.totalEmissions) * 100).toFixed(1);
      const scope3Percent = ((data.carbonData.scope3Total / data.carbonData.totalEmissions) * 100).toFixed(1);

      doc.font('Helvetica-Bold')
         .text('範疇排放：');

      doc.font('Helvetica')
         .text(`  • Scope 1 (直接排放)：${data.carbonData.scope1Total.toFixed(2)} tCO2e (${scope1Percent}%)`);

      doc.text(`  • Scope 2 (能源間接排放)：${data.carbonData.scope2Total.toFixed(2)} tCO2e (${scope2Percent}%)`);

      doc.text(`  • Scope 3 (其他間接排放)：${data.carbonData.scope3Total.toFixed(2)} tCO2e (${scope3Percent}%)`);

      if (data.carbonData.electricityTotal) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold')
           .text('主要排放源：');

        doc.font('Helvetica')
           .text(`  • 電力使用：${data.carbonData.electricityTotal.toFixed(2)} kWh`);

        if (data.carbonData.naturalGasTotal) {
          doc.text(`  • 天然氣：${data.carbonData.naturalGasTotal.toFixed(2)} m³`);
        }

        if (data.carbonData.fuelTotal) {
          doc.text(`  • 燃料消耗：${data.carbonData.fuelTotal.toFixed(2)} L`);
        }
      }

      // 章節內容
      const sections = [
        { title: '一、執行摘要', content: data.content.executiveSummary },
        { title: '二、碳足跡分析', content: data.content.carbonFootprint },
        { title: '三、排放總結', content: data.content.emissionsSummary },
        { title: '四、減排目標', content: data.content.reductionTargets },
        { title: '五、永續措施', content: data.content.initiatives },
        { title: '六、法規遵循', content: data.content.compliance },
        { title: '七、財務影響', content: data.content.financialImpact },
        { title: '八、利害關係人溝通', content: data.content.stakeholders }
      ];

      sections.forEach((section) => {
        doc.addPage();

        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text(section.title, { underline: true });

        doc.moveDown(1);

        doc.fontSize(12)
           .font('Helvetica')
           .text(section.content, {
             align: 'justify',
             lineGap: 5
           });
      });

      // 結束頁
      doc.addPage();
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('報告結束', { align: 'center' });

      doc.moveDown(2);

      doc.fontSize(10)
         .font('Helvetica')
         .text('本報告由永續碳排管理系統自動生成', { align: 'center' });

      doc.text(`生成時間：${new Date().toLocaleString('zh-TW')}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// 儲存 PDF 到指定路徑
export async function savePDF(pdfBuffer: Buffer, filename: string): Promise<string> {
  // 確保 public/reports 目錄存在
  const reportsDir = path.join(process.cwd(), 'public', 'reports');

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, filename);

  fs.writeFileSync(filePath, pdfBuffer);

  return `/reports/${filename}`;
}
