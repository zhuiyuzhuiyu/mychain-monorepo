import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, timeAgo, fmtNum, type TxResult } from '../api';
import CopyBtn from '../components/CopyBtn';

export default function TxDetail() {
  const { hash } = useParams<{ hash: string }>();
  const [data, setData] = useState<TxResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hash) return;
    api.tx(hash).then(setData).catch(e => setError((e as Error).message));
  }, [hash]);

  if (error) return <div className="container" style={{ paddingTop: 32 }}><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="container" style={{ paddingTop: 32, color: '#6c757d' }}>加载中...</div>;
  if (data.error) return <div className="container" style={{ paddingTop: 32 }}><div className="alert alert-error">{data.error}</div></div>;

  const { tx, blockHeight, status } = data;
  const body = tx?.body;
  const coin = body?.amount?.[0];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/txs" className="text-muted text-sm">← 交易</Link>
          <span className="text-muted">/</span>
          <div>
            <div className="page-title">交易详情</div>
            <div className="page-sub mono text-xs" style={{ marginTop: 3 }}>{hash}</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">交易信息</span>
          <span className={`badge ${status === '已确认' ? 'badge-green' : 'badge-orange'}`}>{status}</span>
        </div>
        <div style={{ padding: '4px 16px 12px' }}>
          <div className="kv-row"><span className="kv-key">交易哈希</span><span className="kv-val mono text-sm">{tx.hash}<CopyBtn text={tx.hash} /></span></div>
          <div className="kv-row"><span className="kv-key">状态</span><span className="kv-val"><span className={`badge ${status === '已确认' ? 'badge-green' : 'badge-orange'}`}>{status}</span></span></div>
          {blockHeight && <div className="kv-row"><span className="kv-key">所在区块</span><span className="kv-val"><Link to={`/block/${blockHeight}`} className="hash-link fw-600">#{blockHeight}</Link></span></div>}
          <div className="kv-row"><span className="kv-key">时间</span><span className="kv-val">{timeAgo(tx.timestamp)} ({new Date(tx.timestamp).toLocaleString('zh-CN')})</span></div>
          <div className="kv-row"><span className="kv-key">消息类型</span><span className="kv-val"><span className="badge" style={{ background: '#f3f0fa', color: '#6f42c1', border: '1px solid #d9cdf0' }}>{body?.typeUrl}</span></span></div>
          <div className="divider" />
          <div className="kv-row"><span className="kv-key">发送方</span><span className="kv-val"><Link to={`/address/${body?.from}`} className="hash-link">{body?.from}</Link><CopyBtn text={body?.from ?? ''} /></span></div>
          <div className="kv-row"><span className="kv-key">接收方</span><span className="kv-val"><Link to={`/address/${body?.to}`} className="hash-link">{body?.to}</Link><CopyBtn text={body?.to ?? ''} /></span></div>
          <div className="kv-row"><span className="kv-key">转账金额</span><span className="kv-val text-green fw-600" style={{ fontSize: 16 }}>{fmtNum(coin?.amount)} <span style={{ fontSize: 12, fontWeight: 400, color: '#6c757d' }}>{coin?.denom}</span></span></div>
          <div className="kv-row"><span className="kv-key">手续费</span><span className="kv-val">{fmtNum(tx.authInfo?.fee?.amount)} <span className="text-xs text-muted">{tx.authInfo?.fee?.denom}</span></span></div>
          <div className="kv-row"><span className="kv-key">序列号</span><span className="kv-val mono">{tx.authInfo?.sequence}</span></div>
          {body?.memo && <div className="kv-row"><span className="kv-key">备注</span><span className="kv-val">{body.memo}</span></div>}
          <div className="divider" />
          <div className="kv-row"><span className="kv-key">签名</span><span className="kv-val mono text-xs" style={{ wordBreak: 'break-all' }}>{tx.signature}</span></div>
          <div className="kv-row"><span className="kv-key">公钥</span><span className="kv-val mono text-xs" style={{ wordBreak: 'break-all' }}>{tx.publicKey}</span></div>
        </div>
      </div>
    </div>
  );
}
