import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, shortHash, timeAgo, fmtNum, type Account, type Tx } from '../api';
import CopyBtn from '../components/CopyBtn';

type TxWithBlock = Tx & { blockHeight: number };

export default function AddressPage() {
  const { address } = useParams<{ address: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [txs, setTxs] = useState<TxWithBlock[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address) return;
    api.account(address).then(setAccount).catch(e => setError((e as Error).message));
    (async () => {
      const data = await api.blocks(50).catch(() => ({ blocks: [], total: 0 }));
      const related: TxWithBlock[] = [];
      for (const b of (data.blocks || [])) {
        if (b.txCount > 0) {
          const full = await api.block(b.height).catch(() => null);
          if (full?.transactions) {
            full.transactions.forEach(tx => {
              if (tx.body?.from === address || tx.body?.to === address)
                related.push({ ...tx, blockHeight: b.height });
            });
          }
        }
      }
      setTxs(related);
    })();
  }, [address]);

  if (error) return <div className="container" style={{ paddingTop: 32 }}><div className="alert alert-error">{error}</div></div>;
  if (!account) return <div className="container" style={{ paddingTop: 32, color: '#6c757d' }}>加载中...</div>;
  if (account.error) return <div className="container" style={{ paddingTop: 32 }}><div className="alert alert-error">{account.error}</div></div>;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <div className="page-header">
        <div className="page-title">账户详情</div>
        <div className="page-sub mono text-xs" style={{ marginTop: 4 }}>{address}</div>
      </div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">账户信息</span></div>
          <div style={{ padding: '4px 16px 12px' }}>
            <div className="kv-row"><span className="kv-key">地址</span><span className="kv-val mono text-sm">{account.address}<CopyBtn text={account.address} /></span></div>
            <div className="kv-row"><span className="kv-key">账号编号</span><span className="kv-val">{account.accountNumber}</span></div>
            <div className="kv-row"><span className="kv-key">序列号</span><span className="kv-val">{account.sequence}</span></div>
            <div className="kv-row"><span className="kv-key">公钥</span><span className="kv-val mono text-xs" style={{ wordBreak: 'break-all' }}>{account.publicKey}</span></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">余额</span></div>
          <div style={{ padding: 16 }}>
            {account.balances?.length === 0
              ? <div className="text-muted text-sm">暂无余额</div>
              : account.balances?.map(b => (
                <div key={b.denom} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#6c757d', textTransform: 'uppercase' }}>{b.denom}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#00a186' }}>{fmtNum(b.amount)}</div>
                  </div>
                  <span className="badge badge-green">{b.denom}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">相关交易</span><span className="badge badge-gray">{txs.length} 笔</span></div>
        {txs.length === 0 ? <div className="empty-state">暂无相关交易</div> : (
          <table>
            <thead><tr><th>交易哈希</th><th>区块</th><th>方向</th><th>对方地址</th><th>金额</th><th>时间</th></tr></thead>
            <tbody>
              {txs.map(tx => {
                const isOut = tx.body?.from === address;
                const other = isOut ? tx.body?.to : tx.body?.from;
                return (
                  <tr key={tx.hash}>
                    <td><Link to={`/tx/${tx.hash}`} className="hash-link mono truncate">{shortHash(tx.hash)}</Link></td>
                    <td><Link to={`/block/${tx.blockHeight}`} className="hash-link fw-600">#{tx.blockHeight}</Link></td>
                    <td><span className={`badge ${isOut ? 'badge-orange' : 'badge-green'}`}>{isOut ? '发出' : '收入'}</span></td>
                    <td><Link to={`/address/${other}`} className="hash-link truncate">{shortHash(other)}</Link></td>
                    <td><span style={{ color: isOut ? '#fd7e14' : '#00a186', fontWeight: 600 }}>{isOut ? '-' : '+'}{fmtNum(tx.body?.amount?.[0]?.amount)}</span> <span className="text-xs text-muted">{tx.body?.amount?.[0]?.denom}</span></td>
                    <td className="text-muted text-sm">{timeAgo(tx.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
