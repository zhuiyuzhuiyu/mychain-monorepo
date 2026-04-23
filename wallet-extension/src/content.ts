console.log('[MyChain content script] 已注入到页面:', location.href);

// 只处理页面发出的请求（direction = 'request'）
window.addEventListener('message', e => {
  if (e.source !== window) return;
  const { type, payload, id, direction } = e.data || {};
  if (!type?.startsWith('MYCHAIN_') || !id || direction !== 'request') return;

  chrome.runtime.sendMessage({ type, payload }, (res: { payload?: unknown; error?: string }) => {
    if (chrome.runtime.lastError) {
      window.postMessage({ id, direction: 'response', error: chrome.runtime.lastError.message }, '*');
      return;
    }
    if (res?.error) window.postMessage({ id, direction: 'response', error: res.error }, '*');
    else window.postMessage({ id, direction: 'response', payload: res?.payload }, '*');
  });
});
