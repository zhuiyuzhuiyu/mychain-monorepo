import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtNum, type Account } from '../api';
import CopyBtn from '../components/CopyBtn';

type NewAccount = Account & { mnemonic: string };

export default function AccountsPage() {
  const [newAcc, setNewAcc] = useState<NewAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [queryAddr, setQueryAddr] = useState('');
  const [queryResult, setQueryResult] = useState<Account | null>(null);
  const [queryErr, setQueryErr] = useState('');

  const createAccount = async () => {
    setCreating(true);
    try { const data = await api.createAccount(); setNewAcc(data); }
    finally { setCreating(false); }
  };

  const queryAccount = async () => {
    if (!queryAddr.trim()) return;
    setQueryResult(null); setQueryErr('');
    try {
      const data = await api.account(queryAddr.trim());
      if (data.error) setQueryErr(data.error);
      else setQueryResult(data);
    } catch (e) { setQueryErr((e as Error).message); }
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div className="page-title">账户管理</div>
        <div className="page-sub">创建新账户 / 查询余额</div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">创建新账户</span></div>
          <div style={{ padding: 16 }}>
            <p className="text-sm text-muted" style={{ marginBottom: 14 }}>使用 secp256k1 算法生成密钥对，地址格式为 Bech32（cosmos1...）</p>
            <button className="btn btn-green btn-full" onClick={createAccount} disabled={creating}>{creating ? '生成中...' : '⊕ 生成新账户'}</button>
            {newAcc && (
              <div style={{ marginTop: 14 }}>
                <div className="alert alert-success">✓ 账户创建成功，请务必保存助记词！</div>
                <div className="kv-row"><span className="kv-key">地址</span><span className="kv-val hash-link text-sm">{newAcc.address}<CopyBtn text={newAcc.address} /></span></div>
                <div className="kv-row"><span className="kv-key">账号编号</span><span className="kv-val">{newAcc.accountNumber}</span></div>
                <div className="kv-row"><span className="kv-key">公钥</span><span className="kv-val mono text-xs" style={{ wordBreak: 'break-all' }}>{newAcc.publicKey}</span></div>
                <div className="divider" />
                <div className="alert alert-warn">
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠ 助记词（请勿泄露）</div>
                  <div className="mono text-sm">{newAcc.mnemonic}</div>
                  <CopyBtn text={newAcc.mnemonic} />
                </div>
                <Link to={`/address/${newAcc.address}`} className="btn btn-outline btn-full" style={{ marginTop: 10, textAlign: 'center', display: 'block' }}>查看账户详情 →</Link>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">查询账户</span></div>
          <div style={{ padding: 16 }}>
            <div className="form-group">
              <label className="form-label">账户地址</label>
              <input className="form-input" value={queryAddr} onChange={e => setQueryAddr(e.target.value)} onKeyDown={e => e.key === 'Enter' && queryAccount()} placeholder="cosmos1..." />
            </div>
            <button className="btn btn-primary btn-full" onClick={queryAccount}>查询</button>
            {queryErr && <div className="alert alert-error" style={{ marginTop: 14 }}>{queryErr}</div>}
            {queryResult && (
              <div style={{ marginTop: 14 }}>
                <div className="kv-row"><span className="kv-key">账号编号</span><span className="kv-val">{queryResult.accountNumber}</span></div>
                <div className="kv-row"><span className="kv-key">序列号</span><span className="kv-val">{queryResult.sequence}</span></div>
                <div className="divider" />
                {queryResult.balances?.length === 0
                  ? <div className="text-muted text-sm">暂无余额</div>
                  : queryResult.balances?.map(b => (
                    <div key={b.denom} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span className="text-muted text-sm">{b.denom}</span>
                      <span className="text-green fw-600">{fmtNum(b.amount)}</span>
                    </div>
                  ))
                }
                <Link to={`/address/${queryResult.address}`} className="btn btn-outline btn-full" style={{ marginTop: 10, textAlign: 'center', display: 'block' }}>查看完整详情 →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
