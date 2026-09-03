import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth, ROLES, AccessDenied } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthLoadingScreen from './components/AuthLoadingScreen';
import LoginPage from './components/LoginPage';

// Dynamic API Integration
import {
  fetchTransactions,
  fetchAlerts,
  fetchSystemHealth,
  createCaseApi
} from './services/api';

// Dashboard Overview Components
import StatsGrid from './components/StatsGrid';
import TransactionChart from './components/TransactionChart';
import RiskDistribution from './components/RiskDistribution';
import AlertFeed from './components/AlertFeed';
import CryptoExchangeList from './components/CryptoExchangeList';
import TransactionTable from './components/TransactionTable';
import BlockedPatterns from './components/BlockedPatterns';
import HourlyActivity from './components/HourlyActivity';
import BankDistribution from './components/BankDistribution';
import ActivityTimeline from './components/ActivityTimeline';
import WeeklyComparison from './components/WeeklyComparison';

// Dynamic Sub-View Components
import {
  MonitoringView,
  AlertsView,
  AnalysisView,
  RulesView,
  ComplianceView,
  ApoloGovernanceView
} from './components/PageViews';
import GNNMetricsCatalogView from './components/GNNMetricsCatalogView';
import {
  OperationsView,
  Investigation360View,
  RiskControlsView,
  ModelGovernanceView,
  IntegrationPlatformView,
  AdministrationView
} from './components/PlatformViews';

import Customer360Drawer from './components/Customer360Drawer';

function DashboardLayout({ onBackToLanding }) {
  const { currentUser, can } = useAuth();
  const activatedRoleConfig = ROLES[currentUser?.role] || ROLES.compliance_officer;
  const [activePage, setActivePage] = useState(activatedRoleConfig.defaultPage || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ sentinelOnline: false, coreOnline: false, online: false });

  // Customer 360 & Cross-Page Investigation States
  const [customer360Account, setCustomer360Account] = useState(null);
  const [isCustomer360Open, setIsCustomer360Open] = useState(false);
  const [selectedGnnEntity, setSelectedGnnEntity] = useState(null);

  // Sync active page when user changes
  useEffect(() => {
    if (currentUser?.roleConfig?.defaultPage) {
      const allowed = currentUser.roleConfig.allowedMenus || [];
      if (!allowed.includes(activePage)) {
        setActivePage(currentUser.roleConfig.defaultPage);
      }
    }
  }, [currentUser]);

  // ----------------------------------------------------
  // UNIFIED AML SANDBOX STATES
  // ----------------------------------------------------
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Polling mechanism to check health and load transaction data from backend
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const health = await fetchSystemHealth();
        if (!active) return;
        setSystemHealth(health);
        setApiOnline(health.sentinelOnline);

        const [txs, alts] = await Promise.all([fetchTransactions(), fetchAlerts()]);
        if (active) {
          setTransactions(Array.isArray(txs) ? txs : []);
          const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');
          setAlerts((Array.isArray(alts) ? alts : []).filter(a => !storedResolved.includes(a.id) && !storedResolved.includes(a.transaction_id)));
        }
      } catch (err) {
        console.error('Error loading API data:', err);
        if (active) {
          setApiOnline(false);
          setSystemHealth({ sentinelOnline: false, coreOnline: false, online: false });
          setTransactions([]);
          setAlerts([]);
        }
      }
    }

    loadData();
    const interval = setInterval(loadData, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const [blockedEntities, setBlockedEntities] = useState({
    wallets: [
      { id: 'w1', address: '0x1a2b3c4d5e6f7890abcdef1234567890abcd1234', dateAdded: '2026-05-28', reason: 'Pola Structuring Berulang (Smurfing)' },
      { id: 'w2', address: '0x9876543210fedcba9876543210fedcba98765432', dateAdded: '2026-05-29', reason: 'Batas transfer harian terlampaui' }
    ],
    banks: [
      { id: 'b1', account: '4521880292', holder: 'Ahmad Faisal', bank: 'BCA', dateAdded: '2026-05-28', reason: 'Kasus Pencucian Uang Binance' }
    ],
    ids: [
      { id: 'id1', nik: '3171092828020921', name: 'Ahmad Faisal', dateAdded: '2026-05-28', reason: 'Blacklist Densus Keuangan' }
    ]
  });

  const [rules, setRules] = useState({
    riskThreshold: 85,
    dailyLimit: 100000000,
    autoBlockEnabled: true,
    smurfingCheckEnabled: true
  });

  const adminProfile = {
    name: currentUser?.name || 'Admin Regulator',
    role: activatedRoleConfig?.sublabel || 'Compliance Officer',
    avatar: activatedRoleConfig?.avatar || 'AR',
    badge: activatedRoleConfig?.badge || 'FULL ACCESS',
    badgeColor: activatedRoleConfig?.badgeColor || '#059669',
    level: activatedRoleConfig?.level || 'LEVEL 2',
    bank: currentUser?.bank || 'Bank Kuningan',
    nip: currentUser?.nip || '-',
  };

  const [toasts, setToasts] = useState([]);

  // Toast utility helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    // Play cyber alert sound effect using Web Audio API
    if (type === 'error' || type === 'warning' || message.includes('🔥') || message.includes('BLOCKED')) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'error' ? 880 : 587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(type === 'error' ? 440 : 880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch (e) {
        // AudioContext blocked or unsupported
      }
    }

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const [privacyMasking, setPrivacyMasking] = useState(true);

  const handleCreateInvestigationCase = useCallback(async (payload) => {
    const account = payload?.account || {};
    const edge = payload?.edge || {};
    const accountId = account.account || account.account_id || account.id || 'UNKNOWN';
    const transactionId = edge.transaction_id || edge.transactionId || payload?.transactionId || `GNN-${Date.now()}`;
    const caseId = payload?.caseId || `CASE-GNN-${Date.now()}`;

    try {
      await createCaseApi({
        caseId,
        alertId: payload?.alertId || null,
        transactionId,
        accountId,
        priority: account.riskScore >= 90 ? 'CRITICAL' : 'HIGH',
        note: payload?.note || `Eskalasi investigasi GNN untuk ${account.label || accountId}`,
        graphSnapshot: payload?.graphSnapshot || {},
        actor: currentUser?.id || currentUser?.name || 'Unknown_User',
        role: currentUser?.role || 'analyst',
        tenantId: currentUser?.bank || 'all'
      });
      setSelectedGnnEntity(account);
      setActivePage('alerts');
      addToast(`📝 Kasus ${caseId} tersimpan dengan snapshot graf GNN.`, 'success');
    } catch (error) {
      console.error('Failed to create GNN investigation case:', error);
      addToast(`❌ Kasus gagal disimpan: ${error.message}`, 'error');
    }
  }, [currentUser, addToast]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} id="app-root">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            closeSidebar();
          }
        }}
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
        adminProfile={adminProfile}
        alertsCount={alerts.length}
      />

      <main className="main-content">
        <Header
          onMenuToggle={toggleSidebar}
          apiOnline={apiOnline}
          systemHealth={systemHealth}
          onBackToLanding={onBackToLanding}
          addToast={addToast}
          privacyMasking={privacyMasking}
          setPrivacyMasking={setPrivacyMasking}
          activePage={activePage}
        />

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* ----------------------------------------------------
                  1. DEFAULT OVERVIEW DASHBOARD
              ---------------------------------------------------- */}
              {activePage === 'dashboard' && (
                <>
                  <StatsGrid transactions={transactions} />
                  <TransactionChart transactions={transactions} />
                  <div className="content-grid-3" style={{ marginTop: 24 }}>
                    <RiskDistribution transactions={transactions} />
                    <AlertFeed alerts={alerts} />
                    <CryptoExchangeList />
                  </div>
                  <TransactionTable transactions={transactions} isMasked={privacyMasking} />
                  <div className="content-grid-3" style={{ marginTop: 24 }}>
                    <BlockedPatterns transactions={transactions} />
                    <HourlyActivity transactions={transactions} />
                    <BankDistribution transactions={transactions} />
                  </div>
                  <div className="content-grid" style={{ marginTop: 24 }}>
                    <ActivityTimeline transactions={transactions} />
                    <WeeklyComparison transactions={transactions} />
                  </div>
                </>
              )}

              {/* ----------------------------------------------------
                  2. LIVE MONITORING & SENTINEL TERMINAL VIEW
              ---------------------------------------------------- */}
              {activePage === 'monitoring' && (
                <MonitoringView
                  transactions={transactions}
                  setTransactions={setTransactions}
                  setAlerts={setAlerts}
                  addToast={addToast}
                  rules={rules}
                  isMasked={privacyMasking}
                  onNavigateToGNN={(txn) => {
                    setSelectedGnnEntity(txn);
                    setActivePage('analysis');
                    if (addToast) addToast(`🧠 Membuka GNN Network Investigation untuk ${txn.id || 'Transaksi'}`, 'info');
                  }}
                  onOpenCustomer360={(acc) => {
                    setCustomer360Account(acc);
                    setIsCustomer360Open(true);
                  }}
                />
              )}

              {/* ----------------------------------------------------
                  3. GRAPH RELATION FORENSICS (GNN GRAPH SAGE)
              ---------------------------------------------------- */}
              {activePage === 'analysis' && (
                <AnalysisView
                  transactions={transactions}
                  addToast={addToast}
                  isMasked={privacyMasking}
                  selectedEntity={selectedGnnEntity}
                  onCreateCase={handleCreateInvestigationCase}
                  onOpenCustomer360={(acc) => {
                    setCustomer360Account(acc);
                    setIsCustomer360Open(true);
                  }}
                />
              )}

              {/* ----------------------------------------------------
                  4. 15 AML INDICATORS, GNN CANVAS & XAI CATALOG
              ---------------------------------------------------- */}
              {activePage === 'gnn_metrics_catalog' && (
                <GNNMetricsCatalogView
                  addToast={addToast}
                  onCreateCase={handleCreateInvestigationCase}
                  onOpenCustomer360={(acc) => {
                    setCustomer360Account(acc);
                    setIsCustomer360Open(true);
                  }}
                />
              )}

              {/* ----------------------------------------------------
                  5. ALERTS & CMS INVESTIGATION VIEW
              ---------------------------------------------------- */}
              {activePage === 'alerts' && (
                <AlertsView
                  alerts={alerts}
                  setAlerts={setAlerts}
                  addToast={addToast}
                  setBlockedEntities={setBlockedEntities}
                  isMasked={privacyMasking}
                  onNavigateToGNN={(alert) => {
                    setSelectedGnnEntity(alert);
                    setActivePage('analysis');
                    if (addToast) addToast(`🧠 Membuka GNN Network Investigation untuk ${alert?.title || 'Kasus'}`, 'info');
                  }}
                  onNavigateToLive={() => {
                    setActivePage('monitoring');
                    if (addToast) addToast('⚡ Membuka Live Detection Real-Time Stream', 'info');
                  }}
                  onOpenCustomer360={(acc) => {
                    setCustomer360Account(acc);
                    setIsCustomer360Open(true);
                  }}
                />
              )}

              {/* ----------------------------------------------------
                  4. DYNAMIC THRESHOLD & RISK APPETITE POLICIES (POJK 8/2023)
              ---------------------------------------------------- */}
              {activePage === 'rules' && (
                !can('viewRules') ? (
                  <AccessDenied
                    permission="Kalibrasi Ambang Batas FDS & Risk Appetite Bank"
                    requiredRole="Pejabat Kepatuhan (Compliance Officer / MLRO)"
                  />
                ) : (
                  <RulesView
                    rules={rules}
                    setRules={setRules}
                    addToast={addToast}
                    isReadOnly={!can('editRules')}
                  />
                )
              )}

              {/* ----------------------------------------------------
                  5. PPATK COMPLIANCE & FORMAL LTKM REPORT GENERATOR
              ---------------------------------------------------- */}
              {activePage === 'compliance' && (
                <ComplianceView addToast={addToast} />
              )}

              {/* ----------------------------------------------------
                  6. APOLO OJK COMPLIANCE PREVIEW & GOVERNANCE
              ---------------------------------------------------- */}
              {activePage === 'apolo_governance' && (
                <ApoloGovernanceView addToast={addToast} />
              )}
              {activePage === 'operations' && <OperationsView transactions={transactions} alerts={alerts} isMasked={privacyMasking} />}
              {activePage === 'investigation_360' && <Investigation360View transactions={transactions} isMasked={privacyMasking} />}
              {activePage === 'risk_controls' && <RiskControlsView />}
              {activePage === 'model_governance' && <ModelGovernanceView />}
              {activePage === 'integration' && <IntegrationPlatformView systemHealth={systemHealth} />}
              {activePage === 'administration' && <AdministrationView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ----------------------------------------------------
          DYNAMIC TOAST NOTIFICATIONS DRAWER
      ---------------------------------------------------- */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none'
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              style={{
                pointerEvents: 'auto',
                minWidth: 320,
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                background: toast.type === 'error' ? 'var(--status-danger)' : toast.type === 'warning' ? 'var(--status-warning)' : 'var(--status-success)',
                boxShadow: 'var(--shadow-lg)',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.8
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* ----------------------------------------------------
          GLOBAL CUSTOMER 360 INVESTIGATION DRAWER
      ---------------------------------------------------- */}
      <Customer360Drawer
        account={customer360Account}
        isOpen={isCustomer360Open}
        onClose={() => setIsCustomer360Open(false)}
        isMasked={privacyMasking}
        onNavigateToGNN={(acc) => {
          setSelectedGnnEntity(acc);
          setActivePage('analysis');
          if (addToast) addToast(`🧠 Membuka Analisis Graf GNN untuk ${acc.name || acc.label || 'Nasabah'}`, 'info');
        }}
        onCreateCase={handleCreateInvestigationCase}
        addToast={addToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppInner() {
  // viewMode: 'landing' | 'loading' | 'login' | 'dashboard'
  const [viewMode, setViewMode] = useState('landing');
  const { login } = useAuth();

  const handleLoginSuccess = (user) => {
    login(user); // Register user into AuthContext (sets role + permissions)
    setViewMode('dashboard');
  };

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          style={{ width: '100%' }}
        >
          <LandingPage onEnter={() => setViewMode('loading')} />
        </motion.div>
      )}

      {viewMode === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35 }}
          style={{ width: '100%' }}
        >
          <AuthLoadingScreen onFinished={() => setViewMode('login')} />
        </motion.div>
      )}

      {viewMode === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          style={{ width: '100%' }}
        >
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() => setViewMode('landing')}
          />
        </motion.div>
      )}

      {viewMode === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%' }}
        >
          <DashboardLayout
            onBackToLanding={() => setViewMode('landing')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
