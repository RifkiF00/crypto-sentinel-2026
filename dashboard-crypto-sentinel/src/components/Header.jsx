import { Bell, Sun, Moon, Filter, Menu, Zap, Home } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { triggerSmurfingSimulation } from '../services/api';

export default function Header({ onMenuToggle, apiOnline = false, onBackToLanding, addToast }) {
  const { theme, toggleTheme } = useTheme();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateSmurfing = async () => {
    setIsSimulating(true);
    if (addToast) addToast('🔥 Menjalankan 10 transfer smurfing beruntun...', 'warning');
    try {
      const res = await triggerSmurfingSimulation();
      if (addToast) {
        addToast(`✅ Simulasi Selesai! ${res.message || ''}`, 'success');
      }
    } catch (e) {
      if (addToast) addToast(`⚠️ Gagal menjalankan simulasi: ${e.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle} id="btn-menu">
          <Menu size={20} />
        </button>
        <div className="header-title-group">
          <h2>Dashboard Overview</h2>
          <p>Monitor transaksi bank & pencegahan pelarian uang ke crypto</p>
        </div>
      </div>
      <div className="header-right">
        {onBackToLanding && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onBackToLanding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
          >
            <Home size={16} />
            <span>Landing Page</span>
          </button>
        )}

        <button
          className="btn btn-sm"
          onClick={handleSimulateSmurfing}
          disabled={isSimulating}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            cursor: isSimulating ? 'wait' : 'pointer'
          }}
        >
          <Zap size={14} className={isSimulating ? 'animate-bounce' : ''} />
          <span>{isSimulating ? 'Menjalankan...' : '🔥 Simulasikan Smurfing'}</span>
        </button>

        <div 
          className="live-indicator animate-pulse" 
          id="live-status"
          style={{
            borderColor: apiOnline ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)',
            background: apiOnline ? 'rgba(16,185,129,0.06)' : 'rgba(100,116,139,0.06)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <div 
            className="live-dot" 
            style={{
              background: apiOnline ? '#10b981' : '#64748b',
              boxShadow: apiOnline ? '0 0 8px #10b981' : 'none'
            }}
          />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: apiOnline ? '#10b981' : 'var(--text-muted)' }}>
            {apiOnline ? 'SENTINEL API: ONLINE' : 'SENTINEL: OFFLINE MODE'}
          </span>
        </div>

        <button
          className="theme-toggle tooltip"
          data-tooltip={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
          onClick={toggleTheme}
          id="btn-theme-toggle"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
