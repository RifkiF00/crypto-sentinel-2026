import { useState, useEffect } from 'react';
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
  Play,
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
  DollarSign
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
import { formatCurrency, formatNumber, cryptoExchangeData, topBlockedPatterns } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';
import MuleAccountAnalysis from './MuleAccountAnalysis';
import GNNVisualization from './GNNVisualization';

// Dynamic API Integration
import { checkHealth, analyzeTransaction, mapApiLogToTx, fetchCryptoExchanges, fetchBlockedPatterns } from '../services/api';

// ==========================================
// 1. LIVE MONITORING VIEW
// ==========================================
export function MonitoringView({ transactions, setTransactions, addToast, rules }) {
  const [isLive, setIsLive] = useState(true);
  const [autoBlock, setAutoBlock] = useState(rules.autoBlockEnabled);
  const [simAmount, setSimAmount] = useState('85000000');
  const [simSender, setSimSender] = useState('Hendra Wijaya');
  const [simExchange, setSimExchange] = useState('Binance');
  const [logs, setLogs] = useState([
    { time: '10:08:42', text: 'Real-time WebSocket connection established with Bank API Gateways.' },
    { time: '10:08:45', text: 'Active scanning enabled. Compliance database connected.' }
  ]);

  // Simulate real-time ticking logs
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const msgs = [
        'Memindai transaksi m-banking Bank Mandiri...',
        'Memindai transaksi ATM BCA...',
        'Pemeriksaan kepatuhan OJK aman untuk TXN-2026-10492.',
        'Sistem memverifikasi dompet crypto tujuan Indodax...',
        'Memindai transaksi m-banking Bank BRI...'
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [{ time: now, text: randomMsg }, ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!simSender.trim()) return;

    const amountNum = parseFloat(simAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast('Masukkan nominal transaksi yang valid!', 'error');
      return;
    }

    try {
      const isOnline = await checkHealth();
      if (isOnline) {
        addToast('⚡ Menganalisis transaksi via Crypto-Sentinel API...', 'success');
        const apiResult = await analyzeTransaction(simSender, amountNum, simExchange);
        const newTx = mapApiLogToTx(apiResult);
        
        setTransactions(prev => [newTx, ...prev]);

        const now = new Date().toLocaleTimeString();
        setLogs(prev => [
          { time: now, text: `[API SERVER] ${newTx.status.toUpperCase()}: Transaksi dari ${simSender} sebesar ${formatCurrency(amountNum)} ke ${simExchange} (${newTx.id})` },
          { time: now, text: `[API SERVER] Keputusan: ${apiResult.decision} | Risiko: ${apiResult.risk_score}% | Alasan: ${apiResult.reasons.join(', ')}` },
          ...prev
        ]);

        if (newTx.status === 'blocked') {
          addToast(`🛡️ API: Transaksi ${newTx.id} DIBLOKIR! Risiko: ${newTx.riskScore}%`, 'error');
        } else if (newTx.status === 'flagged') {
          addToast(`⚠️ API: Transaksi ${newTx.id} DITANDAI! Risiko: ${newTx.riskScore}%`, 'warning');
        } else {
          addToast(`✅ API: Transaksi ${newTx.id} DISETUJUI. Risiko: ${newTx.riskScore}%`, 'success');
        }
      } else {
        // Fallback to offline mock logic
        const txId = `TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const risk = amountNum >= 500000000 ? Math.floor(82 + Math.random() * 15) : Math.floor(40 + Math.random() * 40);
        const shouldBlock = autoBlock && risk >= rules.riskThreshold;

        const newTx = {
          id: txId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          senderName: simSender,
          senderAccount: `****${Math.floor(1000 + Math.random() * 9000)}`,
          senderBank: ['BCA', 'Mandiri', 'BNI', 'BRI'][Math.floor(Math.random() * 4)],
          amount: amountNum,
          destinationType: 'Crypto Exchange',
          destination: simExchange,
          walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          riskScore: risk,
          status: shouldBlock ? 'blocked' : risk >= 40 ? 'flagged' : 'approved',
          reason: shouldBlock ? 'Skor risiko melebihi ambang batas otomatis' : risk >= 40 ? 'Potensi transfer besar ke crypto' : null,
          flaggedRules: shouldBlock ? ['Automated Block Threshold', 'High Risk Destination'] : risk >= 40 ? ['Medium Risk Destination'] : []
        };

        setTransactions(prev => [newTx, ...prev]);

        const now = new Date().toLocaleTimeString();
        setLogs(prev => [
          { time: now, text: `[OFFLINE] ${newTx.status.toUpperCase()}: Transaksi dari ${simSender} sebesar ${formatCurrency(amountNum)} ke ${simExchange} (${newTx.id})` },
          ...prev
        ]);

        if (shouldBlock) {
          addToast(`🛡️ Transaksi ${txId} diblokir otomatis! Risiko: ${risk}%`, 'error');
        } else if (newTx.status === 'flagged') {
          addToast(`⚠️ Transaksi ${txId} ditandai mencurigakan! Risiko: ${risk}%`, 'warning');
        } else {
          addToast(`✅ Transaksi ${txId} disetujui. Risiko: ${risk}%`, 'success');
        }
      }
    } catch (error) {
      console.error("API error, falling back:", error);
      addToast('⚠️ Terjadi error koneksi API, beralih ke mode offline.', 'warning');
      
      const txId = `TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const risk = amountNum >= 500000000 ? Math.floor(82 + Math.random() * 15) : Math.floor(40 + Math.random() * 40);
      const shouldBlock = autoBlock && risk >= rules.riskThreshold;

      const newTx = {
        id: txId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        senderName: simSender,
        senderAccount: `****${Math.floor(1000 + Math.random() * 9000)}`,
        senderBank: ['BCA', 'Mandiri', 'BNI', 'BRI'][Math.floor(Math.random() * 4)],
        amount: amountNum,
        destinationType: 'Crypto Exchange',
        destination: simExchange,
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        riskScore: risk,
        status: shouldBlock ? 'blocked' : risk >= 40 ? 'flagged' : 'approved',
        reason: shouldBlock ? 'Skor risiko melebihi ambang batas otomatis' : risk >= 40 ? 'Potensi transfer besar ke crypto' : null,
        flaggedRules: shouldBlock ? ['Automated Block Threshold', 'High Risk Destination'] : risk >= 40 ? ['Medium Risk Destination'] : []
      };

      setTransactions(prev => [newTx, ...prev]);

      const now = new Date().toLocaleTimeString();
      setLogs(prev => [
        { time: now, text: `[OFFLINE FALLBACK] ${newTx.status.toUpperCase()}: Transaksi dari ${simSender} sebesar ${formatCurrency(amountNum)} ke ${simExchange} (${newTx.id})` },
        ...prev
      ]);
    }

    // Reset Form
    setSimSender('');
    setSimAmount('25000000');
  };

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
            <div className="card-header">
              <h3 className="card-title"><Activity /> Aliran Transaksi Terakhir</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-approved">{transactions.filter(t => t.status === 'approved').length} Disetujui</span>
                <span className="badge badge-flagged">{transactions.filter(t => t.status === 'flagged').length} Ditandai</span>
                <span className="badge badge-blocked">{transactions.filter(t => t.status === 'blocked').length} Dicegah</span>
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
                      <th>Tujuan Kripto</th>
                      <th>Nominal</th>
                      <th>Skor Risiko</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((txn) => (
                      <tr key={txn.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{txn.id}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{txn.timestamp.split(' ')[1]}</div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{txn.senderName}</td>
                        <td>{txn.senderBank} ({txn.senderAccount})</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{txn.destination}</div>
                          <div className="wallet-address">{txn.walletAddress || 'N/A'}</div>
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
          {/* Ticker Simulator Form */}
          <div className="card" style={{ marginBottom: 24, border: '1px solid var(--border-accent)', background: 'var(--gradient-card)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--accent-primary)' }}><Play size={18} /> AML Sandbox Simulator</h3>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Simulasikan alur pengiriman dana dari nasabah bank ke Crypto Exchange luar negeri untuk menguji sensitivitas pendeteksian.
              </p>
              <form onSubmit={handleSimulate}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nama Pengirim (Nasabah Bank)</label>
                  <input 
                    type="text"
                    className="header-search" 
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                    value={simSender}
                    onChange={(e) => setSimSender(e.target.value)}
                    placeholder="Contoh: Hendra Wijaya"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Jumlah (IDR)</label>
                    <input 
                      type="number" 
                      className="header-search"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      placeholder="Minimal 10000"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Tujuan Exchange</label>
                    <select 
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      value={simExchange}
                      onChange={(e) => setSimExchange(e.target.value)}
                    >
                      <option value="Binance">Binance (Intl - High Risk)</option>
                      <option value="Indodax">Indodax (Lokal)</option>
                      <option value="Tokocrypto">Tokocrypto (Lokal)</option>
                      <option value="Luno">Luno (Intl - High Risk)</option>
                      <option value="Pintu">Pintu (Lokal)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Aktifkan Blokir Otomatis OJK</span>
                  <input 
                    type="checkbox" 
                    checked={autoBlock} 
                    onChange={() => setAutoBlock(!autoBlock)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Play size={16} /> Simulasikan Transaksi M-Banking
                </button>
              </form>
            </div>
          </div>

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
                {logs.map((log, i) => (
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

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.type === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleResolveAlert = (id, action) => {
    // Actions: 'block', 'dismiss', 'investigate'
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
            { id: Math.random().toString(), account: accountToBlock, holder: alertItem.description.split(' melakukan')[0] || 'Unknown Sender', bank: 'BCA', dateAdded: new Date().toISOString().substring(0, 10), reason: `AML Alert: ${alertItem.title}` },
            ...prev.banks
          ]
        }));

        addToast(`🛡️ Alert resolved. Wallet ${walletToBlock.substring(0, 8)}... & bank account blocked!`, 'error');
      }
    } else if (action === 'dismiss') {
      addToast('✅ Alert ditandai sebagai AMAN dan diselesaikan.', 'success');
    } else if (action === 'investigate') {
      addToast('📂 Alert dalam status investigasi mendalam OJK.', 'warning');
    }

    setAlerts(prev => prev.filter(a => a.id !== id));
    setSelectedAlert(null);
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
                  className={`alert-item ${alert.type}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  onClick={() => setSelectedAlert(alert)}
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
                </div>
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
            // Simulate direct local download trigger
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('download', `AML-OJK-Audit-Report-${analysisRange}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const analysisTabs = [
    { id: 'patterns', label: '📊 Analisis Pola AML', icon: <BarChart3 size={16} /> },
    { id: 'mule', label: '🏦 Deteksi Rekening Mule', icon: <Users size={16} /> },
    { id: 'gnn', label: '🧠 GNN Network Analysis', icon: <Activity size={16} /> },
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
                  <div className="chart-container" style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patterns} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                        <XAxis type="number" stroke={chartTheme.axis} fontSize={11} />
                        <YAxis dataKey="pattern" type="category" stroke={chartTheme.axis} width={130} fontSize={10} />
                        <Tooltip contentStyle={chartTheme.tooltip} />
                        <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]}>
                          {patterns.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--status-danger)' : index === 1 ? 'var(--status-warning)' : 'var(--accent-primary)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
  const [clients, setClients] = useState([
    { name: 'Ahmad Faisal', account: '****4521', bank: 'BCA', score: 92, status: 'Suspended', txs: 18 },
    { name: 'Budi Santoso', account: '****8734', bank: 'Mandiri', score: 76, status: 'Monitored', txs: 12 },
    { name: 'Rizky Hidayat', account: '****6543', bank: 'BRI', score: 88, status: 'Suspended', txs: 15 },
    { name: 'Siti Nurhaliza', account: '****1122', bank: 'BCA', score: 65, status: 'Monitored', txs: 9 },
    { name: 'Maria Kusuma', account: '****5566', bank: 'CIMB', score: 84, status: 'Suspended', txs: 14 }
  ]);

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

  const triggerAuditReport = () => {
    setLoading(true);
    addToast('📄 Mengompilasi ringkasan audit pencucian uang nasional...', 'success');
    setTimeout(() => {
      setLoading(false);
      addToast('✅ Laporan Kepatuhan Bulanan siap diunduh!', 'success');
    }, 2000);
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

        {/* Generate SAR Wizard */}
        <div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}><FileText /> Pembuat Laporan Resmi AML</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Ekspor laporan Suspicious Activity Report (SAR) resmi dalam dokumen terenkripsi untuk diserahkan ke Kepala Divisi AML / BI.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Pilih Kategori Laporan</label>
              <select 
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="SAR">Suspicious Activity Report (Laporan Transaksi Mencurigakan)</option>
                <option value="CTR">Cash Transaction Report (Laporan Nilai Diatas 500jt)</option>
                <option value="EXCHANGE">Bursa Kepatuhan (Exchange Audit)</option>
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={triggerAuditReport}
              disabled={loading}
            >
              {loading ? 'Mengompilasi Data...' : '⚙️ Generate & Unduh Dokumen SAR'}
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
