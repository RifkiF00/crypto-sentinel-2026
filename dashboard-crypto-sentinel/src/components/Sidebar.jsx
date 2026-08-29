import {
  LayoutDashboard,
  Activity,
  GitBranch,
  ShieldAlert,
  Sliders,
  Shield,
} from 'lucide-react';

export default function Sidebar({ activePage, onPageChange, isOpen, adminProfile, alertsCount }) {
  const navSections = [
    {
      title: 'Operasional Utama',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard Overview', id: 'dashboard' },
        { icon: Activity, label: 'Live Sentinel Stream', id: 'monitoring', badge: 'LIVE' },
        { icon: GitBranch, label: 'Analisis Graf Relasi (GNN)', id: 'analysis' },
        { icon: ShieldAlert, label: 'Investigasi Alert (CMS)', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
      ],
    },
    {
      title: 'Tata Kelola & Regulasi',
      items: [
        { icon: Sliders, label: 'Kalibrasi FDS (POJK 8/2023)', id: 'rules' },
        { icon: Shield, label: 'Kepatuhan & Audit PPATK', id: 'compliance' },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar-nav">
      <div className="sidebar-header" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: '68px' }}>
        <img
          src="/img/Logo3_transparent.png"
          alt="Crypto - Sentinel"
          style={{
            width: '100%',
            maxWidth: '195px',
            height: 'auto',
            maxHeight: '44px',
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
                  <span className={`nav-badge ${item.id === 'monitoring' ? 'badge-live' : ''}`} style={{
                    background: item.id === 'monitoring' ? 'var(--status-success)' : 'var(--status-danger)',
                    animation: item.id === 'monitoring' ? 'none' : 'pulse-badge 2s infinite'
                  }}>
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

