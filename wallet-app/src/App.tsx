import { useState } from 'react';
import type { WalletInfo } from './bridge';
import ConnectPage from './pages/ConnectPage';
import WalletPage from './pages/WalletPage';
import SendPage from './pages/SendPage';

type Page = 'connect' | 'wallet' | 'send';

const STORAGE_KEY = 'mychain_wallet_address';

function loadSaved(): WalletInfo | null {
  const addr = localStorage.getItem(STORAGE_KEY);
  return addr ? { address: addr } : null;
}

export default function App() {
  const [wallet, setWallet] = useState<WalletInfo | null>(loadSaved);
  const [page, setPage] = useState<Page>(loadSaved() ? 'wallet' : 'connect');

  const connect = (info: WalletInfo) => {
    localStorage.setItem(STORAGE_KEY, info.address);
    setWallet(info);
    setPage('wallet');
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setWallet(null);
    setPage('connect');
  };

  if (page === 'connect') return <ConnectPage onConnected={connect} />;
  if (page === 'send' && wallet) return <SendPage wallet={wallet} onBack={() => setPage('wallet')} />;
  if (wallet) return <WalletPage wallet={wallet} onSend={() => setPage('send')} onDisconnect={disconnect} />;
  return null;
}
