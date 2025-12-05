# 📸 上傳品牌圖片指南

系統已經更新為使用「碳智匯」品牌元素並添加了背景圖支援。

## ⚠️ 重要：圖片文件尚未上傳

目前 `/public/images/` 目錄中還沒有實際的圖片文件。請按照以下步驟上傳您的品牌圖片。

## 📋 需要上傳的圖片

您之前提供的三張圖片需要重命名並上傳到項目中：

### 1. **第一張圖片（圓形 Logo）**
- **原始描述**：藍色和綠色漸變的圓形，中間有大腦和電路圖案
- **重命名為**：`logo.png`
- **上傳到**：`/home/user/CFM/public/images/logo.png`
- **建議尺寸**：512 x 512 像素

### 2. **第二張圖片（垂直背景）**
- **原始描述**：垂直方向的科技背景，帶有電路和 Logo
- **重命名為**：`background-vertical.png`
- **上傳到**：`/home/user/CFM/public/images/background-vertical.png`
- **建議尺寸**：1080 x 1920 像素

### 3. **第三張圖片（橫向背景）**
- **原始描述**：橫向寬屏背景，帶有電路紋理和 Logo
- **重命名為**：`background-horizontal.png`
- **上傳到**：`/home/user/CFM/public/images/background-horizontal.png`
- **建議尺寸**：1920 x 1080 像素

## 🚀 如何上傳圖片

### 方法 1：使用命令行（推薦）

如果您的圖片在本地電腦上：

```bash
# 1. 將圖片複製到項目目錄
cp /path/to/your/logo.png /home/user/CFM/public/images/logo.png
cp /path/to/your/background-vertical.png /home/user/CFM/public/images/background-vertical.png
cp /path/to/your/background-horizontal.png /home/user/CFM/public/images/background-horizontal.png

# 2. 確認文件已經複製
ls -lh /home/user/CFM/public/images/

# 3. 添加到 Git
cd /home/user/CFM
git add public/images/*.png

# 4. 提交
git commit -m "feat: 添加碳智匯品牌圖片資源"

# 5. 推送
git push
```

### 方法 2：使用文件管理器

1. 打開文件管理器
2. 導航到 `/home/user/CFM/public/images/`
3. 將三張圖片拖放到該目錄
4. 確保文件名完全匹配（包括副檔名）

### 方法 3：使用 IDE/編輯器

如果您使用 VS Code 或其他 IDE：

1. 在項目樹中找到 `public/images/` 目錄
2. 右鍵點擊 → 上傳文件
3. 選擇三張圖片並上傳

## ✅ 驗證圖片已正確放置

運行以下命令檢查：

```bash
ls -lh /home/user/CFM/public/images/
```

應該看到類似的輸出：

```
total 1.5M
-rw-r--r-- 1 user user  80K Dec  5 12:00 logo.png
-rw-r--r-- 1 user user 500K Dec  5 12:00 background-vertical.png
-rw-r--r-- 1 user user 800K Dec  5 12:00 background-horizontal.png
-rw-r--r-- 1 user user  1K  Dec  5 12:00 README.md
```

## 🔧 測試圖片顯示

上傳圖片後：

1. **重啟開發服務器**：
   ```bash
   cd /home/user/CFM
   npm run dev
   ```

2. **訪問以下頁面**：
   - 首頁：http://localhost:3000
   - Dashboard：http://localhost:3000/dashboard

3. **檢查項目**：
   - ✅ Logo 在頂部導航欄顯示
   - ✅ 首頁中央的大 Logo 顯示
   - ✅ 側邊欄中的 Logo 顯示
   - ✅ 背景圖片正確顯示
   - ✅ 內容清晰可讀（有半透明覆蓋層）

## 🎨 如果圖片需要調整

### 調整背景透明度

編輯 `/home/user/CFM/src/app/globals.css`：

```css
.bg-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  /* 調整這裡的 rgba 值來改變透明度 */
  background: linear-gradient(
    to bottom right,
    rgba(248, 250, 252, 0.7),  /* 數字越大越不透明 */
    rgba(239, 246, 255, 0.7),
    rgba(240, 253, 244, 0.7)
  );
  pointer-events: none;
}
```

### 調整 Logo 尺寸

Logo 會自動響應式調整，但如需手動調整，可修改相關組件中的 `w-` 和 `h-` 類。

## 📝 已完成的代碼更新

以下功能已經實現，等待圖片上傳：

✅ 系統名稱更新為「碳智匯」
✅ 所有組件更新為使用圖片 Logo
✅ 背景圖片 CSS 樣式已配置
✅ 首頁添加背景圖和覆蓋層
✅ Dashboard 和所有內部頁面添加背景圖
✅ 調整玻璃效果透明度以配合背景
✅ 響應式設計支援桌面和移動端

## 🆘 遇到問題？

### 圖片不顯示
- 檢查文件名是否完全匹配（區分大小寫）
- 確認文件在正確的目錄中
- 重啟開發服務器
- 清除瀏覽器緩存（Ctrl+Shift+R）

### 背景太暗或太亮
- 調整 `globals.css` 中的覆蓋層透明度
- 可以使用圖片編輯軟件調整原始圖片的亮度

### Logo 顯示變形
- 確保 Logo 是正方形（1:1 比例）
- 使用 PNG 格式並保持透明背景

---

**準備好上傳圖片後，請按照上述步驟操作。如有任何問題，請查看 `BRANDING_SETUP.md` 文件或諮詢開發團隊。**
