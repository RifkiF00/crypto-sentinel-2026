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
    description: 'Audit kepatuhan sistem, pengawasan independen, validasi transparansi model AI & audit log tanpa intervensi operasional.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      triageAlert: false,        // OJK tidak melakukan triage operasional
      addNotes: false,           // Read-only
      executeBlock: false,       // TIDAK BOLEH memblokir transaksi (mencegah conflict of interest)
      resolveAlert: false,       // TIDAK BOLEH menutup kasus bank
      generateLTKM: false,       // Hanya bank yang submit SAR ke PPATK
      viewRules: true,           // Bisa audit kalibrasi & transparansi AI (Read-Only)
      editRules: false,          // TIDAK BOLEH mengubah ambang batas bank
      viewCompliance: true,      // Mengakses Immutable Audit Log & Timestamp LTKM
      downloadLTKM: true,        // Bisa unduh dokumen untuk audit pengawasan
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
    description: 'Pengambilan keputusan akhir pemblokiran, kalibrasi kebijakan risiko POJK 8/2023, dan persetujuan pelaporan resmi PPATK.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      triageAlert: true,
      addNotes: true,
      executeBlock: true,        // Menyetujui eskalasi Freeze / Unfreeze
      resolveAlert: true,        // Memutuskan status akhir: Resolved - Valid Threat vs False Positive
      generateLTKM: true,        // Menyetujui & ekspor draft LTKM/SAR langsung ke standar PPATK goAML
      viewRules: true,
      editRules: true,           // Mengubah ambang batas skor risiko & bobot hibrida GNN
      viewCompliance: true,
      downloadLTKM: true,
      manageGovernance: true,    // Mengatur hak akses tim dan kriteria Travel Rule
    }
  },
  analyst: {
    label: 'Analis AML / Fraud Investigator',
    sublabel: 'Unit Forensik & Triage Transaksi',
    avatar: 'AA',
    badge: 'READ + TRIAGE',
    badgeColor: '#0284c7',
    level: 'LEVEL 1 — Read + Triage',
    description: 'Deteksi cepat, investigasi transaksi harian, analisis graf relasi GNN, dan eskalasi indikasi ancaman ke Pejabat Kepatuhan.',
    permissions: {
      viewDashboard: true,
      viewLiveMonitoring: true,
      viewGNN: true,
      viewAlerts: true,
      triageAlert: true,         // Mengubah status triage: Unassigned -> In Review -> Escalated
      addNotes: true,            // Menambahkan catatan investigasi forensik
      executeBlock: false,       // TIDAK BISA memblokir langsung (harus eskalasi ke MLRO)
      resolveAlert: false,       // Tidak bisa menutup kasus secara final tanpa sign-off
      generateLTKM: false,       // TIDAK BISA kirim laporan ke PPATK tanpa sign-off Pejabat Kepatuhan
      viewRules: false,          // TIDAK BISA mengakses menu Kalibrasi FDS (SoD)
      editRules: false,          // TIDAK BISA mengubah parameter skor risiko
      viewCompliance: true,      // Bisa melihat regulasi terkait
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
