'use strict';
/**
 * 測試環境樁：為 game.js 提供最小瀏覽器環境（DOM / localStorage / 計時器 / 隨機數）
 * 零依賴，僅用 Node 內建功能。game.js 會直接操作這些全域物件。
 */

function makeEl() {
    const cls = new Set();
    const attrs = {};
    const el = {
        textContent: '',
        dataset: {},
        style: {},
        disabled: false,
        innerHTML: '',
        classList: {
            add: (c) => { cls.add(c); },
            remove: (c) => { cls.delete(c); },
            contains: (c) => cls.has(c),
            toggle: (c, force) => {
                if (force === undefined) { cls.has(c) ? cls.delete(c) : cls.add(c); }
                else if (force) cls.add(c);
                else cls.delete(c);
            },
        },
        setAttribute: (k, v) => { attrs[k] = String(v); },
        getAttribute: (k) => (k in attrs ? attrs[k] : null),
        addEventListener: () => {},
        remove: () => {},
        appendChild: () => {},
        querySelectorAll: () => [],
    };
    Object.defineProperty(el, 'className', {
        get() { return [...cls].join(' '); },
        set(v) {
            cls.clear();
            String(v).split(/\s+/).filter(Boolean).forEach((c) => cls.add(c));
        },
        configurable: true,
    });
    el._attrs = attrs;
    return el;
}

// 待執行的計時器回呼（取代真實 setTimeout，讓測試完全同步、可決定性 flush）
const timers = [];
// Math.random  mock 佇列，取完則回傳 0
let randQueue = [];

function install() {
    const els = {};
    const store = {};

    globalThis.localStorage = {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    };

    globalThis.window = globalThis;
    globalThis.addEventListener = () => {};
    globalThis.document = {
        getElementById: (id) => (els[id] || (els[id] = makeEl())),
        querySelector: () => ({ offsetWidth: 360 }),
        querySelectorAll: () => [],
        createElement: () => makeEl(),
        addEventListener: () => {},
        documentElement: makeEl(),
    };

    globalThis.setTimeout = (fn) => { timers.push(fn); return timers.length; };
    globalThis.clearTimeout = () => {};
    globalThis.setInterval = () => 0;
    globalThis.clearInterval = () => {};
    globalThis.Math.random = () => (randQueue.length > 0 ? randQueue.shift() : 0);

    return { els, store };
}

/** 清掉 DOM 快取與待執行計時器，確保案例間隔離 */
function resetDom(ctx) {
    Object.keys(ctx.els).forEach((k) => delete ctx.els[k]);
    timers.length = 0;
    randQueue = [];
    ctx.store && Object.keys(ctx.store).forEach((k) => delete ctx.store[k]);
}

/** 執行所有待執行的計時器回呼（模擬 200ms 動畫延遲後的邏輯） */
function runTimers() {
    const q = timers.splice(0, timers.length);
    q.forEach((fn) => fn());
}

/** 設定接下來 Math.random() 的回傳序列 */
function setRandom(values) {
    randQueue = [...values];
}

module.exports = { makeEl, install, resetDom, runTimers, setRandom };
