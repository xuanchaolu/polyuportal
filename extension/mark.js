/* content script（隔离世界）与页面共享 DOM，所以用 <html> 上的属性告知 portal：
   "解锁扩展已启用"。portal 据此不再提示"右侧可能是空白"。 */
document.documentElement.setAttribute('data-frame-unlocker', '1');
