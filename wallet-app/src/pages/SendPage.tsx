import { useState } from 'react';
import { bridge, type TxResult, type WalletInfo } from '../bridge';
import { shortAddr } from '../api';

interface Props { wallet: WalletInfo; onBack: () => void; }

export default function SendPage({ wallet, onBack }: Props) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<TxResult | null>(null);

  const submit = async () => {
    if (!to.trim()) { setErr('请填写接收方地址'); return; }
    if (!amount || Number(amount) <= 0) { setErr('请填写有效金额'); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const data = await bridge.sendTx({ to: to.trim(), amount, memo });
      setResult(data);
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
    background: '#f8fafc', transition: 'border 0.2s',
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block', textTransform: 'uppercase' as const, letterSpacing: 0.5 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* 顶栏 */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 18, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>发送代币</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>MsgSend · uatom</div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* 发送方 */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>发送方</label>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f1f5f9', fontSize: 13, fontFamily: 'monospace', color: '#475569', border: '1.5px solid #e2e8f0' }}>
              {shortAddr(wallet.address)}
              <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>（当前钱包）</span>
            </div>
          </div>

          {/* 接收方 */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>接收方地址 *</label>
            <input style={inputStyle} value={to} onChange={e => setTo(e.target.value)} placeholder="cosmos1..." />
          </div>

          {/* 金额 */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>金额（uatom）*</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inputStyle, paddingRight: 70 }} type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>uatom</span>
            </div>
          </div>

          {/* 备注 */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>备注（可选）</label>
            <input style={inputStyle} value={memo} onChange={e => setMemo(e.target.value)} placeholder="可选备注" />
          </div>

          {err && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
              {err}
            </div>
          )}

          <button
            onClick={submit} disabled={loading}
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8, #7c3aed)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '广播中...' : '确认转账 →'}
          </button>

          {result && (
            <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginBottom: 10 }}>✓ 交易已广播</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>交易哈希</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', color: '#1d4ed8', background: '#eff6ff', borderRadius: 6, padding: '8px 10px', marginBottom: 10 }}>{result.txHash}</div>
              <div style={{ display: 'inline-block', background: '#fef9c3', color: '#854d0e', fontSize: 11, borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>{result.status}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>💡 去浏览器挖矿页面触发打包以确认交易</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
