/* 兜底重试：Blackboard 的 cookie 检查有可能跑在扩展改写 cookie 之前（竞态），
   结果落到 /webapps/login/nocookies.jsp。这时带着标记重载一次，
   第二次请求就会带上已经被放宽成 SameSite=None 的会话 cookie。 */
(function () {
  if (!/\/webapps\/login\/nocookies\.jsp$/i.test(location.pathname)) return;
  var u;
  try { u = new URL(location.href); } catch (e) { return; }
  if (u.searchParams.get('_portal_retry') === '1') return;   // 只重试一次，避免死循环
  u.searchParams.set('_portal_retry', '1');
  location.replace(u.toString());
})();
