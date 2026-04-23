import { useState } from 'react';
import { bridge, type WalletInfo } from '../bridge';

interface Props { onConnected: (info: WalletInfo) => void; }

export default function ConnectPage({ onConnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const connect = async () => {
    setLoading(true); setErr('');
    try {
      console.log('[wallet-app] 发送连接请求...');
      const info = await bridge.getWallet();
      console.log('[wallet-app] 收到钱包信息:', info);
      onConnected(info);
    } catch (e) {
      console.error('[wallet-app] 连接失败:', e);
      setErr((e as Error).message ?? String(e));
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      <div style={{ width: 420, background: '#fff', borderRadius: 20, padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⛓</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>MyChain Wallet</div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 36 }}>连接你的钱包以开始转账</div>

        <button
          onClick={connect}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', marginBottom: 16,
          }}
        >
          {loading ? '连接中...' : '🔌 连接 MyChain 钱包插件'}
        </button>

        {err && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#dc2626', textAlign: 'left' }}>
            <strong>连接失败：</strong>{err}
          </div>
        )}

        <div style={{ marginTop: 24, padding: '14px 16px', background: '#f8fafc', borderRadius: 10, fontSize: 12, color: '#64748b', textAlign: 'left', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#475569' }}>使用前请确认：</div>
          <div>① 已安装 MyChain Wallet 浏览器插件</div>
          <div>② 插件中已创建或导入钱包账户</div>
          <div>③ 区块链节点运行在 localhost:3000</div>
        </div>
      </div>
    </div>
  );
}
