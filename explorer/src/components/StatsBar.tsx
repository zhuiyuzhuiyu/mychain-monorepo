import type { ChainInfo, ChainStatus } from '../api';

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

interface StatsBarProps {
  stats: Partial<ChainStatus> & { mempool?: number };
  info: Partial<ChainInfo>;
}

function Stat({ label, value, sub, highlight }: StatProps) {
  return (
    <div style={{ padding: '13px 24px', borderRight: '1px solid #e9ecef', minWidth: 130, flexShrink: 0 }}>
      <div style={{ fontSize: 10, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: highlight ? '#00a186' : '#212529' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11, color: '#6c757d', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

export default function StatsBar({ stats, info }: StatsBarProps) {
  const fmt = (n: string | number | undefined) => n != null ? new Intl.NumberFormat('zh-CN').format(Number(n)) : '—';
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e9ecef' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          <Stat label="块高度" value={fmt(stats?.height)} sub="最新区块" />
          <Stat label="链 ID" value={info?.chainId || '—'} />
          <Stat label="代币单位" value={info?.denom || '—'} />
          <Stat label="出块奖励" value={info?.blockReward ? fmt(info.blockReward) : '—'} sub={info?.denom} highlight />
          <Stat label="挖矿难度" value={info?.difficulty ? `${info.difficulty} 前导零` : '—'} />
          <Stat label="内存池" value={fmt(stats?.mempool)} sub="待打包交易" />
        </div>
      </div>
    </div>
  );
}
