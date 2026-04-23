function sendToExtension<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);

    const handler = (e: MessageEvent) => {
      // 只处理从 content script 返回的消息（direction = 'response'）
      if (e.data?.id !== id || e.data?.direction !== 'response') return;
      window.removeEventListener('message', handler);
      clearTimeout(timer);
      if (e.data.error) reject(new Error(e.data.error));
      else resolve(e.data.payload as T);
    };

    window.addEventListener('message', handler);
    const timer = setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('插件无响应，请确认已安装 MyChain Wallet 插件并创建钱包'));
    }, 5000);

    // direction = 'request' 标记这是页面发出的请求
    window.postMessage({ type, payload, id, direction: 'request' }, '*');
  });
}

export interface WalletInfo { address: string; }
export interface TxResult { txHash: string; status: string; }

export const bridge = {
  getWallet: () => sendToExtension<WalletInfo>('MYCHAIN_GET_WALLET'),
  sendTx: (p: { to: string; amount: string; memo: string }) =>
    sendToExtension<TxResult>('MYCHAIN_SEND_TX', p),
};
