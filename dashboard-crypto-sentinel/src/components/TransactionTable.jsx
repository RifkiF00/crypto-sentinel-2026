import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Eye, ShieldBan, X, Clock, User, Wallet, AlertTriangle, Building2 } from 'lucide-react';
import { recentTransactions, formatCurrency } from '../data/mockData';

const statusConfig = {
  blocked: { label: 'Diblokir', class: 'badge-blocked' },
  flagged: { label: 'Ditandai', class: 'badge-flagged' },
  approved: { label: 'Disetujui', class: 'badge-approved' },
  pending: { label: 'Pending', class: 'badge-pending' },
};

function TransactionDetail({ transaction, onClose }) {
  const [showStrModal, setShowStrModal] = useState(false);
  if (!transaction) return null;
  const status = statusConfig[transaction.status];

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
                padding: 24,
                marginBottom: 20,
                textAlign: 'center',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Skor Risiko</div>
              <div
                style={{
                  fontSize: '3rem',
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
                {transaction.riskScore}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <DetailItem icon={User} label="Pengirim" value={transaction.senderName} sub={`${transaction.senderBank} • ${transaction.senderAccount}`} />
              <DetailItem icon={Building2} label="Tujuan" value={transaction.destination} sub={transaction.destinationType} />
              <DetailItem icon={Wallet} label="Jumlah" value={formatCurrency(transaction.amount)} />
              <DetailItem icon={Clock} label="Waktu" value={transaction.timestamp} />
            </div>

            {/* Wallet Address */}
            {transaction.walletAddress && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Wallet Address</div>
                <div className="wallet-address" style={{ maxWidth: '100%' }}>
                  {transaction.walletAddress}
                </div>
              </div>
            )}

            {/* Reason */}
            {transaction.reason && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Alasan</div>
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
              <div>
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              {(transaction.status === 'blocked' || transaction.status === 'flagged') && (
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
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <AlertTriangle size={14} />
                  Preview Draf STR PPATK (AI)
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
                  DRAF LAPORAN STR PPATK (AUTOMATED AI)
                </div>
                <button className="modal-close" onClick={() => setShowStrModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: 24, fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
                    <div><span style={{ color: '#64748b' }}>No. Referensi STR:</span> <strong style={{ color: 'white', fontFamily: 'monospace' }}>STR-PPATK-2026-{transaction.id}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Tanggal Pembuatan:</span> <strong style={{ color: 'white' }}>Hari Ini (Real-Time)</strong></div>
                    <div><span style={{ color: '#64748b' }}>Pelapor:</span> <strong style={{ color: 'white' }}>Bank Kuningan (Compliance Div.)</strong></div>
                    <div><span style={{ color: '#64748b' }}>Status Sistem FDS:</span> <strong style={{ color: '#ef4444' }}>AUTO-BLOCKED (95% RISK)</strong></div>
                  </div>
                </div>

                <h4 style={{ color: 'white', marginBottom: 8, fontSize: '0.95rem' }}>1. Subjek Terlapor (Pengirim)</h4>
                <div style={{ marginBottom: 16, lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8 }}>
                  Nama: <strong>{transaction.senderName || 'Rifki Firmansyah'}</strong><br />
                  Rekening: <code>{transaction.senderAccount || '0123456789'}</code> ({transaction.senderBank || 'Bank Kuningan'})<br />
                  NIK: <code>3171092802092102</code> • Device: <code>DEV-ANDROID-S24-ULTRA</code>
                </div>

                <h4 style={{ color: 'white', marginBottom: 8, fontSize: '0.95rem' }}>2. Ringkasan Kasus (Dibuat Otomatis oleh AI)</h4>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 10, lineHeight: 1.6, color: '#f8fafc', marginBottom: 20 }}>
                  <p>
                    Mesin <strong>Crypto-Sentinel Explainable AI (XAI)</strong> mendeteksi skenario pencucian uang tingkat tinggi (<em>Smurfing / Structuring Pattern</em>). 
                    Terlapor melakukan pengiriman dana sebesar <strong>{formatCurrency(transaction.amount)}</strong> secara beruntun ke beberapa akun rekening penampung (mule) di bank lain.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    <strong>Analisis Graf GNN:</strong> Aliran dana bermuara ke dompet crypto on-chain <code>0xbf6665...</code> yang terhubung langsung ke bursa pertukaran <strong>Indodax / Binance</strong> untuk proses pencairan (cash-out). 
                    Sistem <em>Circuit Breaker</em> telah memicu pemblokiran otomatis pada transaksi ke-4 dan menghentikan mutasi saldo.
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
                    Unduh PDF Resmi STR
                  </a>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      alert('✓ Laporan STR PPATK berhasil dikirim ke gateway Sistem Informasi Terpadu (SIPENDAR) PPATK!');
                      setShowStrModal(false);
                    }}
                  >
                    Kirim Langsung ke PPATK
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

export default function TransactionTable({ transactions: propTransactions }) {
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
            Transaksi Terbaru
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
                  const status = statusConfig[tx.status];
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                    >
                      <td>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                          {tx.id}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem' }}>
                        {tx.timestamp.split(' ')[1]}
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.senderName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.senderAccount}</div>
                        </div>
                      </td>
                      <td>{tx.senderBank}</td>
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
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.destination}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.destinationType}</div>
                        </div>
                      </td>
                      <td>
                        <div className="risk-meter" style={{ minWidth: 100 }}>
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
                            {tx.riskScore}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}
