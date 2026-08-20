import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  Shield,
  Search,
  ArrowRightLeft,
  Snowflake,
  Eye,
  Ban,
  ChevronRight,
  Wallet,
  Building2,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  X,
  CreditCard,
  MapPin,
  Briefcase,
  Globe,
  Smartphone,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Send,
  Download
} from 'lucide-react';
import { muleAccountsData, formatCurrency } from '../data/mockData';

export default function MuleAccountAnalysis({ addToast }) {
  const [muleAccounts, setMuleAccounts] = useState(muleAccountsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMule, setSelectedMule] = useState(null);
  const [hoveredFlowNode, setHoveredFlowNode] = useState(null);
  const [showLtkmModal, setShowLtkmModal] = useState(false);
  const [ltkmDrafting, setLtkmDrafting] = useState(false);

  const filteredAccounts = useMemo(() => {
    return muleAccounts.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.alias && m.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.account.includes(searchTerm) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.nik && m.nik.includes(searchTerm))
    );
  }, [muleAccounts, searchTerm]);

  const stats = useMemo(() => ({
    totalMules: muleAccounts.length,
    totalFunds: muleAccounts.reduce((s, m) => s + m.totalInflow, 0),
    frozen: muleAccounts.filter(m => m.status === 'frozen').length,
    activeDangerous: muleAccounts.filter(m => m.status === 'active').length
  }), [muleAccounts]);

  const handleFreeze = (id) => {
    setMuleAccounts(prev => prev.map(m => {
      if (m.id === id) {
        const isFrozen = m.status === 'frozen';
        addToast?.(isFrozen
          ? `🔓 Rekening ${m.name} (${m.account}) dicairkan kembali.`
          : `🧊 Rekening Mule ${m.name} (${m.account}) DIBEKUKAN oleh OJK/PPATK!`, isFrozen ? 'warning' : 'error');
        return { ...m, status: isFrozen ? 'monitored' : 'frozen' };
      }
      return m;
    }));
  };

  const handleSendLtkm = () => {
    setLtkmDrafting(true);
    setTimeout(() => {
      setLtkmDrafting(false);
      setShowLtkmModal(false);
      addToast?.(`📄 Laporan LTKM PPATK resmi diterbitkan untuk NIK ${selectedMule?.nik || selectedMule?.id}!`, 'success');
    }, 1500);
  };

  // Flow diagram data
  const flowLayers = [
    { label: 'Sumber Dana (Korban)', color: '#3b82f6', icon: '🏦', items: ['PT Mitra Sejahtera', 'Perusahaan Maju Mandiri', 'Suryadi Kusumah'] },
    { label: 'Mule Layer 1 (Penampung Utama)', color: '#ef4444', icon: '🔴', items: ['Bambang Haryanto (BCA)', 'Siti Rahmawati (CIMB)'] },
    { label: 'Mule Layer 2 (Layering & Relay)', color: '#f59e0b', icon: '🟡', items: ['Dewi Kartika (Mandiri)', 'Rahmat Hidayat (BRI)'] },
    { label: 'Crypto Off-Ramp Wallet', color: '#a855f7', icon: '💜', items: ['0x1a2b… (Indodax)', '0x9abc… (TokoCrypto)', '0x3456… (Pintu)'] },
    { label: 'Exchange Destinasi', color: '#f97316', icon: '🔶', items: ['Binance (Global)', 'Indodax (Lokal)'] }
  ];

  const roleColor = (role) => {
    if (role === 'Penampung Utama') return { bg: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: 'var(--status-danger-border)' };
    if (role === 'Relay') return { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: 'var(--status-warning-border)' };
    return { bg: 'var(--status-info-bg)', color: 'var(--status-info)', border: 'var(--status-info-border)' };
  };

  const statusConfig = {
    active: { label: 'AKTIF', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)', icon: '🔴' },
    frozen: { label: 'DIBEKUKAN', color: 'var(--status-info)', bg: 'var(--status-info-bg)', icon: '🧊' },
    monitored: { label: 'DIPANTAU', color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', icon: '🟡' }
  };

  return (
    <div className="mule-analysis-view">
      {/* Stats Cards */}
      <div className="mule-stats-grid">
        <motion.div className="card" style={{ padding: 18 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--status-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-danger)' }}>
              <Users size={22} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Mule Terdeteksi</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-danger)' }}>{stats.totalMules}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: 18 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--status-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-warning)' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Dana Mengalir</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-warning)' }}>{formatCurrency(stats.totalFunds)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: 18 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-info)' }}>
              <Snowflake size={22} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rekening Dibekukan</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-info)' }}>{stats.frozen}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: 18 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Masih Aktif (Bahaya)</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{stats.activeDangerous}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mule Flow Diagram */}
      <motion.div className="card" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="card-header">
          <h3 className="card-title"><ArrowRightLeft size={18} /> Diagram Topologi Aliran Dana Mule Account</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Alur pengalihan uang dari Korban Bank → Mule Layering → Crypto Wallet → Off-Ramp Exchange</span>
        </div>
        <div className="card-body">
          <div className="mule-flow-container">
            {flowLayers.map((layer, layerIdx) => (
              <div key={layerIdx} className="mule-flow-layer">
                <div className="mule-flow-layer-label" style={{ color: layer.color }}>
                  <span>{layer.icon}</span>
                  <span>{layer.label}</span>
                </div>
                <div className="mule-flow-nodes">
                  {layer.items.map((item, itemIdx) => (
                    <motion.div
                      key={itemIdx}
                      className={`mule-flow-node ${hoveredFlowNode === `${layerIdx}-${itemIdx}` ? 'active' : ''}`}
                      style={{ borderColor: layer.color, '--node-color': layer.color }}
                      onMouseEnter={() => setHoveredFlowNode(`${layerIdx}-${itemIdx}`)}
                      onMouseLeave={() => setHoveredFlowNode(null)}
                      whileHover={{ scale: 1.08, y: -2 }}
                    >
                      <span className="mule-flow-node-dot" style={{ background: layer.color }} />
                      <span className="mule-flow-node-label">{item}</span>
                    </motion.div>
                  ))}
                </div>
                {layerIdx < flowLayers.length - 1 && (
                  <div className="mule-flow-arrow">
                    <svg width="40" height="24" viewBox="0 0 40 24">
                      <defs>
                        <linearGradient id={`arrow-grad-${layerIdx}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={layer.color} stopOpacity="0.6" />
                          <stop offset="100%" stopColor={flowLayers[layerIdx + 1].color} stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <path d="M2 12 L30 12" stroke={`url(#arrow-grad-${layerIdx})`} strokeWidth="2" fill="none" strokeDasharray="4 3">
                        <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.5s" repeatCount="indefinite" />
                      </path>
                      <path d="M28 6 L36 12 L28 18" stroke={flowLayers[layerIdx + 1].color} strokeWidth="2" fill="none" strokeOpacity="0.6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table + Detail Split */}
      <div className="content-grid-wide" style={{ width: '100%', minWidth: 0 }}>
        
        {/* Mule accounts table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ minWidth: 0, width: '100%', overflowX: 'hidden' }}
        >
          <div className="card" style={{ marginBottom: 16, padding: 14, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
            <div className="mule-table-header">
              <div className="header-search" style={{ margin: 0, width: '100%' }}>
                <Search />
                <input
                  type="text"
                  placeholder="Cari nama nasabah, NIK, No. Rekening, atau ID Mule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-blocked">{muleAccounts.filter(m => m.status === 'active').length} Aktif</span>
                <span className="badge badge-pending">{muleAccounts.filter(m => m.status === 'frozen').length} Dibekukan</span>
                <span className="badge badge-flagged">{muleAccounts.filter(m => m.status === 'monitored').length} Dipantau</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
            <div className="card-body" style={{ padding: 0, width: '100%', minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}>
              <div className="table-container" style={{ maxHeight: 440, overflowY: 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y', width: '100%', display: 'block' }}>
                <table className="data-table" style={{ minWidth: 700, width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Identitas Nasabah (KYC)</th>
                      <th>Rekening & Cabang</th>
                      <th>Peran Jaringan</th>
                      <th>Skor Risiko</th>
                      <th>Inflow / Outflow</th>
                      <th>Status LTKM PPATK</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((mule) => {
                      const rc = roleColor(mule.role);
                      const sc = statusConfig[mule.status];
                      const isSelected = selectedMule?.id === mule.id;

                      return (
                        <tr
                          key={mule.id}
                          style={{
                            cursor: 'pointer',
                            opacity: mule.status === 'frozen' ? 0.75 : 1,
                            background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
                          }}
                          onClick={() => setSelectedMule(mule)}
                        >
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{mule.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mule.alias || 'Perorangan'}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NIK: {mule.nik}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{mule.bank} • {mule.account}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mule.branch}</div>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: rc.bg,
                              color: rc.color,
                              border: `1px solid ${rc.border}`
                            }}>{mule.role}</span>
                          </td>
                          <td>
                            <div className="risk-meter">
                              <div className="risk-bar" style={{ width: 55 }}>
                                <div
                                  className={`risk-bar-fill ${mule.riskScore >= 80 ? 'high' : mule.riskScore >= 40 ? 'medium' : 'low'}`}
                                  style={{ width: `${mule.riskScore}%` }}
                                />
                              </div>
                              <span className="risk-value" style={{
                                color: mule.riskScore >= 80 ? 'var(--status-danger)' : 'var(--status-warning)',
                                fontWeight: 800
                              }}>{mule.riskScore}%</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                              <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>
                                <ArrowDownRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatCurrency(mule.totalInflow)}
                              </span>
                              <span style={{ color: 'var(--status-danger)', fontWeight: 700 }}>
                                <ArrowUpRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatCurrency(mule.totalOutflow)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: mule.strStatus?.includes('Diterbitkan') ? 'var(--status-success)' : 'var(--text-muted)' }}>
                              {mule.strStatus || 'Review FDS'}
                            </div>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${mule.status === 'frozen' ? 'btn-ghost' : 'btn-danger'}`}
                              style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700 }}
                              onClick={(e) => { e.stopPropagation(); handleFreeze(mule.id); }}
                            >
                              {mule.status === 'frozen' ? <Eye size={13} /> : <Snowflake size={13} />}
                              {mule.status === 'frozen' ? ' Cairkan' : ' Bekukan'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real Field AML Profile Inspector Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {selectedMule ? (
            <div className="card" style={{ padding: 20, borderColor: 'var(--border-accent)', background: 'var(--bg-glass)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              
              {/* Header Profile */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={18} style={{ color: 'var(--status-danger)' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Profil Forensik Nasabah Mule</h3>
                </div>
                <button className="modal-close" onClick={() => setSelectedMule(null)}><X size={16} /></button>
              </div>

              {/* Avatar + Basic Data */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: 12, background: 'rgba(99, 102, 241, 0.08)', borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'var(--gradient-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1.2rem',
                    boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)'
                  }}>
                    {selectedMule.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{selectedMule.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{selectedMule.alias || 'Nasabah Perorangan'}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ID: {selectedMule.id} • {selectedMule.bank} ({selectedMule.account})
                    </span>
                  </div>
                </div>

                {/* Score & Financial Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Skor Risiko FDS</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{selectedMule.riskScore}%</p>
                  </div>
                  <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Peran Jaringan</span>
                    <p style={{ fontSize: '0.92rem', fontWeight: 800, color: roleColor(selectedMule.role).color, marginTop: 4 }}>{selectedMule.role}</p>
                  </div>
                  <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Inflow</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--status-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedMule.totalInflow)}</p>
                  </div>
                  <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Outflow</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedMule.totalOutflow)}</p>
                  </div>
                </div>

                {/* Identitas KYC (Legal & Official Banking Info) */}
                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8, marginBottom: 14, border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CreditCard size={14} /> IDENTITAS LEGAL NASABAH (KYC)
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>NIK (E-KTP):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedMule.nik || '3174052108870003'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>NPWP:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedMule.npwp || '09.234.567.8-015.000'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pekerjaan/Skenario:</span>
                      <strong>{selectedMule.job || 'Wiraswasta / Nominee'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cabang Pembuka:</span>
                      <strong>{selectedMule.branch || 'KC Jakarta Sudirman'}</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, pt: 4, borderTop: '1px stroke var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Alamat KTP Domisili:</span>
                      <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedMule.address || 'Jl. Jend. Sudirman No. 45, Jakarta Selatan'}</strong>
                    </div>
                  </div>
                </div>

                {/* Indikator Forensik TPPU & Cyber Risk */}
                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8, marginBottom: 14, border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Globe size={14} /> INDIKATOR FORENSIK ALIRAN DANA
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Waktu Endap (Holding):</span>
                      <strong style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{selectedMule.holdingTime || '3.5 menit'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>IP & Geolokasi:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedMule.ipAddress || '182.253.12.89 (VPN)'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Device Fingerprint:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedMule.deviceId || 'DEV-88392-ANDROID14'}</strong>
                    </div>
                  </div>
                </div>

                {/* Linked Crypto Wallets */}
                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Wallet size={14} /> TERHUBUNG CRYPTO WALLET / EXCHANGE
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedMule.linkedCryptoWallets?.map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wallet size={13} style={{ color: 'var(--accent-purple)' }} />
                        <code style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{w}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <button
                  className="btn btn-primary"
                  style={{ background: selectedMule.status === 'frozen' ? 'var(--bg-input)' : 'var(--gradient-danger)', justifyContent: 'center', fontWeight: 700 }}
                  onClick={() => handleFreeze(selectedMule.id)}
                >
                  🧊 {selectedMule.status === 'frozen' ? 'Cairkan Pembekuan Rekening' : 'Bekukan Rekening Mule (Sesuai Aturan OJK)'}
                </button>
                
                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', fontWeight: 700, gap: 6 }}
                  onClick={() => setShowLtkmModal(true)}
                >
                  <FileText size={15} /> Buat Draf Laporan LTKM Ke PPATK
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 36, borderStyle: 'dashed', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={40} style={{ marginInline: 'auto', marginBottom: 12, color: 'var(--text-muted)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Inspeksi Profil Rekening Mule</h4>
              <p style={{ fontSize: '0.78rem', marginTop: 6, lineHeight: 1.5 }}>
                Pilih salah satu nama nasabah dari tabel di samping untuk memeriksa identitas KYC resmi (NIK, NPWP, Alamat KTP), bukti indikator forensik TPPU, dan tindakan hukum pembekuan OJK/PPATK.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* LTKM PPATK Official Report Drafting Modal */}
      <AnimatePresence>
        {showLtkmModal && selectedMule && (
          <div className="modal-backdrop" onClick={() => setShowLtkmModal(false)} style={{ zIndex: 9999 }}>
            <motion.div
              className="modal"
              style={{ maxWidth: 540, padding: 24 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Draf LTKM Resmi (PPATK System)</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Laporan Transaksi Keuangan Mencurigakan — UU TPPU No. 8/2010</p>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setShowLtkmModal(false)}><X size={16} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem', marginBottom: 20 }}>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Terlaporkan / Subjek:</span>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>{selectedMule.name} ({selectedMule.alias})</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NIK: {selectedMule.nik || '3174052108870003'} • NPWP: {selectedMule.npwp || '09.234.567.8-015.000'}</p>
                </div>

                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Rekening & Bank:</span>
                  <p style={{ fontWeight: 700 }}>{selectedMule.bank} — {selectedMule.account} ({selectedMule.branch})</p>
                </div>

                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Kategori Transaksi Mencurigakan:</span>
                  <p style={{ fontWeight: 700, color: '#ef4444' }}>Dugaan Rekening Mule & Smurfing Off-Ramp Crypto ({formatCurrency(selectedMule.totalInflow)})</p>
                </div>

                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Indikator Bukti Forensik:</span>
                  <ul style={{ paddingLeft: 16, marginTop: 4, color: 'var(--text-secondary)' }}>
                    <li>Waktu terendap dana ultra-singkat ({selectedMule.holdingTime})</li>
                    <li>IP Address mencurigakan / Proxy ({selectedMule.ipAddress})</li>
                    <li>Terhubung langsung ke Crypto Wallets ({selectedMule.linkedCryptoWallets?.join(', ')})</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowLtkmModal(false)}>Batal</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendLtkm}
                  disabled={ltkmDrafting}
                  style={{ gap: 6, fontWeight: 700 }}
                >
                  {ltkmDrafting ? <Send size={15} className="animate-spin" /> : <Send size={15} />}
                  {ltkmDrafting ? 'Mengirim Draf LTKM...' : 'Kirim LTKM Ke Portal PPATK'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
