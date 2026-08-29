import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldBan,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Database,
  ShieldAlert,
  Clock,
  Send,
  Activity,
  Layers
} from 'lucide-react';
import { dashboardStats, formatNumber, formatCurrency } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function StatsGrid({ transactions = [] }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'analyst';

  // Dynamic calculations from transactions array
  const total = transactions.length > 0 ? transactions.length : dashboardStats.totalTransactions;
  const blocked = transactions.filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK').length;
  const flagged = transactions.filter(tx => tx.status === 'flagged' || tx.status === 'REVIEW').length;
  const totalValueBlocked = transactions
    .filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const isLive = transactions.length > 0;

  let statsList = [];
  let bannerTitle = '';

  if (role === 'analyst') {
    bannerTitle = '💼 DASHBOARD OPERASIONAL ANALIS — Status Beban Kerja & Triage Personal (Unit Forensik AML)';
    statsList = [
      {
        label: 'Alert Ditugaskan Hari Ini',
        value: '18 Kasus',
        change: 12.5,
        icon: ShieldAlert,
        type: 'primary',
        sourceNote: '7 Kritis · 11 Peringatan',
      },
      {
        label: 'Antrean Dalam Review',
        value: '5 Kasus',
        change: -8.3,
        icon: Clock,
        type: 'warning',
        sourceNote: 'Sedang Dianalisis Forensik',
      },
      {
        label: 'Eskalasi ke MLRO',
        value: '4 Kasus',
        change: 25.0,
        icon: Send,
        type: 'danger',
        sourceNote: 'Menunggu Persetujuan Freeze',
      },
      {
        label: 'Rata-rata Skor Risiko Jam Ini',
        value: '76.4%',
        change: 4.2,
        icon: Activity,
        type: 'success',
        sourceNote: 'Klaster Anomali Multi-Hop',
      },
    ];
  } else if (role === 'admin_regulator') {
    bannerTitle = '🏛️ REGULATORY COMPLIANCE OVERVIEW — Pengawasan Independen Ekosistem Apex (OJK / BI Audit)';
    statsList = [
      {
        label: 'Total Transaksi Ekosistem',
        value: formatNumber(total),
        change: 15.2,
        icon: Banknote,
        type: 'primary',
        sourceNote: 'Konsolidasi Bank Kuningan & Bank BJB',
      },
      {
        label: 'Efektivitas Recall Fraud AI',
        value: '99.48%',
        change: 0.8,
        icon: CheckCircle2,
        type: 'success',
        sourceNote: 'Akurasi Deteksi GNN + Rule FDS',
      },
      {
        label: 'Rasio False Positive',
        value: '0.0017%',
        change: -12.4,
        icon: ShieldBan,
        type: 'warning',
        sourceNote: 'Perlindungan Hak Nasabah Sah',
      },
      {
        label: 'Total Dana Terlindungi',
        value: formatCurrency(isLive ? totalValueBlocked : dashboardStats.totalValueBlocked),
        change: 18.3,
        icon: Layers,
        type: 'primary',
        sourceNote: 'Penyelamatan Aset dari Pelarian Kripto',
      },
    ];
  } else {
    // compliance_officer (MLRO)
    bannerTitle = '📊 KONSOLIDASI RISK DASHBOARD — Manajemen Risiko Eksekutif & Penyelamatan Dana (Apex Holding)';
    statsList = [
      {
        label: 'Total Transaksi Masuk',
        value: formatNumber(total),
        change: isLive ? ((transactions.length / Math.max(dashboardStats.totalTransactions, 1)) * 100 - 100).toFixed(1) * 1 : dashboardStats.totalTransactionsChange,
        icon: Banknote,
        type: 'primary',
        sourceNote: isLive ? `${transactions.length} tx dari Neon Cloud DB` : 'Dataset PaySim & Telemetri Live',
      },
      {
        label: 'Transaksi Dicegah (Auto-Block)',
        value: formatNumber(isLive ? blocked : dashboardStats.blockedTransactions),
        change: isLive ? (blocked > 0 ? ((blocked / total) * 100).toFixed(1) * 1 : 0) : dashboardStats.blockedTransactionsChange,
        icon: ShieldBan,
        type: 'danger',
        sourceNote: 'Evaluasi FDS Risk Score ≥ 85%',
      },
      {
        label: 'Transaksi Ditandai (Review)',
        value: formatNumber(isLive ? flagged : dashboardStats.flaggedTransactions),
        change: isLive ? (flagged > 0 ? ((flagged / total) * 100).toFixed(1) * 1 : 0) : dashboardStats.flaggedTransactionsChange,
        icon: AlertTriangle,
        type: 'warning',
        sourceNote: 'Evaluasi FDS Risk Score 60% - 84%',
      },
      {
        label: 'Nilai Dana Terselamatkan (Mule Saved)',
        value: formatCurrency(isLive ? totalValueBlocked : dashboardStats.totalValueBlocked),
        change: isLive ? (totalValueBlocked > 0 ? 18.3 : 0) : dashboardStats.totalValueBlockedChange,
        icon: CheckCircle2,
        type: 'success',
        sourceNote: 'Dana Rekening Mule Berhasil Dibekukan',
      },
    ];
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Role-Specific Dataset Source Badge Header */}
      <div className="dataset-source-banner">
        <div className="dataset-source-text">
          <Database size={15} style={{ flexShrink: 0 }} />
          <span>{bannerTitle}</span>
        </div>
        <span className="dataset-source-tag">
          {isLive ? `🟢 ${transactions.length} LIVE TX · NEON DB` : 'SAMPEL EKOSISTEM APEX'}
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
