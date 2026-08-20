import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ShieldAlert,
  BarChart3,
  Globe,
  FileWarning,
  Users,
  Database,
  BookOpen,
  Shield,
  Settings,
  AlertTriangle,
  Terminal,
  Download,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  Volume2,
  VolumeX,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  X,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Server,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign,
  Cpu,
  Brain,
  Ban,
  Building2,
  ArrowRightLeft,
  Wallet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { formatCurrency, formatNumber, cryptoExchangeData, topBlockedPatterns, muleAccountsData, gnnGraphData } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';
import MuleAccountAnalysis from './MuleAccountAnalysis';
import GNNVisualization from './GNNVisualization';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';

// Dynamic API Integration
import { checkHealth, analyzeTransaction, mapApiLogToTx, fetchCryptoExchanges, fetchBlockedPatterns, fetchMuleAccounts, fetchStatistics, fetchTransactions, resolveAlertApi } from '../services/api';

// ==========================================
// 1. LIVE MONITORING VIEW
// ==========================================
export function MonitoringView({ transactions, setTransactions, addToast, rules }) {
  const [isLive, setIsLive] = useState(true);
  const [autoBlock] = useState(rules.autoBlockEnabled);
  const [timeFilter, setTimeFilter] = useState('1day'); // '1day' | '7days' | 'all'
  const [tickerLogs, setTickerLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: 'Real-time WebSocket connection established with Bank API Gateways.' },
    { time: new Date().toLocaleTimeString(), text: 'Active scanning enabled. Compliance database connected.' }
  ]);

  // Filter transactions by selected time range (Default: 1 Hari Terakhir)
  const filteredTransactions = useMemo(() => {
    if (timeFilter === 'all') return transactions;

    const now = new Date();
    const cutoffDays = timeFilter === '1day' ? 1 : 7;
    const cutoffTime = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

    return transactions.filter(t => {
      if (!t.timestamp) return true;
      try {
        const cleanTs = t.timestamp.replace(' ', 'T');
        const txDate = new Date(cleanTs);
        if (isNaN(txDate.getTime())) return true;
        return txDate >= cutoffTime;
      } catch (e) {
        return true;
      }
    });
  }, [transactions, timeFilter]);

  // Combine real historical transactions with scanner ticker logs
  const consoleLogs = useMemo(() => {
    const realTxLogs = filteredTransactions.map(tx => {
      const timeStr = tx.timestamp ? (tx.timestamp.includes(' ') ? tx.timestamp.split(' ')[1] : tx.timestamp) : '00:00:00';
      const tag = tx.status === 'blocked' ? '[BLOCKED]' : tx.status === 'flagged' ? '[FLAGGED]' : '[APPROVED]';
      const amountM = (tx.amount / 1000000).toFixed(1);
      return {
        time: timeStr,
        text: `${tag} ${tx.id}: ${tx.senderName} (${tx.senderAccount}) -> ${tx.destination} (Rp ${amountM}jt | Risk: ${tx.riskScore}%)`
      };
    });
    return [...realTxLogs, ...tickerLogs];
  }, [filteredTransactions, tickerLogs]);

  // Simulate real-time scanner activity
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const msgs = [
        'Memindai transaksi m-banking Bank Mandiri...',
        'Memindai transaksi ATM BCA...',
        'Pemeriksaan kepatuhan OJK aman untuk transaksi domestik.',
        'Sistem memverifikasi dompet crypto tujuan Indodax / Tokocrypto...',
        'Memindai transaksi m-banking Bank BRI...'
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date().toLocaleTimeString();
      setTickerLogs(prev => [{ time: now, text: randomMsg }, ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="monitoring-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Live Transactions Sentinel</h2>
          <p style={{ color: 'var(--text-muted)' }}>Pantau alur dana nasabah bank ke Crypto Exchange secara real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsLive(!isLive)}
          >
            <Activity className={isLive ? 'animate-pulse' : ''} style={{ color: isLive ? 'var(--status-success)' : 'inherit' }} />
            {isLive ? 'Jeda Scan' : 'Aktifkan Scan'}
          </button>
          <div className="live-indicator" style={{ display: 'flex', alignItems: 'center' }}>
            <span className={`live-dot ${isLive ? 'active' : ''}`} style={{ width: 8, height: 8, background: isLive ? 'var(--status-success)' : 'var(--text-muted)', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.8rem', marginLeft: 8 }}>{isLive ? 'SCANNING ACTIVE' : 'STANDBY'}</span>
          </div>
        </div>
      </div>

      <div className="content-grid-wide">
        {/* Left Side: Live Feed & Stats */}
        <div>
          {/* Status grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon primary" style={{ width: 40, height: 40, background: 'var(--accent-primary-subtle)', borderRadius: 8, display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--accent-primary)' }}><Server size={20} /></div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status API Gateway</h4>
                <p style={{ fontWeight: 700, color: 'var(--status-success)', fontSize: '0.95rem' }}>CONNECTED</p>
              </div>
            </div>
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon success" style={{ width: 40, height: 40, background: 'var(--status-success-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--status-success)' }}><RefreshCw className={isLive ? 'animate-spin' : ''} size={20} style={{ animationDuration: '4s' }} /></div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-Refresh Ticker</h4>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{isLive ? 'Setiap 2.5s' : 'PAUSED'}</p>
              </div>
            </div>
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon warning" style={{ width: 40, height: 40, background: 'var(--status-warning-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--status-warning)' }}><Lock size={20} /></div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated Blocks</h4>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{autoBlock ? 'ACTIVE (>80)' : 'DISABLED'}</p>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
              <h3 className="card-title"><Activity /> Aliran Transaksi Terakhir</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card-subtle)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <button
                    className={`btn btn-sm ${timeFilter === '1day' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setTimeFilter('1day')}
                    style={{ fontSize: '0.72rem', padding: '3px 10px', height: 26, borderRadius: 'var(--radius-sm)' }}
                  >
                    🕒 1 Hari
                  </button>
                  <button
                    className={`btn btn-sm ${timeFilter === '7days' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setTimeFilter('7days')}
                    style={{ fontSize: '0.72rem', padding: '3px 10px', height: 26, borderRadius: 'var(--radius-sm)' }}
                  >
                    📅 7 Hari
                  </button>
                  <button
                    className={`btn btn-sm ${timeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setTimeFilter('all')}
                    style={{ fontSize: '0.72rem', padding: '3px 10px', height: 26, borderRadius: 'var(--radius-sm)' }}
                  >
                    🌐 Semua ({transactions.length})
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge badge-approved">{filteredTransactions.filter(t => t.status === 'approved').length} Disetujui</span>
                  <span className="badge badge-flagged">{filteredTransactions.filter(t => t.status === 'flagged').length} Ditandai</span>
                  <span className="badge badge-blocked">{filteredTransactions.filter(t => t.status === 'blocked').length} Dicegah</span>
                </div>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ maxHeight: 380, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TXID / Waktu</th>
                      <th>Nasabah</th>
                      <th>Asal Rekening</th>
                      <th>Rekening / Exchange Tujuan</th>
                      <th>Nominal</th>
                      <th>Skor Risiko</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{txn.id}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{txn.timestamp.split(' ')[1]}</div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{txn.senderName}</td>
                        <td>{txn.senderBank} ({txn.senderAccount})</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{txn.destination}</div>
                          {txn.walletAddress && <div className="wallet-address">{txn.walletAddress}</div>}
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatCurrency(txn.amount)}</td>
                        <td>
                          <div className="risk-meter">
                            <div className="risk-bar" style={{ width: 60 }}>
                              <div
                                className={`risk-bar-fill ${txn.riskScore >= 80 ? 'high' : txn.riskScore >= 40 ? 'medium' : 'low'}`}
                                style={{ width: `${txn.riskScore}%` }}
                              />
                            </div>
                            <span className="risk-value" style={{
                              color: txn.riskScore >= 80 ? 'var(--status-danger)' : txn.riskScore >= 40 ? 'var(--status-warning)' : 'var(--status-success)'
                            }}>{txn.riskScore}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${txn.status}`}>
                            <span className="badge-dot" />
                            {txn.status === 'blocked' ? 'Dicegah' : txn.status === 'flagged' ? 'Ditandai' : 'Lolos'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Simulation Panel & Real-time scan log */}
        <div>
          {/* Terminal Console Logs */}
          <div className="card" style={{ background: '#020617', borderColor: '#1e293b' }}>
            <div className="card-header" style={{ borderBottomColor: '#1e293b', background: '#0b0f19' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={16} style={{ color: '#06b6d4' }} />
                <h3 className="card-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#06b6d4' }}>SANDBOX_SCANNER_CONSOLE.log</h3>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#10b981' : '#64748b', display: 'inline-block' }} />
            </div>
            <div className="card-body" style={{ padding: 12, maxHeight: 180, overflowY: 'auto' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#38bdf8', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {consoleLogs.map((log, i) => (
                  <div key={i} style={{ lineBreak: 'anywhere' }}>
                    <span style={{ color: '#64748b' }}>[{log.time}]</span>{' '}
                    <span style={{ color: log.text.includes('BLOCKED') ? '#ef4444' : log.text.includes('FLAGGED') ? '#f59e0b' : '#94a3b8' }}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ALERTS AND THREATS VIEW
// ==========================================
export function AlertsView({ alerts, setAlerts, addToast, setBlockedEntities }) {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState('remediation');
  const [showFullModal, setShowFullModal] = useState(false);
  const [modalTab, setModalTab] = useState('gnn');
  const [mulesList, setMulesList] = useState(muleAccountsData);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.type === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleResolveAlert = (id, action) => {
    // Actions: 'block', 'dismiss', 'investigate'
    resolveAlertApi(id);

    if (action === 'block') {
      const alertItem = alerts.find(a => a.id === id);
      if (alertItem) {
        // Extract wallet or info if matches
        const walletMatch = alertItem.description.match(/0x[a-fA-F0-9]{40}/);
        const walletToBlock = walletMatch ? walletMatch[0] : `0x${Math.random().toString(16).substr(2, 40)}`;
        const accountMatch = alertItem.description.match(/\d+/);
        const accountToBlock = accountMatch ? accountMatch[0] : String(Math.floor(100000000 + Math.random() * 900000000));

        // Add to blocked entities in state
        setBlockedEntities(prev => ({
          ...prev,
          wallets: [
            { id: Math.random().toString(), address: walletToBlock, dateAdded: new Date().toISOString().substring(0, 10), reason: `AML Alert: ${alertItem.title}` },
            ...prev.wallets
          ],
          banks: [
            { id: Math.random().toString(), account: accountToBlock, holder: alertItem.description.split(' mengirim')[0] || 'Unknown Sender', bank: 'BCA', dateAdded: new Date().toISOString().substring(0, 10), reason: `AML Alert: ${alertItem.title}` },
            ...prev.banks
          ]
        }));

        addToast(`🛡️ Alert diselesaikan. Akun & wallet ${walletToBlock.substring(0, 8)}... berhasil diblokir!`, 'error');
      }
    } else if (action === 'dismiss') {
      addToast('✅ Alert ditandai sebagai AMAN dan diselesaikan.', 'success');
    } else if (action === 'investigate') {
      addToast('📂 Alert dalam status investigasi mendalam OJK.', 'warning');
    }

    setAlerts(prev => prev.filter(a => a.id !== id));
    setSelectedAlert(null);
  };

  const getSenderName = (alert) => {
    if (!alert) return '';
    const desc = alert.description;
    if (desc.includes('Ahmad Faisal')) return 'Ahmad Faisal';
    if (desc.includes('Rizky Hidayat')) return 'Rizky Hidayat';
    if (desc.includes('Budi Santoso')) return 'Budi Santoso';
    if (desc.includes('Siti Nurhaliza')) return 'Siti Nurhaliza';
    if (desc.includes('Maria Kusuma')) return 'Maria Kusuma';
    return 'Ahmad Faisal';
  };

  const getLinkedMules = (alert) => {
    const sender = getSenderName(alert);
    const mapped = [];
    if (sender === 'Ahmad Faisal') {
      const m1 = mulesList.find(m => m.id === 'MULE-001');
      const m2 = mulesList.find(m => m.id === 'MULE-002');
      if (m1) mapped.push(m1);
      if (m2) mapped.push(m2);
    } else if (sender === 'Budi Santoso') {
      const m1 = mulesList.find(m => m.id === 'MULE-002');
      const m2 = mulesList.find(m => m.id === 'MULE-003');
      if (m1) mapped.push(m1);
      if (m2) mapped.push(m2);
    } else if (sender === 'Rizky Hidayat') {
      const m1 = mulesList.find(m => m.id === 'MULE-003');
      const m2 = mulesList.find(m => m.id === 'MULE-005');
      if (m1) mapped.push(m1);
      if (m2) mapped.push(m2);
    } else {
      const m = mulesList.find(m => m.id === 'MULE-004') || mulesList[0];
      if (m) mapped.push(m);
    }
    return mapped;
  };

  const handleFreezeMule = (id) => {
    setMulesList(prev => prev.map(m => {
      if (m.id === id) {
        const isFrozen = m.status === 'frozen';
        addToast(isFrozen
          ? `🔓 Rekening ${m.name} (${m.account}) dicairkan kembali.`
          : `🧊 Rekening Mule ${m.name} (${m.account}) DIBEKUKAN oleh OJK!`, isFrozen ? 'warning' : 'error');
        return { ...m, status: isFrozen ? 'monitored' : 'frozen' };
      }
      return m;
    }));
  };

  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert);
    setActiveDetailTab('remediation');
  };

  return (
    <div className="alerts-view" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Alert & Pusat Ancaman</h2>
          <p style={{ color: 'var(--text-muted)' }}>Pantau dan kelola sinyal structuring, transfer bypass limit, dan wallet crypto mencurigakan.</p>
        </div>
        <span className="nav-badge" style={{ fontSize: '0.85rem', padding: '6px 14px', animation: 'none' }}>
          {alerts.length} Ancaman Aktif
        </span>
      </div>

      <div className="content-grid-wide">
        {/* Main List */}
        <div>
          {/* Filters & Search */}
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`tab ${filterSeverity === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('all')}
                >
                  Semua ({alerts.length})
                </button>
                <button
                  className={`tab ${filterSeverity === 'critical' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('critical')}
                  style={{ color: filterSeverity === 'critical' ? 'var(--status-danger)' : '' }}
                >
                  🔴 Kritis ({alerts.filter(a => a.type === 'critical').length})
                </button>
                <button
                  className={`tab ${filterSeverity === 'warning' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('warning')}
                  style={{ color: filterSeverity === 'warning' ? 'var(--status-warning)' : '' }}
                >
                  🟡 Peringatan ({alerts.filter(a => a.type === 'warning').length})
                </button>
                <button
                  className={`tab ${filterSeverity === 'info' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('info')}
                  style={{ color: filterSeverity === 'info' ? 'var(--status-info)' : '' }}
                >
                  🔵 Info ({alerts.filter(a => a.type === 'info').length})
                </button>
              </div>

              <div className="header-search" style={{ margin: 0 }}>
                <Search />
                <input
                  type="text"
                  placeholder="Cari alert..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 220 }}
                />
              </div>
            </div>
          </div>

          {/* Alerts Feed items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredAlerts.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--status-success)', marginBottom: 12, marginInline: 'auto' }} />
                <h3>Pusat Ancaman Bersih!</h3>
                <p style={{ marginTop: 6, fontSize: '0.85rem' }}>Tidak ada pendeteksian uang terlarang yang membutuhkan intervensi regulator saat ini.</p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`alert-item ${alert.type} ${selectedAlert?.id === alert.id ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    background: selectedAlert?.id === alert.id ? 'var(--accent-primary-subtle)' : 'var(--bg-card)',
                    border: selectedAlert?.id === alert.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all 0.25s'
                  }}
                  onClick={() => handleSelectAlert(alert)}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div className={`alert-icon ${alert.type}`} style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 className="alert-title" style={{ fontSize: '0.92rem', margin: 0 }}>{alert.title}</h4>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '1px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                          background: alert.type === 'critical' ? 'var(--status-danger-bg)' : alert.type === 'warning' ? 'var(--status-warning-bg)' : 'var(--status-info-bg)',
                          color: alert.type === 'critical' ? 'var(--status-danger)' : alert.type === 'warning' ? 'var(--status-warning)' : 'var(--status-info)'
                        }}>{alert.type.toUpperCase()}</span>
                      </div>
                      <p className="alert-desc" style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{alert.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className="alert-time" style={{ fontSize: '0.78rem' }}>{alert.time}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Panel / Detail View (Right Sidebar Mode) */}
        <div>
          <AnimatePresence mode="wait">
            {selectedAlert ? (
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ padding: 20, borderColor: 'var(--border-accent)', background: 'var(--bg-glass)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Remediasi Regulator</h3>
                  <button className="modal-close" onClick={() => setSelectedAlert(null)}><X size={16} /></button>
                </div>

                {/* Sub-tab Navigation */}
                <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: 4, borderRadius: 8, marginBottom: 20, gap: 4 }}>
                  <button
                    onClick={() => setActiveDetailTab('remediation')}
                    className={`tab ${activeDetailTab === 'remediation' ? 'active' : ''}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      flex: 1,
                      textAlign: 'center',
                      border: 'none',
                      background: activeDetailTab === 'remediation' ? 'var(--bg-card)' : 'transparent',
                      color: activeDetailTab === 'remediation' ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderRadius: 6,
                      fontWeight: activeDetailTab === 'remediation' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🛡️ Tindakan
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('mule')}
                    className={`tab ${activeDetailTab === 'mule' ? 'active' : ''}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      flex: 1,
                      textAlign: 'center',
                      border: 'none',
                      background: activeDetailTab === 'mule' ? 'var(--bg-card)' : 'transparent',
                      color: activeDetailTab === 'mule' ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderRadius: 6,
                      fontWeight: activeDetailTab === 'mule' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🏦 Mule Acc
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('gnn')}
                    className={`tab ${activeDetailTab === 'gnn' ? 'active' : ''}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      flex: 1,
                      textAlign: 'center',
                      border: 'none',
                      background: activeDetailTab === 'gnn' ? 'var(--bg-card)' : 'transparent',
                      color: activeDetailTab === 'gnn' ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderRadius: 6,
                      fontWeight: activeDetailTab === 'gnn' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🧠 GNN Flow
                  </button>
                </div>

                {activeDetailTab === 'remediation' && (
                  <>
                    <div style={{ marginBottom: 20 }}>
                      <span className={`badge badge-${selectedAlert.type === 'critical' ? 'blocked' : selectedAlert.type === 'warning' ? 'flagged' : 'pending'}`} style={{ marginBottom: 12 }}>
                        Threat Level: {selectedAlert.type.toUpperCase()}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{selectedAlert.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-input)', padding: 12, borderRadius: 8 }}>
                        {selectedAlert.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>REMEDIASI OJK COMPLIANCE</div>

                      <button
                        className="btn btn-primary"
                        style={{ background: 'var(--gradient-danger)', justifyContent: 'center' }}
                        onClick={() => handleResolveAlert(selectedAlert.id, 'block')}
                      >
                        🛡️ Blokir Rekening & Wallet Crypto
                      </button>

                      <button
                        className="btn btn-ghost"
                        style={{ justifyContent: 'center' }}
                        onClick={() => handleResolveAlert(selectedAlert.id, 'investigate')}
                      >
                        📂 Kirim Tim Investigasi AML
                      </button>

                      <button
                        className="btn btn-ghost"
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', justifyContent: 'center' }}
                        onClick={() => handleResolveAlert(selectedAlert.id, 'dismiss')}
                      >
                        Abaikan & Tandai Aman
                      </button>

                      <button
                        className="btn btn-primary"
                        style={{
                          background: 'var(--gradient-primary)',
                          justifyContent: 'center',
                          marginTop: 12,
                          boxShadow: 'var(--shadow-glow)'
                        }}
                        onClick={() => {
                          setShowFullModal(true);
                          setModalTab('gnn');
                        }}
                      >
                        🔍 Investigasi Diagnostik OJK
                      </button>
                    </div>
                  </>
                )}

                {activeDetailTab === 'mule' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: -4 }}>
                      REKENING PENAMPUNG TERKAIT SENDER
                    </div>
                    {getLinkedMules(selectedAlert).map((mule) => (
                      <div
                        key={mule.id}
                        style={{
                          background: 'var(--bg-input)',
                          padding: 14,
                          borderRadius: 10,
                          border: '1px solid var(--border-color)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: 0.5 }}>{mule.id}</span>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{mule.name}</h4>
                          </div>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                            background: mule.status === 'frozen' ? 'var(--status-info-bg)' : 'var(--status-danger-bg)',
                            color: mule.status === 'frozen' ? 'var(--status-info)' : 'var(--status-danger)',
                            border: `1px solid ${mule.status === 'frozen' ? 'var(--status-info-border)' : 'var(--status-danger-border)'}`
                          }}>
                            {mule.status === 'frozen' ? '🧊 BEKU' : '🔴 AKTIF'}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Bank & Rekening:</span>
                            <strong>{mule.bank} - {mule.account}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Skor Risiko:</span>
                            <strong style={{ color: mule.riskScore >= 90 ? 'var(--status-danger)' : 'var(--status-warning)' }}>
                              {mule.riskScore}%
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Peran:</span>
                            <strong>{mule.role}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Dana Mengalir:</span>
                            <strong style={{ color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(mule.totalInflow || mule.inflow)}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                          <button
                            className={`btn btn-sm ${mule.status === 'frozen' ? 'btn-ghost' : 'btn-primary'}`}
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              padding: '6px',
                              background: mule.status === 'frozen' ? 'transparent' : 'var(--gradient-danger)',
                              color: mule.status === 'frozen' ? 'var(--text-primary)' : 'white'
                            }}
                            onClick={() => handleFreezeMule(mule.id)}
                          >
                            {mule.status === 'frozen' ? '🔓 Cairkan' : '🧊 Bekukan Rekening'}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'center', marginTop: 4 }}
                      onClick={() => {
                        setShowFullModal(true);
                        setModalTab('mule');
                      }}
                    >
                      🏦 Lihat Detail Rekening Mule OJK
                    </button>
                  </div>
                )}

                {activeDetailTab === 'gnn' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: -4 }}>
                      ALIRAN DANA DETEKSI GNN (PIPELINE)
                    </div>

                    {/* Visual Vertical Flow Chart */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '20px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border-color)'
                    }}>

                      {/* Node 1: Sender Bank */}
                      <div style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'var(--bg-card)',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid var(--status-info-border)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-info)' }}>
                          <Building2 size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUMBER DANA (NASABAH)</span>
                          <h5 style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>{getSenderName(selectedAlert)}</h5>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-info)', fontFamily: 'var(--font-mono)' }}>90% Risk</span>
                      </div>

                      {/* Connective Line */}
                      <div style={{ height: 24, width: 2, background: 'linear-gradient(180deg, var(--status-info) 0%, var(--status-danger) 100%)', position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 6,
                          height: 6,
                          background: 'var(--status-danger)',
                          borderRadius: '50%',
                          animation: 'ping 1s infinite'
                        }} />
                      </div>

                      {/* Node 2: Mule Accounts */}
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {getLinkedMules(selectedAlert).map((mule, idx) => (
                          <div key={idx} style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'var(--bg-card)',
                            padding: 10,
                            borderRadius: 8,
                            border: '1px solid var(--status-danger-border)',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-danger)' }}>
                              <Users size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>REKENING MULE PENAMPUNG</span>
                              <h5 style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>{mule.name}</h5>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{mule.riskScore}% Risk</span>
                          </div>
                        ))}
                      </div>

                      {/* Connective Line */}
                      <div style={{ height: 24, width: 2, background: 'linear-gradient(180deg, var(--status-danger) 0%, var(--accent-purple) 100%)' }} />

                      {/* Node 3: Crypto Wallets */}
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {getLinkedMules(selectedAlert).flatMap(m => m.linkedCryptoWallets || []).map((w, idx) => (
                          <div key={idx} style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'var(--bg-card)',
                            padding: 10,
                            borderRadius: 8,
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
                              <Wallet size={16} style={{ width: 14, height: 14 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>ALAMAT WALLET CRYPTO SUSPEK</span>
                              <h5 style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-mono)' }}>
                                {w.includes('...') ? w : `${w.substring(0, 8)}...${w.substring(w.length - 6)}`}
                              </h5>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>85% Risk</span>
                          </div>
                        ))}
                      </div>

                      {/* Connective Line */}
                      <div style={{ height: 24, width: 2, background: 'linear-gradient(180deg, var(--accent-purple) 0%, var(--accent-tertiary) 100%)' }} />

                      {/* Node 4: Target Exchange */}
                      <div style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'var(--bg-card)',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-tertiary)' }}>
                          <Globe size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>TUJUAN AKHIR EXCHANGE</span>
                          <h5 style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>Binance</h5>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-tertiary)', fontFamily: 'var(--font-mono)' }}>85% Risk</span>
                      </div>

                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--gradient-primary)', justifyContent: 'center', marginTop: 4 }}
                      onClick={() => {
                        setShowFullModal(true);
                        setModalTab('gnn');
                      }}
                    >
                      🧠 Buka Peta Jaringan GNN Interaktif
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="card" style={{ padding: 30, borderStyle: 'dashed', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShieldAlert size={36} style={{ marginInline: 'auto', marginBottom: 12, color: 'var(--text-muted)' }} />
                <h4>Inspektur OJK Compliance</h4>
                <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Ketuk salah satu ancaman aktif di samping kiri untuk mengkaji parameter dan mengambil tindakan penegakan hukum.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic full screen blur modal */}
      {showFullModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 24
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              maxWidth: '90vw',
              width: '1280px',
              height: '88vh',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                  <Brain style={{ color: 'var(--accent-primary)' }} /> Investigasi Diagnostik OJK Compliance
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4, margin: 0 }}>
                  Analisis Jaringan GNN & Deteksi Rekening Mule untuk alert: <strong>{selectedAlert?.title}</strong> ({getSenderName(selectedAlert)})
                </p>
              </div>
              <button
                className="btn btn-ghost"
                style={{ borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowFullModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 20, gap: 12 }}>
              <button
                className={`tab ${modalTab === 'gnn' ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border: 'none',
                  background: 'transparent',
                  color: modalTab === 'gnn' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: modalTab === 'gnn' ? '2px solid var(--accent-primary)' : 'none',
                  cursor: 'pointer',
                  fontWeight: modalTab === 'gnn' ? 700 : 500
                }}
                onClick={() => setModalTab('gnn')}
              >
                🧠 Peta Jaringan GNN
              </button>
              <button
                className={`tab ${modalTab === 'mule' ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border: 'none',
                  background: 'transparent',
                  color: modalTab === 'mule' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: modalTab === 'mule' ? '2px solid var(--accent-primary)' : 'none',
                  cursor: 'pointer',
                  fontWeight: modalTab === 'mule' ? 700 : 500
                }}
                onClick={() => setModalTab('mule')}
              >
                🏦 Analisis Deteksi Rekening Mule
              </button>
            </div>

            {/* Modal Body with full view inside */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {modalTab === 'gnn' ? (
                <GNNVisualization addToast={addToast} />
              ) : (
                <MuleAccountAnalysis addToast={addToast} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. TRANSACTION ANALYSIS VIEW
// ==========================================
export function AnalysisView({ transactions, addToast }) {
  const chartTheme = useChartTheme();
  const [analysisRange, setAnalysisRange] = useState('30days');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('patterns');
  const [exchanges, setExchanges] = useState(cryptoExchangeData);
  const [patterns, setPatterns] = useState(topBlockedPatterns);

  useEffect(() => {
    let active = true;
    async function loadAnalysisData() {
      try {
        const online = await checkHealth();
        if (!active) return;
        if (online) {
          const exRes = await fetchCryptoExchanges();
          const patRes = await fetchBlockedPatterns();
          if (active) {
            setExchanges(exRes);
            setPatterns(patRes);
          }
        }
      } catch (e) {
        console.error("Failed to load analysis page data:", e);
      }
    }
    loadAnalysisData();
  }, []);


  const startExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            const content = `================================================================================
LAPORAN HASIL REKONSILIASI AUDIT OJK - PENELUSURAN AML & KRIPTO
Otoritas Jasa Keuangan (OJK) - Republik Indonesia
================================================================================
RENTANG KELOLA   : ${analysisRange.toUpperCase()}
TANGGAL EXPORT   : ${new Date().toISOString().replace('T', ' ').substring(0, 19)} WIB
STATUS DOKUMEN   : LAPORAN RESMI AUDIT TERENKRIPSI
================================================================================

1. METRIK KEBERHASILAN PENCEGAHAN (30 HARI)
- Persentase Keberhasilan : 88.2%
- Total Nominal Dicegah   : Rp 15.200.000.000 (Rp 15.2M)
- Transaksi Terblokir     : 198 Transaksi (Minggu Ini) vs 162 Transaksi (Minggu Lalu)

2. POPULASI DISTRIBUSI PADA BURSA KRIPTO (EXCHANGE)
- Zipmex     : 3.645 Transaksi | Total Nominal AML Dicegah: Rp 1.3M | Risk: SEDANG
- Indodax    : 3.627 Transaksi | Total Nominal AML Dicegah: Rp 1.2M | Risk: SEDANG
- Binance    : 3.666 Transaksi | Total Nominal AML Dicegah: Rp 1.2M | Risk: SEDANG
- Tokocrypto : 3.626 Transaksi | Total Nominal AML Dicegah: Rp 1.1M | Risk: SEDANG
- Luno       : 3.622 Transaksi | Total Nominal AML Dicegah: Rp 1.1M | Risk: SEDANG

================================================================================
DIGITAL SIGNATURE : SHA256: 4f8a9b2c1d6e3f5a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
AUDITOR SYSTEM    : CRYPTO-SENTINEL FDS ENGINE v3.2
================================================================================`;

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `AML-OJK-Audit-Report-${analysisRange}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            addToast?.('📥 Dokumen Laporan Audit OJK berhasil diunduh!', 'success');
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const analysisTabs = [
    { id: 'patterns', label: 'Analisis Pola AML', icon: <BarChart3 size={16} /> },
    { id: 'mule', label: 'Deteksi Rekening Mule', icon: <Users size={16} /> },
    { id: 'gnn', label: 'GNN Network Analysis', icon: <Activity size={16} /> },
  ];

  return (
    <div className="analysis-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Analisis Mendalam OJK</h2>
          <p style={{ color: 'var(--text-muted)' }}>Visualisasi pola penimbunan pecahan, deteksi rekening mule, dan analisis jaringan transaksi dengan GNN.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {activeAnalysisTab === 'patterns' && (
            <>
              <select
                style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                value={analysisRange}
                onChange={(e) => setAnalysisRange(e.target.value)}
              >
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={startExport}>
                <Download size={16} /> Ekspor Laporan OJK
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analysis-tab-navigation" style={{ marginBottom: 24 }}>
        {analysisTabs.map(tab => (
          <button
            key={tab.id}
            className={`analysis-tab-btn ${activeAnalysisTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveAnalysisTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Original Patterns Analysis */}
        {activeAnalysisTab === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Embedded Deep Analytics Cards */}
            <div className="content-grid" style={{ marginBottom: 24 }}>
              {/* Visual 1: Patterns blocked */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><FileWarning /> Analisis Tipe Pola AML Terdeteksi</h3>
                </div>
                <div className="card-body">
                  <ResponsiveChartWrapper height={260}>
                    {(w, h) => (
                      <BarChart width={w} height={h} data={patterns} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                        <XAxis type="number" stroke={chartTheme.axis} fontSize={11} />
                        <YAxis dataKey="pattern" type="category" stroke={chartTheme.axis} width={Math.min(w * 0.38, 110)} fontSize={10} />
                        <Tooltip contentStyle={chartTheme.tooltip} />
                        <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={18}>
                          {patterns.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--status-danger)' : index === 1 ? 'var(--status-warning)' : 'var(--accent-primary)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveChartWrapper>
                </div>
              </div>

              {/* Visual 2: Comparative values */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><TrendingUp /> Komparasi Mingguan Nominal Dicegah</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Minggu Ini (Mei W4)</span>
                      <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>Rp 15.2M</p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>🛡️ 198 Transaksi Blok</span>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Minggu Lalu (Mei W3)</span>
                      <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Rp 12.8M</p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>🛡️ 162 Transaksi Blok</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.8rem' }}>
                      <span>Persentase Keberhasilan Pencegahan</span>
                      <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>98.2%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 9 }}>
                      <div style={{ height: '100%', background: 'var(--status-success)', width: '98.2%', borderRadius: 9 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparative list */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><BarChart3 /> Distribusi Penampungan di Crypto Exchanges</h3>
              </div>
              <div className="card-body">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nama Exchange</th>
                        <th>Kategori Risiko OJK</th>
                        <th>Jumlah Frekuensi (30h)</th>
                        <th>Total Nominal Pencucian Dicegah</th>
                        <th>Status Operasional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchanges.map((exc, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 700 }}>{exc.name}</td>
                          <td>
                            <span className={`badge badge-${exc.risk === 'high' ? 'blocked' : exc.risk === 'medium' ? 'flagged' : 'approved'}`}>
                              {exc.risk === 'high' ? 'TINGGI' : exc.risk === 'medium' ? 'SEDANG' : 'RENDAH'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{exc.transactions} Transaksi</td>
                          <td style={{ fontWeight: 700, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(exc.amount)}</td>
                          <td>
                            <span className="live-dot" style={{ background: exc.risk === 'high' ? 'var(--status-warning)' : 'var(--status-success)', width: 6, height: 6, display: 'inline-block', borderRadius: '50%', marginRight: 6 }} />
                            <span style={{ fontSize: '0.82rem' }}>{exc.risk === 'high' ? 'Diawasi Khusus' : 'Reguler'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Mule Account Analysis */}
        {activeAnalysisTab === 'mule' && (
          <motion.div
            key="mule"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <MuleAccountAnalysis addToast={addToast} />
          </motion.div>
        )}

        {/* Tab 3: GNN Network Analysis */}
        {activeAnalysisTab === 'gnn' && (
          <motion.div
            key="gnn"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <GNNVisualization addToast={addToast} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Export Loader Modal */}
      {isExporting && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400, textAlign: 'center', padding: 24 }}>
            <FileText size={48} className="animate-bounce" style={{ color: 'var(--accent-primary)', marginInline: 'auto', marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Membuat Dokumen Audit OJK</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 16 }}>Mengumpulkan data transaksi AML CryptoSentinel...</p>
            <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 9, marginBottom: 12 }}>
              <div style={{ height: '100%', background: 'var(--gradient-primary)', width: `${exportProgress}%`, borderRadius: 9, transition: 'width 250ms ease' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progres: {exportProgress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CRYPTO EXCHANGE DIRECTORY VIEW
// ==========================================
export function ExchangeView({ addToast }) {
  const [riskFilter, setRiskFilter] = useState('all');
  const [exchanges, setExchanges] = useState([
    { name: 'Binance', volume: 28500000000, risk: 'high', compliance: 'F (Non-Registrasi)', prevented: 12500000000, status: true },
    { name: 'Indodax', volume: 18400000000, risk: 'low', compliance: 'A (Bappebti Registered)', prevented: 4200000000, status: true },
    { name: 'Tokocrypto', volume: 12600000000, risk: 'low', compliance: 'A (Bappebti Registered)', prevented: 3100000000, status: true },
    { name: 'Luno', volume: 9500000000, risk: 'high', compliance: 'C (Dalam Review)', prevented: 2100000000, status: true },
    { name: 'Pintu', volume: 6200000000, risk: 'low', compliance: 'A (Bappebti Registered)', prevented: 1800000000, status: true },
    { name: 'Zipmex', volume: 1500000000, risk: 'medium', compliance: 'D (Audit Khusus)', prevented: 950000000, status: false }
  ]);

  useEffect(() => {
    let active = true;
    async function loadExchanges() {
      try {
        const online = await checkHealth();
        if (!active) return;
        if (online) {
          const res = await fetchCryptoExchanges();
          if (active) {
            const mapped = res.map(ex => {
              const complianceMap = {
                high: 'F (Non-Registrasi)',
                medium: 'D (Audit Khusus)',
                low: 'A (Bappebti Registered)'
              };
              return {
                name: ex.name,
                volume: ex.amount * 2.2 + 50000000,
                risk: ex.risk,
                compliance: complianceMap[ex.risk] || 'A (Bappebti Registered)',
                prevented: ex.amount,
                status: ex.risk !== 'high'
              };
            });
            setExchanges(mapped);
          }
        }
      } catch (e) {
        console.error("Failed to load exchanges in directory view:", e);
      }
    }
    loadExchanges();
  }, []);

  const toggleStatus = (name) => {
    setExchanges(prev => prev.map(ex => {
      if (ex.name === name) {
        const nextState = !ex.status;
        addToast(`🛡️ Regulasi ${name}: ${nextState ? 'DIPULIHKAN' : 'DIBEKUKAN / SUSPENDED'} oleh OJK.`, nextState ? 'success' : 'error');
        return { ...ex, status: nextState };
      }
      return ex;
    }));
  };

  const filteredEx = exchanges.filter(ex => riskFilter === 'all' || ex.risk === riskFilter);

  return (
    <div className="exchange-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Katalog Crypto Exchange & Compliance</h2>
          <p style={{ color: 'var(--text-muted)' }}>Pantau bursa pertukaran kripto domestik dan internasional. Bekukan izin konektivitas perbankan exchange yang melanggar aturan.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`tab ${riskFilter === 'all' ? 'active' : ''}`} onClick={() => setRiskFilter('all')}>Semua</button>
          <button className={`tab ${riskFilter === 'high' ? 'active' : ''}`} onClick={() => setRiskFilter('high')} style={{ color: riskFilter === 'high' ? 'var(--status-danger)' : '' }}>Kategori Merah (High)</button>
          <button className={`tab ${riskFilter === 'low' ? 'active' : ''}`} onClick={() => setRiskFilter('low')} style={{ color: riskFilter === 'low' ? 'var(--status-success)' : '' }}>Terdaftar Resmi</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Logo & Bursa</th>
                <th>Volume Transaksi Sentinel</th>
                <th>Total Dana AML Dicegah</th>
                <th>Status Lisensi Bappebti / OJK</th>
                <th>Indeks Risiko</th>
                <th>Aksi Pembekuan OJK</th>
              </tr>
            </thead>
            <tbody>
              {filteredEx.map((ex, index) => (
                <tr key={index} style={{ opacity: ex.status ? 1 : 0.6 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="exchange-logo" style={{ background: ex.status ? 'var(--accent-primary-subtle)' : 'var(--bg-elevated)', color: ex.status ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {ex.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: {ex.risk === 'high' ? 'International' : 'Domestic Exchange'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(ex.volume)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(ex.prevented)}</td>
                  <td>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: ex.compliance.startsWith('A') ? 'var(--status-success)' : ex.compliance.startsWith('F') ? 'var(--status-danger)' : 'var(--status-warning)'
                    }}>{ex.compliance}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${ex.risk === 'high' ? 'blocked' : ex.risk === 'medium' ? 'flagged' : 'approved'}`}>
                      {ex.risk.toUpperCase()} RISK
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${ex.status ? 'btn-danger' : 'btn-primary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => toggleStatus(ex.name)}
                    >
                      {ex.status ? 'Bekukan Akses Bank' : 'Pulihkan Akses'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SUSPICIOUS FRAUD PATTERNS VIEW
// ==========================================
export function PatternsView() {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const patterns = [
    { id: 'smurfing', name: 'Smurfing / Structuring (Pecahan)', desc: 'Memecah nominal transaksi besar menjadi angka kecil (<Rp 100jt) berulang-ulang dari rekening yang sama dalam rentang waktu kurang dari 24 jam.', algorithm: 'Scan for unique sender accounts having > 3 transactions to crypto wallets under 100M IDR within a 120-minute window.' },
    { id: 'wallet-reuse', name: 'New Wallet Address Reuse', desc: 'Transfer dana dalam jumlah besar dari nasabah bank ke wallet crypto yang baru berumur kurang dari 48 jam.', algorithm: 'Check transaction metadata. Query target address timestamp from Blockchain Explorer APIs. Flag if wallet creation < 48 hours.' },
    { id: 'international-wash', name: 'International Wash Trading Bypass', desc: 'Transfer dana dari bank lokal ke bursa pertukaran kripto internasional ilegal (Non-Regulasi) tanpa pelaporan devisa luar negeri.', algorithm: 'Cross-reference exchange IP/domain nodes. Flag if destination is located in FATF non-cooperative jurisdictions.' }
  ];

  const handleTestPattern = (id) => {
    setIsAnalyzing(true);
    setTerminalOutput(['[AML-ENGINE] Initializing scanner rules...', `[AML-ENGINE] Binding algorithm: ${patterns.find(p => p.id === id).id.toUpperCase()}`]);

    let step = 0;
    const terminalLogs = [
      '[DATA-SYNC] Querying live database tables (recent_transactions)...',
      '[SCANNING] Analyzing sender bank accounts & volume patterns...',
      '[SCANNING] Evaluating structural transaction times and wallet metadata...',
      `[MATCH FOUND] STRUCTURING DETECTED on Client 'Ahmad Faisal'!`,
      `[DECISION] Threat index calculated: 92%. Queueing OJK system auto-block.`
    ];

    const timer = setInterval(() => {
      if (step < terminalLogs.length) {
        setTerminalOutput(prev => [...prev, terminalLogs[step]]);
        step++;
      } else {
        clearInterval(timer);
        setIsAnalyzing(false);
      }
    }, 450);
  };

  return (
    <div className="patterns-view">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Pola Fraud & Money Laundering AML</h2>
        <p style={{ color: 'var(--text-muted)' }}>Kelola model deteksi fraud cerdas berbasis alur pecahan (Structuring) dan transfer ke entitas berisiko tinggi.</p>
      </div>

      <div className="content-grid-wide">
        {/* Pattern catalog list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {patterns.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 18,
                cursor: 'pointer',
                borderColor: selectedPattern?.id === p.id ? 'var(--border-accent)' : '',
                background: selectedPattern?.id === p.id ? 'var(--accent-primary-subtle)' : ''
              }}
              onClick={() => { setSelectedPattern(p); setTerminalOutput([]); }}
            >
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{p.name}</h4>
                <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>ALGORITMA AKTIF</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Console / Rules tester */}
        <div>
          {selectedPattern ? (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Aturan Logika: {selectedPattern.name}</h3>
              <code style={{ display: 'block', padding: 12, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.5, marginBottom: 20 }}>
                {selectedPattern.algorithm}
              </code>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
                onClick={() => handleTestPattern(selectedPattern.id)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Menganalisis Transaksi...' : '🔬 Jalankan Simulasi Pendeteksian'}
              </button>

              {terminalOutput.length > 0 && (
                <div className="card" style={{ background: '#020617', borderColor: '#1e293b' }}>
                  <div className="card-body" style={{ padding: 12, maxHeight: 180, overflowY: 'auto' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#10b981', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {terminalOutput.map((out, idx) => (
                        <div key={idx}>
                          <span style={{ color: '#64748b' }}>&gt;</span> {out}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 30, borderStyle: 'dashed', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileWarning size={36} style={{ marginInline: 'auto', marginBottom: 12 }} />
              <h4>Uji Aturan Pendeteksian Fraud</h4>
              <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Pilih salah satu tipe pola penimbunan AML di samping kiri untuk memeriksa algoritme deteksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. CLIENT RISK PROFILES VIEW
// ==========================================
export function RiskProfilesView({ addToast }) {
  const [searchClient, setSearchClient] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadClients() {
      try {
        const online = await checkHealth();
        if (!active) return;
        if (online) {
          const mules = await fetchMuleAccounts();
          if (active) {
            const mapped = mules.map(m => ({
              name: m.name,
              account: `****${m.account.slice(-4)}`,
              bank: m.bank,
              score: m.riskScore,
              status: m.status === 'frozen' ? 'Suspended' : m.status === 'monitored' ? 'Monitored' : 'Active',
              txs: m.txCount
            }));
            setClients(mapped);
          }
        }
      } catch (e) {
        console.error("Failed to load client risk profiles:", e);
      }
    }
    loadClients();
  }, []);

  const handleUpdateStatus = (name, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Monitored' : currentStatus === 'Monitored' ? 'Active' : 'Suspended';
    setClients(prev => prev.map(cl => {
      if (cl.name === name) {
        addToast(`👤 Status nasabah ${name} diubah menjadi: ${nextStatus.toUpperCase()}`, 'warning');
        return { ...cl, status: nextStatus };
      }
      return cl;
    }));
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()));

  return (
    <div className="risk-profiles-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Profil Risiko Nasabah Bank</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gunakan audit profil untuk mengawasi individual berisiko tinggi berdasarkan skor anomali transaksi kripto.</p>
        </div>

        <div className="header-search" style={{ margin: 0 }}>
          <Search />
          <input
            type="text"
            placeholder="Cari nama nasabah..."
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            style={{ width: 220 }}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nasabah</th>
                <th>Asal Bank & Rekening</th>
                <th>Skor Risiko Personal</th>
                <th>Frekuensi Ke Crypto (30h)</th>
                <th>Status Pengawasan</th>
                <th>Aksi OJK</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{client.name}</td>
                  <td>{client.bank} ({client.account})</td>
                  <td>
                    <div className="risk-meter" style={{ width: 120 }}>
                      <div className="risk-bar">
                        <div
                          className={`risk-bar-fill ${client.score >= 80 ? 'high' : 'medium'}`}
                          style={{ width: `${client.score}%` }}
                        />
                      </div>
                      <span className="risk-value" style={{ color: client.score >= 80 ? 'var(--status-danger)' : 'var(--status-warning)' }}>{client.score}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{client.txs} Kali Transfer</td>
                  <td>
                    <span className={`badge badge-${client.status === 'Suspended' ? 'blocked' : client.status === 'Monitored' ? 'flagged' : 'approved'}`}>
                      {client.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => handleUpdateStatus(client.name, client.status)}
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. DATABASE BLOCKLIST VIEW
// ==========================================
export function BlocklistView({ blockedEntities, setBlockedEntities, addToast }) {
  const [activeTab, setActiveTab] = useState('wallets');

  // Form input states
  const [walletInput, setWalletInput] = useState('');
  const [walletReason, setWalletReason] = useState('Potensi Smurfing Binance');

  const [bankAccountInput, setBankAccountInput] = useState('');
  const [bankHolderInput, setBankHolderInput] = useState('');
  const [bankReason, setBankReason] = useState('Stukturasi Berulang');

  const [idInput, setIdInput] = useState('');
  const [idHolderInput, setIdHolderInput] = useState('');
  const [idReason, setIdReason] = useState('Identitas Terkait Money Laundering');

  const handleAddWallet = (e) => {
    e.preventDefault();
    if (!walletInput.trim()) return;

    const newWallet = {
      id: Math.random().toString(),
      address: walletInput,
      dateAdded: new Date().toISOString().substring(0, 10),
      reason: walletReason
    };

    setBlockedEntities(prev => ({
      ...prev,
      wallets: [newWallet, ...prev.wallets]
    }));

    addToast(`🛡️ Wallet ${walletInput.substring(0, 8)}... berhasil dimasukkan ke blocklist.`, 'success');
    setWalletInput('');
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    if (!bankAccountInput.trim() || !bankHolderInput.trim()) return;

    const newBank = {
      id: Math.random().toString(),
      account: bankAccountInput,
      holder: bankHolderInput,
      bank: 'Mandiri',
      dateAdded: new Date().toISOString().substring(0, 10),
      reason: bankReason
    };

    setBlockedEntities(prev => ({
      ...prev,
      banks: [newBank, ...prev.banks]
    }));

    addToast(`🛡️ Rekening ${bankAccountInput} (${bankHolderInput}) diblokir!`, 'success');
    setBankAccountInput('');
    setBankHolderInput('');
  };

  const handleAddId = (e) => {
    e.preventDefault();
    if (!idInput.trim() || !idHolderInput.trim()) return;

    const newId = {
      id: Math.random().toString(),
      nik: idInput,
      name: idHolderInput,
      dateAdded: new Date().toISOString().substring(0, 10),
      reason: idReason
    };

    setBlockedEntities(prev => ({
      ...prev,
      ids: [newId, ...prev.ids]
    }));

    addToast(`🛡️ NIK ${idInput} dimasukkan ke blacklist nasional OJK!`, 'success');
    setIdInput('');
    setIdHolderInput('');
  };

  const handleRemoveEntity = (id, listName) => {
    setBlockedEntities(prev => ({
      ...prev,
      [listName]: prev[listName].filter(item => item.id !== id)
    }));
    addToast('🗑️ Entitas berhasil dihapus dari blocklist aktif.', 'warning');
  };

  return (
    <div className="blocklist-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Database Terblokir OJK (Blocklist)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manajemen blocklist nasional untuk membekukan alamat dompet crypto luar negeri, nomor rekening m-banking, dan NIK pelaku money laundering.</p>
        </div>
      </div>

      <div className="content-grid-wide">
        {/* Blocklist Table & Tab Content */}
        <div>
          {/* Tab selector */}
          <div className="tabs" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <button
              className={`tab ${activeTab === 'wallets' ? 'active' : ''}`}
              onClick={() => setActiveTab('wallets')}
            >
              🌐 Alamat Wallet Crypto ({blockedEntities.wallets.length})
            </button>
            <button
              className={`tab ${activeTab === 'banks' ? 'active' : ''}`}
              onClick={() => setActiveTab('banks')}
            >
              💳 Rekening Bank ({blockedEntities.banks.length})
            </button>
            <button
              className={`tab ${activeTab === 'ids' ? 'active' : ''}`}
              onClick={() => setActiveTab('ids')}
            >
              👤 NIK / Identitas ({blockedEntities.ids.length})
            </button>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              {activeTab === 'wallets' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alamat Dompet Crypto</th>
                      <th>Tanggal Masuk</th>
                      <th>Alasan Pemblokiran</th>
                      <th>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedEntities.wallets.map((w) => (
                      <tr key={w.id}>
                        <td><code style={{ color: 'var(--status-danger)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{w.address}</code></td>
                        <td>{w.dateAdded}</td>
                        <td style={{ fontSize: '0.82rem' }}>{w.reason}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--status-danger)', border: 'none' }}
                            onClick={() => handleRemoveEntity(w.id, 'wallets')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'banks' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rekening & Pemegang</th>
                      <th>Asal Bank</th>
                      <th>Tanggal Blokir</th>
                      <th>Alasan Kasus</th>
                      <th>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedEntities.banks.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.holder}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.account}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{b.bank}</td>
                        <td>{b.dateAdded}</td>
                        <td style={{ fontSize: '0.82rem' }}>{b.reason}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--status-danger)', border: 'none' }}
                            onClick={() => handleRemoveEntity(b.id, 'banks')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'ids' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama NIK / KTP</th>
                      <th>Nomor NIK Resmi</th>
                      <th>Tanggal Ditambahkan</th>
                      <th>Catatan OJK</th>
                      <th>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedEntities.ids.map((id) => (
                      <tr key={id.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{id.name}</td>
                        <td><code style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{id.nik}</code></td>
                        <td>{id.dateAdded}</td>
                        <td style={{ fontSize: '0.82rem' }}>{id.reason}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--status-danger)', border: 'none' }}
                            onClick={() => handleRemoveEntity(id.id, 'ids')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Input Form Panel */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Plus size={18} /> Tambah Entitas Blokir</h3>
            </div>
            <div className="card-body">
              {activeTab === 'wallets' && (
                <form onSubmit={handleAddWallet}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Alamat Wallet Crypto (Hex)</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                      placeholder="Contoh: 0x71C5...4fd9"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Alasan / Indikasi Kasus</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={walletReason}
                      onChange={(e) => setWalletReason(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Database size={16} /> Daftarkan Blocklist Dompet
                  </button>
                </form>
              )}

              {activeTab === 'banks' && (
                <form onSubmit={handleAddBank}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nama Pemegang Rekening</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={bankHolderInput}
                      onChange={(e) => setBankHolderInput(e.target.value)}
                      placeholder="Contoh: Ahmad Faisal"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nomor Rekening Bank</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={bankAccountInput}
                      onChange={(e) => setBankAccountInput(e.target.value)}
                      placeholder="Contoh: 849202029"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Alasan Kasus</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={bankReason}
                      onChange={(e) => setBankReason(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Database size={16} /> Bekukan Rekening Sekarang
                  </button>
                </form>
              )}

              {activeTab === 'ids' && (
                <form onSubmit={handleAddId}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nama Lengkap Sesuai KTP</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={idHolderInput}
                      onChange={(e) => setIdHolderInput(e.target.value)}
                      placeholder="Contoh: Rizky Hidayat"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nomor NIK / KTP Resmi (16 Digit)</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={idInput}
                      onChange={(e) => setIdInput(e.target.value)}
                      placeholder="Contoh: 3171092828020921"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Catatan Fraud AML</label>
                    <input
                      type="text"
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={idReason}
                      onChange={(e) => setIdReason(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Database size={16} /> Blacklist NIK Nasional
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. POLICIES AND RULES CONFIGURATION VIEW
// ==========================================
export function RulesView({ rules, setRules, addToast }) {
  const [localThreshold, setLocalThreshold] = useState(rules.riskThreshold);
  const [localLimit, setLocalLimit] = useState(rules.dailyLimit);
  const [localAutoBlock, setLocalAutoBlock] = useState(rules.autoBlockEnabled);
  const [localSmurfing, setLocalSmurfing] = useState(rules.smurfingCheckEnabled);

  const handleSave = () => {
    setRules({
      riskThreshold: localThreshold,
      dailyLimit: localLimit,
      autoBlockEnabled: localAutoBlock,
      smurfingCheckEnabled: localSmurfing
    });
    addToast('💾 Aturan dan Kebijakan AML OJK berhasil diperbarui nasional!', 'success');
  };

  return (
    <div className="rules-view">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Aturan & Regulasi AML (Policies)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sesuaikan ambang batas pemblokiran otomatis, deteksi smurfing, dan limit pengiriman harian nasabah bank ke bursa kripto.</p>
      </div>

      <div className="content-grid">
        {/* Rules Config Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Sliders /> Konsol Aturan Kebijakan</h3>
          </div>
          <div className="card-body">
            {/* Rule 1: Risk Slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justify: 'space-between', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Ambang Batas Pemblokiran Otomatis OJK</span>
                <span style={{ color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>Skor {localThreshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                style={{ width: '100%', cursor: 'pointer' }}
                value={localThreshold}
                onChange={(e) => setLocalThreshold(parseInt(e.target.value))}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Setiap transaksi nasabah bank ke crypto dengan skor risiko di atas ambang ini akan dicegah seketika.</span>
            </div>

            {/* Rule 2: Daily limit amount */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Batas Pengiriman Uang Harian ke Bursa Crypto</label>
              <input
                type="number"
                className="header-search"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                value={localLimit}
                onChange={(e) => setLocalLimit(parseInt(e.target.value))}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Jumlah dana akumulasi maksimum yang dapat ditransfer nasabah per hari sebelum diblokir otomatis.</span>
            </div>

            {/* Rule 3: Auto-block switch */}
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 16, padding: 12, background: 'var(--bg-input)', borderRadius: 8 }}>
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Blokir Otomatis Skala Nasional</h5>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gunakan audit real-time untuk mematikan alur transfer berisiko.</p>
              </div>
              <input
                type="checkbox"
                checked={localAutoBlock}
                onChange={() => setLocalAutoBlock(!localAutoBlock)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>

            {/* Rule 4: Smurfing check switch */}
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 24, padding: 12, background: 'var(--bg-input)', borderRadius: 8 }}>
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Deteksi Structuring / Smurfing Pintar</h5>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deteksi alur pemecahan dana di bawah Rp 100jt berulang.</p>
              </div>
              <input
                type="checkbox"
                checked={localSmurfing}
                onChange={() => setLocalSmurfing(!localSmurfing)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
              <Save size={16} /> Simpan Kebijakan AML OJK
            </button>
          </div>
        </div>

        {/* Visual overview explaining parameters */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><BookOpen /> Panduan Compliance Regulasi</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.85rem', lineHeight: 1.5 }}>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4 }}>💡 Informasi Regulasi OJK</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Berdasarkan UU No. 8 Tahun 2010 terkait Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang, penyedia bank wajib mensinkronisasikan sistem deteksi anomali real-time ke database compliance nasional.
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-warning)' }}>⚠️ Catatan Penyesuaian</span>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Meningkatkan kriteria skor risiko di bawah 65% dapat menyebabkan banyak keluhan transaksi normal (false positives). Disarankan menggunakan batas standar di angka 80%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. AUDIT AND COMPLIANCE VIEW
// ==========================================
export function ComplianceView({ addToast }) {
  const [reportType, setReportType] = useState('SAR');
  const [loading, setLoading] = useState(false);

  const triggerAuditReport = async () => {
    // 1. MUST open window SYNCHRONOUSLY to prevent browser pop-up blocking on repeated clicks!
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('⚠️ Harap izinkan pop-up peramban untuk membuka PDF Laporan.', 'warning');
      return;
    }

    setLoading(true);
    addToast('📄 Menghubungkan ke Backend API & Mengompilasi Laporan PDF Audit...', 'info');

    // Show initial loading state inside the print window immediately
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Mengompilasi Laporan PDF...</title></head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #38bdf8;">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">⚙️ Crypto - Sentinel</div>
          <div style="font-size: 14px; color: #94a3b8;">Mengompilasi data audit real-time &amp; sertifikasi OJK...</div>
        </div>
      </body>
      </html>
    `);

    try {
      // 2. Fetch live data from Backend API or fallbacks
      const [stats, liveTxns, mules] = await Promise.all([
        fetchStatistics().catch(() => ({ totalTransactions: 50000, blockedTransactions: 525, totalValueBlocked: 15200000000 })),
        fetchTransactions().catch(() => []),
        fetchMuleAccounts().catch(() => [])
      ]);

      const now = new Date();
      const dateStr = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
      const shortUuid = Math.random().toString(36).substring(2, 10).toUpperCase();
      const reportId = `LTKM-BKG-${dateStr}-${shortUuid}`;
      const createdAtFormatted = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + `, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      const dateOnlyStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      const topTx = (liveTxns && liveTxns.length > 0) ? liveTxns[0] : null;
      const transactionId = topTx?.id || topTx?.transactionId || 'TXN-KNG-2026-9901';
      const senderName = topTx?.senderName || 'Nasabah Terlapor (Budi Santoso)';
      const senderAccount = topTx?.senderAccount || '782019453210';
      const destinationName = topTx?.destination || 'Rekening Penampung / Bursa Kripto Indodax';
      const destinationAccount = topTx?.destinationAccount || '0x9B82...3Fa1 / 8829104829';
      const amount = topTx?.amount || 150000000;
      const amountFormatted = formatCurrency(amount);
      const riskScore = topTx?.riskScore || 92;
      const decision = riskScore >= 85 ? 'BLOCK' : 'REVIEW';

      const reasons = [
        'Terdeteksi transaksi anomali melebihi ambang batas risiko (>85/100).',
        'Pola Structuring/Smurfing: 5 transfer beruntun dengan nominal mendekati limit pelaporan tunai.',
        'Drain-to-Zero Saldo: Saldo rekening pengirim terkuras habis setelah transaksi berlangsung.',
        'Ketidaksesuaian Purpose Code ISO 20022 dengan rekening penerima bursa kripto (VASP).'
      ];
      const reasonsLi = reasons.map(r => `<li>${r}</li>`).join('');

      const narrative = `Berdasarkan hasil pemantauan sistem intelijen anti-fraud Crypto-Sentinel pada tanggal ${createdAtFormatted}, telah terdeteksi transaksi mencurigakan dengan skor risiko ${riskScore}/100 (Kategori Kritis/Tinggi). Transaksi atas nama ${senderName} (Rekening: ${senderAccount}) senilai ${amountFormatted} menuju ${destinationName} (Rekening: ${destinationAccount}) memenuhi indikator Transaksi Keuangan Mencurigakan (TKM) dengan temuan: ${reasons.join('; ')}. Sesuai POJK No. 12/2024 dan UU No. 8 Tahun 2010 Pasal 23, transaksi telah ditahan sementara (Circuit Breaker) dan direkomendasikan untuk pembekuan rekening serta pelaporan resmi ke Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK).`;

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${reportId} - Laporan Transaksi Keuangan Mencurigakan</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            color: #000;
            background: #fff;
            margin: 40px auto;
            max-width: 800px;
            font-size: 13pt;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 15pt;
            margin: 0;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header h2 {
            font-size: 13pt;
            margin: 4px 0;
            font-weight: normal;
        }
        .header p {
            font-size: 10pt;
            margin: 2px 0;
            color: #333;
        }
        .confidential-badge {
            text-align: right;
            font-weight: bold;
            font-size: 11pt;
            color: #900;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-meta {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .report-meta td {
            padding: 4px 0;
            vertical-align: top;
            font-size: 12pt;
        }
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 20px;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-size: 12pt;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #000;
            padding: 6px 10px;
            font-size: 11pt;
            text-align: left;
        }
        table.data-table th {
            background-color: #f2f2f2;
        }
        .narrative-box {
            border: 1px solid #000;
            padding: 12px;
            margin: 10px 0;
            text-align: justify;
            font-size: 11.5pt;
            line-height: 1.5;
            background-color: #fafafa;
        }
        .signatures {
            margin-top: 40px;
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
        .sig-box {
            width: 45%;
            text-align: center;
        }
        .sig-space {
            height: 70px;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            font-size: 9pt;
            color: #555;
            text-align: center;
        }
        .btn-print {
            display: block;
            width: 140px;
            margin: 30px auto 0 auto;
            padding: 10px 16px;
            text-align: center;
            background-color: #1e3a8a;
            color: white;
            border: none;
            border-radius: 6px;
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            font-weight: bold;
            cursor: pointer;
            letter-spacing: 0.5px;
        }
        @media print {
            .btn-print { display: none; }
            body { margin: 20px; }
        }
    </style>
</head>
<body>

    <div class="confidential-badge">
        [ RAHASIA — DOKUMEN INTELIJEN KEUANGAN ]
    </div>

    <div class="header">
        <h1>PT BPR KUNINGAN (PERSERODA)</h1>
        <h2>SATUAN KERJA KEPATUHAN, HUKUM & APU-PPT</h2>
        <p>Jl. Jenderal Sudirman No. 128, Kuningan, Jawa Barat | Telepon: (0232) 871128</p>
    </div>

    <table class="report-meta">
        <tr>
            <td style="width: 25%;"><strong>Nomor Laporan</strong></td>
            <td style="width: 2%;">:</td>
            <td><strong>${reportId}</strong></td>
        </tr>
        <tr>
            <td><strong>Tanggal Diterbitkan</strong></td>
            <td>:</td>
            <td>${createdAtFormatted}</td>
        </tr>
        <tr>
            <td><strong>Dasar Hukum Pelaporan</strong></td>
            <td>:</td>
            <td>UU No. 8 Tahun 2010 Pasal 23 & POJK No. 12/2024</td>
        </tr>
        <tr>
            <td><strong>Perihal</strong></td>
            <td>:</td>
            <td>Laporan Transaksi Keuangan Mencurigakan (LTKM) Otomatis — Pencegahan Fraud Kripto/Mule</td>
        </tr>
    </table>

    <div class="section-title">I. IDENTITAS NASABAH / TERLAPOR</div>
    <table class="data-table">
        <tr>
            <th style="width: 30%;">Nama Lengkap Nasabah</th>
            <td>${senderName}</td>
        </tr>
        <tr>
            <th>Nomor Rekening Sumber</th>
            <td><strong>${senderAccount}</strong> (PT BPR KUNINGAN (PERSERODA))</td>
        </tr>
        <tr>
            <th>Nomor Induk Kependudukan (NIK)</th>
            <td>3208************</td>
        </tr>
        <tr>
            <th>Kategori Nasabah</th>
            <td>Perseorangan</td>
        </tr>
    </table>

    <div class="section-title">II. RINCIAN TRANSAKSI MENCURIGAKAN</div>
    <table class="data-table">
        <tr>
            <th style="width: 30%;">ID Transaksi Sistem</th>
            <td>${transactionId}</td>
        </tr>
        <tr>
            <th>Nominal Transaksi</th>
            <td><strong style="font-size: 13pt;">${amountFormatted}</strong></td>
        </tr>
        <tr>
            <th>Rekening & Pihak Tujuan</th>
            <td>${destinationAccount} (${destinationName})</td>
        </tr>
        <tr>
            <th>Skor Risiko AI (Crypto-Sentinel)</th>
            <td><strong style="color: #900;">${riskScore} / 100 (${decision})</strong></td>
        </tr>
        <tr>
            <th>Tindakan Sistem (Circuit Breaker)</th>
            <td><strong>Transaksi dibekukan seketika (Pre-Authorization Circuit Breaker) untuk mencegah pelarian dana ke bursa aset kripto/jaringan mule.</strong></td>
        </tr>
    </table>

    <div class="section-title">III. URAIAN ANOMALI & INDIKASI KECURIGAAN</div>
    <div class="narrative-box">
        ${narrative}
    </div>

    <div style="margin-top: 10px;">
        <strong>Daftar Sub-Indikator APU-PPT Terpicu:</strong>
        <ul style="margin: 6px 0 15px 20px;">
            ${reasonsLi}
        </ul>
    </div>

    <div class="section-title">IV. REKOMENDASI TINDAKAN & PENGESAHAN</div>
    <p style="font-size: 11pt; margin-bottom: 25px;">
        Dokumen ini diterbitkan secara otomatis oleh modul kepatuhan <em>Crypto-Sentinel FDS</em> untuk diverifikasi oleh Pejabat Kepatuhan sebelum disampaikan melalui sistem pelaporan <strong>PPATK goAML</strong>.
    </p>

    <table style="width: 100%; border: none; margin-top: 30px;">
        <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
                <p>Mengetahui / Menyetujui,<br><strong>Direktur Kepatuhan</strong></p>
                <div style="height: 65px;"></div>
                <p><strong><u>DENI HERYANA, S.Sos., M.M.</u></strong><br>Direktur yang Membawahkan Fungsi Kepatuhan</p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
                <p>Kuningan, ${dateOnlyStr}<br><strong>Petugas Kepatuhan / Analis APU-PPT</strong></p>
                <div style="height: 65px;"></div>
                <p><strong><u>Rifki Firmansyah, S.Kom</u></strong><br>Unit Kerja Kepatuhan & Manajemen Risiko</p>
            </td>
        </tr>
    </table>

    <button class="btn-print" onclick="window.print()">Cetak / Print PDF</button>

    <div class="footer">
        Dokumen Rahasia Negara — Dilarang menggandakan atau menyebarluaskan tanpa izin tertulis dari Pejabat Kepatuhan Perbankan & PPATK.<br>
        Sistem Deteksi: Crypto-Sentinel Middleware Security Layer v0.5.0 — PIDI Capstone 2026.
    </div>

</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      addToast(`📄 Jendela Pratinjau PDF Laporan Resmi ${reportType} berhasil dibuka!`, 'success');
    } catch (e) {
      console.error("PDF generation failed:", e);
      addToast('❌ Gagal mengompilasi laporan PDF dari API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compliance-view">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Audit & Compliance Kepatuhan Perbankan</h2>
        <p style={{ color: 'var(--text-muted)' }}>Hasil rekonsiliasi data audit AML berkala dan log sertifikasi kepatuhan sistem.</p>
      </div>

      <div className="content-grid-wide" style={{ marginBottom: 24 }}>
        {/* Compliance checklist stats */}
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Nilai Kepatuhan (Compliance Score)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', width: 90, height: 90, borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-success)' }}>94%</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Tingkat Integrasi Sangat Baik</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                  Sistem terhubung ke 6 API Bank terbesar (BCA, Mandiri, BRI, BNI, CIMB, Permata). Tingkat keterlambatan respon WebSocket &lt; 85ms.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Shield /> Log Pemeriksaan Kepatuhan</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Komponen Audit</th>
                    <th>Metrik Pemeriksaan</th>
                    <th>Status Sistem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>WebSocket Bank Sync</td>
                    <td>Kecepatan Sync Transfer Realtime</td>
                    <td><span className="badge badge-approved"><span className="badge-dot" /> AKTIF</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Blocklist Auto-Push</td>
                    <td>Integrasi ke Sistem Bappebti</td>
                    <td><span className="badge badge-approved"><span className="badge-dot" /> TERHUBUNG</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Wash Trading Analyzer</td>
                    <td>Uji Blockchain Tracker Node</td>
                    <td><span className="badge badge-flagged"><span className="badge-dot" /> CHECKING</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Generate Formal STR/LTKM Wizard */}
        <div>
          <div className="card" style={{ padding: 22, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <FileText size={20} color="#2563eb" />
              Pembuat Dokumen Resmi LTKM / STR
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
              Ekspor dokumen formal <strong>Laporan Transaksi Keuangan Mencurigakan (LTKM / STR)</strong> berstandar hukum perbankan nasional, lengkap dengan Kop Surat Resmi Bank Kuningan, pembuktian forensik GNN GraphSAGE, dan tanda tangan digital untuk pelaporan ke <strong>goAML PPATK &amp; OJK</strong>.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Pilih Jenis Dokumen Kepatuhan
              </label>
              <select
                style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'var(--text-primary)', outline: 'none', fontSize: '0.86rem', fontWeight: 600 }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="SAR">LTKM / STR — Laporan Transaksi Keuangan Mencurigakan (UU No. 8/2010)</option>
                <option value="CTR">TKM / CTR — Laporan Nilai Nominal Diatas Rp 500 Juta</option>
                <option value="EXCHANGE">Laporan Kepatuhan VASP &amp; Rekening Mule Bursa Kripto</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                height: 44,
                justifyContent: 'center',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
              onClick={triggerAuditReport}
              disabled={loading}
            >
              <FileText size={18} />
              <span>{loading ? 'Mengompilasi Data Dokumen...' : '📄 Cetak / Unduh Dokumen Resmi LTKM (Format PPATK)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. SYSTEM CONFIGURATION & SETTINGS VIEW
// ==========================================
export function SettingsView({ adminProfile, setAdminProfile, addToast }) {
  // Local profile states
  const [name, setName] = useState(adminProfile.name);
  const [role, setRole] = useState(adminProfile.role);

  // Local toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState(3);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdminProfile({
      name: name,
      role: role,
      avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    });

    addToast('👤 Profil Admin Regulator berhasil disimpan!', 'success');
  };

  return (
    <div className="settings-view">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Konfigurasi & Pengaturan Sistem</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sesuaikan akun regulator OJK Anda, matikan/hidupkan efek notifikasi suara bahaya AML, dan atur integrasi dev.</p>
      </div>

      <div className="content-grid">
        {/* Admin Profile Config Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><User /> Pengaturan Profil Akun</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nama Lengkap Regulator</label>
                <input
                  type="text"
                  className="header-search"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Admin Regulator"
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Jabatan & Divisi OJK</label>
                <input
                  type="text"
                  className="header-search"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: OJK - Compliance Div."
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={16} /> Simpan Pengaturan Akun
              </button>
            </form>
          </div>
        </div>

        {/* Audio Alerts & Refresh Control */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Settings /> Preferensi Pemantau (Visual & Audio)</h3>
          </div>
          <div className="card-body">
            {/* Audio switch */}
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Efek Suara Sinyal Ancaman</h5>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bunyikan alarm OJK otomatis jika structuring terdeteksi.</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  addToast(soundEnabled ? '🔇 Efek alarm dinonaktifkan.' : '🔊 Alarm ancaman aktif.', 'warning');
                }}
              >
                {soundEnabled ? <Volume2 style={{ color: 'var(--status-success)' }} /> : <VolumeX />}
              </button>
            </div>

            {/* Refresh Seconds Slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justify: 'space-between', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Interval Auto-refresh Realtime Ticker</span>
                <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{autoRefreshSecs} Detik</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                style={{ width: '100%', cursor: 'pointer' }}
                value={autoRefreshSecs}
                onChange={(e) => setAutoRefreshSecs(parseInt(e.target.value))}
              />
            </div>

            <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <strong>🔑 KUNCI API DEV (MOCK):</strong>
              <code style={{ display: 'block', wordBreak: 'break-all', marginTop: 4, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.OJKCryptoSentinelSecretKey...
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
