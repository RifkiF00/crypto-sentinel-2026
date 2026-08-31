import { Bell, Sun, Moon, Filter, Menu, Zap, Home, EyeOff, Eye, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { APP_MODE } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { triggerSmurfingSimulation } from '../services/api';

export default function Header({
  onMenuToggle,
  apiOnline = false,
  systemHealth = {},
  onBackToLanding,
  addToast,
  privacyMasking = false,
  setPrivacyMasking,
  activePage = 'dashboard'
}) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const role = currentUser?.role;
  const [isSimulating, setIsSimulating] = useState(false);

  const getHeaderMeta = () => {
    switch (activePage) {
      case 'dashboard':
        if (role === 'admin_regulator') {
          return {
            title: 'Regulatory Compliance Overview',
            desc: 'Statistik pencegahan kejahatan keuangan ekosistem Apex Bank & evaluasi rasio False Positive'
          };
        }
        return {
          title: 'Konsolidasi Risk Dashboard',
          desc: 'Ringkasan total dana terselamatkan (Mule Saved) Bank Kuningan, Bank BJB & Apex Holding'
        };
      case 'monitoring':
        return {
          title: 'Live Sentinel Stream',
          desc: 'Pemantauan aliran transaksi real-time dari core banking Bank Kuningan & Bank BJB'
        };
      case 'analysis':
        if (role === 'admin_regulator') {
          return {
            title: 'Transparansi Model GNN (XAI Governance)',
            desc: 'Audit explainability algoritma AI Graph Neural Network & kepatuhan perlindungan konsumen'
          };
        }
        return {
          title: 'Analisis Graf Relasi (GNN) — Cross-Bank Explorer',
          desc: 'Pemetaan visualisasi multi-hop aliran dana Bank Kuningan -> Bank BJB -> Wallet Kripto'
        };
      case 'alerts':
        return {
          title: 'Investigasi Alert (CMS)',
          desc: 'Triage antrean transaksi mencurigakan, catatan forensik & eskalasi pemblokiran'
        };
      case 'rules':
        return {
          title: 'Kalibrasi FDS (POJK 8/2023)',
          desc: 'Pengaturan ambang batas skor risiko terpusat & tenant-specific Bank Kuningan vs Bank BJB'
        };
      case 'compliance':
        if (role === 'admin_regulator') {
          return {
            title: 'Audit Log & Traceability (PPATK & OJK Audit)',
            desc: 'Pemeriksaan immutable audit trail, log tindakan analis & otorisasi pemblokiran'
          };
        }
        return {
          title: 'Kepatuhan & Audit PPATK',
          desc: 'Multi-Entity SAR Generator & ekspor resmi LTKM / STR ke goAML PPATK'
        };
      case 'apolo_governance':
        return {
          title: 'APOLO OJK Compliance Preview',
          desc: 'Formulir komposisi nasabah berdasar risiko siap unggah ke portal resmi APOLO OJK'
        };
      default:
        return {
          title: 'Dashboard Overview',
          desc: 'Monitor transaksi bank & pencegahan pelarian uang ke crypto'
        };
    }
  };

  const headerMeta = getHeaderMeta();

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

  const toggleMasking = () => {
    const next = !privacyMasking;
    if (setPrivacyMasking) setPrivacyMasking(next);
    if (addToast) {
      addToast(
        next
          ? '🔒 Mode Sensor Privasi (UU PDP No. 27/2022) DIAKTIFKAN'
          : '🔓 Mode Sensor Privasi DINONAKTIFKAN (Tampilkan Data Lengkap)',
        next ? 'success' : 'warning'
      );
    }
  };

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle} id="btn-menu">
          <Menu size={20} />
        </button>
        <div className="header-title-group">
          <h2>{headerMeta.title}</h2>
          <p>{headerMeta.desc}</p>
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

        {/* Toggle Masking UU PDP */}
        <button
          className="btn btn-ghost btn-sm tooltip"
          data-tooltip={privacyMasking ? 'Matikan Sensor Privasi' : 'Aktifkan Sensor UU PDP'}
          onClick={toggleMasking}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            background: privacyMasking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
            color: privacyMasking ? '#10b981' : 'var(--text-secondary)',
            border: `1px solid ${privacyMasking ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '5px 12px',
          }}
        >
          {privacyMasking ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{privacyMasking ? 'UU PDP: AKTIF' : 'Sensor Data'}</span>
        </button>

        {/* Sandbox Demo Controls (Isolated from Production) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '3px 6px 3px 10px'
        }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
            SANDBOX DEMO
          </span>

          <button
            className="btn btn-sm"
            onClick={handleSimulateSmurfing}
            disabled={isSimulating}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
              cursor: isSimulating ? 'wait' : 'pointer'
            }}
            title="Simulasi mutasi smurfing buatan dalam lingkungan sandbox pengujian"
          >
            <Zap size={12} className={isSimulating ? 'animate-bounce' : ''} />
            <span>{isSimulating ? 'Memproses...' : 'Simulasi Smurfing'}</span>
          </button>
        </div>

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
            {apiOnline
              ? (systemHealth.coreOnline ? `SENTINEL + CORE: ONLINE · ${APP_MODE.toUpperCase()}` : `SENTINEL API: ONLINE · CORE UNAVAILABLE · ${APP_MODE.toUpperCase()}`)
              : `${APP_MODE.toUpperCase()}: BACKEND UNAVAILABLE`}
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
