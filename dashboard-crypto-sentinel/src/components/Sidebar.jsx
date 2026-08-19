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
      title: 'Utama',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: Activity, label: 'Live Monitoring', id: 'monitoring', badge: 'LIVE' },
        { icon: ShieldAlert, label: 'Alert & Ancaman', id: 'alerts', badge: alertsCount > 0 ? alertsCount : null },
      ],
    },
    {
      title: 'Analisis',
      items: [
        { icon: BarChart3, label: 'Analisis Transaksi', id: 'analysis' },
        { icon: Globe, label: 'Crypto Exchange', id: 'exchange' },
        { icon: FileWarning, label: 'Pola Mencurigakan', id: 'patterns' },
        { icon: Users, label: 'Profil Risiko', id: 'risk-profiles' },
      ],
    },
    {
      title: 'Sistem',
      items: [
        { icon: Database, label: 'Database Blocklist', id: 'blocklist' },
        { icon: BookOpen, label: 'Aturan & Kebijakan', id: 'rules' },
        { icon: Shield, label: 'Compliance', id: 'compliance' },
        { icon: Settings, label: 'Pengaturan', id: 'settings' },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar-nav">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/img/LOGO1.jpeg" alt="Crypto - Sentinel Logo" />
        </div>
        <div className="sidebar-brand">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', whiteSpace: 'nowrap', margin: 0, letterSpacing: '-0.3px' }}>
            Crypto - Sentinel
          </h1>
          <span style={{ color: 'var(--text-muted)', letterSpacing: '0.4px', fontWeight: 700, fontSize: '0.54rem', display: 'block', marginTop: 2, whiteSpace: 'nowrap' }}>
            DETECT • INFILTRATE • INTELLIGENCE
          </span>
        </div>
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
        <div className="sidebar-user" id="sidebar-user-profile" style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div className="user-avatar" style={{ background: 'var(--gradient-primary)', color: 'white', fontWeight: 800 }}>
            {adminProfile?.avatar || 'HW'}
          </div>
          <div className="user-info" style={{ overflow: 'hidden' }}>
            <span className="name" style={{ fontWeight: 800, color: 'white', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {adminProfile?.name || 'Capt. Ir. Hendra Wijaya, M.Sc.'}
            </span>
            <span className="role" style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 700 }}>
              {adminProfile?.badgeId || 'SENTINEL-007'} • {adminProfile?.role || 'Satgas TPPU OJK-PPATK'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

