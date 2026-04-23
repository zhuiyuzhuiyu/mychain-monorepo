import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, shortHash, timeAgo, fmtNum, type BlockSummary } from '../api';

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await api.blocks(50).catch(() => ({ blocks: [] as BlockSummary[], total: 0 }));
      setBlocks(data.blocks || []);
      setTotal(data.total || 0);
    };
    load();
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div className="page-title">区块列表</div>
        <div className="page-sub">共 {fmtNum(total)} 个区块 · 每 6 秒自动刷新</div>
      </div>
      <div className="card">
        {blocks.length === 0 ? <div className="empty-state">暂无区块</div> : (
          <table>
            <thead><tr><th>高度</th><th>区块哈希</th><th>时间</th><th>矿工</th><th>交易数</th><th>Nonce</th></tr></thead>
            <tbody>
              {blocks.map(b => (
                <tr key={b.height}>
                  <td><Link to={`/block/${b.height}`} className="hash-link" style={{ fontWeight: 700 }}>#{b.height}</Link></td>
                  <td><Link to={`/block/${b.height}`} className="hash-link mono truncate" style={{ maxWidth: 220 }}>{b.hash}</Link></td>
                  <td className="text-muted text-sm">{timeAgo(b.timestamp)}</td>
                  <td><Link to={`/address/${b.proposer}`} className="hash-link truncate">{shortHash(b.proposer)}</Link></td>
                  <td><span className="badge badge-blue">{b.txCount}</span></td>
                  <td className="text-muted mono text-sm">{fmtNum(b.nonce)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
