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
    label: 'Admin Regulator',
    sublabel: 'OJK — Supervisory Access',
    avatar: 'AR',
    badge: 'SUPERVISORY',
    badgeColor: '#7c3aed',
    level: 'LEVEL 3 — Full Read',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      resolveAlert: false,       // OJK tidak boleh resolve tiket bank
      generateLTKM: false,       // Hanya pejabat bank yang generate
      viewRules: true,
      editRules: false,          // OJK tidak mengubah threshold bank
      viewCompliance: true,
      downloadLTKM: true,        // Bisa unduh untuk audit
    }
  },
  compliance_officer: {
    label: 'Pejabat Kepatuhan',
    sublabel: 'APU-PPT — Compliance Officer',
    avatar: 'PK',
    badge: 'FULL ACCESS',
    badgeColor: '#059669',
    level: 'LEVEL 2 — Operator',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      resolveAlert: true,        // Bisa resolve & tutup kasus
      generateLTKM: true,        // Bisa generate laporan LTKM ke PPATK
      viewRules: true,
      editRules: true,           // Bisa kalibrasi threshold FDS
      viewCompliance: true,
      downloadLTKM: true,
    }
  },
  analyst: {
    label: 'Analis AML',
    sublabel: 'Unit Investigasi Keuangan',
    avatar: 'AA',
    badge: 'READ + TRIAGE',
    badgeColor: '#0284c7',
    level: 'LEVEL 1 — Analyst',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      resolveAlert: true,        // Bisa triage (tandai untuk review)
      generateLTKM: false,       // Tidak bisa generate LTKM — harus ke Compliance Officer
      viewRules: true,
      editRules: false,          // Tidak bisa ubah threshold
      viewCompliance: true,
      downloadLTKM: false,
    }
  }
};

// ─── Predefined User Accounts ────────────────────────────────────────────────
export const DEMO_USERS = [
  {
    id: 'u1',
    email: 'compliance@bankkuningan.co.id',
    password: 'SentinelPass2026!',
    name: 'Rifki Firmansyah, S.Kom',
    role: 'compliance_officer',
    bank: 'PT BPR Kuningan (Perseroda)',
    nip: 'BKG-2026-0089',
  },
  {
    id: 'u2',
    email: 'regulator@ojk.go.id',
    password: 'OJKInspect2026!',
    name: 'Bu Fatimah Sari, M.Ak',
    role: 'admin_regulator',
    bank: 'OJK — Pengawasan Perbankan',
    nip: 'OJK-REG-0042',
  },
  {
    id: 'u3',
    email: 'analyst@bankbjb.co.id',
    password: 'AnalystBjb2026!',
    name: 'Billy Jonathan, S.E',
    role: 'analyst',
    bank: 'Bank bjb — Unit AML',
    nip: 'BJB-AML-0211',
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
