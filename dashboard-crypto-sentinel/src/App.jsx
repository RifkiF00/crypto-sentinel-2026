import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, User, KeyRound, LogIn, Cpu, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './components/LandingPage';

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
  ExchangeView,
  PatternsView,
  RiskProfilesView,
  BlocklistView,
  RulesView,
  ComplianceView,
  SettingsView
} from './components/PageViews';

// Initial Mock Data
import { recentTransactions, alertFeed } from './data/mockData';

function DashboardLayout({ onBackToLanding }) {
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
    name: 'Capt. Ir. Hendra Wijaya, M.Sc., CAMS',
    role: 'Analis Senior Satgas TPPU (OJK & PPATK)',
    avatar: 'HW',
    nip: 'NIP-19880412-201201-1-003',
    badgeId: 'SENTINEL-OFFICER-007',
    clearance: 'LEVEL 4 — HIGH COMMAND',
    certifications: 'CAMS • CFE • CISSP',
    station: 'SOC-Room 04 (Gedung Soemitro Jakarta)',
    ipAddress: '10.12.88.45 (Intranet Regulator)',
    sessionToken: 'SEC-8849-2026-ACTIVE'
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
          adminProfile={adminProfile}
          setAdminProfile={setAdminProfile}
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
                  <StatsGrid />
                  <TransactionChart />
                  <div className="content-grid-3" style={{ marginTop: 24 }}>
                    <RiskDistribution />
                    <AlertFeed alerts={alerts} />
                    <CryptoExchangeList />
                  </div>
                  <TransactionTable transactions={transactions} />
                  <div className="content-grid-3" style={{ marginTop: 24 }}>
                    <BlockedPatterns />
                    <HourlyActivity />
                    <BankDistribution />
                  </div>
                  <div className="content-grid" style={{ marginTop: 24 }}>
                    <ActivityTimeline />
                    <WeeklyComparison />
                  </div>
                </>
              )}

              {/* ----------------------------------------------------
                  2. LIVE MONITORING VIEW
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
                  3. ALERTS AND THREATS VIEW
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
                  4. TRANSACTION DEEP ANALYSIS
              ---------------------------------------------------- */}
              {activePage === 'analysis' && (
                <AnalysisView transactions={transactions} addToast={addToast} />
              )}

              {/* ----------------------------------------------------
                  5. CRYPTO EXCHANGES DIRECTORY
              ---------------------------------------------------- */}
              {activePage === 'exchange' && (
                <ExchangeView addToast={addToast} />
              )}

              {/* ----------------------------------------------------
                  6. DETECTED CRITICAL FRAUD PATTERNS
              ---------------------------------------------------- */}
              {activePage === 'patterns' && (
                <PatternsView />
              )}

              {/* ----------------------------------------------------
                  7. DETAILED CLIENT RISK PROFILES
              ---------------------------------------------------- */}
              {activePage === 'risk-profiles' && (
                <RiskProfilesView addToast={addToast} />
              )}

              {/* ----------------------------------------------------
                  8. DATABASE BLOCKLIST
              ---------------------------------------------------- */}
              {activePage === 'blocklist' && (
                <BlocklistView 
                  blockedEntities={blockedEntities} 
                  setBlockedEntities={setBlockedEntities} 
                  addToast={addToast} 
                />
              )}

              {/* ----------------------------------------------------
                  9. DYNAMIC THRESHOLD POLICIES & RULES
              ---------------------------------------------------- */}
              {activePage === 'rules' && (
                <RulesView 
                  rules={rules} 
                  setRules={setRules} 
                  addToast={addToast} 
                />
              )}

              {/* ----------------------------------------------------
                  10. COMPLIANCE AUDITING VIEWS
              ---------------------------------------------------- */}
              {activePage === 'compliance' && (
                <ComplianceView addToast={addToast} />
              )}

              {/* ----------------------------------------------------
                  11. PREFERENCES & SETTINGS
              ---------------------------------------------------- */}
              {activePage === 'settings' && (
                <SettingsView 
                  adminProfile={adminProfile} 
                  setAdminProfile={setAdminProfile} 
                  addToast={addToast} 
                />
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

function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(username);
    }, 750);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #030712 0%, #090d16 50%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Background Animated Cyber Ambient Lights */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '20%',
        width: 450,
        height: 450,
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Header Bar with Back Link */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 32,
        right: 32,
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/img/LOGO1.jpeg" alt="Logo" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>
            Crypto<span style={{ color: '#38bdf8' }}>-Sentinel</span>
          </span>
        </div>
        <button
          onClick={onBackToLanding}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 9999,
            padding: '8px 18px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease'
          }}
        >
          ← Kembali ke Landing Page
        </button>
      </div>

      {/* Centered Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: 440,
          width: '100%',
          padding: '36px 32px',
          background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.92) 0%, rgba(9, 13, 26, 0.97) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 24,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.2)',
          color: 'white',
          position: 'relative',
          zIndex: 5
        }}
      >
        {/* Official Logo Badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
            padding: 7
          }}>
            <img
              src="/img/LOGO1.jpeg"
              alt="Crypto Sentinel Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 15 }}
            />
          </div>

          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 2, color: '#38bdf8', textTransform: 'uppercase' }}>
            // INTELHUB SOC PORTAL
          </span>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.3px', margin: '4px 0 4px' }}>
            Crypto - Sentinel
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600, margin: 0 }}>
            Portal Otentikasi Analis Satgas TPPU (OJK & PPATK RI)
          </p>
        </div>

        {/* Notice Badge */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 12,
          marginBottom: 22,
          fontSize: '0.74rem',
          color: '#a5b4fc',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Sparkles size={16} style={{ flexShrink: 0, color: '#38bdf8' }} />
          <span><strong>Mode Sandbox:</strong> Bebas memasukkan username & password apa saja.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              Username / NIP Analis
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masukan username"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  fontSize: '0.88rem',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(99, 102, 241, 0.28)',
                  borderRadius: 12,
                  color: 'white',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                }}
              />
              <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              Password Sesi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="masukan password"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  fontSize: '0.88rem',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(99, 102, 241, 0.28)',
                  borderRadius: 12,
                  color: 'white',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                }}
              />
              <KeyRound size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px 20px',
              fontSize: '0.92rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 6px 24px rgba(99, 102, 241, 0.45)',
              gap: 8,
              cursor: isAuthenticating ? 'wait' : 'pointer'
            }}
          >
            {isAuthenticating ? (
              <><Cpu size={18} className="animate-spin" /> Mengautentikasi Sesi...</>
            ) : (
              <><LogIn size={18} /> Masuk Ke Dashboard Analisis</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [appView, setAppView] = useState('landing'); // 'landing' | 'login' | 'dashboard'

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {appView === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%' }}
          >
            <LandingPage onEnter={() => setAppView('login')} />
          </motion.div>
        )}

        {appView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%' }}
          >
            <LoginPage
              onLoginSuccess={() => setAppView('dashboard')}
              onBackToLanding={() => setAppView('landing')}
            />
          </motion.div>
        )}

        {appView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
          >
            <DashboardLayout onBackToLanding={() => setAppView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
