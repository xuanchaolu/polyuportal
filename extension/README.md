# Portal Frame Unlocker — 让右侧面板能真的显示那些网页

## 它解决的是什么问题

你的 portal 里点课程时，浏览器**已经**把请求发到对方服务器了（实测：直连 `158.132.77.40`，
中间没有任何中转）。真正被挡住的是**"显示"**这一步：Canvas / Learn@PolyU / eStudent / POSS …
这些站点在响应头里写了：

```
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self'
```

这是它们明确告诉浏览器"不许把我放进别人的 iframe 里"。浏览器照做，于是右侧只能是一片灰板。
这跟"请求从哪里发出"无关，**是对方站点自己的策略**，任何本地网页都绕不过去。

这个扩展只在**你自己的浏览器里**、只针对**子框架(iframe)请求**，把这两个响应头摘掉。

装上之后 portal 会**自动切换成"全部在右侧打开"**：主页面 hero 上出现 **`内嵌已解锁`**
的绿色胶囊，14 个原本回退到新标签的站点也改在右侧显示。没装时 portal 会自动回退到
新标签打开这些站点——两边都不用手动切。

这个自动切换靠 `mark.js` 这个 content script：它在 `127.0.0.1` / `localhost`（以及
`file://`，需额外打开「允许访问文件网址」）的页面上往 `<html>` 写 `data-frame-unlocker="1"`
（content script 与页面共享 DOM，所以 portal 能读到）。

## 实测效果（同一台机器、同一个网址）

| | 帧区域像素 | 控制台 | 结果 |
| --- | --- | --- | --- |
| 不装扩展 | 2 种颜色，整片 `#dddddd` | `Framing 'https://adfs.polyu.edu.hk/' violates … frame-ancestors 'self'` | ❌ 灰板 |
| 装上扩展 | **1304 种颜色**，白色 45% | 无 | ✅ Canvas→ADFS 登录页正常显示 |

portal 里 18 个链接逐个实测：**装扩展后全部能在右侧渲染出来**——包括 Canvas 转到
`adfs.polyu.edu.hk` 的 SSO 登录页、Learn@PolyU、eStudent、POSS、FO、iBooking、HKUST、CityU、CUHK、HKU、Unimelb。

另外验证了**它不会削弱你平时的浏览**：顶层直接访问这些网站时，`X-Frame-Options` 与
`Content-Security-Policy` 都原样保留（因为规则限定 `resourceTypes: ["sub_frame"]`）。

## 怎么装（Chrome / Edge）

1. 打开 `chrome://extensions`
2. 右上角打开 **开发者模式**
3. 点 **加载已解压的扩展程序**，选择这个 `extension` 文件夹
4. 回到 portal 刷新页面，点之前打不开的课程即可（若仍显示灰板，把该站点的
   「仍在此处嵌入」点一下，或直接刷新 portal）

不想要了就回到 `chrome://extensions` 点移除，或在开关上关掉。

## 卸载后会怎样

portal 会立刻回到"没装扩展"的行为：嵌不进去的站点自动改用新标签打开，胶囊变回
`内嵌未解锁`，其它一切照旧。

## 第三层：让 portal 在"托管到别的域名"时也能认出扩展

把 portal 部署到 Netlify（`https://polyhk.netlify.app/`）之后，胶囊一直显示 `内嵌未解锁`，
14 个站点又退回新标签——这是早期版本的一个真 bug：当时只有一条探测路径，
就是 content script 往页面上写标记，而它的 `matches` 只列了
`127.0.0.1` / `localhost` / `file://`，托管到别的域名就一条都不匹配，portal 自然以为"没装扩展"。

现在改成三条路，任一命中就算装了：

| 路径 | 原理 | 覆盖范围 |
| --- | --- | --- |
| ① content script 标记 | `mark.js` 往 `<html>` 写 `data-frame-unlocker="1"` | manifest 里列出的来源（本地 + `*.netlify.app` 等） |
| ② 探针（兜底） | portal `fetch('chrome-extension://<ID>/ping.txt')`，该文件声明为 `web_accessible_resources` | **任何域名**，包括你以后换的托管服务 |
| ③ 稍后复查 | 防止 ① 注入晚于页面脚本 | 同上 |

为了让 ② 在换域名后依然有效，manifest 里加了 `key` 字段把**扩展 ID 固定**为
`gafohjaajiehoomiaogehgikedkogjho`（否则 ID 由安装路径推导，换目录就变，探针就失效了）。

> 踩坑记录：第一版探针写好后托管域名仍然显示未解锁。原因是 600ms 后那次"复查 DOM 标记"
> 用的是**双向**赋值——标记在托管域名上本来就不存在，于是把探针刚探到的"已装"又按回了"未装"。
> 现在探测是**单向**的：只会从未装变成已装。

**小副作用**：扩展没装时，这个探针会在控制台留下 1–2 条 `Failed to load resource: net::ERR_FAILED`
（Chrome 把无法解析的扩展 URL 记为 `chrome-extension://invalid/`）。它不出网、不影响功能，
只在开发者工具里可见。

## 第二层：会话 cookie（修 Blackboard 的 "Browser Cookies Disabled"）

只摘响应头还不够。Learn@PolyU（Blackboard）会"种一个 cookie 再读回来"判断浏览器是否支持
cookie，而它的 Set-Cookie **没写 SameSite**，于是按默认的 Lax 处理——Lax cookie 在第三方
iframe 里既存不下也发不出，页面就报 `Browser Cookies Disabled`。

实测（同一浏览器）：

| 场景 | learn.polyu.edu.hk 的 cookie | 结果 |
| --- | --- | --- |
| 顶层直接访问 | 存下 4 个（JSESSIONID / BbRouter…） | 正常 |
| portal 的 iframe 里 | **0 个** | 落到 `nocookies.jsp`，报 Browser Cookies Disabled |
| iframe + 手动种一个 SameSite=None 的 cookie | 存得下、发得出 | 越过 nocookies，进入 ADFS 登录页 |

所以 `background.js` 会**只读地**观察响应头（MV3 里 webRequest 只能观察，不能拦截），
把**来自 iframe 的**响应里的 Set-Cookie 用 cookies API 重写一遍，补上 `SameSite=None; Secure`：

- 判据是 `details.frameId !== 0`——顶层文档自己发起的请求一律不碰，
  所以**你平时直接访问这些网站时，cookie 仍然是 Lax，防护没有被削弱**（已实测：顶层 4 个 cookie 全部保持 Lax）；
- 只有 panel 里 iframe 收到的会话 cookie 会被放宽，这正是它能在面板里工作的前提；
- `bbfix.js` 兜底：万一 Blackboard 的 cookie 检查跑在改写之前（竞态）落到 `nocookies.jsp`，
  会带标记重载一次（只重试一次，不会循环）。

**代价**：被放宽的那些会话 cookie 会变成 `SameSite=None`，意味着之后从别的网站发起对同一域名的
请求也会带上它（CSRF 面变大）。这是"让这类站点在面板里能用"的必要代价。
分区 cookie（Partitioned/CHIPS，只对 portal 这个顶层站点生效，最安全）实测**不生效**——
Chrome/Edge 153 下分区 SameSite=None cookie 在 iframe 里存不下也发不出，所以只能用全局放宽。

## 覆盖的站点

`rules.json` 里按域名分组，目前包含：`polyu.edu.hk`（含 adfs / canvas / learn / www38 / www40 / lib）、
`ust.hk`、`cityu.edu.hk`、`cuhk.edu.hk`、`hku.hk`、`t1cloud.com`、`deepseek.com`。
加站点就往 `rules.json` 里复制一段规则、改 `urlFilter` 和 `manifest.json` 的 `host_permissions`，
然后在 `chrome://extensions` 点一下重新加载。

## 需要知道的代价（重要）

1. **这是主动关掉一层安全防护。** `X-Frame-Options` / `frame-ancestors` 是用来防点击劫持的。
   本扩展把这两个头在**子框架请求**上删掉，范围限定了域名清单、且不影响顶层导航，
   但被内嵌的页面确实少了一层保护。这是你自己机器上的个人工具，请自己判断是否接受。
2. **登录态可能仍然进不去。** iframe 里的请求算"第三方上下文"，如果浏览器拦截第三方 Cookie，
   SSO 会话不会带进去，你会看到登录页但登不进去。Chrome 默认仍允许第三方 Cookie，
   所以多数情况可用；若你的 Chrome 开了"跟踪保护 / 阻止第三方 Cookie"，请继续用「新标签打开」。
3. **只能装给 Chromium 系浏览器。** Firefox / Safari 的拦截策略更严且没有等价的简单开关。
4. 少数页面（例如 Deepseek 平台）还有风控层，可能仍返回 403，这与内嵌无关。

## 实现

- `manifest.json` — MV3，权限只要 `declarativeNetRequest` + `declarativeNetRequestWithHostAccess`
  （后面这个必须有，否则 `modifyHeaders` 不生效——第一版就是栽在这里，实测才发现）
- `rules.json` — 每条规则：`condition.urlFilter = ||域名`、`resourceTypes: ["sub_frame"]`，
  `action.modifyHeaders` 移除 `x-frame-options` / `content-security-policy` /
  `content-security-policy-report-only`
- `rules.json` — 摘 `X-Frame-Options` / `CSP`
- `background.js` — 观察非顶层响应的 Set-Cookie，把会话 cookie 放宽为 `SameSite=None`
- `bbfix.js` — Blackboard `nocookies.jsp` 上的一次性重载兜底
- `mark.js` — content script，只在 `127.0.0.1` / `localhost` 上打一个 DOM 标记，
  不读取任何页面内容，只用于让 portal 知道扩展已生效
- 没有后台脚本、不采集任何浏览数据、不向任何服务器发送数据
