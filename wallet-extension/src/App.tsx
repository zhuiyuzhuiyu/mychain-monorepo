import { useState, useEffect } from 'react';
import { getWallet, type WalletData } from './store';
import SetupPage from './pages/SetupPage';
import WalletPage from './pages/WalletPage';
import SendPage from './pages/SendPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'setup' | 'wallet' | 'send' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('setup');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWallet().then(w => {
      if (w) { setWallet(w); setPage('wallet'); }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#6c757d', fontSize: 13 }}>
        加载中...
      </div>
    );
  }

  if (page === 'setup') {
    return (
      <SetupPage onDone={() => {
        getWallet().then(w => { if (w) { setWallet(w); setPage('wallet'); } });
      }} />
    );
  }

  if (page === 'settings') {
    return <SettingsPage onBack={() => setPage(wallet ? 'wallet' : 'setup')} />;
  }

  if (page === 'send' && wallet) {
    return <SendPage wallet={wallet} onBack={() => setPage('wallet')} />;
  }

  if (wallet) {
    return (
      <WalletPage
        wallet={wallet}
        onSend={() => setPage('send')}
        onSettings={() => setPage('settings')}
        onLogout={() => { setWallet(null); setPage('setup'); }}
      />
    );
  }

  return null;
}
