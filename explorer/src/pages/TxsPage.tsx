import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, shortHash, timeAgo, fmtNum, type Tx } from '../api';

type TxWithBlock = Tx & { blockHeight: number };

interface TxTableProps { txs: (Tx | TxWithBlock)[]; showBlock: boolean; }

function TxTable({ txs, showBlock }: TxTableProps) {
  return (
    <table>
      <thead><tr><th>交易哈希</th>{showBlock && <th>区块</th>}<th>发送方</th><th>接收方</th><th>金额</th><th>时间</th></tr></thead>
      <tbody>
        {txs.map(tx => (
          <tr key={tx.hash}>
            <td><Link to={`/tx/${tx.hash}`} className="hash-link mono truncate">{shortHash(tx.hash)}</Link></td>
            {showBlock && 'blockHeight' in tx && <td><Link to={`/block/${tx.blockHeight}`} className="hash-link fw-600">#{tx.blockHeight}</Link></td>}
            <td><Link to={`/address/${tx.body?.from}`} className="hash-link truncate">{shortHash(tx.body?.from)}</Link></td>
            <td><Link to={`/address/${tx.body?.to}`} className="hash-link truncate">{shortHash(tx.body?.to)}</Link></td>
            <td><span className="text-green fw-600">{fmtNum(tx.body?.amount?.[0]?.amount)}</span> <span className="text-xs text-muted">{tx.body?.amount?.[0]?.denom}</span></td>
            <td className="text-muted text-sm">{timeAgo(tx.timestamp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TxsPage() {
  const [pending, setPending] = useState<Tx[]>([]);
  const [confirmed, setConfirmed] = useState<TxWithBlock[]>([]);

  useEffect(() => {
    const load = async () => {
      const p = await api.pending().catch(() => ({ pending: [] }));
      setPending(p.pending || []);
      const data = await api.blocks(30).catch(() => ({ blocks: [], total: 0 }));
      const txs: TxWithBlock[] = [];
      for (const b of (data.blocks || [])) {
        if (b.txCount > 0) {
          const full = await api.block(b.height).catch(() => null);
          if (full?.transactions) full.transactions.forEach(tx => txs.push({ ...tx, blockHeight: b.height }));
        }
      }
      setConfirmed(txs);
    };
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div className="page-title">交易列表</div>
        <div className="page-sub">已确认 {confirmed.length} 笔 · 内存池 {pending.length} 笔</div>
      </div>
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">⏳ 待确认（内存池）</span><span className="badge badge-orange">{pending.length} 笔</span></div>
          <TxTable txs={pending} showBlock={false} />
        </div>
      )}
      <div className="card">
        <div className="card-header"><span className="card-title">✅ 已确认交易</span><span className="badge badge-green">{confirmed.length} 笔</span></div>
        {confirmed.length === 0 ? <div className="empty-state">暂无已确认交易</div> : <TxTable txs={confirmed} showBlock={true} />}
      </div>
    </div>
  );
}
