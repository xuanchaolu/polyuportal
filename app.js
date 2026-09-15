/* ============================================================
   PolyU Portal — app.js
   左侧层级导航 + 右侧内嵌网页 + 一键收起侧栏
   ============================================================ */

/* ---------------------------- 数据 ---------------------------- */
/* kind: canvas | learn | polyu | apply | web   */

const DEFAULT_NAV = [
  {
    id: 'ama',
    title: 'AMA Subjects',
    items: [
      { id: 'ama3640', code: 'AMA3640', sub: 'Canvas · 课程页', kind: 'canvas', frame: 'no',
        url: 'https://canvas.polyu.edu.hk/courses/3825' },
      { id: 'ama4650', code: 'AMA4650', sub: 'Learn@PolyU · Outline', kind: 'learn', frame: 'no',
        url: 'https://learn.polyu.edu.hk/ultra/courses/_133560_1/cl/outline' },
      { id: 'ama4680', code: 'AMA4680', sub: 'Learn@PolyU · Outline', kind: 'learn', frame: 'no',
        url: 'https://learn.polyu.edu.hk/ultra/courses/_133561_1/cl/outline' }
    ]
  },
  {
    id: 'other',
    title: 'Other Subjects',
    items: [
      { id: 'clc3211p', code: 'CLC3211P', sub: 'Learn@PolyU · Outline', kind: 'learn', frame: 'no',
        url: 'https://learn.polyu.edu.hk/ultra/courses/_134794_1/cl/outline' },
      { id: 'comp4431', code: 'COMP4431', sub: 'Canvas · 课程页', kind: 'canvas', frame: 'no',
        url: 'https://canvas.polyu.edu.hk/courses/4429' },
      { id: 'engl4022', code: 'ENGL4022', sub: 'Canvas · 课程页', kind: 'canvas', frame: 'no',
        url: 'https://canvas.polyu.edu.hk/courses/4339' }
    ]
  },
  {
    id: 'intern',
    title: 'Internship',
    items: [
      { id: 'datatact', code: 'Datatact', sub: 'Teaching / 工作相关', kind: 'web', frame: 'yes',
        url: 'http://datatact.com/teach.html' }
    ]
  },
  {
    id: 'msc',
    title: 'MSc Application',
    items: [
      { id: 'hku', code: 'HKU', sub: 'TOLA 申请系统', kind: 'apply', frame: 'yes',
        url: 'https://sweb.hku.hk/tola/servlet/CreateUserScreen/loginForm' },
      { id: 'hkust', code: 'HKUST', sub: '研究生申请系统', kind: 'apply', frame: 'no',
        url: 'https://w5.ab.ust.hk/cgi-bin/std_nem_cgi.sh/WService=broker_7p_p/prg/pg_ap_main.r' },
      { id: 'cuhk', code: 'CUHK', sub: 'Graduate School 在线申请', kind: 'apply', frame: 'yes',
        url: 'https://www.gradsch.cuhk.edu.hk/onlineapp/login_email.aspx' },
      { id: 'polyu-app', code: 'PolyU', sub: 'eAdmission 申请入口', kind: 'apply', frame: 'no',
        url: 'https://www38.polyu.edu.hk/eAdmission/index.do' },
      { id: 'cityu', code: 'CityU', sub: '网上入学申请', kind: 'apply', frame: 'no',
        url: 'https://banweb.cityu.edu.hk/pls/PROD/hwskalog_cityu.P_DispLoginNon' },
      { id: 'unimelb', code: 'Unimelb', sub: 'eStudent 申请登录', kind: 'apply', frame: 'yes',
        url: 'https://unimelb-web.t1cloud.com/T1SMDefault/WebApps/eStudent/SM/eApplications/eAppLogin.aspx?r=&f=%23UM.EAP.CI2LOGIN.WEB&fac=undefined&cc=undefined&_gl=1*5zrtki*_gcl_au*NDMzNTA1MzA5LjE3ODg4MDM3OTg.*_ga*NDI0MjEyNTQ1LjE3ODg4MDM3ODI.*_ga_VPL3MMS54G*czE3ODkyOTQ3MDIkbzUkZzAkdDE3ODkyOTQ3MDIkajYwJGwwJGgw' }
    ]
  },
  {
    id: 'ai',
    title: 'AI',
    items: [
      { id: 'deepseek', code: 'Deepseek', sub: 'AI 平台 · 用量/账单', kind: 'ai',
        frame: 'login', url: 'https://platform.deepseek.com/usage' }
    ]
  },
  {
    id: 'polyu',
    title: 'PolyU Links',
    items: [
      { id: 'estudent', code: 'eStudent', sub: '选课 / 成绩 / 学籍', kind: 'polyu', frame: 'no',
        url: 'https://www38.polyu.edu.hk/eStudent/secure/home.jsf' },
      { id: 'poss', code: 'POSS', sub: 'Personal On-line Service System', kind: 'polyu', frame: 'no',
        url: 'https://www40.polyu.edu.hk/poss/secure/login/loginhome.do' },
      { id: 'ibooking', code: 'iBooking', sub: '图书馆研习室预约', kind: 'polyu', frame: 'no',
        url: 'https://www.lib.polyu.edu.hk/services/it-support/ibooking/' },
      { id: 'fo', code: 'FO', sub: 'Faculty of Science 教职员系统', kind: 'polyu', frame: 'no',
        url: 'https://www40.polyu.edu.hk/fosae/' }
    ]
  }
];

/* frame 字段：真实浏览器逐个实测的可嵌入性（headless Chrome 截图判据：
   被拦下的子框架在帧区域内渲染成整片 #dddddd 单色填充，真实页面必有文字像素）
     'no'    = 实测禁止嵌入，右侧只会是灰色空白 → 默认直接用新标签打开
     'yes'   = 实测能正常渲染 → 默认在右侧嵌入显示
     'login' = 登录后才能用的页面，未能实测（被站点风控挡在外面，无法判定禁不禁嵌），
               且 iframe 里拿不到登录态 → 也默认新标签打开，但理由说清楚
   实测结论：13 个禁止嵌入，4 个可嵌入（datatact / HKU / CUHK / Unimelb）      */

/* kind → 配色与角标 */
const KIND = {
  canvas: { short: 'C', label: 'Canvas' },
  learn:  { short: 'L', label: 'Learn@PolyU' },
  polyu:  { short: 'P', label: 'PolyU' },
  apply:  { short: 'A', label: 'Application' },
  ai:     { short: 'D', label: 'AI' },
  web:    { short: 'W', label: 'Website' }
};

/* ---------------------- 数据层：内置默认 + 用户可编辑 ---------------------- */
/* DEFAULT_NAV 是出厂内置；用户在「设置」里增删分组/小项目后存在 state.nav。
   NAV / ALL_ITEMS / BY_ID 是"当前生效"的派生数据，任何改动后调 rebuildIndex() 重算。 */
let NAV = [];
let ALL_ITEMS = [];
let BY_ID = {};

function cloneNav(src) { return JSON.parse(JSON.stringify(src)); }

function rebuildIndex() {
  ALL_ITEMS = NAV.flatMap(g => g.items.map(it => ({ ...it, groupId: g.id, groupTitle: g.title })));
  BY_ID = Object.fromEntries(ALL_ITEMS.map(it => [it.id, it]));
}

/* 用户新建的分组/条目用这种 id，避免和内置的撞上 */
function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* 角标与类型名：内置条目按 kind 取，自定义条目用名称首字母 */
function badgeOf(item) {
  const k = KIND[item.kind];
  if (k) return k.short;
  const m = String(item.code || '?').match(/[A-Za-z0-9]/);
  return m ? m[0].toUpperCase() : '★';
}
function kindLabel(item) {
  return (KIND[item.kind] && KIND[item.kind].label) || '自定义';
}

/* 默认策略（两种环境自动切换，用户不需要管）：
     · 检测到 extension/ 的 Portal Frame Unlocker → 全部页面都在右侧面板打开
     · 没检测到扩展 → 该站本身禁止嵌入的（frame:'no'）、以及登录态进不去的（frame:'login'）
       自动回退成新标签打开，其余留在右侧
   用户手动设过的偏好（state.tabPref）永远优先于上面两档默认。 */

/* ---------------------------- 状态 ---------------------------- */

const LS = 'polyu-portal-v3';
const state = {
  collapsed: false,
  autoCollapse: true,
  theme: 'light',
  width: 306,
  currentId: null,
  closed: {},        // groupId -> true 表示收起
  tabPref: {},       // itemId -> 'tab' | 'embed'，用户手动覆盖默认行为
  recent: [],        // 最近访问的 itemId，新的在前
  nav: null,         // 当前生效的分组/条目（用户可编辑），null = 用内置默认
  query: '',
  back: [],
  fwd: []
};

/* 解锁扩展是否在位（由 extension/mark.js 在 <html> 上写标记，见下方探测） */
let unlockerOn = false;
function unlockerActive() { return unlockerOn; }

/* 打开方式三级判定：
     ① 用户在设置/顶栏里显式设过 → 听用户的
     ② 实测能嵌入的站点（frame:'yes'）→ 一律右侧
     ③ 其余（禁嵌入 / 需登录 / 自定义新条目）→ 装了扩展就右侧，没装就新标签 */
function usesNewTab(item) {
  const pref = state.tabPref[item.id];
  if (pref) return pref === 'tab';
  if (item.frame === 'yes') return false;
  return !unlockerOn;
}

/* 走新标签的原因：用户设定 / 没扩展的自动回退（文案要区分开，不能说错） */
function tabReason(item) {
  if (!usesNewTab(item)) return null;
  return state.tabPref[item.id] === 'tab' ? 'user' : 'fallback';
}

function save() {
  try {
    localStorage.setItem(LS, JSON.stringify({
      collapsed: state.collapsed,
      autoCollapse: state.autoCollapse,
      theme: state.theme,
      width: state.width,
      currentId: state.currentId,
      closed: state.closed,
      tabPref: state.tabPref,
      recent: state.recent,
      nav: state.nav
    }));
  } catch (_) {}
}

function load() {
  try {
    /* v2 -> v3：默认策略从"禁嵌入的跳新标签"改成"全部右侧打开"。
       旧的 tab 偏好是旧策略下的产物，清掉才能让新默认立刻生效；
       旧的 embed 偏好与新默认一致，保留。之后手动设的偏好照常保存。 */
    const v2 = localStorage.getItem('polyu-portal-v2');
    if (v2) {
      const old = JSON.parse(v2) || {};
      const keep = {};
      Object.keys(old.tabPref || {}).forEach(id => { if (old.tabPref[id] === 'embed') keep[id] = 'embed'; });
      const { tabPref, ...rest } = old;
      Object.assign(state, rest, { tabPref: keep });
      localStorage.removeItem('polyu-portal-v2');
      save();
      return;
    }
    /* v1 的 newTab 映射迁移到 v2 的 tabPref */
    const v1 = localStorage.getItem('polyu-portal-v1');
    if (v1) {
      const old = JSON.parse(v1);
      if (old && old.newTab) {
        state.tabPref = {};
        Object.keys(old.newTab).forEach(id => { if (old.newTab[id]) state.tabPref[id] = 'tab'; });
      }
      localStorage.removeItem('polyu-portal-v1');
      const { newTab, ...rest } = old || {};
      Object.assign(state, rest, { tabPref: state.tabPref });
      save();
      return;
    }
    const raw = localStorage.getItem(LS);
    if (!raw) return;
    Object.assign(state, JSON.parse(raw));
  } catch (_) {}
}

/* 启动/每次改动后都要确保：NAV 有内容、索引是最新的 */
function ensureNav() {
  const ok = Array.isArray(state.nav) && state.nav.every(g => g && typeof g.title === 'string' && Array.isArray(g.items));
  NAV = ok ? state.nav : cloneNav(DEFAULT_NAV);
  state.nav = NAV;
  rebuildIndex();
}

/* ---------------------------- DOM ---------------------------- */

const $ = id => document.getElementById(id);

const app        = $('app');
const navEl      = $('nav');
const homeEl     = $('home');
const homeGrid   = $('homeGrid');
const frameWrap  = $('frameWrap');
const frame      = $('frame');
const loadingBar = $('loadingBar');
const blockedHint= $('blockedHint');
const tabOnly    = $('tabOnly');
const toastEl    = $('toast');

let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1900);
}

/* ---------------------------- 渲染：侧栏 ---------------------------- */

function matches(item) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  return (item.code + ' ' + item.sub + ' ' + item.groupTitle + ' ' + item.url)
    .toLowerCase().includes(q);
}

function renderNav() {
  navEl.innerHTML = '';
  let shown = 0;

  NAV.forEach(group => {
    const list = group.items.filter(matches);
    if (!list.length) return;
    shown += list.length;

    const g = document.createElement('div');
    g.className = 'group' + ((state.closed[group.id] && !state.query) ? ' closed' : '');

    const btn = document.createElement('button');
    btn.className = 'group-btn';
    btn.type = 'button';
    btn.innerHTML = `
      <svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      <span>${esc(group.title)}</span>
      <span class="g-count">${list.length}</span>`;
    btn.addEventListener('click', () => {
      state.closed[group.id] = !state.closed[group.id];
      g.classList.toggle('closed', !!state.closed[group.id]);
      save();
    });

    const items = document.createElement('div');
    items.className = 'group-items';

    list.forEach(item => {
      const tabMode = usesNewTab(item);
      const a = document.createElement('div');
      a.className = 'item' + (state.currentId === item.id ? ' active' : '')
                  + (tabMode ? ' tabonly' : '');
      a.dataset.id = item.id;
      /* 说明文字不再占一行，改到 tooltip 里 */
      const reason = tabReason(item);
      a.title = `${item.code} · ${item.sub}\n${item.url}\n` + (reason === 'user'
        ? '↗ 你把这个站点设成了新标签打开（点顶栏胶囊按钮可改回右侧显示）'
        : reason === 'fallback'
          ? '↗ 未检测到解锁扩展，该站暂时用新标签打开（装上 Portal Frame Unlocker 后自动改为右侧显示）'
          : '⊡ 点击后在右侧打开');
      a.innerHTML = `
        <span class="i-badge">${esc(badgeOf(item))}</span>
        <span class="i-text">
          <span class="i-code">${esc(item.code)}</span>
        </span>
        <svg class="i-ext" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.4A1.6 1.6 0 0 1 16.4 20H5.6A1.6 1.6 0 0 1 4 18.4V7.6A1.6 1.6 0 0 1 5.6 6H10"/></svg>`;

      a.addEventListener('click', e => {
        if (e.target.closest('.i-ext')) {
          window.open(item.url, '_blank', 'noopener');
          return;
        }
        openItem(item.id);
      });

      items.appendChild(a);
    });

    g.append(btn, items);
    navEl.appendChild(g);
  });

  if (!shown) {
    navEl.innerHTML = `<div class="nav-empty">没有匹配 “${esc(state.query)}” 的链接<br><code>Esc</code> 清除搜索</div>`;
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------------------- 渲染：首页卡片 ---------------------------- */

function renderHome() {
  homeGrid.innerHTML = '';
  NAV.forEach(group => {
    const card = document.createElement('div');
    card.className = 'home-card';
    card.innerHTML = `
      <div class="hc-head">
        <h3>${esc(group.title)}</h3>
        <span class="hc-n">${group.items.length}</span>
      </div>
      <div class="hc-chips"></div>`;
    const row = card.querySelector('.hc-chips');
    group.items.forEach(item => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.title = item.url;
      b.innerHTML = `<span class="c-av">${esc(badgeOf(item))}</span>${esc(item.code)}`;
      b.addEventListener('click', () => openItem(item.id));
      row.appendChild(b);
    });
    homeGrid.appendChild(card);
  });
  $('linkCount').textContent = ALL_ITEMS.length;
  renderStats();
  renderRecent();
}

/* ---------------------------- 内嵌解锁扩展探测 ---------------------------- */
/* 两条路探测 extension/ 里的 Portal Frame Unlocker：
   ① content script（mark.js）在它 matches 的来源上往 <html> 写 data-frame-unlocker="1"
      —— 同步、最快，但只覆盖 manifest 里列出的来源（本地 / 托管域名）
   ② 兜底：抓扩展的一个 web_accessible_resource。扩展 ID 由 manifest 的 key 字段固定，
      所以 portal 部署到任何域名（Netlify、自己的服务器…）都能探测到。
   扩展没装时②会立刻失败，不会有延迟。 */
const UNLOCKER_ID = 'gafohjaajiehoomiaogehgikedkogjho';   // manifest.key 推导出的固定 ID
const UNLOCKER_PROBE = 'chrome-extension://' + UNLOCKER_ID + '/ping.txt';

async function probeUnlocker() {
  if (document.documentElement.dataset.frameUnlocker === '1') return true;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 1500);
    const r = await fetch(UNLOCKER_PROBE, { cache: 'no-store', signal: ctl.signal });
    clearTimeout(timer);
    return r.ok && (await r.text()).includes('frame-unlocker');
  } catch (_) {
    return false;
  }
}

/* 探测结果只会从"未装"变成"已装"，所以 applyUnlocker 是单向的：
   只负责"打开"，绝不会把已经探测到的结果关掉。
   （踩过的坑：早先这里用双向的 refreshUnlockerState 复查 DOM 标记，
     在托管域名上标记本来就不存在，600ms 后的复查把探针刚探到的结果又按回了未解锁。） */
function applyUnlocker(on) {
  if (!on || unlockerOn) return;
  refreshUnlockerState(true, true);
}

function refreshUnlockerState(force, knownOn) {
  const on = (knownOn !== undefined) ? knownOn
           : document.documentElement.dataset.frameUnlocker === '1';
  if (on === unlockerOn && !force) return;
  unlockerOn = on;
  renderUnlockerPill();
  renderNav();          // 侧栏的「新标签」标记跟着变
  renderStats();        // 统计卡跟着变
  renderRecent();
  if (state.currentId) syncModeBtn(BY_ID[state.currentId], usesNewTab(BY_ID[state.currentId]));
}

function renderUnlockerPill() {
  const pill = $('unlockPill');
  if (!pill) return;
  const on = unlockerActive();
  pill.hidden = false;
  pill.className = 'pill-unlock ' + (on ? 'on' : 'off');
  pill.textContent = on ? '内嵌已解锁' : '内嵌未解锁';
  pill.title = on
    ? '已检测到 Portal Frame Unlocker 扩展：被 X-Frame-Options 拦下的校内站点也能显示在右侧。'
    : '未检测到 Portal Frame Unlocker 扩展：部分站点在右侧会是一片灰色空白。' +
      '把 extension/ 文件夹用「加载解压缩的扩展程序」装进浏览器即可解决。';
}

/* ---------------------------- logo ---------------------------- */
/* 图片能用就显示 logo（隐藏文字版），任何一张加载失败都回落到文字品牌 */
(function initLogo() {
  const imgs = [...document.querySelectorAll('.logo-img')];
  if (!imgs.length) return;
  let loaded = 0;
  imgs.forEach(el => {
    const ok = () => { loaded++; app.classList.add('has-logo'); };
    const fail = () => { app.classList.remove('has-logo'); };
    el.addEventListener('load', ok);
    el.addEventListener('error', fail);
    if (el.complete) (el.naturalWidth > 0 ? ok() : fail());
  });
})();

/* ---------------------------- 主页面：统计 / 最近访问 / 时钟 ---------------------------- */

function renderStats() {
  const tab = ALL_ITEMS.filter(usesNewTab).length;
  const emb = ALL_ITEMS.length - tab;
  const rows = [
    [ALL_ITEMS.length, '个链接'],
    [NAV.length, '个分组'],
    [emb, '个在右侧打开'],
    [tab, '个新标签打开']
  ];
  $('homeStats').innerHTML = rows
    .map(([n, label]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join('');
}

function renderRecent() {
  const list = (state.recent || []).filter(id => BY_ID[id]).slice(0, 8);
  const box = $('homeRecent');
  if (!list.length) { box.hidden = true; return; }
  box.hidden = false;
  const target = $('recentChips');
  target.innerHTML = '';
  list.forEach((id, i) => {
    const item = BY_ID[id];
    const b = document.createElement('button');
    b.className = 'chip recent' + (i === 0 ? ' latest' : '');
    b.type = 'button';
    b.title = item.url;
    b.innerHTML = (i === 0 ? '<span class="c-tag">继续上次</span>' : '') +
      `<span class="c-av">${esc(badgeOf(item))}</span>${esc(item.code)}`;
    b.addEventListener('click', () => openItem(item.id));
    target.appendChild(b);
  });
}

function pushRecent(id) {
  state.recent = [id, ...(state.recent || []).filter(x => x !== id)].slice(0, 8);
}

function greetOf(h) {
  if (h < 5) return '凌晨好，注意休息';
  if (h < 11) return '早上好';
  if (h < 13) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

let clockTimer = null;
function tickClock() {
  const now = new Date();
  const p = n => String(n).padStart(2, '0');
  $('clockTime').textContent = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  $('clockDate').textContent = now.toLocaleDateString('zh-CN',
    { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  $('homeGreet').textContent = greetOf(now.getHours());
}
function startClock() {
  tickClock();
  if (!clockTimer) clockTimer = setInterval(tickClock, 1000);
}

/* ---------------------------- 打开 / 关闭页面 ---------------------------- */

function setActive(id) {
  state.currentId = id;
  navEl.querySelectorAll('.item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });
}

function openItem(id, opts = {}) {
  const item = BY_ID[id];
  if (!item) return;
  const { history = true, autocollapse = true, popup = true, forceEmbed = false } = opts;

  if (history && state.currentId !== id) {
    state.back.push(state.currentId || null);   // null = 首页
    state.fwd.length = 0;
  }

  state.currentId = id;
  setActive(id);
  pushRecent(id);
  renderRecent();

  homeEl.hidden = true;
  frameWrap.hidden = false;

  $('titleCode').textContent = item.code;
  $('titleName').textContent = kindLabel(item) + ' · ' + hostOf(item.url);
  $('titleDot').classList.add('live');
  $('statusUrl').textContent = item.url;

  const openBtn = $('openBtn');
  openBtn.href = item.url;
  openBtn.hidden = false;
  $('reloadBtn').disabled = false;
  $('copyBtn').disabled = false;
  $('toOpen').href = item.url;

  const tabMode = usesNewTab(item) && !forceEmbed;
  const reason = tabMode ? tabReason(item) : null;
  syncModeBtn(item, tabMode, reason);

  if (tabMode) {
    /* 实测禁止嵌入的站点（或用户指定）：不浪费一次必然空白的加载，直接开新标签 */
    tabOnly.hidden = false;
    blockedHint.hidden = true;
    loadingBar.classList.remove('on');
    frame.src = 'about:blank';
    $('statusText').textContent = '已在新标签页打开 · ' + item.code;
    if (reason === 'fallback') {
      /* 没装扩展时的自动回退：说清楚为什么会跳出去，以及怎么变回右侧 */
      $('toTitle').textContent = '没装解锁扩展，这个站点已用新标签打开';
      $('toSub').innerHTML = (item.frame === 'login')
        ? `<code>${esc(hostOf(item.url))}</code> 是登录后才能看的页面，iframe 里拿不到登录态。` +
          `装上 <code>extension/</code> 里的 Portal Frame Unlocker 后会自动改回右侧显示；也可以点「仍在此处嵌入」强行试。`
        : `<code>${esc(hostOf(item.url))}</code> 本身用 X-Frame-Options / CSP 禁止被嵌入，` +
          `没有解锁扩展时右侧只会是灰色空白，所以这里自动回退成新标签。` +
          `装上 <code>extension/</code> 里的 Portal Frame Unlocker 后会自动改回右侧显示。`;
    } else {
      $('toTitle').textContent = '已按你的设置用新标签打开';
      if (item.frame === 'no') {
        $('toSub').innerHTML = `<code>${esc(hostOf(item.url))}</code> 本身禁止被嵌入，是你把它设成了新标签打开。` +
          `点「仍在此处嵌入」可以在右侧显示（需已装解锁扩展）。`;
      } else if (item.frame === 'login') {
        $('toSub').innerHTML = `<code>${esc(hostOf(item.url))}</code> 是登录后才能看的页面，` +
          `嵌在右侧时浏览器可能拦掉第三方 Cookie。想试试的话点「仍在此处嵌入」。`;
      } else {
        $('toSub').innerHTML = `<code>${esc(hostOf(item.url))}</code> 本身可以嵌入显示，是你把它设成了新标签打开。`;
      }
    }
    if (popup) {
      const w = window.open(item.url, '_blank', 'noopener');
      if (!w) toast('浏览器拦截了弹窗，请点右侧「再打开一次」');
    }
  } else {
    tabOnly.hidden = true;
    /* 装了扩展就一切正常，不打扰；没装且该站实测禁嵌时才给出可操作的提示 */
    blockedHint.hidden = (item.frame === 'yes' || unlockerActive()) ? true : hintDismissed();
    $('bhReason').innerHTML = (item.frame === 'no')
      ? `右侧如果是灰色空白，是因为 <code>${hostOf(item.url)}</code> 用 X-Frame-Options / CSP 禁止被嵌入。` +
        `装上 <code>extension/</code> 里的 Portal Frame Unlocker 就能正常显示，或直接点右边按钮开新标签。`
      : `若右侧空白，多半是该站设置了 <code>X-Frame-Options</code> 或限制第三方 Cookie，用右侧按钮开新标签即可。`;
    $('statusText').textContent = '正在加载 · ' + item.code;
    loadingBar.classList.add('on');
    frame.src = item.url;
  }

  syncArrows();
  save();

  if (autocollapse && state.autoCollapse && !state.collapsed) setCollapsed(true);
}

/* 顶栏「新标签 / 嵌入」切换按钮 */
function syncModeBtn(item, tabMode, reason) {
  const b = $('modeBtn');
  b.hidden = false;
  b.classList.toggle('on', !!tabMode);
  $('modeLabel').textContent = tabMode ? '新标签' : '嵌入';
  /* 模式胶囊表示「当前设置」，右侧主按钮表示「现在要做的动作」，避免两者文案重复 */
  $('openBtnLabel').textContent = tabMode ? '再打开一次' : '新标签打开';
  b.title = !tabMode
    ? '当前：右侧嵌入显示 — 点一下改成新标签打开'
    : (reason === 'fallback'
        ? '当前：新标签打开（未检测到解锁扩展，自动回退）— 点一下强行在右侧嵌入'
        : '当前：新标签打开（你的设置）— 点一下改回在右侧嵌入');
}

function toggleMode() {
  const item = BY_ID[state.currentId];
  if (!item) return;
  const next = usesNewTab(item) ? 'embed' : 'tab';
  state.tabPref[item.id] = next;
  save();
  renderNav();
  openItem(item.id, { history: false, popup: false, autocollapse: false, forceEmbed: next === 'embed' });
  toast(next === 'tab'
    ? item.code + ' 以后用新标签打开'
    : item.code + ' 以后在右侧嵌入显示');
}

/* 设置某个站点的打开方式 */
function setTabPref(id, mode) {
  state.tabPref[id] = mode;
  save();
  renderNav();
  if (id === state.currentId) {
    const it = BY_ID[id];
    syncModeBtn(it, usesNewTab(it), tabReason(it));
  }
}

function hintDismissed() {
  try { return !!sessionStorage.getItem('pp-hint-off'); } catch (_) { return false; }
}

function hostOf(url) {
  try { return new URL(url).host; } catch (_) { return url; }
}

function reloadFrame() {
  const item = BY_ID[state.currentId];
  if (!item) { toast('当前在首页'); return; }
  if (usesNewTab(item)) {
    window.open(item.url, '_blank', 'noopener');
    return;
  }
  loadingBar.classList.add('on');
  frame.src = 'about:blank';
  requestAnimationFrame(() => { frame.src = item.url; });
}

function goHome(opts = {}) {
  const { history = true } = opts;
  if (history && state.currentId) {
    state.back.push(state.currentId);
    state.fwd.length = 0;
  }
  state.currentId = null;
  setActive(null);

  homeEl.hidden = false;
  frameWrap.hidden = true;
  frame.src = 'about:blank';
  blockedHint.hidden = true;
  tabOnly.hidden = true;

  $('titleCode').textContent = '首页';
  $('titleName').textContent = '全部链接总览';
  $('titleDot').classList.remove('live');
  $('statusUrl').textContent = '';
  $('statusText').textContent = '就绪';
  $('openBtn').hidden = true;
  $('modeBtn').hidden = true;
  renderStats();
  renderRecent();
  startClock();
  $('reloadBtn').disabled = true;
  $('copyBtn').disabled = true;

  syncArrows();
  save();
}

function syncArrows() {
  $('backBtn').disabled = state.back.length === 0;
  $('fwdBtn').disabled = state.fwd.length === 0;
}

function goBack() {
  if (!state.back.length) return;
  const prev = state.back.pop();
  if (state.currentId) state.fwd.push(state.currentId);
  prev ? openItem(prev, { history: false }) : goHome({ history: false });
  syncArrows();
}

function goFwd() {
  if (!state.fwd.length) return;
  const next = state.fwd.pop();
  if (state.currentId) state.back.push(state.currentId);
  next ? openItem(next, { history: false }) : goHome({ history: false });
  syncArrows();
}

/* ---------------------------- 侧栏收起 ---------------------------- */

function setCollapsed(v) {
  state.collapsed = !!v;
  app.classList.toggle('collapsed', state.collapsed);
  $('collapseBtn').title = '收起侧栏 ( [ )';
  $('railToggle').title = '展开侧栏 ( [ )';
  save();
}

function toggleCollapsed() { setCollapsed(!state.collapsed); }

/* ---------------------------- 主题 ---------------------------- */

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  $('themeLabel').textContent = state.theme === 'dark' ? '浅色模式' : '深色模式';
}

/* ---------------------------- 事件绑定 ---------------------------- */

$('homeBtn').addEventListener('click', () => goHome());
$('brandHome').addEventListener('click', () => goHome());
$('brandHome').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); }
});
$('clearRecent').addEventListener('click', () => {
  state.recent = [];
  save();
  renderRecent();
  toast('已清空最近访问');
});
$('collapseBtn').addEventListener('click', () => setCollapsed(true));
$('railToggle').addEventListener('click', () => setCollapsed(false));
$('backBtn').addEventListener('click', goBack);
$('fwdBtn').addEventListener('click', goFwd);

$('reloadBtn').addEventListener('click', reloadFrame);

$('copyBtn').addEventListener('click', async () => {
  const item = BY_ID[state.currentId];
  if (!item) return;
  try {
    await navigator.clipboard.writeText(item.url);
    toast('网址已复制');
  } catch (_) {
    toast(item.url);
  }
});

const fullBtn = $('fullBtn');
fullBtn.addEventListener('click', () => {
  app.classList.toggle('zen');
  toast(app.classList.contains('zen') ? '已进入专注模式 · 再按 F 退出' : '已退出专注模式');
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) app.classList.remove('zen');
});

$('bhOpen').addEventListener('click', () => {
  const item = BY_ID[state.currentId];
  if (item) window.open(item.url, '_blank', 'noopener');
});

$('bhRemember').addEventListener('click', () => {
  const item = BY_ID[state.currentId];
  if (!item) return;
  setTabPref(item.id, 'tab');
  blockedHint.hidden = true;
  tabOnly.hidden = false;
  frame.src = 'about:blank';
  loadingBar.classList.remove('on');
  $('statusText').textContent = '已在新标签页打开 · ' + item.code;
  $('toTitle').textContent = '已按你的设置用新标签打开';
  $('toSub').textContent = '这个站点本身可以嵌入，是你把它设成了新标签打开。';
  toast(item.code + ' 以后直接新标签打开');
});

$('toEmbed').addEventListener('click', () => {
  const item = BY_ID[state.currentId];
  if (!item) return;
  setTabPref(item.id, 'embed');
  openItem(item.id, { history: false, popup: false, forceEmbed: true, autocollapse: false });
  toast(item.code + ' 改回在右侧嵌入');
});

$('modeBtn').addEventListener('click', toggleMode);

$('toOpen').addEventListener('click', () => {
  const item = BY_ID[state.currentId];
  if (item) toast('已在新标签打开 ' + item.code);
});

$('bhClose').addEventListener('click', () => {
  blockedHint.hidden = true;
  try { sessionStorage.setItem('pp-hint-off', '1'); } catch (_) {}
});

$('search').addEventListener('input', e => {
  state.query = e.target.value.trim();
  $('searchClear').hidden = !state.query;
  renderNav();
});
$('searchClear').addEventListener('click', () => {
  $('search').value = '';
  state.query = '';
  $('searchClear').hidden = true;
  renderNav();
  $('search').focus();
});

$('autoCollapse').addEventListener('change', e => {
  state.autoCollapse = e.target.checked;
  save();
});

$('themeBtn').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  save();
});

/* iframe 载入状态（跨域页面无法读取内容，仅用于进度条与状态文案） */
frame.addEventListener('load', () => {
  loadingBar.classList.remove('on');
  if (!tabOnly.hidden) return;
  const item = BY_ID[state.currentId];
  if (item) $('statusText').textContent = '已加载 · ' + item.code + ' · ' + kindLabel(item);
});
setTimeout(() => {
  if (!frameWrap.hidden) loadingBar.classList.remove('on');
}, 6000);

/* 拖动分栏 */
(function initResizer() {
  const rz = $('resizer');
  let dragging = false;
  const clamp = w => Math.max(210, Math.min(560, w));

  rz.addEventListener('pointerdown', e => {
    dragging = true;
    rz.classList.add('dragging');
    rz.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  rz.addEventListener('pointermove', e => {
    if (!dragging) return;
    const w = clamp(e.clientX);
    state.width = w;
    document.documentElement.style.setProperty('--sb-w', w + 'px');
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    rz.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    save();
  };
  rz.addEventListener('pointerup', end);
  rz.addEventListener('pointercancel', end);
})();

/* 键盘快捷键 */
document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);

  if (e.key === 'Escape') {
    if (typing) {
      document.activeElement.value = '';
      state.query = '';
      $('searchClear').hidden = true;
      renderNav();
      document.activeElement.blur();
    } else if (document.activeElement === document.body) {
      state.query = ''; $('search').value = ''; renderNav();
    }
    return;
  }

  if (typing) return;

  if (e.key === '[' || (e.key.toLowerCase() === 'b' && (e.metaKey || e.ctrlKey))) {
    e.preventDefault();
    toggleCollapsed();
  } else if (e.key === '/') {
    e.preventDefault();
    if (state.collapsed) setCollapsed(false);
    $('search').focus();
  } else if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    goHome();
  } else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    fullBtn.click();
  } else if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
    if (state.currentId) { e.preventDefault(); $('reloadBtn').click(); }
  } else if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault(); goBack();
  } else if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault(); goFwd();
  }
});

/* ---------------------------- 启动 ---------------------------- */


/* ============================================================
   设置：分组与小项目的增删改
   ============================================================ */

/* 表单状态：{ type:'item'|'group', mode:'new'|'edit', targetId, groupId } */
let setForm = null;
let setPending = null;     // 待确认的删除 { type, id }

function openSettings() {
  setForm = null;
  setPending = null;
  $('settingsModal').hidden = false;
  document.body.classList.add('modal-open');
  renderSettings();
}

function closeSettings() {
  $('settingsModal').hidden = true;
  document.body.classList.remove('modal-open');
  setForm = null;
  setPending = null;
}

/* 每次改动后统一收尾：重建索引、刷新所有视图、落盘 */
function commitNav() {
  state.nav = NAV;
  rebuildIndex();
  save();
  renderNav();
  renderHome();
  renderStats();
  renderRecent();
  /* 当前正在看的条目被删掉 → 回主页面 */
  if (state.currentId && !BY_ID[state.currentId]) goHome({ history: false });
  if (!$('settingsModal').hidden) renderSettings();
}

function findGroup(id) { return NAV.find(g => g.id === id); }
/* BY_ID 里存的是副本（带了 groupId 等派生字段），改内容必须动 NAV 里的真身 */
function findItem(id) {
  for (const g of NAV) {
    const it = g.items.find(x => x.id === id);
    if (it) return { group: g, item: it };
  }
  return null;
}

function moveInArray(arr, from, to) {
  if (to < 0 || to >= arr.length) return false;
  const [x] = arr.splice(from, 1);
  arr.splice(to, 0, x);
  return true;
}

/* ---------------------------- 渲染设置列表 ---------------------------- */

function renderSettings() {
  const list = $('setList');
  list.innerHTML = '';
  $('setEmpty').hidden = NAV.length > 0;

  /* 删除确认条 */
  const bar = $('setConfirm');
  if (setPending) {
    bar.hidden = false;
    const name = setPending.type === 'group'
      ? (findGroup(setPending.id) || {}).title
      : ((BY_ID[setPending.id] || {}).code);
    bar.innerHTML = `确定删除「${esc(name || '')}」${setPending.type === 'group' ? '及其下所有小项目' : ''}？` +
      `<button class="btn-danger" id="cfmYes">确定删除</button><button class="ghost-btn" id="cfmNo">取消</button>`;
    bar.querySelector('#cfmYes').addEventListener('click', doDelete);
    bar.querySelector('#cfmNo').addEventListener('click', () => { setPending = null; renderSettings(); });
  } else {
    bar.hidden = true;
    bar.innerHTML = '';
  }

  NAV.forEach((group, gi) => {
    const box = document.createElement('div');
    box.className = 'set-group';

    const head = document.createElement('div');
    head.className = 'set-group-head';
    head.innerHTML = `
      <span class="sg-title">${esc(group.title)}</span>
      <span class="sg-count">${group.items.length} 项</span>
      <span class="sg-actions"></span>`;
    const acts = head.querySelector('.sg-actions');
    acts.append(
      mkSmall('↑', '上移分组', () => { if (moveInArray(NAV, gi, gi - 1)) commitNav(); }, gi === 0),
      mkSmall('↓', '下移分组', () => { if (moveInArray(NAV, gi, gi + 1)) commitNav(); }, gi === NAV.length - 1),
      mkSmall('改名', '重命名分组', () => openForm('group', 'edit', group.id)),
      mkSmall('＋项目', '在这个分组里新建小项目', () => openForm('item', 'new', null, group.id)),
      mkSmall('删除', '删除这个分组', () => { setPending = { type: 'group', id: group.id }; setForm = null; renderSettings(); }, false, 'danger')
    );
    box.appendChild(head);

    if (!group.items.length) {
      const e = document.createElement('div');
      e.className = 'set-none';
      e.textContent = '（这个分组还没有小项目）';
      box.appendChild(e);
    }

    group.items.forEach((item, ii) => {
      const row = document.createElement('div');
      row.className = 'set-item';
      const badge = badgeOf(item);
      const mode = state.tabPref[item.id] || 'auto';
      const modeText = { auto: '自动', embed: '右侧嵌入', tab: '新标签' }[mode];
      row.innerHTML = `
        <span class="i-badge">${esc(badge)}</span>
        <span class="si-main">
          <span class="si-name">${esc(item.code)}</span>
          <span class="si-url">${esc(item.url)}</span>
        </span>
        <span class="si-mode si-${mode}">${modeText}</span>
        <span class="si-actions"></span>`;
      const a = row.querySelector('.si-actions');
      a.append(
        mkSmall('↑', '上移', () => { if (moveInArray(group.items, ii, ii - 1)) commitNav(); }, ii === 0),
        mkSmall('↓', '下移', () => { if (moveInArray(group.items, ii, ii + 1)) commitNav(); }, ii === group.items.length - 1),
        mkSmall('编辑', '编辑这一项', () => openForm('item', 'edit', item.id)),
        mkSmall('删除', '删除这一项', () => { setPending = { type: 'item', id: item.id }; setForm = null; renderSettings(); }, false, 'danger')
      );
      box.appendChild(row);
    });

    list.appendChild(box);
  });
}

function mkSmall(text, title, fn, disabled, cls) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'mini-btn' + (cls ? ' ' + cls : '');
  b.textContent = text;
  b.title = title;
  b.disabled = !!disabled;
  b.addEventListener('click', fn);
  return b;
}

/* ---------------------------- 新建 / 编辑表单 ---------------------------- */

function openForm(type, mode, targetId, groupId) {
  setPending = null;
  let item = null, group = null;
  if (type === 'item' && mode === 'edit') {
    item = BY_ID[targetId];
    groupId = item ? item.groupId : (NAV[0] && NAV[0].id);
  }
  if (type === 'group' && mode === 'edit') group = findGroup(targetId);
  if (type === 'item' && mode === 'new') groupId = groupId || (NAV[0] && NAV[0].id);
  setForm = { type, mode, targetId, groupId };
  renderSettings();
  $('setForm').hidden = false;
  $('formTitle').textContent = (mode === 'edit' ? '编辑' : '新建') + (type === 'group' ? '分组' : '小项目');
  $('rowSub').hidden = type !== 'item';
  $('rowGroup').hidden = type !== 'item';
  $('rowMode').hidden = type !== 'item';
  $('rowUrl').hidden = type !== 'item';
  $('fName').value = type === 'group' ? (group ? group.title : '') : (item ? item.code : '');
  $('fUrl').value = item ? item.url : '';
  $('fSub').value = item ? (item.sub || '') : '';
  /* 所属分组下拉 */
  const sel = $('fGroup');
  sel.innerHTML = NAV.map(g => `<option value="${esc(g.id)}">${esc(g.title)}</option>`).join('');
  if (groupId) sel.value = groupId;
  /* 打开方式 */
  const cur = (type === 'item' && item && state.tabPref[item.id]) || 'auto';
  document.querySelectorAll('input[name="fMode"]').forEach(r => { r.checked = (r.value === cur); });
  $('formError').hidden = true;
  $('fName').focus();
}

function closeForm() {
  setForm = null;
  $('setForm').hidden = true;
  renderSettings();
}

/* 网址规范化 + 校验：只允许 http/https，没写协议就补 https:// */
function normalizeUrl(raw) {
  let v = String(raw || '').trim();
  if (!v) return { error: '请填写网址' };
  if (/\s/.test(v)) return { error: '网址里不能有空格' };
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) v = 'https://' + v;
  let u;
  try { u = new URL(v); } catch (_) { return { error: '网址格式不对，例：https://example.com/page' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { error: '只支持 http / https 网址' };
  }
  /* URL() 会把乱七八糟的输入"修"成形如 xn--%20-xxx 的域名，所以域名要自己再校验一遍 */
  const host = u.hostname;
  const okHost =
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host) ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host === 'localhost';
  if (!okHost) return { error: '域名看起来不对，例：https://example.com/page' };
  return { url: u.toString() };
}

function saveForm() {
  if (!setForm) return;
  const err = $('formError');
  err.hidden = true;
  err.textContent = '';
  const name = $('fName').value.trim();
  if (!name) { err.textContent = '请填写名称'; err.hidden = false; return; }

  if (setForm.type === 'group') {
    if (setForm.mode === 'edit') {
      const g = findGroup(setForm.targetId);
      if (g) g.title = name;
    } else {
      NAV.push({ id: uid('g'), title: name, items: [] });
      const fresh = NAV[NAV.length - 1];
      closeForm();
      commitNav();
      toast('分组已创建，接着加第一个小项目');
      openForm('item', 'new', null, fresh.id);
      return;
    }
    closeForm();
    commitNav();
    return;
  }

  const got = normalizeUrl($('fUrl').value);
  if (got.error) { err.textContent = got.error; err.hidden = false; return; }
  const sub = $('fSub').value.trim();
  const mode = (document.querySelector('input[name="fMode"]:checked') || {}).value || 'auto';
  let targetId;

  if (setForm.mode === 'edit') {
    const found = findItem(setForm.targetId);
    if (!found) { closeForm(); return; }
    const real = found.item;
    real.code = name;
    real.sub = sub;
    real.url = got.url;
    targetId = real.id;
    /* 换分组：从原组摘出来，放进目标组 */
    const sel = $('fGroup').value;
    if (sel && sel !== found.group.id) {
      const to = findGroup(sel);
      if (to) {
        found.group.items = found.group.items.filter(x => x.id !== real.id);
        to.items.push(real);
      }
    }
  } else {
    const g = findGroup($('fGroup').value || setForm.groupId) || NAV[0];
    if (!g) { err.textContent = '请先新建一个分组'; err.hidden = false; return; }
    const fresh = { id: uid('i'), code: name, sub, kind: 'custom', url: got.url };
    g.items.push(fresh);
    targetId = fresh.id;
  }

  /* 打开方式写进 tabPref（和顶栏胶囊按钮共用同一份设置） */
  if (targetId) {
    if (mode === 'auto') delete state.tabPref[targetId];
    else state.tabPref[targetId] = mode;
  }

  closeForm();
  commitNav();
}

function doDelete() {
  if (!setPending) return;
  if (setPending.type === 'group') {
    NAV = NAV.filter(g => g.id !== setPending.id);
    delete state.closed[setPending.id];
  } else {
    NAV.forEach(g => { g.items = g.items.filter(it => it.id !== setPending.id); });
    delete state.tabPref[setPending.id];
    state.recent = (state.recent || []).filter(x => x !== setPending.id);
  }
  setPending = null;
  commitNav();
}

function resetNav() {
  setPending = { type: 'reset', id: null };
  const bar = $('setConfirm');
  bar.hidden = false;
  bar.innerHTML = `恢复成出厂的 18 个链接？<b>你自己添加的分组和项目都会消失</b>，此项不可撤销。` +
    `<button class="btn-danger" id="cfmYes">确定恢复</button><button class="ghost-btn" id="cfmNo">取消</button>`;
  bar.querySelector('#cfmYes').addEventListener('click', () => {
    NAV = cloneNav(DEFAULT_NAV);
    state.tabPref = {};
    state.closed = {};
    state.recent = [];
    setPending = null;
    commitNav();
    toast('已恢复默认链接');
  });
  bar.querySelector('#cfmNo').addEventListener('click', () => { setPending = null; renderSettings(); });
}

/* ---------------------------- 事件绑定 ---------------------------- */

$('settingsBtn').addEventListener('click', openSettings);
$('setClose').addEventListener('click', closeSettings);
document.querySelector('#settingsModal .modal-backdrop').addEventListener('click', closeSettings);
$('addGroupBtn').addEventListener('click', () => openForm('group', 'new'));
$('addItemBtn').addEventListener('click', () => openForm('item', 'new'));
$('formSave').addEventListener('click', saveForm);
$('formCancel').addEventListener('click', closeForm);
$('navReset').addEventListener('click', resetNav);
$('fName').addEventListener('keydown', e => { if (e.key === 'Enter') saveForm(); });
$('fUrl').addEventListener('keydown', e => { if (e.key === 'Enter') saveForm(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('settingsModal').hidden) { closeSettings(); }
});

(function init() {
  load();
  ensureNav();          // NAV / ALL_ITEMS / BY_ID 就绪

  applyTheme();
  document.documentElement.style.setProperty('--sb-w', (state.width || 306) + 'px');
  $('autoCollapse').checked = state.autoCollapse !== false;
  app.classList.toggle('collapsed', !!state.collapsed);

  renderNav();
  renderHome();
  renderUnlockerPill();                              // 先按"未解锁"显示，探测到再改
  /* ① content script 的 DOM 标记（本地 / manifest 里列过的域名走这条，同步最快） */
  applyUnlocker(document.documentElement.dataset.frameUnlocker === '1');
  /* ② content script 万一注入晚了，再确认一次（仍然只单向打开） */
  setTimeout(() => applyUnlocker(document.documentElement.dataset.frameUnlocker === '1'), 600);
  /* ③ 兜底探针：托管到任何域名都能识别（扩展没装时立刻失败，无副作用） */
  probeUnlocker().then(applyUnlocker);

  /* 进入 portal 先落在主页面；上次访问的条目留在「最近访问」里一键继续 */
  state.currentId = null;
  state.back = [];
  state.fwd = [];
  goHome({ history: false });
})();
