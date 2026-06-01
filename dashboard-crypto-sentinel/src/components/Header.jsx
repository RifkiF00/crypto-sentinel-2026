import { Bell, Sun, Moon, Filter, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onMenuToggle, apiOnline = false }) {
  const { theme, toggleTheme } = useTheme();

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
        <button className="header-btn tooltip" data-tooltip="Filter" id="btn-filter">
          <Filter size={18} />
        </button>
        <button className="header-btn tooltip" data-tooltip="Notifikasi" id="btn-notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
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
