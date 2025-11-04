// src/lib/model.ts
// 綠色製造優化模型計算邏輯

export interface ModelParams {
  // 基本參數
  a: number;    // 需求參數
  b: number;    // 價格敏感度
  M: number;    // 市場增長率
  rho: number;  // 折扣率
  W: number;    // 批發價格
  V: number;    // 變動成本
  Dcost: number; // 處理成本
  S: number;    // 固定成本
  Ii: number;   // 初始投資
  
  // 綠色製造參數
  A: number;    // 零售訂購成本
  UR: number;   // 單位零售持有成本
  Uf: number;   // 單位固定持有成本
  Ij: number;   // 單位庫存成本
  H: number;    // 生產時間
  alpha: number; // 綠色投資係數
  beta: number;  // 綠色技術效果
  
  // 不確定性參數
  SHat: number;
  VHat: number;
  DcostHat: number;
  UFHat: number;
  IiHat: number;
  IjHat: number;
  AHat: number;
  WHat: number;
  URHat: number;
  MHat: number;
  
  CapitalDelta: number;
  TP: number;
}

export interface OptimizationResult {
  optimalProfit: number;
  optimalP: number;
  optimalTf: number;
  optimalTR: number;
  optimalG: number;
  totalCycle: number;
  totalRevenue: number;
  totalCost: number;
  carbonReduction: number;
}

/**
 * 需求函數
 */
export function d1(p: number, params: ModelParams): number {
  return (params.a - params.b * p) * (1 + params.M);
}

/**
 * 延遲需求函數
 */
export function D2(t: number, p: number, params: ModelParams): number {
  const f = 1 / (1 + params.CapitalDelta * (params.TP - t));
  return (params.a - params.b * (1 - params.rho) * p) * (1 + params.M) * f;
}

/**
 * 訂單量計算
 */
export function Q1(p: number, TR: number, params: ModelParams): number {
  return d1(p, params) * (TR - params.TP);
}

/**
 * 延遲訂單量計算（簡化積分）
 */
export function Q2(p: number, params: ModelParams): number {
  // 使用數值積分（Simpson's rule）
  const n = 100; // 分割數
  const h = params.TP / n;
  let sum = 0;
  
  for (let i = 0; i <= n; i++) {
    const t = i * h;
    const weight = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
    sum += weight * D2(t, p, params);
  }
  
  return (h / 3) * sum;
}

/**
 * 總訂單量
 */
export function Q(p: number, TR: number, params: ModelParams): number {
  return Q1(p, TR, params) + Q2(p, params);
}

/**
 * 總收入計算
 */
export function TotalR(p: number, TR: number, params: ModelParams): number {
  const R1r = (1 - params.rho) * p * Q2(p, params);
  const R2r = p * Q1(p, TR, params);
  const R1f = params.W * Q2(p, params);
  const R2f = params.W * Q1(p, TR, params);
  return R1r + R2r + R1f + R2f;
}

/**
 * 固定週期成本
 */
export function TCF(Tf: number, params: ModelParams): number {
  return params.S / Tf + 
         params.V * params.H + 
         params.Dcost * params.H + 
         params.Ii / Tf + 
         params.Ij * params.H + 
         params.Uf * params.H / 2;
}

/**
 * 固定週期誤差
 */
export function Ef(G: number, Tf: number, params: ModelParams): number {
  return Math.exp(-params.beta * G) / Tf * 
         (params.SHat + 
          (params.VHat + params.DcostHat + params.UFHat) * params.H * Tf + 
          params.IiHat + 
          params.IjHat * params.H * Tf);
}

/**
 * 零售週期成本
 */
export function TCr(p: number, TR: number, G: number, params: ModelParams): number {
  const q = Q(p, TR, params);
  return params.A + 
         params.W * q + 
         params.UR * q / 2 * Math.pow(TR, 2) + 
         params.M * q + 
         params.alpha * G;
}

/**
 * 零售週期誤差
 */
export function Er(p: number, TR: number, G: number, params: ModelParams): number {
  const q = Q(p, TR, params);
  return Math.exp(-params.beta * G) * 
         (params.AHat + 
          params.WHat * q + 
          params.URHat * q / 2 * Math.pow(TR, 2) + 
          params.MHat * q);
}

/**
 * 利潤函數
 */
export function PI(p: number, Tf: number, TR: number, G: number, params: ModelParams): number {
  const revenue = TotalR(p, TR, params);
  const costR = TCr(p, TR, G, params) + Er(p, TR, G, params);
  const costF = (TCF(Tf, params) + Ef(G, Tf, params)) / Tf * TR;
  
  return (revenue - costR - costF) / (TR + Tf);
}

/**
 * 優化求解（使用網格搜索法）
 */
export function optimize(params: ModelParams): OptimizationResult {
  let maxProfit = -Infinity;
  let optimalP = 0;
  let optimalTf = 0;
  let optimalTR = 0;
  let optimalG = 0;

  // 定義搜索範圍
  const pRange = { min: params.W + 10, max: 400, step: 5 };
  const TfRange = { min: 5, max: 50, step: 1 };
  const TRRange = { min: params.TP + 0.5, max: 10, step: 0.5 };
  const GRange = { min: 0, max: 5000, step: 100 };

  // 粗糙搜索
  for (let p = pRange.min; p <= pRange.max; p += pRange.step) {
    for (let Tf = TfRange.min; Tf <= TfRange.max; Tf += TfRange.step) {
      for (let TR = TRRange.min; TR <= TRRange.max; TR += TRRange.step) {
        for (let G = GRange.min; G <= GRange.max; G += GRange.step) {
          // 檢查約束條件
          if (d1(p, params) <= 0 || 
              (params.a - params.b * (1 - params.rho) * p) <= 0) {
            continue;
          }

          const profit = PI(p, Tf, TR, G, params);
          
          if (profit > maxProfit) {
            maxProfit = profit;
            optimalP = p;
            optimalTf = Tf;
            optimalTR = TR;
            optimalG = G;
          }
        }
      }
    }
  }

  // 精細搜索（在最優點附近）
  const fineStep = 0.1;
  for (let p = optimalP - pRange.step; p <= optimalP + pRange.step; p += fineStep) {
    for (let Tf = optimalTf - TfRange.step; Tf <= optimalTf + TfRange.step; Tf += fineStep) {
      for (let TR = optimalTR - TRRange.step; TR <= optimalTR + TRRange.step; TR += fineStep) {
        for (let G = optimalG - GRange.step; G <= optimalG + GRange.step; G += GRange.step / 10) {
          if (Tf <= 0 || TR <= params.TP || G < 0) continue;
          if (d1(p, params) <= 0 || 
              (params.a - params.b * (1 - params.rho) * p) <= 0) {
            continue;
          }

          const profit = PI(p, Tf, TR, G, params);
          
          if (profit > maxProfit) {
            maxProfit = profit;
            optimalP = p;
            optimalTf = Tf;
            optimalTR = TR;
            optimalG = G;
          }
        }
      }
    }
  }

  // 計算相關指標
  const totalRevenue = TotalR(optimalP, optimalTR, params);
  const totalCost = totalRevenue - maxProfit * (optimalTR + optimalTf);
  const carbonReduction = optimalG * params.beta * 1000; // 估算碳減排量

  return {
    optimalProfit: maxProfit,
    optimalP,
    optimalTf,
    optimalTR,
    optimalG,
    totalCycle: optimalTR + optimalTf,
    totalRevenue,
    totalCost,
    carbonReduction,
  };
}

/**
 * 敏感性分析
 */
export function sensitivityAnalysis(
  params: ModelParams, 
  paramName: keyof ModelParams,
  variations: number[] = [-20, -10, 0, 10, 20]
): any[] {
  const baseResult = optimize(params);
  const results = [];

  for (const variation of variations) {
    const modifiedParams = { ...params };
    const baseValue = params[paramName] as number;
    const newValue = baseValue * (1 + variation / 100);
    (modifiedParams[paramName] as number) = newValue;

    const result = optimize(modifiedParams);
    const profitChange = result.optimalProfit - baseResult.optimalProfit;
    const profitChangePct = (profitChange / baseResult.optimalProfit) * 100;

    results.push({
      parameterName: paramName,
      baseValue,
      variation,
      newValue,
      profitChange,
      profitChangePct,
      optimalP: result.optimalP,
      optimalTf: result.optimalTf,
      optimalTR: result.optimalTR,
      optimalG: result.optimalG,
    });
  }

  return results;
}

/**
 * 默認參數配置
 */
export const DEFAULT_PARAMS: ModelParams = {
  a: 1000,
  b: 2.5,
  M: 0.15,
  rho: 0.2,
  W: 180,
  V: 950,
  Dcost: 100,
  S: 15000,
  Ii: 600000,
  A: 2000,
  UR: 15,
  Uf: 6,
  Ij: 5,
  H: 450,
  alpha: 12,
  beta: 0.001,
  SHat: 15000,
  VHat: 1400,
  DcostHat: 50,
  UFHat: 25,
  IiHat: 1000,
  IjHat: 120,
  AHat: 30,
  WHat: 5,
  URHat: 30,
  MHat: 5,
  CapitalDelta: 0.2,
  TP: 1.0,
};
