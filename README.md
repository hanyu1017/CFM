# 🌱 永續碳排管理系統

> 專業的企業碳排放監控與永續發展管理平台

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-green)](https://www.prisma.io/)

## 📋 功能特色

### 🎯 四大核心頁面

1. **碳排儀表板** - 實時監控企業碳排放數據
   - 實時數據更新（每5秒）
   - 多維度視覺化圖表（趨勢圖、圓餅圖、柱狀圖）
   - Scope 1/2/3 排放分類顯示
   - 關鍵指標卡片展示

2. **決策模型系統** - 綠色製造優化決策
   - 基於數學模型的供應鏈優化
   - 參數化配置（25+ 個經濟與綠色製造參數）
   - 即時優化計算
   - 敏感性分析
   - 碳減排量預測

3. **永續報告書生成** - 自動化報告產出
   - 一鍵生成標準報告
   - 自定義報告內容
   - 支援 PDF/DOCX 格式
   - 符合國際永續報告標準

4. **系統設定管理** - 完整的資料管理
   - 公司基本資料管理
   - 減排目標設定與追蹤
   - 系統配置管理
   - 完整的 CRUD 功能

### 🤖 AI 對話助手

- 浮動式對話界面
- 智能問答系統
- 數據查詢與分析
- 減排建議提供
- 由 OpenAI GPT 驅動

## 🏗️ 技術架構

### 前端
- **框架**: Next.js 14 (App Router)
- **UI 框架**: React 18 + TypeScript
- **樣式**: Tailwind CSS
- **圖表**: Recharts + Chart.js
- **狀態管理**: SWR
- **圖標**: Lucide React

### 後端
- **資料庫**: PostgreSQL 15
- **ORM**: Prisma
- **API**: Next.js API Routes
- **AI**: OpenAI API

### 部署
- **前端**: Vercel
- **資料庫**: Railway
- **CI/CD**: 自動化部署

## 🚀 快速開始

### 前置需求

```bash
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 15
```

### 安裝步驟

1. **克隆專案**
```bash
git clone <your-repo-url>
cd carbon-management-system
```

2. **安裝依賴**
```bash
npm install
```

3. **配置環境變數**
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/carbon_db"
OPENAI_API_KEY="your-openai-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **初始化資料庫**
```bash
npx prisma generate
npx prisma db push
```

5. **啟動開發伺服器**
```bash
npm run dev
```

訪問 http://localhost:3000

## 📂 專案結構

```
carbon-management-system/
├── prisma/
│   └── schema.prisma          # 資料庫 Schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── dashboard/         # 碳排儀表板
│   │   ├── decision-model/    # 決策模型
│   │   ├── report/            # 報告生成
│   │   ├── settings/          # 系統設定
│   │   ├── api/               # API 路由
│   │   ├── layout.tsx         # 全局布局
│   │   └── globals.css        # 全局樣式
│   ├── components/            # React 組件
│   │   ├── dashboard/         # 儀表板組件
│   │   ├── layout/            # 布局組件
│   │   └── ai-chat/           # AI 對話組件
│   ├── lib/                   # 工具函數
│   │   ├── model.ts           # 決策模型邏輯
│   │   └── db.ts              # 資料庫連接
│   └── types/                 # TypeScript 類型
├── public/                    # 靜態資源
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎨 核心功能詳解

### 決策模型算法

系統實現了綠色製造優化模型，包含：

**目標函數：**
```
maximize PI(p, Tf, TR, G)
```

**主要變數：**
- `p`: 零售價格
- `Tf`: 固定生產週期
- `TR`: 零售週期
- `G`: 綠色投資金額

**優化算法：**
1. 網格搜索（粗略掃描）
2. 局部精細搜索
3. 約束條件檢查
4. 敏感性分析

### 資料庫設計

主要資料表：
- `Company`: 公司基本資料
- `CarbonEmission`: 碳排放數據
- `ModelParameter`: 決策模型參數
- `OptimizationResult`: 優化結果
- `SustainabilityReport`: 永續報告書
- `EmissionTarget`: 減排目標

## 🔧 API 端點

### 碳排數據
```
GET  /api/carbon/dashboard      # 獲取儀表板數據
GET  /api/carbon/realtime       # 獲取實時數據
```

### 決策模型
```
POST /api/model/optimize        # 執行優化計算
POST /api/model/save-params     # 保存參數配置
```

### 報告生成
```
POST /api/report/generate       # 生成自定義報告
POST /api/report/generate-quick # 一鍵生成報告
```

### AI 對話
```
POST /api/ai/chat              # AI 對話接口
```

### 設定管理
```
GET  /api/settings/company     # 獲取公司資料
POST /api/settings/company     # 更新公司資料
GET  /api/settings/targets     # 獲取減排目標
POST /api/settings/targets     # 創建減排目標
```

## 🌐 部署指南

### Vercel 部署（前端）

1. 推送代碼到 GitHub
2. 在 Vercel 導入專案
3. 配置環境變數
4. 點擊部署

### Railway 部署（資料庫）

1. 創建 Railway 專案
2. 添加 PostgreSQL 服務
3. 複製連接字串到 Vercel

詳細步驟請參考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📊 數據模型

### 碳排放數據結構
```typescript
{
  date: Date,
  scope1: number,    // 直接排放
  scope2: number,    // 能源間接排放
  scope3: number,    // 其他間接排放
  totalCarbon: number,
  electricity: number,
  naturalGas: number,
  // ...
}
```

### 決策模型參數
```typescript
{
  a: 1000,          // 需求參數
  b: 2.5,           // 價格敏感度
  alpha: 12,        // 綠色投資係數
  beta: 0.001,      // 綠色技術效果
  // ... 25+ 個參數
}
```

## 🛠️ 開發指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 構建生產版本
npm run start        # 啟動生產伺服器
npm run lint         # 代碼檢查
npm run prisma:studio # 打開 Prisma Studio
```

## 🔐 安全性考量

- 環境變數保護
- API 速率限制
- 資料庫連接加密
- HTTPS 強制使用
- 定期安全更新

## 📈 性能優化

- Next.js 增量靜態生成 (ISR)
- 圖片優化（Next/Image）
- 資料庫索引優化
- SWR 客戶端緩存
- CDN 靜態資源分發

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 📞 聯絡方式

如有問題，請聯繫：[your-email@example.com](mailto:your-email@example.com)

---

**注意事項：**
- 請妥善保管 API Keys
- 定期備份資料庫
- 遵守環境法規
- 保護用戶隱私

## 🎯 路線圖

- [ ] 多語言支持
- [ ] 移動端 APP
- [ ] 更多圖表類型
- [ ] 批量數據導入
- [ ] 高級分析功能
- [ ] 第三方系統整合

---

Made with 💚 for a sustainable future
