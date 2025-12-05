# 品牌元素設置說明

## 📸 圖片放置指南

系統已更新為使用新的「碳智匯」品牌元素。請按照以下步驟放置圖片文件：

### 1. 準備圖片文件

您需要準備以下三張圖片：

1. **logo.png** - 圓形Logo（第一張圖片）
   - 建議尺寸：512x512 像素
   - 格式：PNG（支援透明背景）
   - 用途：導航欄、側邊欄、首頁展示

2. **background-vertical.png** - 垂直背景圖（第二張圖片）
   - 建議尺寸：1080x1920 像素
   - 格式：PNG 或 JPG
   - 用途：移動端背景

3. **background-horizontal.png** - 橫向背景圖（第三張圖片）
   - 建議尺寸：1920x1080 像素
   - 格式：PNG 或 JPG
   - 用途：桌面端背景

### 2. 放置圖片

將準備好的圖片文件放置到以下目錄：

```
/home/user/CFM/public/images/
```

完整路徑應為：
- `/home/user/CFM/public/images/logo.png`
- `/home/user/CFM/public/images/background-vertical.png`
- `/home/user/CFM/public/images/background-horizontal.png`

### 3. 確認文件結構

確保您的文件結構如下：

```
CFM/
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── background-vertical.png
│   │   └── background-horizontal.png
│   └── fonts/
├── src/
└── ...
```

### 4. 使用背景圖片（可選）

如果您想在頁面上使用背景圖片，可以添加以下 CSS 類：

#### 使用橫向背景（桌面端）
在任何元素上添加 `bg-pattern` 類：
```jsx
<div className="min-h-screen bg-pattern">
  {/* 您的內容 */}
</div>
```

#### 使用垂直背景（移動端）
在任何元素上添加 `bg-pattern-vertical` 類：
```jsx
<div className="min-h-screen bg-pattern-vertical">
  {/* 您的內容 */}
</div>
```

#### 添加疊加效果
如果背景圖片太深色，可以添加 `bg-overlay` 類來增加半透明覆蓋層：
```jsx
<div className="min-h-screen bg-pattern bg-overlay">
  {/* 您的內容 */}
</div>
```

## ✅ 已完成的更新

以下品牌元素已經更新：

### 系統名稱
- ✅ 已將「CFM System」更新為「碳智匯」
- ✅ 副標題更新為「智慧碳管理平台」

### Logo 使用位置
- ✅ 首頁導航欄
- ✅ 首頁主要展示區域
- ✅ 側邊欄品牌區
- ✅ 移動端導航欄

### 透明度調整
- ✅ 玻璃效果（glass-effect）透明度從 80% 降低到 60%
- ✅ 增強背景模糊效果（backdrop-blur-xl）
- ✅ 調整邊框透明度從 20% 到 30%

### 配置文件
- ✅ package.json
- ✅ README.md
- ✅ src/app/layout.tsx（元數據）
- ✅ 所有組件文件

## 🎨 設計建議

### Logo 優化
- Logo 使用圓形容器，確保在所有位置都有一致的外觀
- 在不同尺寸下自動調整（響應式設計）

### 背景效果
- 使用半透明白色覆蓋層，確保內容可讀性
- 背景圖片固定定位（fixed），提供視差效果
- 支援桌面和移動端不同背景圖片

## 🔧 如何測試

1. 放置圖片後，重啟開發伺服器：
   ```bash
   npm run dev
   ```

2. 訪問 http://localhost:3000

3. 檢查以下頁面：
   - 首頁（/）
   - 儀表板（/dashboard）
   - 其他頁面的側邊欄

## 📝 注意事項

- 圖片文件名必須完全匹配（包括副檔名）
- 建議使用 PNG 格式以獲得最佳質量
- Logo 建議使用透明背景
- 背景圖片大小應該適中，避免過大影響載入速度
- 如果圖片未顯示，請檢查文件路徑和權限

## 🚀 部署到生產環境

確保在部署前：
1. 所有圖片都已放置在 `public/images/` 目錄
2. 圖片已經過優化（壓縮）
3. 在本地測試確認無誤
4. 提交時包含圖片文件：
   ```bash
   git add public/images/
   git commit -m "feat: 更新品牌元素為碳智匯"
   git push
   ```

---

如有任何問題，請參考項目文檔或聯繫開發團隊。
