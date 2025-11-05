# 🔧 快速修復指南 - JSON 文件錯誤

如果您遇到 JSON 解析錯誤，請按照以下步驟操作。

## ❌ 錯誤訊息
```
Unexpected non-whitespace character after JSON at position XXXXX
```

這表示 JSON 文件包含了額外的內容（通常是控制台輸出）。

---

## ✅ 方案 1: 自動修復（最快）

```powershell
# 一鍵驗證並修復 JSON 文件
npm run seed:fix
```

這個命令會：
1. 檢查 JSON 文件
2. 自動移除額外內容
3. 備份原文件
4. 保存純 JSON

**然後運行：**
```powershell
npm run seed:import-pg
```

---

## ✅ 方案 2: 重新生成（推薦）

使用改進的生成腳本，確保只輸出純 JSON：

```powershell
# 重新生成純 JSON 文件
npm run seed:generate-clean

# 導入數據
npm run seed:import-pg
```

---

## ✅ 方案 3: 手動檢查

如果想查看文件問題：

```powershell
# 驗證 JSON 文件
npm run seed:validate

# 這會顯示：
# - 文件大小
# - JSON 開始和結束位置
# - 是否有額外內容
# - 數據摘要
```

---

## 📝 完整流程（從頭開始）

如果要完全重新開始：

```powershell
# 第一步：清理舊文件（可選）
del data\carbon-emissions-seed.json

# 第二步：生成純 JSON 數據
npm run seed:generate-clean

# 第三步：安裝 pg 庫（如果還沒安裝）
npm install pg

# 第四步：設置資料庫連接
$env:DATABASE_URL="postgresql://username:password@localhost:5432/carbon_db"

# 第五步：導入數據
npm run seed:import-pg
```

---

## 🎯 為什麼會出現這個錯誤？

當使用以下命令生成 JSON 時：
```powershell
npm run seed:generate > data/carbon-emissions-seed.json
```

npm 可能會將額外的輸出（如警告、進度訊息等）也寫入文件，導致 JSON 格式不正確。

**解決方案**：使用 `seed:generate-clean`，它會直接寫入文件而不通過重定向。

---

## 🔍 手動檢查 JSON 文件

如果想手動查看問題：

```powershell
# 查看文件開頭
Get-Content data\carbon-emissions-seed.json -Head 5

# 查看文件結尾
Get-Content data\carbon-emissions-seed.json -Tail 5
```

純 JSON 文件應該：
- 第一行以 `{` 開始
- 最後一行以 `}` 結束
- 中間沒有控制台輸出訊息

---

## ✨ 新增的命令

```powershell
npm run seed:generate-clean   # 生成純 JSON（推薦）
npm run seed:validate          # 驗證 JSON 文件
npm run seed:fix               # 自動修復 JSON 文件
npm run seed:import-pg         # 導入數據（使用 pg 庫）
```

---

## 🎉 預期成功輸出

修復後運行 `npm run seed:import-pg`，您應該看到：

```
🌱 開始使用 pg 導入碳排放數據...

✅ 已連接到資料庫

📊 數據文件資訊:
   - 數據點: 180
   - 時間範圍: 2025-05-10 ~ 2025-11-05
   - 總碳排放: 69539.46 tCO2e

🏢 使用現有公司: 綠能科技股份有限公司 (ID: xxx)

🗑️  清除現有碳排放數據...
   ✅ 已刪除 0 筆舊數據

📥 開始導入數據...
   進度: 180/180 (100%)

✅ 數據導入完成！

📝 導入結果摘要:
   - 總筆數: 180
   - 最早日期: 2025-05-10
   - 最新日期: 2025-11-05
   - 公司ID: xxx

🎉 所有操作完成！
```

---

## 📚 更多幫助

- 詳細故障排除：`TROUBLESHOOTING.md`
- 快速開始指南：`QUICK_START.md`
- 數據文檔：`data/README.md`

---

**最快解決方法：**
1. `npm run seed:generate-clean`
2. `npm run seed:import-pg`

就這麼簡單！ 🎉
