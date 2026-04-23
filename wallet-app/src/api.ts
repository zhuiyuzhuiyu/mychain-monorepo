const NODE = (import.meta.env.VITE_NODE_URL as string | undefined)?.replace(/\/$/, '') || '';

export interface Coin { denom: string; amount: string; }
export interface Account { address: string; accountNumber: number; sequence: number; balances: Coin[]; error?: string; }

export async function fetchAccount(address: string): Promise<Account> {
  const res = await fetch(`${NODE}/accounts/${address}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Account>;
}

export function fmtBalance(coins: Coin[]): string {
  if (!coins?.length) return '0 uatom';
  return coins.map(c => `${Number(c.amount).toLocaleString('zh-CN')} ${c.denom}`).join('  ');
}

export function shortAddr(addr: string): string {
  if (addr.length < 16) return addr;
  return `${addr.slice(0, 14)}...${addr.slice(-6)}`;
}
