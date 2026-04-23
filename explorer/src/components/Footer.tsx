import type { ChainInfo } from '../api';

interface FooterProps { info: Partial<ChainInfo>; }

export default function Footer({ info }: FooterProps) {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #e9ecef', marginTop: 48, padding: '20px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12, color: '#6c757d' }}>
          © 2025 MyChain Explorer &nbsp;·&nbsp; Chain: <strong>{info?.chainId || 'mychain-1'}</strong>
          &nbsp;·&nbsp; Token: <strong>{info?.denom || 'uatom'}</strong>
          &nbsp;·&nbsp; Reward: <strong>{info?.blockReward} {info?.denom}</strong>
          &nbsp;·&nbsp; PoW Difficulty: <strong>{info?.difficulty}</strong>
        </div>
        <div style={{ fontSize: 12, color: '#adb5bd' }}>Cosmos-Inspired · Node.js · secp256k1</div>
      </div>
    </footer>
  );
}
