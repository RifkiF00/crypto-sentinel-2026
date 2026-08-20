import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Sun,
  Moon,
  Filter,
  Menu,
  Zap,
  Home,
  ShieldCheck,
  UserCheck,
  Award,
  KeyRound,
  Lock,
  X,
  FileText,
  Activity,
  Building2,
  BadgeCheck,
  LogOut,
  Radio
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { triggerSmurfingSimulation } from '../services/api';

export default function Header({
  onMenuToggle,
  apiOnline = false,
  onBackToLanding,
  addToast,
  adminProfile
}) {
  const { theme, toggleTheme } = useTheme();
  const [isSimulating, setIsSimulating] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const profile = adminProfile || {
    name: 'Capt. Ir. Hendra Wijaya, M.Sc., CAMS',
    role: 'Analis Senior Satgas TPPU (OJK & PPATK)',
    avatar: 'HW',
    nip: 'NIP-19880412-201201-1-003',
    badgeId: 'SENTINEL-OFFICER-007',
    clearance: 'LEVEL 4 — HIGH COMMAND',
    certifications: 'CAMS • CFE • CISSP',
    station: 'SOC-Room 04 (Gedung Soemitro Jakarta)',
    ipAddress: '10.12.88.45 (Intranet Regulator)',
    sessionToken: 'SEC-8849-2026-ACTIVE'
  };

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle} id="btn-menu">
          <Menu size={20} />
        </button>
        <div className="header-title-group">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Dashboard Overview
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontFamily: 'var(--font-mono)'
            }}>
              HQ-COMMAND
            </span>
          </h2>
          <p>Monitor transaksi bank & pencegahan pelarian uang ke crypto</p>
        </div>
      </div>

      <div className="header-right" style={{ gap: 12 }}>
        {onBackToLanding && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onBackToLanding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
          >
            <Home size={15} />
            <span>Landing Page</span>
          </button>
        )}

        {/* Smurfing Simulation Button */}
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
            fontSize: '0.78rem',
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

        {/* Sentinel Live API Status */}
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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: apiOnline ? '#10b981' : 'var(--text-muted)' }}>
            {apiOnline ? 'SENTINEL API: ONLINE' : 'SENTINEL: OFFLINE MODE'}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          className="theme-toggle tooltip"
          data-tooltip={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
          onClick={toggleTheme}
          id="btn-theme-toggle"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </header>
  );
}
