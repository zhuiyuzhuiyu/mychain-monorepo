import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const search = () => {
    const v = q.trim();
    if (!v) return;
    if (/^\d+$/.test(v)) navigate(`/block/${v}`);
    else if (v.startsWith('cosmos1')) navigate(`/address/${v}`);
    else navigate(`/tx/${v}`);
    setQ('');
  };

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/blocks', label: '区块' },
    { to: '/txs', label: '交易' },
    { to: '/accounts', label: '账户' },
    { to: '/miner', label: '挖矿' },
  ];

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e9ecef', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 56, gap: 28 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0784c3,#00a186)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700 }}>⛓</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#212529', letterSpacing: '-0.3px', lineHeight: 1.2 }}>MyChain</div>
            <div style={{ fontSize: 9, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>Explorer</div>
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {navLinks.map(item => (
            <Link key={item.to} to={item.to} style={{ padding: '6px 10px', borderRadius: 5, fontSize: 13, color: '#495057', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#0784c3'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#495057'; }}
            >{item.label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="搜索区块高度 / 交易哈希 / 地址"
            style={{ padding: '7px 12px', border: '1px solid #e9ecef', borderRadius: 6, fontSize: 13, width: 270, outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#0784c3'}
            onBlur={e => e.target.style.borderColor = '#e9ecef'}
          />
          <button onClick={search} style={{ padding: '7px 16px', background: '#0784c3', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>搜索</button>
        </div>
      </div>
    </header>
  );
}
