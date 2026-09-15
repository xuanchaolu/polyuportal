# 技术参考

给维护者看的：数据结构、打开方式判定、以及"为什么某些站点打不开"的实测依据。
**使用说明请先看 [README.md](README.md)。**

---

## 数据层

```
DEFAULT_NAV        出厂内置的分组与链接（写在 app.js 顶部）
state.nav          当前生效的副本；用户在设置里的增删改都存在这里，并持久化到 localStorage
NAV / ALL_ITEMS / BY_ID
                   派生数据（当前分组、扁平化后的条目、按 id 索引）
```

- 任何改动走 `commitNav()`：重建索引 → 刷新侧栏/主页面/统计/最近访问 → 落盘
- 老存档若没有 `nav` 字段，`ensureNav()` 会自动用 `DEFAULT_NAV` 补齐
- localStorage key 为 `polyu-portal-v3`，里面有 `nav / tabPref / recent / closed / theme / width / collapsed`

## 打开方式怎么判定

```js
function usesNewTab(item) {
  const pref = state.tabPref[item.id];   // ① 用户在设置或顶栏胶囊里显式设过
  if (pref) return pref === 'tab';
  if (item.frame === 'yes') return false; // ② 实测可嵌入 → 一律右侧
  return !unlockerOn;                     // ③ 其余（禁嵌 / 需登录 / 自定义新条目）
}                                         //    装了扩展就右侧，没装就新标签
```

- `tabPref` 是**唯一**的覆盖开关，设置界面和顶栏胶囊按钮共用它
- 自定义新条目没有 `frame` 数据，走 ③，所以默认行为是安全的（不会一上来就撞灰板）

## 各站点可嵌入性（实测数据）

`app.js` 里每个内置条目都带一个 `frame` 字段，取值来自真实浏览器实测：

| 取值 | 含义 | 默认行为（未装扩展） |
| --- | --- | --- |
| `no` | 响应头禁止被嵌入 | 新标签 |
| `yes` | 可正常嵌入 | 右侧 |
| `login` | 需登录、无法判定禁不禁嵌 | 新标签（理由与 `no` 不同） |
| 省略 | 未知 | 新标签 |

| 站点 | 实测结果 | 依据 |
| --- | --- | --- |
| canvas.polyu.edu.hk（AMA3640 / COMP4431 / ENGL4022） | ❌ 禁止嵌入 | CSP `frame-ancestors 'self'`（跳转后由 adfs 触发） |
| learn.polyu.edu.hk（AMA4650 / AMA4680 / CLC3211P） | ❌ 禁止嵌入 | CSP `frame-ancestors 'self'` |
| www38.polyu.edu.hk/eStudent | ❌ 禁止嵌入 | 同上（adfs 链路） |
| www38.polyu.edu.hk/eAdmission | ❌ 禁止嵌入 | `X-Frame-Options: DENY` |
| www40.polyu.edu.hk/poss、/fosae | ❌ 禁止嵌入 | `X-Frame-Options: SAMEORIGIN` |
| www.lib.polyu.edu.hk/ibooking | ❌ 禁止嵌入 | `X-Frame-Options: SAMEORIGIN` |
| w5.ab.ust.hk（HKUST） | ❌ 禁止嵌入 | `X-Frame-Options: SAMEORIGIN` |
| banweb.cityu.edu.hk（CityU） | ❌ 禁止嵌入 | CSP `frame-ancestors 'self' *.cityu.edu.hk` |
| platform.deepseek.com（Deepseek） | ⚠️ 需登录，未能实测 | 无 XFO/CSP；但风控对自动探测返回 `403 Request blocked`，无法判定 |
| datatact.com | ✅ 可嵌入 | 无相关响应头 |
| sweb.hku.hk（HKU TOLA） | ✅ 可嵌入 | 无相关响应头 |
| www.gradsch.cuhk.edu.hk（CUHK） | ✅ 可嵌入 | 无相关响应头 |
| unimelb-web.t1cloud.com | ✅ 可嵌入 | 无相关响应头 |

合计：13 个禁止嵌入 + 1 个需登录 + 4 个可嵌入。

**判据**（不靠猜）：把 iframe 指过去后截图帧区域做像素分析——
被拦下的子框架在 Chrome 里渲染成**整片 `#dddddd` 单色填充（帧区只有 2 种颜色、占满 100%）**，
而真实页面一定有文字像素（31–479 种颜色）。只靠响应头或控制台日志会漏判：
`X-Frame-Options` 拦截**不产生任何控制台日志**。

## 会话 cookie（Blackboard 的 `Browser Cookies Disabled`）

只摘响应头还不够。Blackboard 会"种一个 cookie 再读回来"判断浏览器是否支持 cookie，
而它的 `Set-Cookie` 没写 SameSite，按默认 Lax 处理；Lax cookie 在第三方 iframe 里
既存不下也发不出。实测：

| 场景 | learn.polyu.edu.hk 的 cookie | 结果 |
| --- | --- | --- |
| 顶层直接访问 | 存下 4 个 | 正常 |
| portal 的 iframe 里 | **0 个** | 落到 `nocookies.jsp` |
| iframe + 手动种一个 SameSite=None 的 cookie | 存得下、发得出 | 越过 nocookies，进入 ADFS 登录页 |

因此扩展的 `background.js` 用 `webRequest`（只读观察，MV3 不允许拦截）抓响应头，
把 **`details.frameId !== 0`**（即来自 iframe）的 `Set-Cookie` 用 cookies API 重写为
`SameSite=None; Secure`。顶层文档自己发起的请求一律不碰，
**平时直接访问这些网站时 cookie 仍是 Lax**。

分区 cookie（Partitioned / CHIPS，最安全）实测在该 Chrome/Edge 版本下**不生效**：
分区 `SameSite=None` cookie 在 iframe 里存不下也发不出，所以只能用全局放宽。

代价：被放宽的会话 cookie 会从其他网站发起的同名请求里也带上（CSRF 面变大）。

## 扩展探测

portal 判断"扩展装没装"有三条路，任一命中即算已装：

| 路径 | 原理 | 覆盖范围 |
| --- | --- | --- |
| ① content script 标记 | `mark.js` 往 `<html>` 写 `data-frame-unlocker="1"` | manifest 里列出的来源 |
| ② 探针兜底 | `fetch('chrome-extension://<固定 ID>/ping.txt')`（该文件声明为 `web_accessible_resources`） | **任何域名** |
| ③ 稍后复查 | 防止 ① 注入晚于页面脚本 | 同上 |

扩展 ID 由 `manifest.json` 的 `key` 字段**固定**为 `gafohjaajiehoomiaogehgikedkogjho`，
所以换安装目录、换托管域名都不会失效。

探测是**单向**的（只会从未装变成已装）。早期版本这里有个坑：600ms 后那次复查用双向赋值，
在托管域名上（拿不到 content script 标记）会把探针刚探到的"已装"又按回"未装"。

副作用：扩展没装时，探针会在控制台留下 1–2 条 `Failed to load resource: net::ERR_FAILED`
（Chrome 把无法解析的扩展 URL 记成 `chrome-extension://invalid/`），不出网、不影响功能。

## 单文件版构建

```bash
python3 build-single.py
```

把 `styles.css`、`app.js`、`favicon.png`、两处 `main-logo-1x.png` 内联进 `portal.html`，
写出前自检**输出里不能有任何指向本地文件的引用**；任何一处替换没命中会直接报错，
不会静默产出坏文件。

## 开发时的排查脚本（不在本目录内）

下面这些脚本是**开发时用来核实结论的本地工具**，不随 portal 一起分发，
所以本目录里找不到它们。列在这里只是说明"上面那些实测数据是怎么来的"：

| 脚本 | 用途 |
| --- | --- |
| `smoke-portal.js` | jsdom 里的功能断言；`PORTAL_PAGE` / `PORTAL_BASE` 可切换被测页面与来源 |
| `browser-check.js` | 真实 Chromium（CDP）里的布局与行为断言 |
| `single-file-check.js` | 单文件版专项：统计网络请求证明自包含、`file://` 打开可用 |
| `hosted-detect-check.js` | 托管场景（外部域名）下扩展检测是否正常 |
| `default-embed-check.js` | 装了扩展之后的端到端验收（含 Blackboard cookie 回归） |
| `settings-check.js` | 设置功能：增删改排序、网址校验、打开方式、转义 |
| `frame-probe2.js` | 逐个探测各链接的可嵌入性（截图帧区域做像素判据），数据变更后复核 |
| `who-requests.js` | 记录请求的发起文档与实际连到的对端 IP，用来证明请求由本机直接发出 |
| `frame-unlock-check.js` | 装扩展前/后的 A/B 对比 |
| `cookie-diag.js` / `cookie-experiment.js` | 排查 iframe 里的 cookie 存储与发送 |

用法示例（在开发环境里）：

```bash
python3 -m http.server 8321        # 在 portal 目录起服务
node smoke-portal.js               # 跑功能断言
PORTAL_PAGE=portal.html node smoke-portal.js   # 换成测单文件版
```
