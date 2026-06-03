import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  X
} from 'lucide-react';
import { muleAccountsData, formatCurrency } from '../data/mockData';

export default function MuleAccountAnalysis({ addToast }) {
  const [muleAccounts, setMuleAccounts] = useState(muleAccountsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMule, setSelectedMule] = useState(null);
  const [hoveredFlowNode, setHoveredFlowNode] = useState(null);

  const filteredAccounts = useMemo(() => {
    return muleAccounts.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.account.includes(searchTerm) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
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
          : `🧊 Rekening Mule ${m.name} (${m.account}) DIBEKUKAN oleh OJK!`, isFrozen ? 'warning' : 'error');
        return { ...m, status: isFrozen ? 'monitored' : 'frozen' };
      }
      return m;
    }));
  };

  // Flow diagram data
  const flowLayers = [
    { label: 'Sumber Dana', color: '#3b82f6', icon: '🏦', items: ['Ahmad F.', 'Budi S.', 'Rizky H.'] },
    { label: 'Mule Layer 1', color: '#ef4444', icon: '🔴', items: ['Hendro G.', 'Rina K.'] },
    { label: 'Mule Layer 2', color: '#f59e0b', icon: '🟡', items: ['Darmawan P.', 'Surya P.'] },
    { label: 'Crypto Wallet', color: '#a855f7', icon: '💜', items: ['0x1a2b…', '0x9abc…', '0x3456…'] },
    { label: 'Exchange', color: '#f97316', icon: '🔶', items: ['Binance', 'Indodax'] }
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
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
          <h3 className="card-title"><ArrowRightLeft size={18} /> Diagram Alur Rekening Mule</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Visualisasi aliran dana dari sumber → mule → crypto</span>
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
      <div className="content-grid-wide">
        {/* Mule accounts table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="header-search" style={{ margin: 0 }}>
                <Search />
                <input
                  type="text"
                  placeholder="Cari nama, rekening, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 260 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-blocked">{muleAccounts.filter(m => m.status === 'active').length} Aktif</span>
                <span className="badge badge-pending">{muleAccounts.filter(m => m.status === 'frozen').length} Dibekukan</span>
                <span className="badge badge-flagged">{muleAccounts.filter(m => m.status === 'monitored').length} Dipantau</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID & Nama</th>
                      <th>Rekening & Bank</th>
                      <th>Peran Jaringan</th>
                      <th>Skor Risiko</th>
                      <th>Inflow / Outflow</th>
                      <th>Koneksi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((mule) => {
                      const rc = roleColor(mule.role);
                      const sc = statusConfig[mule.status];
                      return (
                        <tr
                          key={mule.id}
                          style={{ cursor: 'pointer', opacity: mule.status === 'frozen' ? 0.65 : 1 }}
                          onClick={() => setSelectedMule(mule)}
                        >
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{mule.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{mule.id}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{mule.bank}</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{mule.account}</div>
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
                                color: mule.riskScore >= 80 ? 'var(--status-danger)' : 'var(--status-warning)'
                              }}>{mule.riskScore}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                              <span style={{ color: 'var(--status-success)' }}>
                                <ArrowDownRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatCurrency(mule.totalInflow)}
                              </span>
                              <span style={{ color: 'var(--status-danger)' }}>
                                <ArrowUpRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatCurrency(mule.totalOutflow)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{mule.connectedAccounts}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>akun</span>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: sc.bg,
                              color: sc.color
                            }}>{sc.icon} {sc.label}</span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${mule.status === 'frozen' ? 'btn-ghost' : 'btn-danger'}`}
                              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
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

        {/* Detail Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {selectedMule ? (
            <div className="card" style={{ padding: 20, borderColor: 'var(--border-accent)', background: 'var(--bg-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Detail Rekening Mule</h3>
                <button className="modal-close" onClick={() => setSelectedMule(null)}><X size={16} /></button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: 'var(--gradient-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.1rem'
                  }}>
                    {selectedMule.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedMule.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedMule.bank} • {selectedMule.account}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Skor Risiko</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{selectedMule.riskScore}%</p>
                  </div>
                  <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Peran</span>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: roleColor(selectedMule.role).color }}>{selectedMule.role}</p>
                  </div>
                  <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Inflow</span>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedMule.totalInflow)}</p>
                  </div>
                  <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Outflow</span>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedMule.totalOutflow)}</p>
                  </div>
                </div>

                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Wallet Crypto Terhubung</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedMule.linkedCryptoWallets.map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wallet size={14} style={{ color: 'var(--accent-purple)' }} />
                        <code style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{w}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  <span>📅 Terdeteksi: <strong style={{ color: 'var(--text-primary)' }}>{selectedMule.detectedDate}</strong></span>
                  <span>•</span>
                  <span>{selectedMule.txCount} transaksi</span>
                  <span>•</span>
                  <span>{selectedMule.connectedAccounts} koneksi</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <button
                  className="btn btn-primary"
                  style={{ background: 'var(--gradient-danger)', justifyContent: 'center' }}
                  onClick={() => { handleFreeze(selectedMule.id); setSelectedMule(null); }}
                >
                  🧊 {selectedMule.status === 'frozen' ? 'Cairkan Rekening' : 'Bekukan Rekening Mule'}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    addToast?.(`📂 Investigasi mendalam dimulai untuk ${selectedMule.name}`, 'warning');
                    setSelectedMule(null);
                  }}
                >
                  📂 Kirim Tim Investigasi AML
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 30, borderStyle: 'dashed', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={36} style={{ marginInline: 'auto', marginBottom: 12, color: 'var(--text-muted)' }} />
              <h4>Inspeksi Rekening Mule</h4>
              <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Pilih salah satu rekening mule dari tabel untuk melihat detail lengkap dan mengambil tindakan pembekuan.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
