import { useState, useEffect } from 'react';

const DEFAULT_NODE_URL = 'http://3.148.112.169';

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 },
  title: { fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: 0 },
  label: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px',
    background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
    color: '#e2e8f0', fontSize: 13, outline: 'none',
  },
  btn: {
    padding: '9px 0', background: '#3b82f6', border: 'none', borderRadius: 8,
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
  },
  tip: { fontSize: 12, color: '#64748b', lineHeight: 1.6 },
  saved: { fontSize: 12, color: '#22c55e', textAlign: 'center' as const },
};

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('nodeUrl', res => {
      setUrl((res.nodeUrl as string) || DEFAULT_NODE_URL);
    });
  }, []);

  const save = () => {
    const trimmed = url.trim().replace(/\/$/, ''); // 去掉末尾斜杠
    chrome.storage.local.set({ nodeUrl: trimmed }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div style={s.wrap}>
      <p style={s.title}>节点设置</p>

      <div>
        <p style={s.label}>节点地址</p>
        <input
          style={s.input}
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={DEFAULT_NODE_URL}
          spellCheck={false}
        />
      </div>

      <p style={s.tip}>
        默认会连接当前线上节点。<br />
        如果你换了服务器，也可以在这里改成新的公网地址。
      </p>

      {saved && <p style={s.saved}>✓ 已保存</p>}

      <button style={s.btn} onClick={save}>保存</button>
      <button style={{ ...s.btn, background: '#334155' }} onClick={onBack}>返回</button>
    </div>
  );
}
