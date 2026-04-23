// 动态读取节点地址，支持用户在插件设置页配置，默认回退 localhost:3000
async function getBase(): Promise<string> {
  const result = await chrome.storage.local.get('nodeUrl');
  return (result.nodeUrl as string) || 'http://localhost:3000';
}

export interface Coin { denom: string; amount: string; }
export interface Account { address: string; accountNumber: number; sequence: number; publicKey: string; balances: Coin[]; error?: string; }
export interface NewAccount extends Account { mnemonic: string; }
export interface SignResult { txHash: string; status: string; error?: string; }

async function get<T>(path: string): Promise<T> {
  const base = await getBase();
  const res = await fetch(base + path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const base = await getBase();
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export const api = {
  createAccount: () => post<NewAccount>('/accounts', {}),
  account: (address: string) => get<Account>(`/accounts/${address}`),
  sign: (body: { from: string; mnemonic: string; to: string; amount: string; memo: string }) =>
    post<SignResult>('/txs/sign', body),
};

export function shortAddr(addr: string): string {
  if (addr.length < 16) return addr;
  return `${addr.slice(0, 12)}...${addr.slice(-6)}`;
}

export function fmtAmount(coins: Coin[]): string {
  if (!coins || coins.length === 0) return '0 uatom';
  return coins.map(c => `${Number(c.amount).toLocaleString('zh-CN')} ${c.denom}`).join('  ');
}
