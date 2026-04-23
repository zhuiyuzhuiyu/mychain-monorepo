import { useState } from 'react';
import { api, type SignResult } from '../api';
import { type WalletData } from '../store';

const s = {
  header: { background: '#1d4ed8', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 },
  title: { fontSize: 16, fontWeight: 700 },
  body: { padding: 20 },
  label: { fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 4, display: 'block' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6', fontSize: 13, outline: 'none', marginBottom: 14 },
  btn: (bg: string, disabled = false): React.CSSProperties => ({
    width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
    background: disabled ? '#adb5bd' : bg, color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  err: { background: '#fff3f3', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#dc3545', marginBottom: 12 },
  success: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 14, marginTop: 14 },
  hashLabel: { fontSize: 11, color: '#6c757d', marginBottom: 4 },
  hash: { fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' as const, color: '#1d4ed8' },
  status: { display: 'inline-block', background: '#fef9c3', color: '#854d0e', fontSize: 11, borderRadius: 4, padding: '2px 8px', marginTop: 8 },
  fromBox: { background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, padding: '10px 12px', fontSize: 12, fontFamily: 'monospace', color: '#495057', marginBottom: 14, wordBreak: 'break-all' as const },
};

interface Props { wallet: WalletData; onBack: () => void; }

export default function SendPage({ wallet, onBack }: Props) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<SignResult | null>(null);

  const submit = async () => {
    if (!to.trim()) { setErr('请填写接收方地址'); return; }
    if (!amount || Number(amount) <= 0) { setErr('请填写有效金额'); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const data = await api.sign({ from: wallet.address, mnemonic: wallet.mnemonic, to: to.trim(), amount, memo });
      if (data.error) setErr(data.error);
      else setResult(data);
    } catch (e) { setErr('无法连接节点，请确认节点已在 :3000 运行'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.title}>发送代币</span>
      </div>

      <div style={s.body}>
        <label style={s.label}>发送方（当前钱包）</label>
        <div style={s.fromBox}>{wallet.address}</div>

        <label style={s.label}>接收方地址 *</label>
        <input style={s.input} value={to} onChange={e => setTo(e.target.value)} placeholder="cosmos1..." />

        <label style={s.label}>金额（uatom）*</label>
        <input style={s.input} type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例：1000000" />

        <label style={s.label}>备注（可选）</label>
        <input style={s.input} value={memo} onChange={e => setMemo(e.target.value)} placeholder="可选" />

        {err && <div style={s.err}>{err}</div>}

        <button style={s.btn('#1d4ed8', loading)} onClick={submit} disabled={loading}>
          {loading ? '提交中...' : '确认转账 →'}
        </button>

        {result && (
          <div style={s.success}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>✓ 交易已提交</div>
            <div style={s.hashLabel}>交易哈希</div>
            <div style={s.hash}>{result.txHash}</div>
            <div style={s.status}>{result.status}</div>
            <div style={{ fontSize: 11, color: '#6c757d', marginTop: 10 }}>💡 去浏览器触发挖矿以确认交易</div>
          </div>
        )}
      </div>
    </div>
  );
}
