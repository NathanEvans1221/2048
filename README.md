# 🎮 2048 網頁版遊戲

經典 2048 遊戲的網頁版實現，支援鍵盤與觸控操作。

![2048](./images/2048.png)

DEMO: https://2048.liawchiisen.workers.dev/

## 📖 遊戲玩法

1. **目標**：合併數字方塊，最終得到 2048
2. **操作方式**：
   - **鍵盤**：使用方向鍵 ↑ ↓ ← → 移動方塊
   - **觸控**：在螢幕上滑動來移動方塊
3. **規則**：
   - 每次移動，所有方塊會朝同一方向移動
   - 相同數字的方塊碰撞時會合併成兩倍數值
   - 每次移動後隨機生成一個新方塊 (2 或 4)
   - 當無法移動時遊戲結束

## 🛠️ 技術栈

| 類別 | 技術 |
|------|------|
| 結構 | HTML5 |
| 樣式 | CSS3 (Flexbox, Grid, CSS Variables, Animations, Transitions) |
| 邏輯 | Vanilla JavaScript (ES6+) |
| 特效 | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| 字體 | [Fredoka](https://fonts.google.com/specimen/Fredoka) (Google Fonts) |

## ✨ 特色功能

- 流暢的移動動畫 (CSS Transition)
- 合併時的縮放彈跳效果
- 數字越大顏色越深 (視覺進度回饋)
- 合併成功時灑花慶祝效果
- 支援手機觸控滑動
- 響應式設計 (支援不同螢幕尺寸)
- 遊戲結束偵測與重新開始

## 🚀 使用方式

直接用瀏覽器打開 `index.html` 即可遊玩：

```bash
# 用預設瀏覽器開啟
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

或使用本地伺服器：

```bash
npx serve
# 然後訪問 http://localhost:3000
```

## 📁 專案結構

```
2048/
├── index.html          # 遊戲主檔案
├── game.js             # 遊戲邏輯 (核心類別 Game2048)
├── style.css           # 遊戲樣式 (淺色/深色主題、動畫)
├── images/             # 截圖與素材
├── tests/              # 單元測試（零依賴 Node runner）
│   ├── run.cjs         # 測試案例與執行入口
│   └── stub.cjs        # DOM/localStorage/計時器環境樁
├── wrangler.jsonc      # Cloudflare Workers 部署設定
├── setup_git_sync.ps1  # Git 多遠端同步腳本
└── README.md           # 說明文件
```

## 🎨 畫面預覽

- 經典木質色調 UI
- 數字方塊顏色漸變 (2→2048)
- 平滑動畫體驗

## 📋 待辦事項 (TODO)

### ⚡ 效能優化

- [x] 使用 Chrome Performance 面板測量 FPS — JS 合併邏輯 10k 次約 5.4ms，瓶頸在 CSS transition 而非 JS，16 宮格無掉幀風險
- [x] 檢查 DOM 元素是否有 memory leak — 已稽核：history 上限 10 筆且只存值不存 DOM、AI/BGM 計時器皆有清理、合併 tile 有 `remove()`、事件綁定僅一次，無洩漏
- [x] 優化大量瓦片時的渲染效能 — `tile-new`/`tile-merged` 清理限定 `tileContainer` 查詢；修復合併動畫 class 被 `className` 覆寫導致 pop 動畫失效；`confetti` 加 `typeof` 防護

### ✨ 功能增強

- [x] 添加行動態效果 (滑動方向指示)
- [x] 添加音效 feedback
- [x] 添加連續合併-combo 顯示
- [x] 添加歷史紀錄/悔棋功能
- [x] 添加 theme 切換 (深色/淺色模式)

### 🧪 測試項目

自動化單元測試（零依賴，不需安裝套件）：

```bash
node tests/run.cjs
```

覆蓋範圍：四向移動與合併、單次合併規則、無效移動、移動後補 tile、
悔棋還原（單步/連續/上限 10 筆）、遊戲結束判定（含補滿觸發遮罩）、
2048 獲勝與繼續、AI 自動玩啟停、combo、addRandomTile 滿盤與機率、
init 初始盤面、bestScore 持久化、主題與音效切換。

手動測試：

- [x] 鍵盤操作測試 (上下左右)
- [x] 觸控滑動測試
- [x] 不同螢幕尺寸響應式測試
- [x] 遊戲結束邏輯測試
- [x] 勝利畫面顯示測試
- [x] localStorage 儲存測試

---

## 📄 授權

MIT License
