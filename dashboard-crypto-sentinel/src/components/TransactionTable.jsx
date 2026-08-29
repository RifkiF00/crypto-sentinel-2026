import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Eye, ShieldBan, X, Clock, User, Wallet, AlertTriangle, Building2, Lock } from 'lucide-react';
import { recentTransactions, formatCurrency } from '../data/mockData';
import ShapExplanation from './ShapExplanation';

const statusConfig = {
  blocked: { label: 'Diblokir', class: 'badge-blocked' },
  flagged: { label: 'Ditandai', class: 'badge-flagged' },
  approved: { label: 'Disetujui', class: 'badge-approved' },
  pending: { label: 'Pending', class: 'badge-pending' },
};

export function maskName(name, isMasked = false) {
  if (!isMasked || !name) return name;
  const parts = name.split(' ');
  return parts.map(p => p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p[0] + '*').join(' ');
}

export function maskAccount(acc, isMasked = false) {
  if (!isMasked || !acc) return acc;
  if (acc.length <= 4) return '***' + acc;
  return acc.slice(0, 3) + '****' + acc.slice(-3);
}

function TransactionDetail({ transaction, onClose, isMasked = false }) {
  const [showStrModal, setShowStrModal] = useState(false);
  if (!transaction) return null;
  const status = statusConfig[transaction.status] || { label: transaction.status, class: 'badge-approved' };

  return (
    <>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal"
          style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title">Detail Transaksi {transaction.id}</div>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span className={`badge ${status.class}`}>
                <span className="badge-dot" />
                {status.label}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {transaction.timestamp}
              </span>
            </div>

            {/* Risk Score */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 14,
                padding: 20,
                marginBottom: 16,
                textAlign: 'center',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Skor Risiko (FDS AI)</div>
              <div
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  color:
                    transaction.riskScore >= 80
                      ? 'var(--status-danger)'
                      : transaction.riskScore >= 40
                      ? 'var(--status-warning)'
                      : 'var(--status-success)',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {transaction.riskScore}%
              </div>
              <div className="risk-meter" style={{ maxWidth: 200, margin: '0 auto' }}>
                <div className="risk-bar" style={{ height: 8 }}>
                  <div
                    className={`risk-bar-fill ${
                      transaction.riskScore >= 80 ? 'high' : transaction.riskScore >= 40 ? 'medium' : 'low'
                    }`}
                    style={{ width: `${transaction.riskScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <DetailItem
                icon={User}
                label="Pengirim"
                value={maskName(transaction.senderName, isMasked)}
                sub={`${transaction.senderBank} • ${maskAccount(transaction.senderAccount, isMasked)}`}
              />
              <DetailItem
                icon={Building2}
                label="Tujuan"
                value={maskName(transaction.destination, isMasked)}
                sub={transaction.destinationType}
              />
              <DetailItem icon={Wallet} label="Jumlah" value={formatCurrency(transaction.amount)} />
              <DetailItem icon={Clock} label="Waktu" value={transaction.timestamp} />
            </div>

            {/* Wallet Address */}
            {transaction.walletAddress && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Wallet Address Kripto</div>
                <div className="wallet-address" style={{ maxWidth: '100%' }}>
                  {transaction.walletAddress}
                </div>
              </div>
            )}

            {/* Reason */}
            {transaction.reason && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Alasan Deteksi FDS</div>
                <div
                  style={{
                    background: 'var(--status-danger-bg)',
                    border: '1px solid var(--status-danger-border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    color: 'var(--status-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={16} />
                  {transaction.reason}
                </div>
              </div>
            )}

            {/* Flagged Rules */}
            {transaction.flaggedRules && transaction.flaggedRules.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Aturan Yang Terpicu</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {transaction.flaggedRules.map((rule) => (
                    <span
                      key={rule}
                      style={{
                        background: 'var(--status-warning-bg)',
                        border: '1px solid var(--status-warning-border)',
                        color: 'var(--status-warning)',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visualisasi Explainable AI (SHAP TreeExplainer) */}
            <ShapExplanation transaction={transaction} riskScore={transaction.riskScore} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              {(transaction.status === 'blocked' || transaction.status === 'BLOCK' || transaction.status === 'flagged' || transaction.status === 'REVIEW') && (
                <button
                  className="btn btn-sm"
                  onClick={() => setShowStrModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#991b1b',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <AlertTriangle size={14} />
                  Draf LTKM PPATK (AI)
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* STR PPATK AI REPORT MODAL */}
      <AnimatePresence>
        {showStrModal && (
          <motion.div
            className="modal-overlay"
            style={{ zIndex: 10000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStrModal(false)}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 650, background: '#090d16', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(239, 68, 68, 0.08)' }}>
                <div className="modal-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                  <ShieldBan size={20} />
                  DRAF LAPORAN LTKM / STR PPATK (AUTOMATED AI)
                </div>
                <button className="modal-close" onClick={() => setShowStrModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: 24, fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
                    <div><span style={{ color: '#64748b' }}>No. Referensi:</span> <strong style={{ color: 'white', fontFamily: 'monospace' }}>LTKM-PPATK-{transaction.id}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Format Regulasi:</span> <strong style={{ color: 'white' }}>UU No. 8/2010 (goAML)</strong></div>
                    <div><span style={{ color: '#64748b' }}>Pelapor:</span> <strong style={{ color: 'white' }}>{transaction.senderBank || 'Bank bjb / Bank Kuningan'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Keputusan FDS:</span> <strong style={{ color: '#ef4444' }}>BLOCKED / CIRCUIT BREAKER</strong></div>
                  </div>
                </div>

                <h4 style={{ color: 'white', marginBottom: 8, fontSize: '0.95rem' }}>1. Subjek Terlapor (Pengirim)</h4>
                <div style={{ marginBottom: 16, lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8 }}>
                  Nama: <strong>{maskName(transaction.senderName, isMasked)}</strong><br />
                  Rekening: <code>{maskAccount(transaction.senderAccount, isMasked)}</code> ({transaction.senderBank})<br />
                  NIK Terenkripsi: <code>3208************</code> (Sesuai UU PDP No. 27/2022)
                </div>

                <h4 style={{ color: 'white', marginBottom: 8, fontSize: '0.95rem' }}>2. Narasi Kronologi Transaksi Mencurigakan</h4>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 10, lineHeight: 1.6, color: '#f8fafc', marginBottom: 20 }}>
                  <p>
                    Sistem <strong>Crypto-Sentinel Hybrid AI Engine</strong> mendeteksi transaksi transfer senilai <strong>{formatCurrency(transaction.amount)}</strong> menuju rekening perantara/bursa kripto.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    <strong>Hasil Penilaian Risiko:</strong> Skor risiko <strong>{transaction.riskScore}%</strong>. Alasan: <em>{transaction.reason || 'Pola Structuring dan Aliran Dana Tidak Wajar'}</em>. Mekanisme <em>Pre-Commit Circuit Breaker (18ms)</em> telah berhasil mencegah mutasi saldo.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <a
                    href={`http://localhost:8000/api/v1/sentinel/str/download/${transaction.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Buka / Cetak Dokumen Resmi PPATK
                  </a>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      alert('✓ Draf LTKM PPATK siap dikirim ke portal goAML PPATK!');
                      setShowStrModal(false);
                    }}
                  >
                    Kirim ke goAML
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailItem({ icon: Icon, label, value, sub }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'var(--accent-primary-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function TransactionTable({ transactions: propTransactions, isMasked = false }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState('all');

  const activeTransactions = propTransactions || recentTransactions;

  const filtered = filter === 'all'
    ? activeTransactions
    : activeTransactions.filter((t) => t.status === filter);

  return (
    <>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        id="transaction-table-card"
      >
        <div className="card-header">
          <div className="card-title">
            <List />
            Transaksi Live Stream (Core Banking & FDS)
          </div>
          <div className="card-actions">
            <div className="tabs" id="transaction-filters">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'blocked', label: 'Diblokir' },
                { key: 'flagged', label: 'Ditandai' },
                { key: 'approved', label: 'Disetujui' },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`tab ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table" id="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Waktu</th>
                  <th>Pengirim</th>
                  <th>Bank</th>
                  <th>Jumlah</th>
                  <th>Tujuan</th>
                  <th>Risiko</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, index) => {
                  const status = statusConfig[tx.status] || { label: tx.status, class: 'badge-approved' };
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.03 }}
                    >
                      <td>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                          {tx.id}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem' }}>
                        {tx.timestamp ? (tx.timestamp.includes(' ') ? tx.timestamp.split(' ')[1] : tx.timestamp.substring(11, 19)) : '-'}
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {maskName(tx.senderName, isMasked)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {maskAccount(tx.senderAccount, isMasked)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: tx.senderBank?.includes('bjb') ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                          color: tx.senderBank?.includes('bjb') ? '#3b82f6' : '#10b981',
                        }}>
                          {tx.senderBank || 'Bank bjb'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`amount ${
                            tx.amount >= 500000000
                              ? 'amount-large'
                              : tx.amount >= 100000000
                              ? 'amount-medium'
                              : 'amount-small'
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {maskName(tx.destination, isMasked)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.destinationType}</div>
                        </div>
                      </td>
                      <td>
                        <div className="risk-meter" style={{ minWidth: 90 }}>
                          <div className="risk-bar">
                            <div
                              className={`risk-bar-fill ${
                                tx.riskScore >= 80 ? 'high' : tx.riskScore >= 40 ? 'medium' : 'low'
                              }`}
                              style={{ width: `${tx.riskScore}%` }}
                            />
                          </div>
                          <span
                            className="risk-value"
                            style={{
                              color:
                                tx.riskScore >= 80
                                  ? 'var(--status-danger)'
                                  : tx.riskScore >= 40
                                  ? 'var(--status-warning)'
                                  : 'var(--status-success)',
                            }}
                          >
                            {tx.riskScore}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          <span className="badge-dot" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedTx(tx)}
                          id={`btn-view-${tx.id}`}
                          style={{ padding: '4px 8px' }}
                          title="Lihat Detail & SHAP Explainability"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedTx && (
          <TransactionDetail
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
            isMasked={isMasked}
          />
        )}
      </AnimatePresence>
    </>
  );
}
