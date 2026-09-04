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
  Lock,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, onPageChange, isOpen, adminProfile, alertsCount, onClose }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'analyst';

  let navSections = [];

  if (role === 'analyst') {
    navSections = [
      {
        title: 'Jalur Utama Investigasi',
        items: [
          { icon: LayoutDashboard, label: 'Command Center', id: 'dashboard' },
          { icon: Activity, label: 'Live Monitoring', id: 'monitoring', badge: 'LIVE' },
          { icon: GitBranch, label: 'GNN Network Investigation', id: 'analysis', badge: 'HERO · XAI' },
          { icon: Sliders, label: 'Katalog 15 Indikator & XAI', id: 'gnn_metrics_catalog', badge: '15 METRIK' },
          { icon: ShieldAlert, label: 'Cases & Compliance', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
        ],
      },
    ];
  } else if (role === 'admin_regulator') {
    navSections = [
      {
        title: 'Pengawasan Independen (Read-Only)',
        items: [
          { icon: LayoutDashboard, label: 'Command Center (Audit)', id: 'dashboard', badge: 'AUDIT' },
          { icon: GitBranch, label: 'GNN Network Investigation', id: 'analysis', badge: 'XAI' },
          { icon: GitBranch, label: 'Model Governance & XAI', id: 'model_governance' },
        ],
      },
      {
        title: 'Kepatuhan & Audit Trail',
        items: [
          { icon: Shield, label: 'Audit Log PPATK & Traceability', id: 'compliance', badge: 'PPATK' },
          { icon: FileCheck2, label: 'Pratinjau Pelaporan APOLO OJK', id: 'apolo_governance', badge: 'APOLO' },
        ],
      }
    ];
  } else {
    // compliance_officer (MLRO / Full Access)
    navSections = [
      {
        title: 'Jalur Utama Investigasi',
        items: [
          { icon: LayoutDashboard, label: 'Command Center', id: 'dashboard' },
          { icon: Activity, label: 'Live Monitoring', id: 'monitoring', badge: 'LIVE' },
          { icon: GitBranch, label: 'GNN Network Investigation', id: 'analysis', badge: 'HERO · XAI' },
          { icon: Sliders, label: 'Katalog 15 Indikator & XAI', id: 'gnn_metrics_catalog', badge: '15 METRIK' },
          { icon: ShieldAlert, label: 'Cases & Compliance', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
        ],
      },
      {
        title: 'Advanced Platform & Tata Kelola',
        items: [
          { icon: Sliders, label: 'Risk Controls & Policies', id: 'risk_controls' },
          { icon: Sliders, label: 'Kalibrasi Threshold (POJK 8)', id: 'rules' },
          { icon: GitBranch, label: 'Model Governance & XAI', id: 'model_governance' },
          { icon: Database, label: 'Integrasi & Kualitas Data', id: 'integration' },
          { icon: Shield, label: 'Kepatuhan PPATK (LTKM Draf)', id: 'compliance' },
          { icon: FileCheck2, label: 'Pelaporan APOLO OJK', id: 'apolo_governance' },
          { icon: Lock, label: 'Administrasi & RBAC', id: 'administration' },
        ],
      }
    ];
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar-nav">
      <div className="sidebar-header" style={{ padding: '12px 14px 12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px' }}>
        <img
          src="/img/logo_dashboard.png"
          alt="Crypto-Sentinel 2026"
          style={{
            width: '100%',
            maxWidth: '148px',
            height: 'auto',
            maxHeight: '38px',
            marginLeft: '8px',
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block',
            filter: 'brightness(0) invert(1)'
          }}
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="sidebar-fold-btn"
            title="Tutup / Gulir Sidebar"
            aria-label="Tutup Sidebar"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
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
                  <span className="nav-badge" aria-label={`Status ${item.badge}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.18)', padding: '12px 14px' }}>
        <div className="sidebar-user" id="sidebar-user-profile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="user-avatar" style={{
            width: 36,
            height: 36,
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            boxShadow: 'none',
            fontWeight: 800,
            fontSize: '0.8rem',
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {adminProfile?.avatar || 'AR'}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="name" style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f8fafc' }}>
                {adminProfile?.name || 'Admin Regulator'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
              <span className="role" style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminProfile?.role || 'OJK - Compliance Div.'}
              </span>
            </div>
            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: 4,
                background: '#1e293b',
                color: adminProfile?.badgeColor || '#38bdf8',
                border: `1px solid ${adminProfile?.badgeColor ? `${adminProfile.badgeColor}55` : '#3b4a5f'}`,
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                flexShrink: 0
              }}>
                {adminProfile?.badge || 'FULL ACCESS'}
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                • {adminProfile?.level ? adminProfile.level.split('—')[0].trim() : 'LEVEL 3'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
