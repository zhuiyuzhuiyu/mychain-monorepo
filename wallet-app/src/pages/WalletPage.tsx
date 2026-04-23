import { useEffect, useState } from 'react';
import { fetchAccount, fmtBalance, shortAddr, type Account } from '../api';
import type { WalletInfo } from '../bridge';

interface Props { wallet: WalletInfo; onSend: () => void; onDisconnect: () => void; }

export default function WalletPage({ wallet, onSend, onDisconnect }: Props) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setAccount(await fetchAccount(wallet.address)); }
    catch { /* 节点未启动 */ }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [wallet.address]);

  const copy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const balance = account ? fmtBalance(account.balances) : (loading ? '加载中...' : '—');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* 顶部余额卡片 */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', padding: '32px 28px' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>账户余额</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{balance}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px' }}>
              {shortAddr(wallet.address)}
            </div>
            <button onClick={copy} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>

        {/* 操作区 */}
        <div style={{ background: '#fff', padding: 24 }}>
          <button
            onClick={onSend}
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
          >
            → 发送代币
          </button>
          <button
            onClick={refresh}
            style={{ width: '100%', padding: '11px 0', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}
          >
            ↻ 刷新余额
          </button>

          {account && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>账号编号</span>
                <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>序列号</span>
                <span style={{ fontWeight: 600 }}>{account.sequence}</span>
              </div>
            </div>
          )}

          <button
            onClick={onDisconnect}
            style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            断开连接
          </button>
        </div>
      </div>
    </div>
  );
}
