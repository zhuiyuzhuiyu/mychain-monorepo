export interface Coin { denom: string; amount: string; }
export interface TxBody { typeUrl: string; from: string; to: string; amount: Coin[]; memo: string; }
export interface TxAuthInfo { sequence: number; fee: Coin; }
export interface Tx { hash: string; body: TxBody; authInfo: TxAuthInfo; signature: string; publicKey: string; timestamp: string; }
export interface BlockHeader { height: number; chainId: string; timestamp: string; previousHash: string; transactionsRoot: string; stateRoot: string; proposer: string; nonce: number; difficulty: number; }
export interface Block { header: BlockHeader; transactions: Tx[]; hash: string; }
export interface BlockSummary { height: number; hash: string; timestamp: string; proposer: string; txCount: number; nonce: number; difficulty?: number; }
export interface Account { address: string; accountNumber: number; sequence: number; publicKey: string; balances: Coin[]; error?: string; }
export interface ChainInfo { name: string; chainId: string; denom: string; difficulty: string; blockReward: string; }
export interface ChainStatus { height: number; latestHash: string; latestTime: string; }
export interface TxResult { tx: Tx; blockHeight?: number; status: string; error?: string; }
export interface MineResult { message: string; block: { height: number; hash: string; timestamp: string; nonce: number; txCount: number; proposer: string }; reward: string; minerBalance: Record<string, string>; error?: string; }
export interface SignResult { txHash: string; status: string; tx: Tx; error?: string; }

const baseUrl = (import.meta.env.VITE_NODE_URL as string | undefined)?.replace(/\/$/, '') || '';
async function get<T>(url: string): Promise<T> {
  const res = await fetch(baseUrl + url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(baseUrl + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json() as Promise<T>;
}

export const api = {
  info: () => get<ChainInfo>('/api/info'),
  status: () => get<ChainStatus>('/blocks/status'),
  blocks: (limit = 20) => get<{ total: number; blocks: BlockSummary[] }>(`/blocks?limit=${limit}`),
  block: (height: number) => get<Block>(`/blocks/${height}`),
  tx: (hash: string) => get<TxResult>(`/txs/${hash}`),
  pending: () => get<{ pending: Tx[] }>('/txs/pending'),
  account: (address: string) => get<Account>(`/accounts/${address}`),
  createAccount: () => post<Account & { mnemonic: string }>('/accounts', {}),
  sign: (body: { from: string; mnemonic: string; to: string; amount: string; memo: string }) => post<SignResult>('/txs/sign', body),
  mine: (minerAddress: string) => post<MineResult>('/mine', { minerAddress }),
};

export function shortHash(h: string | undefined, n = 8): string {
  if (!h) return '-';
  return `${h.slice(0, n)}...${h.slice(-6)}`;
}
export function timeAgo(ts: string | undefined): string {
  if (!ts) return '-';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff} 秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}
export function fmtNum(n: string | number | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('zh-CN').format(Number(n));
}
