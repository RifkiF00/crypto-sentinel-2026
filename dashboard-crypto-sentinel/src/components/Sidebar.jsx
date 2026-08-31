import {
  LayoutDashboard,
  Activity,
  GitBranch,
  ShieldAlert,
  Users,
  Database,
  Sliders,
  Shield,
  FileCheck2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, onPageChange, isOpen, adminProfile, alertsCount }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'analyst';

  let navSections = [];
  const operationsItems = [
    { icon: LayoutDashboard, label: 'Operations Control', id: 'operations', badge: 'SLA' },
    { icon: Activity, label: 'Transaction Monitoring', id: 'monitoring', badge: 'LIVE' },
    { icon: ShieldAlert, label: 'Alert & Case Queue', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
  ];
  const investigationItems = [
    { icon: Users, label: 'Customer / Account 360', id: 'investigation_360' },
    { icon: GitBranch, label: 'Network & Graph Analysis', id: 'analysis' },
  ];

  if (role === 'analyst') {
    navSections = [
      { title: 'Operations', items: [{ icon: LayoutDashboard, label: 'Dashboard Operasional', id: 'dashboard', badge: 'TRIAGE' }, ...operationsItems.slice(1)] },
      { title: 'Investigation', items: investigationItems },
    ];
  } else if (role === 'admin_regulator') {
    navSections = [
      {
        title: 'Pengawasan Independen (Read-Only)',
        items: [
          { icon: LayoutDashboard, label: 'Regulatory Compliance Overview', id: 'dashboard', badge: 'AUDIT' },
          { icon: GitBranch, label: 'Transparansi Model GNN (XAI)', id: 'analysis', badge: 'XAI' },
        ],
      },
      {
        title: 'Kepatuhan Regulasi & Audit Trail',
        items: [
          { icon: Shield, label: 'Audit Log & Traceability', id: 'compliance', badge: 'PPATK' },
          { icon: FileCheck2, label: 'APOLO OJK Compliance Preview', id: 'apolo_governance', badge: 'APOLO' },
        ],
      }
    ];
  } else {
    // compliance_officer (MLRO / Full Access)
    navSections = [
      { title: 'Operations', items: operationsItems },
      { title: 'Investigation', items: investigationItems },
      {
        title: 'Manajemen Risiko Eksekutif',
        items: [
          { icon: LayoutDashboard, label: 'Konsolidasi Risk Dashboard', id: 'dashboard' },
          { icon: Activity, label: 'Live Sentinel Stream', id: 'monitoring', badge: 'LIVE' },
          { icon: GitBranch, label: 'Analisis Graf Relasi (GNN)', id: 'analysis' },
          { icon: ShieldAlert, label: 'Investigasi Alert (CMS / Approval)', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
        ],
      },
      {
        title: 'Risk Controls & Compliance',
        items: [
          { icon: Sliders, label: 'Risk Rules & Thresholds', id: 'risk_controls' },
          { icon: Sliders, label: 'Kalibrasi FDS (POJK 8/2023)', id: 'rules' },
          { icon: Shield, label: 'Kepatuhan & Audit PPATK', id: 'compliance' },
        ],
      },
      {
        title: 'Platform & Governance',
        items: [
          { icon: GitBranch, label: 'Model Governance & XAI', id: 'model_governance' },
          { icon: Database, label: 'Integration & Data Quality', id: 'integration' },
          { icon: Lock, label: 'Administration & RBAC', id: 'administration' },
        ],
      }
    ];
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar-nav">
      <div className="sidebar-header" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: '74px' }}>
        <img
          src="/img/logo_dashboard.png"
          alt="Crypto-Sentinel 2026"
          style={{
            width: '100%',
            maxWidth: '215px',
            height: 'auto',
            maxHeight: '56px',
            marginLeft: '8px',
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block'
          }}
        />
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="nav-section" key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
                id={`nav-${item.id}`}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`nav-badge ${item.id === 'monitoring' ? 'badge-live' : ''}`}
                    style={{
                      background: item.badge === 'LOCKED'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : item.badge === 'READ-ONLY' || item.badge === 'AUDIT' || item.badge === 'INSPECTOR'
                          ? 'rgba(124, 58, 237, 0.15)'
                          : item.id === 'monitoring'
                            ? 'var(--status-success)'
                            : 'var(--status-danger)',
                      color: item.badge === 'LOCKED'
                        ? '#ef4444'
                        : item.badge === 'READ-ONLY' || item.badge === 'AUDIT' || item.badge === 'INSPECTOR'
                          ? '#a78bfa'
                          : 'white',
                      border: item.badge === 'LOCKED'
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : item.badge === 'READ-ONLY' || item.badge === 'AUDIT' || item.badge === 'INSPECTOR'
                          ? '1px solid rgba(124, 58, 237, 0.3)'
                          : 'none',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      animation: item.id === 'monitoring' || item.badge === 'LOCKED' || item.badge === 'READ-ONLY' || item.badge === 'AUDIT' || item.badge === 'INSPECTOR' ? 'none' : 'pulse-badge 2s infinite'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '14px 16px' }}>
        <div className="sidebar-user" id="sidebar-user-profile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="user-avatar" style={{
            background: adminProfile?.badgeColor ? `${adminProfile.badgeColor}22` : 'var(--accent-primary-subtle)',
            color: adminProfile?.badgeColor || 'var(--accent-primary)',
            border: `1.5px solid ${adminProfile?.badgeColor || 'var(--accent-primary)'}66`,
            fontWeight: 800
          }}>
            {adminProfile?.avatar || 'AR'}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="name" style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminProfile?.name || 'Admin Regulator'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span className="role" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {adminProfile?.role || 'OJK - Compliance Div.'}
              </span>
            </div>
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 4,
                background: `${adminProfile?.badgeColor || '#10b981'}22`,
                color: adminProfile?.badgeColor || '#10b981',
                border: `1px solid ${adminProfile?.badgeColor || '#10b981'}44`
              }}>
                {adminProfile?.badge || 'FULL ACCESS'}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                • {adminProfile?.level || 'LEVEL 2'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

