/* ============================================================
   background.js — 让登录类站点也能在 portal 的 iframe 里保持会话
   ============================================================

   问题：Blackboard（Learn@PolyU）等站点用"种一个 cookie 再读回来"来判断
   浏览器是否支持 cookie。它们的 Set-Cookie 没有写 SameSite，于是按默认的
   Lax 处理；而 portal 里的 iframe 属于第三方上下文，Lax cookie 不会被发送，
   甚至连存都存不下 —— 于是页面报 "Browser Cookies Disabled"。

   实测（Chrome/Edge 153）：
     · 顶层访问 learn.polyu.edu.hk   → 存下 4 个 cookie（JSESSIONID / BbRouter…）
     · iframe 里访问同一地址         → 同一个域 0 个 cookie，落到 nocookies.jsp
     · iframe 里手动种一个 SameSite=None 的 cookie → 存得下、发得出，
       页面顺利越过 nocookies 跳到 ADFS 的 NetID 登录页

   做法：只观察响应头（MV3 里这是只读的），把**非顶层导航**回来的 Set-Cookie
   用 cookies API 重新写一遍，补上 SameSite=None; Secure。
   这样：
     · 顶层正常浏览时收到的 cookie 保持原样（Lax）→ 不削弱日常防护
     · 只有从 iframe 里触发的那些（登录/会话类）会被放宽，才能在面板里工作

   代价：这些在 iframe 里被放宽的会话 cookie 会变成 SameSite=None，
   意味着之后从别的网站发起对同一域名的请求也会带上它（CSRF 面变大）。
   这是"让页面在面板里能用"必须付出的代价，请自行判断是否接受。
   ============================================================ */

const DOMAINS = [
  'polyu.edu.hk',
  'ust.hk',
  'cityu.edu.hk',
  'cuhk.edu.hk',
  'hku.hk',
  't1cloud.com',
  'deepseek.com'
];

/* 只处理"归属于某个子框架"的请求：details.frameId 为 0 表示顶层文档自己
   （包含它发起的子资源请求），这些一律不动，日常浏览的保护保持原样；
   frameId > 0 说明请求来自 iframe（也就是 portal 的右侧面板），才放宽。 */
const FILTER = {
  urls: DOMAINS.map(d => `*://*.${d}/*`)
};

/* 解析一条 Set-Cookie，返回 cookies API 需要的字段 */
function parseSetCookie(raw) {
  const parts = raw.split(';');
  const first = parts.shift() || '';
  const eq = first.indexOf('=');
  if (eq <= 0) return null;
  const out = {
    name: first.slice(0, eq).trim(),
    value: first.slice(eq + 1).trim(),
    domain: null, path: '/', secure: false, httpOnly: false, expirationDate: null
  };
  for (const p of parts) {
    const i = p.indexOf('=');
    const k = (i < 0 ? p : p.slice(0, i)).trim().toLowerCase();
    const v = i < 0 ? '' : p.slice(i + 1).trim();
    if (k === 'domain') out.domain = v.replace(/^\./, '');
    else if (k === 'path') out.path = v || '/';
    else if (k === 'secure') out.secure = true;
    else if (k === 'httponly') out.httpOnly = true;
    else if (k === 'max-age') {
      const s = parseInt(v, 10);
      if (!isNaN(s)) out.expirationDate = Math.floor(Date.now() / 1000) + s;
    } else if (k === 'expires' && out.expirationDate === null) {
      const t = Date.parse(v);
      if (!isNaN(t)) out.expirationDate = Math.floor(t / 1000);
    }
  }
  return out;
}

/* 把 cookie 重写成 SameSite=None; Secure（Chrome 要求 SameSite=None 必须配 Secure） */
function relax(raw, reqUrl) {
  const c = parseSetCookie(raw);
  if (!c) return;
  if (/samesite=none/i.test(raw)) return;        // 已经是 None 就不用管

  let url;
  try {
    const u = new URL(reqUrl);
    url = `${u.protocol}//${u.host}${c.path || '/'}`;
  } catch (_) { return; }

  const details = {
    url,
    name: c.name,
    value: c.value,
    path: c.path || '/',
    secure: true,                                // SameSite=None 的前提
    httpOnly: c.httpOnly,
    sameSite: 'no_restriction'                   // = SameSite=None
  };
  if (c.domain) details.domain = c.domain;       // 省略 = host-only cookie
  if (c.expirationDate) details.expirationDate = c.expirationDate;

  chrome.cookies.set(details, (made) => {
    if (chrome.runtime.lastError) {
      console.debug('[frame-unlocker] 放宽 cookie 失败', c.name, chrome.runtime.lastError.message);
    } else if (made) {
      console.debug('[frame-unlocker] 已放宽为 SameSite=None:', made.name, made.domain || made.hostOnly);
    }
  });
}

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.frameId === 0) return;           // 顶层文档及其子资源：不动
    const headers = details.responseHeaders || [];
    for (const h of headers) {
      if (h.name.toLowerCase() === 'set-cookie' && h.value) relax(h.value, details.url);
    }
  },
  FILTER,
  ['responseHeaders', 'extraHeaders']            // 看 Set-Cookie 必须带 extraHeaders
);

console.debug('[frame-unlocker] 已启用：将对', DOMAINS.join(', '), '的非顶层响应放宽会话 cookie');
