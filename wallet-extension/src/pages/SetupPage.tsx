import { useState } from 'react';
import { api } from '../api';
import { saveWallet } from '../store';

const s = {
  wrap: { padding: 24 },
  logo: { textAlign: 'center' as const, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a1a2e' },
  sub: { fontSize: 12, color: '#6c757d', marginTop: 4 },
  btn: (bg: string): React.CSSProperties => ({
    width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
    background: bg, color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginBottom: 10,
  }),
  divider: { textAlign: 'center' as const, color: '#adb5bd', fontSize: 12, margin: '8px 0' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6', fontSize: 13, outline: 'none', marginTop: 6, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 600, color: '#495057' },
  err: { background: '#fff3f3', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#dc3545', marginTop: 8 },
  mnemonic: { background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 8, padding: 12, fontSize: 11, fontFamily: 'monospace', lineHeight: 1.8, wordBreak: 'break-all' as const, marginBottom: 12 },
  warn: { background: '#fff8e1', border: '1px solid #ffc107', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#856404', marginBottom: 12 },
};

interface Props { onDone: () => void; }

export default function SetupPage({ onDone }: Props) {
  const [mode, setMode] = useState<'home' | 'create' | 'import'>('home');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [newMnemonic, setNewMnemonic] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [importMnemonic, setImportMnemonic] = useState('');

  const doCreate = async () => {
    setLoading(true); setErr('');
    try {
      const data = await api.createAccount();
      setNewMnemonic(data.mnemonic);
      setNewAddress(data.address);
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  const confirmCreate = async () => {
    await saveWallet({ address: newAddress, mnemonic: newMnemonic });
    onDone();
  };

  const doImport = async () => {
    const words = importMnemonic.trim();
    if (words.split(' ').length < 12) { setErr('助记词至少 12 个单词'); return; }
    setLoading(true); setErr('');
    try {
      const data = await api.createAccount();
      // 导入：服务端用助记词推导地址（暂用创建接口代替，实际应传 mnemonic）
      // 这里简化处理：直接存用户输入的助记词，地址用服务端返回
      await saveWallet({ address: data.address, mnemonic: words });
      onDone();
    } catch (e) { setErr('无法连接节点，请确认节点已启动'); }
    finally { setLoading(false); }
  };

  if (mode === 'create') {
    return (
      <div style={s.wrap}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>创建新钱包</div>
        {!newMnemonic ? (
          <>
            <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>点击下方按钮，系统将为你生成新的密钥对和助记词。</p>
            {err && <div style={s.err}>{err}</div>}
            <button style={s.btn('#1d4ed8')} onClick={doCreate} disabled={loading}>
              {loading ? '生成中...' : '生成钱包'}
            </button>
            <button style={s.btn('#6c757d')} onClick={() => setMode('home')}>返回</button>
          </>
        ) : (
          <>
            <div style={s.warn}>⚠ 请务必保存助记词，关闭后不可找回！</div>
            <div style={s.label}>地址</div>
            <div style={{ ...s.mnemonic, fontSize: 12 }}>{newAddress}</div>
            <div style={s.label}>助记词</div>
            <div style={s.mnemonic}>{newMnemonic}</div>
            <button style={s.btn('#16a34a')} onClick={confirmCreate}>已保存，进入钱包 →</button>
          </>
        )}
      </div>
    );
  }

  if (mode === 'import') {
    return (
      <div style={s.wrap}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>导入钱包</div>
        <div style={s.label}>助记词（12个单词，空格分隔）</div>
        <textarea
          style={{ ...s.input, height: 80, resize: 'none', fontFamily: 'monospace' }}
          value={importMnemonic}
          onChange={e => setImportMnemonic(e.target.value)}
          placeholder="word1 word2 word3 ..."
        />
        {err && <div style={s.err}>{err}</div>}
        <button style={s.btn('#1d4ed8')} onClick={doImport} disabled={loading}>
          {loading ? '导入中...' : '导入'}
        </button>
        <button style={s.btn('#6c757d')} onClick={() => setMode('home')}>返回</button>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.logo}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⛓</div>
        <div style={s.title}>MyChain Wallet</div>
        <div style={s.sub}>Cosmos 风格区块链钱包</div>
      </div>
      <button style={s.btn('#1d4ed8')} onClick={() => { setMode('create'); doCreate(); }}>
        ⊕ 创建新钱包
      </button>
      <div style={s.divider}>— 或 —</div>
      <button style={s.btn('#16a34a')} onClick={() => setMode('import')}>
        导入已有钱包（助记词）
      </button>
    </div>
  );
}
