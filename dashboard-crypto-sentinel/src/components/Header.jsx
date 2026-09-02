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
            desc: 'Pengawasan independen dan evaluasi risiko ekosistem multi-bank'
          };
        }
        return {
          title: 'Command Center',
          desc: 'Konsolidasi deteksi transaksi mencurigakan dan profil risiko'
        };
      case 'monitoring':
        return {
          title: 'Live Stream Detection',
          desc: 'Aliran transaksi real-time terhubung ke core banking'
        };
      case 'analysis':
        if (role === 'admin_regulator') {
          return {
            title: 'Tata Kelola Model GNN & XAI',
            desc: 'Audit keterbukaan model graph neural network dan kepatuhan POJK'
          };
        }
        return {
          title: 'GNN Network Investigation',
          desc: 'Investigasi topologi multi-hop sindikat mule dan penampungan exchange'
        };
      case 'alerts':
        return {
          title: 'Case Management & Alerts',
          desc: 'Antrean investigasi, forensik transaksi dan eskalasi tindakan'
        };
      case 'rules':
        return {
          title: 'Kalibrasi FDS & Threshold',
          desc: 'Pengaturan parameter deteksi dan ambang batas risiko POJK 8/2023'
        };
      case 'compliance':
        if (role === 'admin_regulator') {
          return {
            title: 'Audit Log & Traceability',
            desc: 'Jejak audit immutable untuk kepatuhan regulator'
          };
        }
        return {
          title: 'Kepatuhan PPATK (LTKM)',
          desc: 'Manajemen draf pelaporan SAR/LTKM ke portal goAML PPATK'
        };
      case 'apolo_governance':
        return {
          title: 'Pelaporan APOLO OJK',
          desc: 'Pratinjau dan arsip data kepatuhan profil risiko nasabah OJK'
        };
      default:
        return {
          title: 'Platform Overview',
          desc: 'Sistem deteksi dini anti-pencucian uang'
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
        <button className="mobile-menu-btn" onClick={onMenuToggle} id="btn-menu" aria-label="Toggle Menu">
          <Menu size={18} />
        </button>
        <div className="header-title-group">
          <h2>{headerMeta.title}</h2>
          <p>{headerMeta.desc}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Toggle Masking UU PDP */}
        <button
          className="btn btn-ghost btn-sm tooltip"
          data-tooltip={privacyMasking ? 'Matikan Sensor Privasi' : 'Aktifkan Sensor UU PDP No. 27/2022'}
          onClick={toggleMasking}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.76rem',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: privacyMasking ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
            background: privacyMasking ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
            color: privacyMasking ? '#10b981' : 'var(--text-secondary)'
          }}
        >
          {privacyMasking ? <ShieldCheck size={14} /> : <EyeOff size={14} />}
          <span>{privacyMasking ? 'Sensor PDP Aktif' : 'Sensor Nonaktif'}</span>
        </button>

        {/* Sandbox Simulation */}
        <button
          className="btn btn-ghost btn-sm tooltip"
          data-tooltip="Simulasi injeksi 10 transaksi smurfing ke engine"
          onClick={handleSimulateSmurfing}
          disabled={isSimulating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.76rem',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: isSimulating ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
            color: isSimulating ? '#f59e0b' : 'var(--text-secondary)',
            cursor: isSimulating ? 'wait' : 'pointer'
          }}
        >
          <Zap size={14} style={{ color: '#f59e0b' }} className={isSimulating ? 'animate-spin' : ''} />
          <span>{isSimulating ? 'Memproses...' : 'Simulasi Sandbox'}</span>
        </button>

        {/* Live Status Badge */}
        <div
          id="live-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: apiOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(100, 116, 139, 0.08)',
            border: `1px solid ${apiOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.2)'}`,
            fontSize: '0.74rem',
            fontWeight: 600,
            color: apiOnline ? '#10b981' : 'var(--text-muted)'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: apiOnline ? '#10b981' : '#64748b',
              boxShadow: apiOnline ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none'
            }}
          />
          <span>{apiOnline ? (systemHealth.coreOnline ? 'Engine + Core Live' : 'Sentinel Engine Live') : 'Offline'}</span>
        </div>

        {onBackToLanding && (
          <button
            className="btn btn-ghost btn-sm tooltip"
            data-tooltip="Kembali ke Beranda"
            onClick={onBackToLanding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.76rem',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <Home size={14} />
            <span>Landing</span>
          </button>
        )}

        <button
          className="theme-toggle tooltip"
          data-tooltip={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
          onClick={toggleTheme}
          id="btn-theme-toggle"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
