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
          <img src="/img/logo.png" alt="CryptoSentinel Logo" />
        </div>
        <div className="sidebar-brand">
          <h1>CryptoSentinel</h1>
          <span>Anti Money Laundering</span>
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

