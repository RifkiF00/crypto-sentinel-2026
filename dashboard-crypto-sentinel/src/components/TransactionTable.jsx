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
  if (!transaction) return null;
  const status = statusConfig[transaction.status];

  return (
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
          {transaction.flaggedRules.length > 0 && (
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
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button>
            {transaction.status === 'pending' && (
              <>
                <button className="btn btn-danger btn-sm">
                  <ShieldBan size={14} />
                  Blokir
                </button>
                <button className="btn btn-primary btn-sm">Setujui</button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
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
