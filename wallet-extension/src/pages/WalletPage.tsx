import { useEffect, useState } from 'react';
import { api, fmtAmount, shortAddr, type Account } from '../api';
import { clearWallet, type WalletData } from '../store';

const s = {
  header: { background: '#1d4ed8', padding: '20px 20px 16px', color: '#fff' },
  label: { fontSize: 10, opacity: 0.75, textTransform: 'uppercase' as const, letterSpacing: 1 },
  addr: { fontSize: 13, fontFamily: 'monospace', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 },
  balance: { fontSize: 28, fontWeight: 700, marginTop: 12 },
  balanceSub: { fontSize: 11, opacity: 0.8, marginTop: 2 },
  body: { padding: 20 },
  btn: (bg: string, full = true): React.CSSProperties => ({
    width: full ? '100%' : undefined,
    padding: '11px 20px', borderRadius: 8, border: 'none',
    background: bg, color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginBottom: 10,
  }),
  copyBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, padding: '2px 6px', cursor: 'pointer' },
  info: { background: '#fff', borderRadius: 10, border: '1px solid #e9ecef', padding: '14px 16px', marginBottom: 14 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f3f5', fontSize: 13 },
  rowLast: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 },
  key: { color: '#6c757d' },
  val: { fontWeight: 600, color: '#212529' },
};

interface Props { wallet: WalletData; onSend: () => void; onSettings: () => void; onLogout: () => void; }

export default function WalletPage({ wallet, onSend, onSettings, onLogout }: Props) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setAccount(await api.account(wallet.address)); }
    catch { /* 节点未启动时忽略 */ }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [wallet.address]);

  const copy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const logout = async () => {
    await clearWallet();
    onLogout();
  };

  const balanceText = account ? fmtAmount(account.balances) : (loading ? '加载中...' : '— uatom');

  return (
    <div>
      <div style={s.header}>
        <div style={s.label}>我的地址</div>
        <div style={s.addr}>
          <span>{shortAddr(wallet.address)}</span>
          <button style={s.copyBtn} onClick={copy}>{copied ? '✓' : '复制'}</button>
        </div>
        <div style={s.balance}>{balanceText}</div>
        <div style={s.balanceSub}>账户余额</div>
      </div>

      <div style={s.body}>
        <button style={s.btn('#1d4ed8')} onClick={onSend}>→ 发送代币</button>
        <button style={s.btn('#0ea5e9')} onClick={refresh}>↻ 刷新余额</button>

        {account && (
          <div style={s.info}>
            <div style={s.row}><span style={s.key}>账号编号</span><span style={s.val}>{account.accountNumber}</span></div>
            <div style={s.row}><span style={s.key}>序列号</span><span style={s.val}>{account.sequence}</span></div>
            <div style={s.rowLast}><span style={s.key}>公钥</span><span style={{ ...s.val, fontSize: 10, fontFamily: 'monospace', maxWidth: 180, wordBreak: 'break-all', textAlign: 'right' }}>{account.publicKey?.slice(0, 20)}...</span></div>
          </div>
        )}

        <button style={{ ...s.btn('#334155'), marginTop: 4 }} onClick={onSettings}>⚙ 节点设置</button>
        <button style={{ ...s.btn('#dc3545'), marginTop: 4 }} onClick={logout}>退出钱包</button>
      </div>
    </div>
  );
}
