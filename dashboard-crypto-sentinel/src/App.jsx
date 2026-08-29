import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthLoadingScreen from './components/AuthLoadingScreen';
import LoginPage from './components/LoginPage';

// Dynamic API Integration
import { checkHealth, fetchTransactions, fetchAlerts } from './services/api';

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
  ComplianceView
} from './components/PageViews';

// Initial Mock Data
import { recentTransactions, alertFeed } from './data/mockData';

function DashboardLayout({ onBackToLanding, currentUser }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  // ----------------------------------------------------
  // UNIFIED AML SANDBOX STATES
  // ----------------------------------------------------
  const [transactions, setTransactions] = useState(recentTransactions);
  const [alerts, setAlerts] = useState(() => {
    const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');
    return alertFeed.filter(a => !storedResolved.includes(a.id));
  });

  // Polling mechanism to check health and load transaction data from backend
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const online = await checkHealth();
        if (!active) return;
        setApiOnline(online);
        
        const txs = await fetchTransactions();
        const alts = await fetchAlerts();
        if (active) {
          if (txs && txs.length > 0) {
            setTransactions(txs);
          }
          const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');
          setAlerts(alts.filter(a => !storedResolved.includes(a.id) && !storedResolved.includes(a.transaction_id)));
        }
      } catch (err) {
        console.error("Error loading API data:", err);
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

  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin Regulator',
    role: 'OJK - Compliance Div.',
    avatar: 'AR'
  });

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

  const [privacyMasking, setPrivacyMasking] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="app-layout" id="app-root">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          closeSidebar();
        }}
        isOpen={sidebarOpen}
        adminProfile={adminProfile}
        alertsCount={alerts.length}
      />

      <main className="main-content">
        <Header
          onMenuToggle={toggleSidebar}
          apiOnline={apiOnline}
          onBackToLanding={onBackToLanding}
          addToast={addToast}
          privacyMasking={privacyMasking}
          setPrivacyMasking={setPrivacyMasking}
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
                  addToast={addToast} 
                  rules={rules} 
                />
              )}

              {/* ----------------------------------------------------
                  3. GRAPH RELATION FORENSICS (GNN GRAPH SAGE)
              ---------------------------------------------------- */}
              {activePage === 'analysis' && (
                <AnalysisView transactions={transactions} addToast={addToast} />
              )}

              {/* ----------------------------------------------------
                  3. ALERTS & CMS INVESTIGATION VIEW
              ---------------------------------------------------- */}
              {activePage === 'alerts' && (
                <AlertsView 
                  alerts={alerts} 
                  setAlerts={setAlerts} 
                  addToast={addToast} 
                  setBlockedEntities={setBlockedEntities} 
                />
              )}

              {/* ----------------------------------------------------
                  4. DYNAMIC THRESHOLD & RISK APPETITE POLICIES (POJK 8/2023)
              ---------------------------------------------------- */}
              {activePage === 'rules' && (
                <RulesView 
                  rules={rules} 
                  setRules={setRules} 
                  addToast={addToast} 
                />
              )}

              {/* ----------------------------------------------------
                  5. PPATK COMPLIANCE & FORMAL LTKM REPORT GENERATOR
              ---------------------------------------------------- */}
              {activePage === 'compliance' && (
                <ComplianceView addToast={addToast} />
              )}
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
    </div>
  );
}

export default function App() {
  // viewMode: 'landing' | 'loading' | 'login' | 'dashboard'
  const [viewMode, setViewMode] = useState('landing');
  const [currentUser, setCurrentUser] = useState({
    nip: 'ADM-882910',
    role: 'compliance',
    name: 'Rifki Firmansyah, S.Kom',
    roleLabel: 'Compliance Officer (PPATK/OJK)'
  });

  return (
    <ThemeProvider>
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
              onLoginSuccess={(user) => {
                if (user) setCurrentUser(user);
                setViewMode('dashboard');
              }}
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
              currentUser={currentUser}
              onBackToLanding={() => setViewMode('landing')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
