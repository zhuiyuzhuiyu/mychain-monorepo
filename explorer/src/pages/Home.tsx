import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, shortHash, timeAgo, fmtNum, type BlockSummary, type Tx } from '../api';

function HeroSearch() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const doSearch = () => {
    const v = q.trim();
    if (!v) return;
    if (/^\d+$/.test(v)) navigate(`/block/${v}`);
    else if (v.startsWith('cosmos1')) navigate(`/address/${v}`);
    else navigate(`/tx/${v}`);
  };
  return (
    <div style={{ background: 'linear-gradient(135deg,#1e2d6e 0%,#0784c3 100%)', padding: '40px 0 36px' }}>
      <div className="container">
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>MyChain 区块链浏览器</div>
        <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginBottom: 22 }}>Cosmos 风格 · PoW 共识 · secp256k1 签名 · Bech32 地址</div>
        <div style={{ display: 'flex', gap: 0, maxWidth: 700 }}>
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="搜索区块高度、交易哈希、账户地址..."
            style={{ flex: 1, padding: '12px 16px', fontSize: 14, border: 'none', borderRadius: '6px 0 0 6px', outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={doSearch} style={{ padding: '12px 22px', background: '#00a186', color: '#fff', border: 'none', borderRadius: '0 6px 6px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>搜索</button>
        </div>
      </div>
    </div>
  );
}

function BlockRow({ b }: { b: BlockSummary }) {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#e8f4fd', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#0784c3', fontWeight: 700, flexShrink: 0 }}>Bk</div>
          <div>
            <Link to={`/block/${b.height}`} className="hash-link" style={{ fontWeight: 700, fontSize: 13 }}>#{b.height}</Link>
            <div style={{ fontSize: 11, color: '#6c757d', marginTop: 1 }}>{timeAgo(b.timestamp)}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 2 }}>矿工</div>
        <Link to={`/address/${b.proposer}`} className="hash-link truncate">{shortHash(b.proposer)}</Link>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className="badge badge-blue">{b.txCount} 笔</span>
        <div style={{ fontSize: 11, color: '#6c757d', marginTop: 3 }}>nonce {fmtNum(b.nonce)}</div>
      </td>
    </tr>
  );
}

function TxRow({ tx }: { tx: Tx }) {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#e8f7f4', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#00a186', fontWeight: 700, flexShrink: 0 }}>Tx</div>
          <div>
            <Link to={`/tx/${tx.hash}`} className="hash-link truncate" style={{ maxWidth: 130 }}>{shortHash(tx.hash)}</Link>
            <div style={{ fontSize: 11, color: '#6c757d', marginTop: 1 }}>{timeAgo(tx.timestamp)}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ fontSize: 11, color: '#6c757d' }}>
          <Link to={`/address/${tx.body?.from}`} className="hash-link truncate" style={{ maxWidth: 110 }}>{shortHash(tx.body?.from)}</Link>
          <span style={{ margin: '0 4px', color: '#adb5bd' }}>→</span>
          <Link to={`/address/${tx.body?.to}`} className="hash-link truncate" style={{ maxWidth: 110 }}>{shortHash(tx.body?.to)}</Link>
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span style={{ color: '#00a186', fontWeight: 600, fontSize: 13 }}>{fmtNum(tx.body?.amount?.[0]?.amount)}</span>
        <span style={{ fontSize: 11, color: '#6c757d', marginLeft: 3 }}>{tx.body?.amount?.[0]?.denom}</span>
      </td>
    </tr>
  );
}

export default function Home() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);

  const refresh = async () => {
    const data = await api.blocks(20).catch(() => ({ blocks: [] as BlockSummary[], total: 0 }));
    const blockList = data.blocks || [];
    setBlocks(blockList);
    const allTxs: Tx[] = [];
    for (const b of blockList) {
      if (b.txCount > 0) {
        const full = await api.block(b.height).catch(() => null);
        if (full?.transactions) allTxs.push(...full.transactions);
      }
    }
    setTxs(allTxs.slice(0, 10));
  };

  useEffect(() => { refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, []);

  return (
    <>
      <HeroSearch />
      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">最新区块</span>
              <Link to="/blocks" style={{ fontSize: 12, color: '#0784c3' }}>查看全部 →</Link>
            </div>
            {blocks.length === 0
              ? <div className="empty-state">暂无区块，请先挖矿</div>
              : <table><tbody>{blocks.slice(0, 8).map(b => <BlockRow key={b.height} b={b} />)}</tbody></table>
            }
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">最新交易</span>
              <Link to="/txs" style={{ fontSize: 12, color: '#0784c3' }}>查看全部 →</Link>
            </div>
            {txs.length === 0
              ? <div className="empty-state">暂无交易记录</div>
              : <table><tbody>{txs.slice(0, 8).map(tx => <TxRow key={tx.hash} tx={tx} />)}</tbody></table>
            }
          </div>
        </div>
      </div>
    </>
  );
}
