import { useState } from 'react';

interface CopyBtnProps { text: string; }

export default function CopyBtn({ text }: CopyBtnProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title="复制" style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#00a186' : '#adb5bd', fontSize: 12, padding: '1px 4px', marginLeft: 2 }}>
      {copied ? '✓' : '⎘'}
    </button>
  );
}
