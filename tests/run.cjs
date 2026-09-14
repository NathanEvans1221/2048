'use strict';
/**
 * 2048 單元測試（零依賴 Node runner）
 *
 * 執行方式：node tests/run.cjs
 * 通過條件：全部案例 PASS 且 exit code 為 0；任一失敗即印出訊息並以 exit code 1 結束。
 */
const fs = require('fs');
const path = require('path');
const stub = require('./stub.cjs');

const ctx = stub.install();

// 載入 game.js 並取出 Game2048 類別（game.js 尾端會自行 new 一個實例，不影響測試）
const src = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
eval(src + '\n;globalThis.__Game2048 = Game2048;');

let passCount = 0;
let failCount = 0;
const failures = [];

function test(name, fn) {
    try {
        fn();
        passCount++;
        console.log(`PASS: ${name}`);
    } catch (e) {
        failCount++;
        failures.push(name);
        console.error(`FAIL: ${name}\n      ${e.message}`);
    }
}

function eq(actual, expected, msg) {
    if (actual !== expected) {
        throw new Error(`${msg}（預期 ${expected}，實際 ${actual}）`);
    }
}

/** 建立全新遊戲實例（DOM 與計時器已隔離重置） */
function freshGame() {
    stub.resetDom(ctx);
    return new globalThis.__Game2048();
}

/** 用 createTile 擺出指定盤面，matrix 為 4x4（null 表空格） */
function setGrid(game, matrix) {
    game.clearTiles();
    game.grid = Array(4).fill().map(() => Array(4).fill(null));
    game.score = 0;
    game.history = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (matrix[r][c] !== null) game.createTile(r, c, matrix[r][c]);
        }
    }
}

/** 讀取盤面為純值矩陣 */
function gridValues(game) {
    return game.grid.map((row) => row.map((cell) => (cell ? cell.value : null)));
}

function eqGrid(game, expected, msg) {
    eq(JSON.stringify(gridValues(game)), JSON.stringify(expected), msg);
}

const EMPTY = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
];

// ---------- 移動與合併 ----------
test('左移合併 2+2=4，分數+4', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    g.move('left');
    eqGrid(g, [[4, null, null, null], ...EMPTY.slice(1)], '盤面');
    eq(g.score, 4, '分數');
    eq(g.history.length, 1, '有效移動入歷史');
});

test('右移合併靠右', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    g.move('right');
    eqGrid(g, [[null, null, null, 4], ...EMPTY.slice(1)], '盤面');
});

test('上移合併', () => {
    const g = freshGame();
    setGrid(g, [[2, null, null, null], [2, null, null, null], ...EMPTY.slice(2)]);
    g.move('up');
    eqGrid(g, [[4, null, null, null], ...EMPTY.slice(1)], '盤面');
});

test('下移合併', () => {
    const g = freshGame();
    setGrid(g, [[2, null, null, null], [2, null, null, null], ...EMPTY.slice(2)]);
    g.move('down');
    const v = gridValues(g);
    eq(v[3][0], 4, '底部為 4');
    eq(v[0][0], null, '頂部清空');
});

test('同行三張相同只合併一次（[2,2,2]→[4,2]）', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, 2, null], ...EMPTY.slice(1)]);
    g.move('left');
    eqGrid(g, [[4, 2, null, null], ...EMPTY.slice(1)], '盤面');
    eq(g.score, 4, '分數只加一次');
});

test('無效移動不改變盤面且不入歷史', () => {
    const g = freshGame();
    setGrid(g, [[2, null, null, null], ...EMPTY.slice(1)]);
    g.move('left');
    eqGrid(g, [[2, null, null, null], ...EMPTY.slice(1)], '盤面不變');
    eq(g.history.length, 0, '歷史為空');
});

test('移動後計時器補上一張新 tile', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    g.move('left');
    stub.setRandom([0, 0]); // 選第一個空格、值為 2
    stub.runTimers();
    const count = g.grid.flat().filter((c) => c !== null).length;
    eq(count, 2, '合併剩 1 張＋新增 1 張＝2 張');
});

// ---------- 悔棋 ----------
test('undo 還原合併前盤面與分數', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    g.move('left');
    g.undo();
    eqGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)], '盤面還原');
    eq(g.score, 0, '分數歸零');
    eq(g.history.length, 0, '歷史清空');
});

test('無歷史時 undo 無作用且不拋錯', () => {
    const g = freshGame();
    setGrid(g, [[2, null, null, null], ...EMPTY.slice(1)]);
    g.undo();
    eqGrid(g, [[2, null, null, null], ...EMPTY.slice(1)], '盤面不變');
});

test('連續兩步 undo 回到起點', () => {
    const g = freshGame();
    setGrid(g, [[2, null, null, null], [2, null, null, null], ...EMPTY.slice(2)]);
    g.move('up'); // (0,0)=4
    eq(gridValues(g)[0][0], 4, '第一步合併');
    g.createTile(3, 3, 8); // 模擬補上的新 tile（避開隨機）
    g.move('left');
    g.undo();
    eq(g.history.length, 1, '退一步剩一筆');
    g.undo();
    eqGrid(g, [[2, null, null, null], [2, null, null, null], ...EMPTY.slice(2)], '回到起點');
    eq(g.score, 0, '分數歸零');
});

test('歷史紀錄上限 10 筆', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    for (let i = 0; i < 12; i++) g.saveHistory();
    eq(g.history.length, 10, '歷史長度');
});

// ---------- 結束與獲勝判定 ----------
test('空盤未結束', () => {
    const g = freshGame();
    setGrid(g, EMPTY.map((r) => [...r]));
    eq(g.isGameOver(), false, 'isGameOver');
});

test('滿盤且無可合併則結束', () => {
    const g = freshGame();
    setGrid(g, [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
    ]);
    eq(g.isGameOver(), true, 'isGameOver');
});

test('滿盤但有可合併則未結束', () => {
    const g = freshGame();
    setGrid(g, [
        [2, 2, 4, 8],
        [16, 32, 64, 128],
        [256, 512, 1024, 2],
        [4, 8, 16, 32],
    ]);
    eq(g.isGameOver(), false, 'isGameOver');
});

test('合出 2048 觸發獲勝', () => {
    const g = freshGame();
    setGrid(g, [[1024, 1024, null, null], ...EMPTY.slice(1)]);
    g.move('left');
    eq(gridValues(g)[0][0], 2048, '合出 2048');
    eq(g.won, true, 'won 旗標');
    eq(ctx.els['win-display'].classList.contains('active'), true, '勝利遮罩顯示');
});

// ---------- AI 評估 ----------
test('evaluateMove 有效方向可走、死局不可走', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    eq(g.evaluateMove('left').canMove, true, 'left 可走');
    const dead = freshGame();
    dead.clearTiles();
    dead.grid = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
    ].map((row) => row.map((v) => ({ value: v, id: 0, element: stub.makeEl() })));
    for (const dir of ['up', 'down', 'left', 'right']) {
        eq(dead.evaluateMove(dir).canMove, false, `${dir} 不可走`);
    }
});

// ---------- 分數與主題 ----------
test('bestScore 寫入 localStorage，新實例可讀取', () => {
    const g = freshGame();
    setGrid(g, [[2, 2, null, null], ...EMPTY.slice(1)]);
    g.move('left'); // score=4 → bestScore=4
    eq(ctx.store['bestScore'], '4', 'localStorage bestScore');
    const g2 = new globalThis.__Game2048();
    eq(g2.bestScore, 4, '新實例讀取 bestScore');
});

test('超大數值使用 super 樣式', () => {
    const g = freshGame();
    const tile = g.createTile(0, 0, 4096);
    eq(tile.className.includes('tile-super'), true, 'tile-super class');
});

test('主題切換寫入 localStorage 並更新 data-theme', () => {
    const g = freshGame();
    const before = g.theme;
    g.toggleTheme();
    eq(g.theme !== before, true, '主題已切換');
    eq(ctx.store['theme'], g.theme, 'localStorage theme');
    eq(document.documentElement.getAttribute('data-theme'), g.theme, 'data-theme');
});

// ---------- 總結 ----------
console.log(`\n共 ${passCount + failCount} 項：通過 ${passCount}，失敗 ${failCount}`);
if (failCount > 0) {
    console.error('失敗案例：' + failures.join('、'));
    process.exit(1);
}
