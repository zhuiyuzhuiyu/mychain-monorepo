import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, shortHash, timeAgo, fmtNum, type Block, type Tx } from '../api';
import CopyBtn from '../components/CopyBtn';

export default function BlockDetail() {
  const { height } = useParams<{ height: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!height) return;
    api.block(parseInt(height)).then(setBlock).catch(e => setError((e as Error).message));
  }, [height]);

  if (error) return <div className="container" style={{ paddingTop: 32 }}><div className="alert alert-error">{error}</div></div>;
  if (!block) return <div className="container" style={{ paddingTop: 32, color: '#6c757d' }}>加载中...</div>;

  const h = block.header;
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/blocks" className="text-muted text-sm">← 区块</Link>
          <span className="text-muted">/</span>
          <div>
            <div className="page-title">区块 #{h.height}</div>
            <div className="page-sub">{timeAgo(h.timestamp)} · {new Date(h.timestamp).toLocaleString('zh-CN')}</div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">区块头信息</span></div>
        <div style={{ padding: '4px 16px 12px' }}>
          <div className="kv-row"><span className="kv-key">区块哈希</span><span className="kv-val mono text-sm">{block.hash}<CopyBtn text={block.hash} /></span></div>
          <div className="kv-row"><span className="kv-key">前块哈希</span><span className="kv-val mono text-sm">{h.previousHash}</span></div>
          <div className="kv-row"><span className="kv-key">高度</span><span className="kv-val fw-600">{fmtNum(h.height)}</span></div>
          <div className="kv-row"><span className="kv-key">链 ID</span><span className="kv-val">{h.chainId}</span></div>
          <div className="kv-row"><span className="kv-key">时间戳</span><span className="kv-val">{new Date(h.timestamp).toLocaleString('zh-CN')}</span></div>
          <div className="kv-row"><span className="kv-key">矿工地址</span><span className="kv-val"><Link to={`/address/${h.proposer}`} className="hash-link">{h.proposer}</Link><CopyBtn text={h.proposer} /></span></div>
          <div className="kv-row"><span className="kv-key">Nonce</span><span className="kv-val mono">{fmtNum(h.nonce)}</span></div>
          <div className="kv-row"><span className="kv-key">难度</span><span className="kv-val"><span className="badge badge-orange">{h.difficulty} 前导零</span></span></div>
          <div className="kv-row"><span className="kv-key">交易根哈希</span><span className="kv-val mono text-sm">{h.transactionsRoot}</span></div>
          <div className="kv-row"><span className="kv-key">状态根哈希</span><span className="kv-val mono text-sm">{h.stateRoot}</span></div>
          <div className="kv-row"><span className="kv-key">交易数</span><span className="kv-val"><span className="badge badge-blue">{block.transactions.length} 笔</span></span></div>
        </div>
      </div>
      {block.transactions.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">包含交易（{block.transactions.length} 笔）</span></div>
          <table>
            <thead><tr><th>交易哈希</th><th>类型</th><th>发送方</th><th>接收方</th><th>金额</th><th>时间</th></tr></thead>
            <tbody>
              {block.transactions.map((tx: Tx) => (
                <tr key={tx.hash}>
                  <td><Link to={`/tx/${tx.hash}`} className="hash-link mono truncate">{shortHash(tx.hash)}</Link></td>
                  <td><span className="badge" style={{ background: '#f3f0fa', color: '#6f42c1', border: '1px solid #d9cdf0', fontSize: 10 }}>MsgSend</span></td>
                  <td><Link to={`/address/${tx.body?.from}`} className="hash-link truncate">{shortHash(tx.body?.from)}</Link></td>
                  <td><Link to={`/address/${tx.body?.to}`} className="hash-link truncate">{shortHash(tx.body?.to)}</Link></td>
                  <td><span className="text-green fw-600">{fmtNum(tx.body?.amount?.[0]?.amount)}</span> <span className="text-xs text-muted">{tx.body?.amount?.[0]?.denom}</span></td>
                  <td className="text-muted text-sm">{timeAgo(tx.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
