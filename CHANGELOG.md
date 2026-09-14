# 變更日誌

本檔案格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
內容統一使用繁體中文。

## [Unreleased]

### 新增

- 單元測試正式化：`tests/`（零依賴 Node runner，`node tests/run.cjs`），27 項案例覆蓋移動合併、悔棋、結束判定、獲勝與繼續、AI 自動玩啟停、combo、addRandomTile、init、分數與主題音效。

### 修正

- 悔棋語意修正：`move()` 改為在變更前保存快照，否則存到的是移動後狀態，悔棋無法真正還原上一步。附 Node 迴歸測試（13 項全通過，舊版可重現失敗）。

## [1.2.0] - 2026-03-01

### 新增

- 標題顯示版本號。
- 背景音樂與事件音效（Web Audio API），含音效開關。
- AI 自動玩按鈕（單步評估：合併得分＋空格加權）。
- 五項功能：滑動方向指示、音效 feedback、連續合併 combo 顯示、歷史紀錄/悔棋、深色/淺色主題切換。
- 手機 RWD 與觸控滑動操作。

### 修正

- AI 無有效移動時顯示遊戲結束。
- AI 移動可行性判斷（`canMove` 偵測）。
- `AudioContext` 錯誤處理與使用者互動後才啟用音效。
- `tile-new` / `tile-merged` 動畫問題。

### 部署

- 新增 Cloudflare Workers 設定（`wrangler.jsonc`），DEMO 上線。

## [1.0.0] - 2026-02-26

### 新增

- 初始 2048 遊戲：核心玩法邏輯（`game.js`）、主頁面（`index.html`）、樣式與動畫（`style.css`）。
- 經典木質色調 UI，數字方塊顏色漸變（2→2048），合併灑花效果。
- 鍵盤方向鍵操作、分數與最高分（`localStorage`）、遊戲結束偵測與重新開始。
