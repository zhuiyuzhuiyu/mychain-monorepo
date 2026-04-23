import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtNum, type MineResult, type SignResult } from '../api';
import CopyBtn from '../components/CopyBtn';

interface TxForm { from: string; mnemonic: string; to: string; amount: string; memo: string; }

export default function MinerPage() {
  const [minerAddr, setMinerAddr] = useState('');
  const [mineResult, setMineResult] = useState<MineResult | null>(null);
  const [mining, setMining] = useState(false);
  const [mineErr, setMineErr] = useState('');

  const [txForm, setTxForm] = useState<TxForm>({ from: '', mnemonic: '', to: '', amount: '', memo: '' });
  const [txResult, setTxResult] = useState<SignResult | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txErr, setTxErr] = useState('');

  const doMine = async () => {
    if (!minerAddr.trim()) return;
    setMining(true); setMineErr(''); setMineResult(null);
    try {
      const data = await api.mine(minerAddr.trim());
      if (data.error) setMineErr(data.error);
      else setMineResult(data);
    } catch (e) { setMineErr((e as Error).message); }
    finally { setMining(false); }
  };

  const submitTx = async () => {
    const { from, mnemonic, to, amount } = txForm;
    if (!from || !mnemonic || !to || !amount) { setTxErr('请填写所有必填字段'); return; }
    setTxLoading(true); setTxErr(''); setTxResult(null);
    try {
      const data = await api.sign(txForm);
      if (data.error) setTxErr(data.error);
      else setTxResult(data);
    } catch (e) { setTxErr((e as Error).message); }
    finally { setTxLoading(false); }
  };

  const setTx = (k: keyof TxForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setTxForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div className="page-title">挖矿 & 转账</div>
        <div className="page-sub">手动触发 PoW 挖矿，或提交代币转账交易</div>
      </div>
      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-header"><span className="card-title">⛏ PoW 挖矿</span><span className="badge badge-orange">手动触发</span></div>
            <div style={{ padding: 16 }}>
              <p className="text-sm text-muted" style={{ marginBottom: 14 }}>矿工搜索满足难度目标的 Nonce，成功后获得出块奖励并打包内存池交易。</p>
              <div className="form-group">
                <label className="form-label">矿工地址</label>
                <input className="form-input" value={minerAddr} onChange={e => setMinerAddr(e.target.value)} placeholder="cosmos1..." />
              </div>
              <button className="btn btn-full" style={{ background: '#fd7e14', color: '#fff', border: 'none' }} onClick={doMine} disabled={mining}>
                {mining ? '⛏ 挖矿中，请稍候...' : '⛏ 开始挖矿'}
              </button>
              {mineErr && <div className="alert alert-error" style={{ marginTop: 14 }}>{mineErr}</div>}
              {mineResult && (
                <div style={{ marginTop: 14 }}>
                  <div className="alert alert-success">🎉 {mineResult.message}</div>
                  <div className="kv-row"><span className="kv-key">区块高度</span><span className="kv-val"><Link to={`/block/${mineResult.block?.height}`} className="hash-link fw-600">#{mineResult.block?.height}</Link></span></div>
                  <div className="kv-row"><span className="kv-key">区块哈希</span><span className="kv-val mono text-xs" style={{ wordBreak: 'break-all' }}>{mineResult.block?.hash}<CopyBtn text={mineResult.block?.hash} /></span></div>
                  <div className="kv-row"><span className="kv-key">Nonce</span><span className="kv-val mono">{fmtNum(mineResult.block?.nonce)}</span></div>
                  <div className="kv-row"><span className="kv-key">包含交易</span><span className="kv-val"><span className="badge badge-blue">{mineResult.block?.txCount} 笔</span></span></div>
                  <div className="kv-row"><span className="kv-key">出块奖励</span><span className="kv-val text-green fw-600">{mineResult.reward}</span></div>
                  <div className="kv-row"><span className="kv-key">矿工余额</span><span className="kv-val text-green fw-600">{Object.entries(mineResult.minerBalance || {}).map(([d, a]) => `${fmtNum(a)} ${d}`).join(', ')}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-header"><span className="card-title">→ 代币转账</span><span className="badge badge-blue">MsgSend</span></div>
            <div style={{ padding: 16 }}>
              <div className="form-group"><label className="form-label">发送方地址 *</label><input className="form-input" value={txForm.from} onChange={setTx('from')} placeholder="cosmos1..." /></div>
              <div className="form-group"><label className="form-label">助记词 * (用于签名)</label><input className="form-input" value={txForm.mnemonic} onChange={setTx('mnemonic')} placeholder="twelve word mnemonic..." /></div>
              <div className="form-group"><label className="form-label">接收方地址 *</label><input className="form-input" value={txForm.to} onChange={setTx('to')} placeholder="cosmos1..." /></div>
              <div className="form-group"><label className="form-label">金额 (uatom) *</label><input className="form-input" type="number" value={txForm.amount} onChange={setTx('amount')} placeholder="1000000" /></div>
              <div className="form-group"><label className="form-label">备注</label><input className="form-input" value={txForm.memo} onChange={setTx('memo')} placeholder="可选" /></div>
              {txErr && <div className="alert alert-error">{txErr}</div>}
              <button className="btn btn-primary btn-full" onClick={submitTx} disabled={txLoading}>{txLoading ? '提交中...' : '提交交易 →'}</button>
              {txResult && (
                <div style={{ marginTop: 14 }}>
                  <div className="alert alert-success">✓ 已加入内存池，等待矿工打包</div>
                  <div className="kv-row"><span className="kv-key">交易哈希</span><span className="kv-val"><Link to={`/tx/${txResult.txHash}`} className="hash-link text-sm">{txResult.txHash}</Link><CopyBtn text={txResult.txHash} /></span></div>
                  <div className="kv-row"><span className="kv-key">状态</span><span className="kv-val"><span className="badge badge-orange">{txResult.status}</span></span></div>
                  <p className="text-xs text-muted" style={{ marginTop: 10 }}>💡 去左侧「挖矿」区域打包此交易</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
