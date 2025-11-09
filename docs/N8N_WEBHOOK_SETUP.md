# N8N Webhook 整合指南

## 概述

本專案已整合 N8N Webhook 功能到浮動式 AI 聊天中。當用戶在浮動式聊天中發送訊息時，系統會自動將查詢數據發送到 N8N webhook 進行處理。

## 功能特點

- ✅ 自動發送聊天查詢到 N8N webhook
- ✅ 追蹤用戶 ID、用戶名、聊天會話 ID
- ✅ 非阻塞式設計，不影響主要聊天功能
- ✅ 自動生成和儲存用戶標識
- ✅ 完整的時間戳記錄

## 架構說明

```
用戶輸入查詢
    ↓
FloatingAI 組件
    ↓
    ├─→ /api/ai/chat (AI 回應)
    └─→ /api/webhook/carbon-query → N8N Webhook
```

## 配置步驟

### 1. 設定 N8N Webhook

在 N8N 中創建一個新的 Webhook Trigger 節點：

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "carbon-query",
    "responseMode": "responseNode",
    "options": {}
  },
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook"
}
```

### 2. 配置環境變數

在 `.env.local` 文件中添加：

```bash
# N8N Webhook URL
N8N_CARBON_QUERY_WEBHOOK_URL="https://your-n8n-instance.com/webhook/carbon-query"
```

**注意：** 如果不設定此環境變數，webhook 功能會被跳過，但不會影響聊天功能。

### 3. N8N 接收的數據格式

Webhook 會接收以下 JSON 數據：

```json
{
  "query": "用戶的查詢內容",
  "user_id": "唯一用戶ID",
  "username": "用戶名",
  "chat_id": "聊天會話ID",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4. N8N 工作流示例

#### 基本數據提取節點

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "query-data",
          "name": "query",
          "value": "={{ $json.body.query }}",
          "type": "string"
        },
        {
          "id": "user-id",
          "name": "user_id",
          "value": "={{ $json.body.user_id }}",
          "type": "string"
        },
        {
          "id": "username",
          "name": "username",
          "value": "={{ $json.body.username }}",
          "type": "string"
        },
        {
          "id": "chat-id",
          "name": "chat_id",
          "value": "={{ $json.body.chat_id }}",
          "type": "string"
        },
        {
          "id": "timestamp",
          "name": "timestamp",
          "value": "={{ $json.body.timestamp }}",
          "type": "string"
        }
      ]
    }
  },
  "name": "Extract Query Data",
  "type": "n8n-nodes-base.set"
}
```

## 使用場景

### 1. 查詢記錄與分析

在 N8N 中可以：
- 記錄所有用戶查詢到數據庫
- 分析用戶行為模式
- 生成使用統計報告

### 2. 智能通知

根據查詢內容觸發：
- Slack/Teams 通知
- Email 提醒
- SMS 警報

### 3. 數據同步

將查詢數據同步到：
- CRM 系統
- 分析平台
- 第三方服務

### 4. 自動化工作流

觸發自動化流程：
- 根據關鍵字執行特定操作
- 整合外部 API
- 生成報告

## API 端點

### POST /api/webhook/carbon-query

接收聊天查詢數據並轉發到 N8N。

**請求體：**
```json
{
  "query": "string",
  "user_id": "string",
  "username": "string",
  "chat_id": "string",
  "timestamp": "ISO 8601 string"
}
```

**響應：**
```json
{
  "success": true,
  "message": "Query processed successfully",
  "data": { /* N8N 返回的數據 */ }
}
```

### GET /api/webhook/carbon-query

測試端點狀態。

**響應：**
```json
{
  "message": "Carbon Query Webhook endpoint is active",
  "method": "POST",
  "expectedFields": ["query", "user_id", "username", "chat_id", "timestamp"]
}
```

## 用戶識別機制

### 用戶 ID
- 自動生成唯一 ID
- 儲存在 localStorage (`carbon_user_id`)
- 格式：`{timestamp}-{random}`

### 用戶名
- 自動生成或從 localStorage 讀取
- 儲存在 localStorage (`carbon_username`)
- 格式：`User_{random}`

### 聊天會話 ID
- 每次打開浮動聊天時生成新的 ID
- 用於追蹤單次對話會話

## 測試

### 1. 測試 API 端點

```bash
# 測試端點狀態
curl http://localhost:3000/api/webhook/carbon-query

# 測試發送數據
curl -X POST http://localhost:3000/api/webhook/carbon-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "測試查詢",
    "user_id": "test-user-123",
    "username": "TestUser",
    "chat_id": "test-chat-456",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }'
```

### 2. 測試浮動聊天

1. 啟動開發服務器：`npm run dev`
2. 打開瀏覽器，訪問任何頁面
3. 點擊右下角的 AI 助手按鈕
4. 發送一條測試訊息
5. 檢查瀏覽器控制台是否顯示 "✅ Webhook 發送成功"
6. 在 N8N 中檢查是否收到數據

## 故障排除

### Webhook 未發送

檢查：
1. 環境變數 `N8N_CARBON_QUERY_WEBHOOK_URL` 是否正確設定
2. 瀏覽器控制台是否有錯誤訊息
3. N8N webhook 是否處於啟用狀態

### Webhook 發送失敗

- 即使 webhook 失敗，聊天功能仍會正常運作
- 檢查 N8N webhook URL 是否可訪問
- 查看瀏覽器控制台的錯誤訊息

### 用戶 ID 丟失

- 清除瀏覽器快取會重置用戶 ID
- 使用無痕模式會生成新的用戶 ID
- 這是預期行為，用於保護用戶隱私

## 安全性考量

- 所有 webhook 請求都在服務器端處理
- 不會在前端暴露敏感的 webhook URL
- 用戶數據僅保存在 localStorage，不會上傳敏感個人信息
- Webhook 失敗不會影響主要功能

## 進階配置

### 自訂用戶名

如果需要讓用戶設定自己的名稱，可以在 localStorage 中修改：

```javascript
localStorage.setItem('carbon_username', '您的名稱');
```

### 停用 Webhook

移除或註解環境變數：

```bash
# N8N_CARBON_QUERY_WEBHOOK_URL="..."
```

### 修改 Webhook 端點

在 `FloatingAI.tsx` 中修改：

```typescript
await fetch('/api/webhook/carbon-query', {
  // ... 改為你的端點
});
```

## 相關文件

- 浮動式 AI 組件：`src/components/ai-chat/FloatingAI.tsx`
- Webhook API：`src/app/api/webhook/carbon-query/route.ts`
- 環境變數範例：`env.example.txt`

## 支援

如有問題，請查看：
1. 瀏覽器控制台日誌
2. 服務器日誌
3. N8N 執行日誌
