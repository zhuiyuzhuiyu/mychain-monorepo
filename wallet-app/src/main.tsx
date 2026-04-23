import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class ErrorBoundary extends Component<{ children: ReactNode }, { err: string }> {
  state = { err: '' };
  static getDerivedStateFromError(e: Error) { return { err: e.message }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 32, fontFamily: 'monospace', color: '#dc2626', background: '#fef2f2', minHeight: '100vh' }}>
        <h2>渲染错误</h2>
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.err}</pre>
      </div>
    );
    return this.props.children;
  }
}

// 等 MetaMask SES lockdown 跑完再挂载，否则会白屏
setTimeout(() => {
  const root = document.getElementById('root');
  if (!root) return;
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}, 0);
