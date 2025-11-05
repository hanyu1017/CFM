// scripts/generate-seed-data.js
// 生成過去 6 個月的碳排放數據（JSON 格式）

// 生成過去 N 天的隨機碳排放數據
function generateCarbonEmissionData(days = 180) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // 生成基礎值並加入一些隨機波動
    const baseScope1 = 45 + Math.random() * 20; // 40-65
    const baseScope2 = 120 + Math.random() * 40; // 120-160
    const baseScope3 = 180 + Math.random() * 60; // 180-240

    // 加入週末效應（週末排放較低）
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;

    // 加入季節性變化（夏季和冬季能源使用較高）
    const month = date.getMonth();
    const seasonalFactor = (month >= 5 && month <= 8) || (month === 11 || month <= 1)
      ? 1.15  // 夏季（6-9月）和冬季（12-2月）較高
      : 1.0;

    const scope1 = baseScope1 * weekendFactor * seasonalFactor;
    const scope2 = baseScope2 * weekendFactor * seasonalFactor;
    const scope3 = baseScope3 * weekendFactor;
    const totalCarbon = scope1 + scope2 + scope3;

    // 生成細分數據
    const electricity = scope2 * 15 + Math.random() * 100; // kWh
    const naturalGas = scope1 * 2 + Math.random() * 20; // m³
    const fuel = scope1 * 3 + Math.random() * 30; // L
    const transport = scope3 * 0.8 + Math.random() * 50; // km
    const waste = scope3 * 0.5 + Math.random() * 30; // kg
    const water = electricity * 0.05 + Math.random() * 10; // m³

    data.push({
      date: date.toISOString(),
      scope1: Number(scope1.toFixed(2)),
      scope2: Number(scope2.toFixed(2)),
      scope3: Number(scope3.toFixed(2)),
      totalCarbon: Number(totalCarbon.toFixed(2)),
      electricity: Number(electricity.toFixed(2)),
      naturalGas: Number(naturalGas.toFixed(2)),
      fuel: Number(fuel.toFixed(2)),
      transport: Number(transport.toFixed(2)),
      waste: Number(waste.toFixed(2)),
      water: Number(water.toFixed(2)),
      dataSource: 'AUTO_GENERATED',
      verified: true,
      notes: `自動生成的 ${date.toISOString().split('T')[0]} 碳排放數據`,
    });
  }

  return data;
}

// 生成數據並輸出為 JSON
const carbonData = generateCarbonEmissionData(180);

// 計算統計數據
const totalEmissions = carbonData.reduce((sum, d) => sum + d.totalCarbon, 0);
const avgDaily = totalEmissions / carbonData.length;
const maxDaily = Math.max(...carbonData.map(d => d.totalCarbon));
const minDaily = Math.min(...carbonData.map(d => d.totalCarbon));

const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    dataPoints: carbonData.length,
    period: `過去 ${carbonData.length} 天 (約 ${Math.round(carbonData.length / 30)} 個月)`,
    dateRange: {
      start: carbonData[0].date,
      end: carbonData[carbonData.length - 1].date,
    },
    statistics: {
      totalEmissions: Number(totalEmissions.toFixed(2)),
      averageDaily: Number(avgDaily.toFixed(2)),
      maxDaily: Number(maxDaily.toFixed(2)),
      minDaily: Number(minDaily.toFixed(2)),
    },
  },
  data: carbonData,
};

// 輸出 JSON
console.log(JSON.stringify(output, null, 2));

// 輸出摘要到 stderr（這樣不會影響 JSON 輸出）
console.error('\n✅ 碳排放數據生成完成！');
console.error(`📊 數據點數量: ${carbonData.length}`);
console.error(`📅 時間範圍: ${carbonData[0].date.split('T')[0]} ~ ${carbonData[carbonData.length - 1].date.split('T')[0]}`);
console.error(`📈 總碳排放: ${totalEmissions.toFixed(2)} tCO2e`);
console.error(`📊 平均每日: ${avgDaily.toFixed(2)} tCO2e`);
console.error(`📈 最高單日: ${maxDaily.toFixed(2)} tCO2e`);
console.error(`📉 最低單日: ${minDaily.toFixed(2)} tCO2e\n`);
