/**
 * AuthContext.jsx — Real Role-Based Access Control (RBAC)
 * Crypto-Sentinel | Enterprise Banking FDS Platform
 * 
 * Dua Role Utama Demo (Segregation of Duties):
 * 1. analyst           — AML Investigator (Triage, GNN Forensics, Customer 360 Masked, Case Notes, Escalate to MLRO)
 * 2. compliance_officer — Compliance Officer / MLRO (Full Decision, Block Approval, Policy Calibration, goAML STR Draft, Advanced Governance)
 *
 * Role Ketiga Konseptual (Roadmap / Read-Only Preview):
 * 3. admin_regulator   — Regulator / Auditor (OJK/BI Supervisory Read-Only Audit)
 */

import { createContext, useContext, useState } from 'react';

// ─── Permission Matrix ────────────────────────────────────────────────────────
export const ROLES = {
  analyst: {
    label: 'AML Investigator',
    sublabel: 'Unit Forensik & Triage Transaksi',
    avatar: 'AI',
    badge: 'INVESTIGATOR',
    badgeColor: '#0284c7',
    level: 'LEVEL 1 — Investigator & Triage',
    defaultPage: 'dashboard',
    allowedMenus: ['dashboard', 'monitoring', 'analysis', 'alerts'],
    description: 'Deteksi cepat transaksi mencurigakan, eksplorasi jaringan relasi GNN, analisis profil Customer 360 (PII masked), dan eskalasi indikasi ke MLRO.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      triageAlert: true,
      addNotes: true,
      createCase: true,
      escalateCase: true,
      requestDraftLTKM: true,
      viewMaskedData: true,
      unmaskPII: false,           // Hanya MLRO terotorisasi
      executeBlock: false,        // Segregation of duties: Investigator tidak boleh memblokir final
      resolveAlert: false,        // Resolusi final oleh MLRO
      overrideCircuitBreaker: false,
      viewRules: false,
      editRules: false,
      viewCompliance: false,
      viewApolo: false,
      downloadLTKM: false,
      manageGovernance: false,
      deleteAuditLogs: false,
    }
  },
  compliance_officer: {
    label: 'Compliance Officer / MLRO',
    sublabel: 'Unit APU-PPT & Kepatuhan Bank',
    avatar: 'CO',
    badge: 'MLRO · FULL ACCESS',
    badgeColor: '#059669',
    level: 'LEVEL 3 — MLRO / Full Decision',
    defaultPage: 'dashboard',
    allowedMenus: [
      'dashboard', 'monitoring', 'analysis', 'alerts',
      'risk_controls', 'rules', 'compliance', 'apolo_governance',
      'model_governance', 'integration', 'administration',
      'operations', 'investigation_360'
    ],
    description: 'Pengambilan keputusan akhir pemblokiran rekening, kalibrasi threshold POJK 8/2023, verifikasi draf LTKM/STR ke PPATK, dan tata kelola platform enterprise.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      triageAlert: true,
      addNotes: true,
      createCase: true,
      escalateCase: true,
      executeBlock: true,         // Otorisasi pemblokiran rekening permanen (wajib reason)
      resolveAlert: true,         // Otorisasi penutupan/resolusi kasus (wajib reason)
      overrideCircuitBreaker: true, // 2-step confirmation + audit trail
      generateLTKM: true,         // Generator draf goAML PPATK 3 detik
      viewRules: true,            // Kalibrasi threshold POJK 8/2023
      editRules: true,
      viewCompliance: true,       // Kepatuhan & Audit PPATK
      viewApolo: true,            // APOLO OJK Compliance Preview
      downloadLTKM: true,
      manageGovernance: true,
      unmaskPII: true,            // Membuka sensor data nasabah (wajib reason)
      deleteAuditLogs: false,     // Audit log bersifat immutable
    }
  },
  admin_regulator: {
    label: 'Regulator / Auditor (Roadmap Preview)',
    sublabel: 'OJK / BI — Supervisory Read-Only Audit',
    avatar: 'RA',
    badge: 'ROADMAP · AUDIT',
    badgeColor: '#7c3aed',
    level: 'LEVEL 3 — Supervisory Audit',
    defaultPage: 'dashboard',
    allowedMenus: ['dashboard', 'analysis', 'compliance', 'apolo_governance', 'model_governance'],
    description: 'Pengawasan independen, penelusuran model card AI, dan verifikasi jejak audit trail kepatuhan perbankan nasional.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: false,
      viewGNN: true,
      viewAlerts: false,
      triageAlert: false,
      addNotes: false,
      createCase: false,
      escalateCase: false,
      executeBlock: false,
      resolveAlert: false,
      generateLTKM: false,
      viewRules: false,
      editRules: false,
      viewCompliance: true,
      viewApolo: true,
      downloadLTKM: true,
      manageGovernance: false,
      unmaskPII: false,
      deleteAuditLogs: false,
    }
  }
};

// ─── Predefined User Accounts ────────────────────────────────────────────────
export const DEMO_USERS = [
  {
    id: 'u1',
    email: 'compliance@bankkuningan.co.id',
    password: 'SentinelPass2026!',
    name: 'Desta Pratama, S.E., CAMS',
    role: 'compliance_officer',
    bank: 'PT BPR Kuningan (Perseroda)',
    nip: 'BKG-MLRO-0089',
  },
  {
    id: 'u2',
    email: 'analyst@bankbjb.co.id',
    password: 'AnalystBjb2026!',
    name: 'Aam Firmansyah, S.Kom.',
    role: 'analyst',
    bank: 'Bank bjb — Unit AML & Forensik',
    nip: 'BJB-INVESTIGATOR-0211',
  },
  // Regulator remains supported by RBAC as a roadmap/read-only preview,
  // but is intentionally not presented as an operational demo login.
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
