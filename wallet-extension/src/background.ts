// 动态读取用户配置的节点地址
async function getNodeUrl(): Promise<string> {
  const result = await chrome.storage.local.get('nodeUrl');
  return (result.nodeUrl as string) || 'http://localhost:3000';
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'MYCHAIN_GET_WALLET') {
    chrome.storage.local.get(['address'], res => {
      if (res.address) sendResponse({ payload: { address: res.address } });
      else sendResponse({ error: '未设置钱包，请先在插件中创建或导入账户' });
    });
    return true;
  }

  if (msg.type === 'MYCHAIN_SEND_TX') {
    chrome.storage.local.get(['address', 'mnemonic'], async res => {
      if (!res.address || !res.mnemonic) {
        sendResponse({ error: '钱包未初始化' });
        return;
      }
      try {
        const NODE = await getNodeUrl();
        const r = await fetch(`${NODE}/txs/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: res.address,
            mnemonic: res.mnemonic,
            to: msg.payload.to,
            amount: msg.payload.amount,
            memo: msg.payload.memo || '',
          }),
        });
        const data = await r.json() as { txHash?: string; status?: string; error?: string };
        if (data.error) sendResponse({ error: data.error });
        else sendResponse({ payload: { txHash: data.txHash, status: data.status } });
      } catch {
        sendResponse({ error: '无法连接节点，请在插件设置页配置正确的节点地址' });
      }
    });
    return true;
  }
});
