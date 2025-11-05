# 🌱 資料庫種子數據執行指南

## 問題說明

遇到 `Cannot find module '#main-entry-point'` 錯誤是因為 Prisma Client 未正確生成。

## ✅ 解決步驟

請在你的 Windows PowerShell 中依序執行：

### 1. 清理並重新安裝依賴

```powershell
# 清理 Prisma Client
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\@prisma\client -ErrorAction SilentlyContinue

# 重新安裝（如果需要）
npm install
```

### 2. 生成 Prisma Client

```powershell
npx prisma generate
```

你應該會看到類似這樣的輸出：
```
✔ Generated Prisma Client (v6.18.0) to .\node_modules\@prisma\client in 234ms
```

### 3. 確認資料庫連接

確保你的 `.env.local` 文件包含正確的資料庫連接字串：

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 4. 推送資料庫結構（如果需要）

```powershell
npx prisma db push
```

### 5. 執行種子數據

```powershell
npm run prisma:seed
```

## 🎉 成功標誌

如果成功，你會看到：

```
🌱 開始執行資料庫種子數據...
🗑️  清除現有數據...
🏢 建立示範公司...
✅ 已建立公司: 綠色科技股份有限公司 (ID: xxx)
📊 建立碳排放數據...
✅ 已建立 180 筆碳排放數據
🎯 建立減排目標...
✅ 已建立 2 個減排目標
⚙️  建立系統設定...
✅ 已建立 8 項系統設定
🔧 建立決策模型參數...
✅ 已建立決策模型參數
📄 建立示範報告...
✅ 已建立完整的示範報告範本

🎉 資料庫種子數據執行完成！

📝 種子數據摘要:
   - 公司數量: 1
   - 碳排放數據: 180 筆（過去180天 / 6個月）
   - 減排目標: 2 個
   - 系統設定: 8 項
   - 決策模型參數: 1 組
   - 示範報告: 1 份
```

## 🔍 常見問題排查

### 問題 1: `npx prisma generate` 失敗

**可能原因**: 網絡問題或權限問題

**解決方法**:
1. 檢查網絡連接
2. 以管理員身份運行 PowerShell
3. 清理 npm 緩存: `npm cache clean --force`

### 問題 2: 資料庫連接失敗

**錯誤訊息**: `Can't reach database server`

**解決方法**:
1. 確認資料庫服務正在運行
2. 檢查 `.env.local` 中的連接字串
3. 確認防火牆設置

### 問題 3: TypeScript 編譯錯誤

**解決方法**:
```powershell
# 確保 tsconfig 文件正確
cat prisma/tsconfig.json

# 應該看到 "module": "commonjs"
```

## 📦 已包含的範本內容

種子數據會自動建立一份完整的永續報告書範本，包含：

- ✅ 執行摘要（董事長的話、重點成果）
- ✅ 碳足跡數據（65,432.5 tCO2e）
- ✅ 排放總結（Scope 1/2/3 + 月度數據）
- ✅ 減排目標（2050 淨零排放路徑）
- ✅ 永續措施（9 個專案，總投資 6,980 萬）
- ✅ 法規遵循（ISO 認證、CDP 評級）
- ✅ 財務影響（投資報酬分析）
- ✅ 利害關係人（6 大群體溝通策略）

## 💡 下一步

種子數據執行成功後，你可以：

1. 啟動開發服務器: `npm run dev`
2. 訪問 http://localhost:3000
3. 查看儀表板中的碳排放數據
4. 在報告頁面查看完整的永續報告書

## 🆘 需要幫助？

如果還有問題，請提供完整的錯誤訊息以便進一步診斷。
