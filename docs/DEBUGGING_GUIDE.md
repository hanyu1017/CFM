# 浮動式 AI 聊天調試指南

## 問題：顯示「抱歉，我暫時無法回應」

如果你在使用浮動式 AI 聊天時看到錯誤消息，請按照以下步驟進行調試。

## 調試步驟

### 1. 打開瀏覽器開發者工具

**Chrome / Edge:**
- 按 `F12` 或 `Ctrl+Shift+I` (Windows/Linux)
- 按 `Cmd+Option+I` (Mac)

**Firefox:**
- 按 `F12` 或 `Ctrl+Shift+K` (Windows/Linux)
- 按 `Cmd+Option+K` (Mac)

**Safari:**
- 按 `Cmd+Option+C` (Mac)

### 2. 切換到 Console 標籤

在開發者工具中，點擊 **Console** 或 **控制台** 標籤。

### 3. 發送測試消息

在浮動式 AI 聊天中輸入一條測試消息，例如：
```
你好
```

### 4. 查看控制台日誌

你會看到一系列帶有表情符號的日誌輸出：

#### ✅ 正常流程的日誌

```
🚀 開始發送消息: 你好
📡 發送 AI 請求到 /api/ai/chat
📝 消息歷史: [{...}]
📤 準備發送 Webhook: {...}
📥 收到響應狀態: 200 OK
✅ AI 響應數據: {response: "...", success: true}
💬 助手消息: 您好！...
✅ Webhook 發送成功，響應: {...}
🏁 消息處理完成
```

#### ❌ 錯誤情況的日誌

如果出現錯誤，你會看到：

```
❌ AI 聊天錯誤 - 詳細信息:
錯誤類型: Error
錯誤消息: HTTP error! status: 500
完整錯誤: Error: HTTP error! status: 500
    at handleSendMessage (FloatingAI.tsx:138)
    ...
```

## 常見問題與解決方案

### 問題 1: `❌ [API] ANTHROPIC_API_KEY 未設置`

**原因：** 缺少 Anthropic API 密鑰

**解決方案：**
1. 複製 `env.example.txt` 為 `.env.local`
2. 訪問 https://console.anthropic.com/
3. 創建 API Key
4. 在 `.env.local` 中設置：
   ```bash
   ANTHROPIC_API_KEY="你的API密鑰"
   ```
5. 重啟開發服務器：`npm run dev`

### 問題 2: `HTTP error! status: 500`

**原因：** 服務器內部錯誤

**檢查步驟：**
1. 查看服務器控制台（運行 `npm run dev` 的終端）
2. 尋找 `❌ [API] AI Chat 錯誤` 相關日誌
3. 檢查 Anthropic API 配額是否用盡
4. 確認網絡連接是否正常

### 問題 3: `HTTP error! status: 400`

**原因：** 請求格式錯誤

**檢查步驟：**
1. 查看控制台中的 `📝 消息歷史`
2. 確認消息格式是否正確
3. 檢查是否有特殊字符導致 JSON 解析失敗

### 問題 4: Webhook 相關錯誤

**日誌示例：**
```
⚠️ Webhook 發送失敗: TypeError: Failed to fetch
```

**說明：**
- Webhook 錯誤**不會影響**主要的 AI 聊天功能
- 如果你沒有設置 N8N，這個錯誤可以忽略
- 如果需要 N8N 整合，檢查 `N8N_CARBON_QUERY_WEBHOOK_URL` 配置

### 問題 5: `❌ [API] 無效的消息格式`

**原因：** 發送的消息數據格式不正確

**解決方案：**
1. 清除瀏覽器快取
2. 重新整理頁面
3. 如果問題持續，檢查是否有瀏覽器擴展干擾

## 日誌圖標說明

| 圖標 | 說明 |
|------|------|
| 🚀 | 操作開始 |
| 📡 | 發送 API 請求 |
| 📤 | 發送數據 |
| 📥 | 接收響應 |
| 📝 | 數據記錄 |
| 📦 | 數據包內容 |
| 🔵 | API 端點接收請求 |
| 🤖 | AI 模型調用 |
| 💬 | 消息內容 |
| ✅ | 成功操作 |
| ❌ | 錯誤 |
| ⚠️ | 警告 |
| 🔍 | 檢查/驗證 |
| ℹ️ | 信息 |
| 🏁 | 操作完成 |

## 服務器端日誌

如果你需要查看服務器端的詳細日誌：

### 查看位置
在運行 `npm run dev` 的終端窗口中

### 服務器日誌示例

```bash
🔵 [API] AI Chat 端點收到請求
📦 [API] 請求 body: {
  "messages": [
    {
      "role": "assistant",
      "content": "您好！..."
    },
    {
      "role": "user",
      "content": "你好"
    }
  ]
}
📝 [API] 消息數量: 2
✅ [API] ANTHROPIC_API_KEY 已設置
🤖 [API] 準備調用 Anthropic API
✅ [API] Anthropic API 響應: {
  id: 'msg_...',
  model: 'claude-3-sonnet-20240229',
  role: 'assistant',
  contentLength: 1
}
💬 [API] 助手回應長度: 123
```

## 調試檢查清單

使用此清單排查問題：

- [ ] 瀏覽器控制台是否有錯誤？
- [ ] `.env.local` 文件是否存在？
- [ ] `ANTHROPIC_API_KEY` 是否已設置？
- [ ] 開發服務器是否正在運行？
- [ ] 網絡連接是否正常？
- [ ] 服務器控制台是否有錯誤？
- [ ] Anthropic API 配額是否充足？
- [ ] 是否有防火牆或代理干擾？

## 高級調試

### 查看網絡請求

1. 在開發者工具中切換到 **Network** 標籤
2. 發送消息
3. 查找 `ai/chat` 請求
4. 點擊查看請求和響應的詳細信息

### 手動測試 API 端點

使用 curl 命令測試：

```bash
# 測試 AI Chat API
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'

# 測試 Webhook API
curl http://localhost:3000/api/webhook/carbon-query
```

### 啟用詳細日誌

如果需要更詳細的日誌，可以在代碼中添加：

```typescript
// 在 FloatingAI.tsx 中
console.log('詳細調試:', JSON.stringify(data, null, 2));
```

## 獲取幫助

如果以上步驟無法解決問題：

1. **收集信息：**
   - 完整的錯誤消息
   - 瀏覽器控制台截圖
   - 服務器控制台截圖
   - `.env.local` 配置（隱藏敏感信息）

2. **檢查文檔：**
   - [N8N Webhook 設置](./N8N_WEBHOOK_SETUP.md)
   - [環境變數配置](../env.example.txt)

3. **常見解決方案：**
   - 重啟開發服務器
   - 清除瀏覽器快取
   - 重新安裝依賴：`rm -rf node_modules && npm install`
   - 檢查 API 密鑰是否有效

## 移除調試日誌

如果你想在生產環境中移除這些調試日誌，可以：

1. 搜索所有 `console.log` 和 `console.error`
2. 使用環境變數控制日誌輸出：

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('調試信息:', data);
}
```

3. 或使用日誌庫如 `winston` 或 `pino` 進行更專業的日誌管理

## 性能影響

這些調試日誌對性能的影響：

- **瀏覽器端：** 極小（僅在開發模式）
- **服務器端：** 極小（主要是 I/O 操作）
- **建議：** 生產環境可以保留錯誤日誌，移除詳細的調試日誌

## 隱私注意事項

調試日誌可能包含：
- 用戶查詢內容
- 用戶 ID（本地生成）
- 會話 ID

**生產環境建議：**
- 不要記錄用戶的實際查詢內容
- 僅記錄錯誤類型和統計信息
- 遵守數據保護法規
