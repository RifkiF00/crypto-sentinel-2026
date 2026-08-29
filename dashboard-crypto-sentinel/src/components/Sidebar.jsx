import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  BarChart3,
  FileWarning,
  Settings,
  Users,
  Globe,
  Database,
  BookOpen,
  Shield,
} from 'lucide-react';

export default function Sidebar({ activePage, onPageChange, isOpen, adminProfile, alertsCount }) {
  const navSections = [
    {
      title: 'Monitoring Utama',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard Overview', id: 'dashboard' },
        { icon: Activity, label: 'Live Sentinel Stream', id: 'monitoring', badge: 'LIVE' },
        { icon: ShieldAlert, label: 'Investigasi Alert (CMS)', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
      ],
    },
    {
      title: 'Intelijen & Forensik AI',
      items: [
        { icon: BarChart3, label: 'Analisis Relasi Graf (GNN)', id: 'analysis' },
        { icon: Globe, label: 'Direktori VASP & Kripto', id: 'exchange' },
        { icon: FileWarning, label: 'Indikator & Pola Fraud', id: 'patterns' },
        { icon: Users, label: 'Profil Risiko Nasabah', id: 'risk-profiles' },
      ],
    },
    {
      title: 'Kepatuhan & Regulasi',
      items: [
        { icon: Database, label: 'Database Blocklist OJK', id: 'blocklist' },
        { icon: BookOpen, label: 'Aturan & Kebijakan FDS', id: 'rules' },
        { icon: Shield, label: 'Kepatuhan & Audit PPATK', id: 'compliance' },
        { icon: Settings, label: 'Pengaturan Sistem', id: 'settings' },
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

      <div className="sidebar-footer">
        <div className="sidebar-user" id="sidebar-user-profile">
          <div className="user-avatar">{adminProfile?.avatar || 'AR'}</div>
          <div className="user-info">
            <span className="name">{adminProfile?.name || 'Admin Regulator'}</span>
            <span className="role">{adminProfile?.role || 'OJK - Compliance Div.'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

