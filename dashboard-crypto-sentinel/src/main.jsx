import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#0d1c2a', color: '#ff3b5c', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 600, background: '#0a1520', padding: 32, borderRadius: 12, border: '1px solid #ff3b5c40', textAlign: 'center' }}>
            <h2 style={{ color: '#00f5c8', marginBottom: 16 }}>🛡️ CryptoSentinel Dashboard</h2>
            <p style={{ color: '#e8f4f8', marginBottom: 20 }}>Terjadi kesalahan saat memuat tampilan dashboard.</p>
            <pre style={{ background: '#030609', padding: 16, borderRadius: 8, color: '#ff3b5c', textAlign: 'left', overflow: 'auto', fontSize: '0.85rem' }}>
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: 24, padding: '12px 24px', background: '#00f5c8', color: '#030609', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}
            >
              Muat Ulang Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
