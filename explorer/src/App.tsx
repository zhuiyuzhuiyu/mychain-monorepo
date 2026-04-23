import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlocksPage from './pages/BlocksPage';
import BlockDetail from './pages/BlockDetail';
import TxsPage from './pages/TxsPage';
import TxDetail from './pages/TxDetail';
import AddressPage from './pages/AddressPage';
import AccountsPage from './pages/AccountsPage';
import MinerPage from './pages/MinerPage';
import { api, type ChainInfo, type ChainStatus } from './api';

type Stats = Partial<ChainStatus> & { mempool?: number };

export default function App() {
  const [stats, setStats] = useState<Stats>({});
  const [info, setInfo] = useState<Partial<ChainInfo>>({});

  useEffect(() => {
    const load = async () => {
      const [status, txs, chainInfo] = await Promise.all([
        api.status().catch(() => ({} as ChainStatus)),
        api.pending().catch(() => ({ pending: [] })),
        api.info().catch(() => ({} as ChainInfo)),
      ]);
      setStats({ height: status.height, latestHash: status.latestHash, latestTime: status.latestTime, mempool: txs.pending?.length ?? 0 });
      setInfo(chainInfo);
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <StatsBar stats={stats} info={info} />
      <main style={{ minHeight: 'calc(100vh - 220px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blocks" element={<BlocksPage />} />
          <Route path="/block/:height" element={<BlockDetail />} />
          <Route path="/txs" element={<TxsPage />} />
          <Route path="/tx/:hash" element={<TxDetail />} />
          <Route path="/address/:address" element={<AddressPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/miner" element={<MinerPage />} />
        </Routes>
      </main>
      <Footer info={info} />
    </BrowserRouter>
  );
}
