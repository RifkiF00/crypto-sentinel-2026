/**
 * AuthContext.jsx — Real Role-Based Access Control (RBAC)
 * Crypto-Sentinel | Enterprise Banking FDS Platform
 * 
 * Tiga Tier Akses (Sesuai Struktur Organisasi Bank):
 * 1. admin_regulator   — OJK/BI Supervisory Access (Full Read, No Write)
 * 2. compliance_officer — Pejabat Kepatuhan APU-PPT (Full Access)
 * 3. analyst           — Analis AML (Read + Alert Resolution only)
 */

import { createContext, useContext, useState } from 'react';

// ─── Permission Matrix ────────────────────────────────────────────────────────
export const ROLES = {
  admin_regulator: {
    label: 'Pengawas Regulasi (OJK / BI)',
    sublabel: 'OJK — Supervisory / Read-Only Audit',
    avatar: 'AR',
    badge: 'SUPERVISORY',
    badgeColor: '#7c3aed',
    level: 'LEVEL 3 — Supervisory Audit',
    defaultPage: 'dashboard',
    allowedMenus: ['dashboard', 'analysis', 'compliance', 'apolo_governance'],
    description: 'Audit kepatuhan sistem, pengawasan independen, validasi transparansi model AI & audit log tanpa intervensi operasional.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: false,  // Tidak ada di daftar menu pengawas
      viewGNN: true,              // Transparansi Model GNN (XAI)
      viewAlerts: false,          // Tidak ada di daftar menu pengawas
      triageAlert: false,
      addNotes: false,
      executeBlock: false,
      resolveAlert: false,
      generateLTKM: false,
      viewRules: false,           // Tidak ada di menu pengawas
      editRules: false,
      viewCompliance: true,       // Audit Log & Traceability
      viewApolo: true,            // APOLO OJK Compliance Preview
      downloadLTKM: true,
      manageGovernance: false,
    }
  },
  compliance_officer: {
    label: 'Pejabat Kepatuhan (Compliance Officer / MLRO)',
    sublabel: 'Unit APU-PPT & Kepatuhan Bank',
    avatar: 'PK',
    badge: 'FULL ACCESS',
    badgeColor: '#059669',
    level: 'LEVEL 3 — MLRO / Full Access',
    defaultPage: 'dashboard',
    allowedMenus: ['dashboard', 'monitoring', 'analysis', 'alerts', 'rules', 'compliance'],
    description: 'Pengambilan keputusan akhir pemblokiran, kalibrasi kebijakan risiko POJK 8/2023, dan persetujuan pelaporan resmi PPATK.',
    permissions: {
      viewDashboard: true,       // Konsolidasi Risk Dashboard
      viewLiveMonitoring: true,  // Live Sentinel Stream
      viewGNN: true,             // Analisis Graf Relasi (GNN)
      viewAlerts: true,          // Approval Engine & Block Action / CMS
      triageAlert: true,
      addNotes: true,
      executeBlock: true,        // Approval Freeze / Unfreeze
      resolveAlert: true,        // Keputusan final
      generateLTKM: true,        // Multi-Entity SAR Generator
      viewRules: true,           // Global & Tenant-Specific Rule Calibration
      editRules: true,
      viewCompliance: true,      // Kepatuhan & Audit PPATK
      viewApolo: false,
      downloadLTKM: true,
      manageGovernance: true,
    }
  },
  analyst: {
    label: 'Analis AML / Fraud Investigator',
    sublabel: 'Unit Forensik & Triage Transaksi',
    avatar: 'AA',
    badge: 'READ + TRIAGE',
    badgeColor: '#0284c7',
    level: 'LEVEL 1 — Read + Triage',
    defaultPage: 'dashboard',
    allowedMenus: ['dashboard', 'monitoring', 'analysis', 'alerts'],
    description: 'Deteksi cepat, investigasi transaksi harian, analisis graf relasi GNN, dan eskalasi indikasi ancaman ke Pejabat Kepatuhan.',
    permissions: {
      viewDashboard: true,       // Dashboard Operasional (Beban Kerja & Triage Personal)
      viewLiveMonitoring: true,  // Live Sentinel Stream
      viewGNN: true,             // Analisis Graf Relasi (GNN) - Cross-Bank Explorer
      viewAlerts: true,          // Investigasi Alert (CMS)
      triageAlert: true,         // Triage alert
      addNotes: true,            // Investigation Notes & mutasi
      executeBlock: false,       // Eskalasi ke MLRO
      resolveAlert: false,
      generateLTKM: false,
      viewRules: false,          // Dihilangkan
      editRules: false,
      viewCompliance: false,     // Dihilangkan
      viewApolo: false,
      downloadLTKM: false,
      manageGovernance: false,
    }
  }
};

// ─── Predefined User Accounts ────────────────────────────────────────────────
export const DEMO_USERS = [
  {
    id: 'u1',
    email: 'compliance@bankkuningan.co.id',
    password: 'SentinelPass2026!',
    name: 'Pejabat Kepatuhan (Compliance Officer)',
    role: 'compliance_officer',
    bank: 'PT BPR Kuningan (Perseroda)',
    nip: 'BKG-COMPLIANCE-0089',
  },
  {
    id: 'u2',
    email: 'regulator@ojk.go.id',
    password: 'OJKInspect2026!',
    name: 'Pengawas Regulasi (OJK / BI Inspector)',
    role: 'admin_regulator',
    bank: 'OJK — Pengawasan Perbankan',
    nip: 'OJK-SUPERVISORY-0042',
  },
  {
    id: 'u3',
    email: 'analyst@bankbjb.co.id',
    password: 'AnalystBjb2026!',
    name: 'Analis AML / Fraud Investigator',
    role: 'analyst',
    bank: 'Bank bjb — Unit AML & Forensik',
    nip: 'BJB-ANALYST-0211',
  }
];

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (user) => {
    const roleConfig = ROLES[user.role] || ROLES.analyst;
    setCurrentUser({ ...user, roleConfig });
  };

  const logout = () => setCurrentUser(null);

  const can = (permission) => {
    if (!currentUser) return false;
    return currentUser.roleConfig?.permissions?.[permission] ?? false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, can, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ─── Access Denied Overlay Component ─────────────────────────────────────────
export function AccessDenied({ permission = '', requiredRole = 'Pejabat Kepatuhan' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 20,
      textAlign: 'center'
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem'
      }}>
        🔒
      </div>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Akses Terbatas
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 420, lineHeight: 1.6 }}>
          Fitur <strong style={{ color: 'var(--text-primary)' }}>{permission}</strong> memerlukan hak akses <strong style={{ color: '#10b981' }}>{requiredRole}</strong>.
          Hubungi administrator sistem untuk pengaturan akses.
        </p>
      </div>
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        padding: '12px 20px',
        fontSize: '0.78rem',
        color: '#ef4444',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600
      }}>
        ERROR 403: PERMISSION_DENIED — {permission.toUpperCase().replace(/ /g, '_')}
      </div>
    </div>
  );
}
