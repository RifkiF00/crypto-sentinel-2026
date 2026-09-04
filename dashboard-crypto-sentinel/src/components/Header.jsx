import { Bell, Filter, Menu, Home, EyeOff, ShieldCheck, LogIn } from 'lucide-react';
import { useState } from 'react';
import { APP_MODE } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser } = useAuth();
  const role = currentUser?.role;

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
          title: 'Live Monitoring',
          desc: 'Aliran transaksi real-time terhubung ke core banking'
        };
      case 'analysis':
        if (role === 'admin_regulator') {
          return {
            title: 'GNN Network Investigation (Audit)',
            desc: 'Audit keterbukaan model graph neural network dan kepatuhan POJK'
          };
        }
        return {
          title: 'GNN Network Investigation',
          desc: 'Investigasi topologi multi-hop sindikat mule dan penampungan exchange'
        };
      case 'alerts':
        return {
          title: 'Cases & Compliance',
          desc: 'Antrean investigasi kasus, forensik transaksi dan eskalasi tindakan'
        };
      case 'gnn_metrics_catalog':
        return {
          title: 'Katalog 15 Indikator & Anthropic GNN',
          desc: 'Eksplorasi metrik AML, canvas jaringan, dan dekomposisi XAI per indikator'
        };
      case 'risk_controls':
        return {
          title: 'Risk Controls & Policies',
          desc: 'Kebijakan mitigasi risiko dan pengendalian fraud platform'
        };
      case 'rules':
        return {
          title: 'Kalibrasi Threshold (POJK 8)',
          desc: 'Pengaturan parameter deteksi dan ambang batas risiko POJK 8/2023'
        };
      case 'model_governance':
        return {
          title: 'Model Governance & XAI',
          desc: 'Transparansi model AI, performa GraphSAGE GNN, dan model card'
        };
      case 'integration':
        return {
          title: 'Integrasi & Kualitas Data',
          desc: 'Konektivitas core banking APEX bjb, sensor PDP, dan pipeline stream'
        };
      case 'compliance':
        if (role === 'admin_regulator') {
          return {
            title: 'Audit Log PPATK & Traceability',
            desc: 'Jejak audit immutable untuk kepatuhan regulator'
          };
        }
        return {
          title: 'Kepatuhan PPATK (LTKM Draf)',
          desc: 'Manajemen draf pelaporan SAR/LTKM ke portal goAML PPATK'
        };
      case 'apolo_governance':
        return {
          title: 'Pelaporan APOLO OJK',
          desc: 'Pratinjau dan arsip data kepatuhan profil risiko nasabah OJK'
        };
      case 'administration':
        return {
          title: 'Administrasi & RBAC',
          desc: 'Manajemen pengguna, hak akses peran, dan tata kelola sistem'
        };
      default:
        return {
          title: 'Platform Overview',
          desc: 'Sistem deteksi dini anti-pencucian uang'
        };
    }
  };

  const headerMeta = getHeaderMeta();

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
        <button className="mobile-menu-btn" onClick={onMenuToggle} id="btn-menu" aria-label="Toggle Menu" title="Buka / Tutup Sidebar">
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
            border: privacyMasking ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            background: privacyMasking ? '#eff6ff' : '#f8fafc',
            color: privacyMasking ? '#1d4ed8' : '#64748b',
            cursor: 'pointer'
          }}
        >
          {privacyMasking ? <ShieldCheck size={14} color="#1d4ed8" /> : <EyeOff size={14} color="#64748b" />}
          <span>{privacyMasking ? 'Sensor PDP Aktif' : 'Sensor Nonaktif'}</span>
        </button>

        {/* Live Status Badge */}
        <div
          id="live-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            background: apiOnline ? '#eff6ff' : '#f8fafc',
            border: apiOnline ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: apiOnline ? '#1d4ed8' : '#64748b'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: apiOnline ? '#2563eb' : '#94a3b8',
              boxShadow: apiOnline ? '0 0 6px rgba(37, 99, 235, 0.45)' : 'none'
            }}
          />
          <span>{apiOnline ? (systemHealth.coreOnline ? 'Engine + Core Live' : 'Sentinel Engine Live') : 'Offline'}</span>
        </div>

        {onBackToLanding && (
          <button
            className="btn btn-ghost btn-sm tooltip"
            data-tooltip="Keluar / Halaman Login"
            onClick={onBackToLanding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.76rem',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              cursor: 'pointer'
            }}
          >
            <LogIn size={14} color="#1d4ed8" />
            <span>Login</span>
          </button>
        )}

      </div>
    </header>
  );
}
