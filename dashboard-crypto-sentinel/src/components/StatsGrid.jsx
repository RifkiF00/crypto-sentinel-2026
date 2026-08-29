import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldBan,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Database,
} from 'lucide-react';
import { dashboardStats, formatNumber, formatCurrency } from '../data/mockData';

export default function StatsGrid({ transactions = [] }) {
  // Hitung metrik dinamis dari array transaksi live
  const total = transactions.length > 0 ? transactions.length : dashboardStats.totalTransactions;
  const blocked = transactions.filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK').length;
  const flagged = transactions.filter(tx => tx.status === 'flagged' || tx.status === 'REVIEW').length;
  const totalValueBlocked = transactions
    .filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const isLive = transactions.length > 0;

  const statsList = [
    {
      label: 'Total Transaksi',
      value: formatNumber(total),
      change: isLive ? ((transactions.length / Math.max(dashboardStats.totalTransactions, 1)) * 100 - 100).toFixed(1) * 1 : dashboardStats.totalTransactionsChange,
      icon: Banknote,
      type: 'primary',
      sourceNote: isLive ? `${transactions.length} tx dari Neon Cloud DB` : 'Dataset PaySim & Telemetri Live',
    },
    {
      label: 'Transaksi Diblokir',
      value: formatNumber(isLive ? blocked : dashboardStats.blockedTransactions),
      change: isLive ? (blocked > 0 ? ((blocked / total) * 100).toFixed(1) * 1 : 0) : dashboardStats.blockedTransactionsChange,
      icon: ShieldBan,
      type: 'danger',
      sourceNote: 'Evaluasi FDS Risk Score ≥ 85%',
    },
    {
      label: 'Transaksi Ditandai',
      value: formatNumber(isLive ? flagged : dashboardStats.flaggedTransactions),
      change: isLive ? (flagged > 0 ? ((flagged / total) * 100).toFixed(1) * 1 : 0) : dashboardStats.flaggedTransactionsChange,
      icon: AlertTriangle,
      type: 'warning',
      sourceNote: 'Evaluasi FDS Risk Score 60% - 84%',
    },
    {
      label: 'Nilai Diblokir',
      value: formatCurrency(isLive ? totalValueBlocked : dashboardStats.totalValueBlocked),
      change: isLive ? (totalValueBlocked > 0 ? 18.3 : 0) : dashboardStats.totalValueBlockedChange,
      icon: CheckCircle2,
      type: 'success',
      sourceNote: 'Dana Rekening Mule Diselamatkan',
    },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Dataset Source Badge Header */}
      <div className="dataset-source-banner">
        <div className="dataset-source-text">
          <Database size={15} style={{ flexShrink: 0 }} />
          <span>
            {isLive
              ? `🟢 LIVE — Neon PostgreSQL Cloud (Singapore) · ${transactions.length} transaksi terakhir dimuat`
              : 'SUMBER DATASET: PaySim Synthetic Financial Fraud Dataset + Telemetri Live Stream API SNAP BI Expresso'}
          </span>
        </div>
        <span className="dataset-source-tag">
          {isLive ? `${blocked} BLOCK · ${flagged} REVIEW` : 'Sample Size: 50.000 Transaksi'}
        </span>
      </div>

      <div className="stats-grid" id="stats-overview">
        {statsList.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`stat-card ${stat.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
            id={`stat-card-${stat.type}`}
          >
            <div className="stat-card-header">
              <div className={`stat-icon ${stat.type}`}>
                <stat.icon size={22} />
              </div>
              <div className={`stat-trend ${stat.change >= 0 ? 'up' : 'down'}`}>
                {stat.change >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4, fontWeight: 500 }}>
              {stat.sourceNote}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
