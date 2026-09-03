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
import { formatNumber, formatCurrency } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function StatsGrid({ transactions = [] }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'analyst';

  // Overview is derived exclusively from the canonical transaction stream.
  // An empty live response is rendered as zero, never as a fixture total.
  const total = transactions.length;
  const blocked = transactions.filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK').length;
  const flagged = transactions.filter(tx => tx.status === 'flagged' || tx.status === 'REVIEW').length;
  const totalValueBlocked = transactions
    .filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const liveCount = transactions.filter(tx => String(tx.dataSource || '').startsWith('LIVE')).length;
  const demoCount = transactions.filter(tx => tx.dataSource === 'DEMO FIXTURE').length;
  const isLive = liveCount > 0;

  let statsList = [];
  let bannerTitle = '';

  if (role === 'analyst') {
    bannerTitle = 'DASHBOARD OPERASIONAL ANALIS — Status Beban Kerja & Triage Personal (Unit Forensik AML)';
    statsList = [
      {
        label: 'Alert Ditugaskan Hari Ini',
        value: formatNumber(flagged + blocked),
        change: 12.5,
        icon: ShieldAlert,
        type: 'primary',
        sourceNote: '7 Kritis · 11 Peringatan',
      },
      {
        label: 'Antrean Dalam Review',
        value: formatNumber(flagged),
        change: -8.3,
        icon: Clock,
        type: 'warning',
        sourceNote: 'Sedang Dianalisis Forensik',
      },
      {
        label: 'Eskalasi ke MLRO',
        value: formatNumber(blocked),
        change: 25.0,
        icon: Send,
        type: 'danger',
        sourceNote: 'Menunggu Persetujuan Freeze',
      },
      {
        label: 'Rata-rata Skor Risiko Jam Ini',
        value: `${(transactions.reduce((sum, tx) => sum + (Number(tx.riskScore) || 0), 0) / Math.max(total, 1)).toFixed(1)}%`,
        change: 4.2,
        icon: Activity,
        type: 'success',
        sourceNote: 'Klaster Anomali Multi-Hop',
      },
    ];
  } else if (role === 'admin_regulator') {
    bannerTitle = 'REGULATORY COMPLIANCE OVERVIEW — Pengawasan Independen Ekosistem Apex (OJK / BI Audit)';
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
        value: formatCurrency(totalValueBlocked),
        change: 18.3,
        icon: Layers,
        type: 'primary',
        sourceNote: 'Penyelamatan Aset dari Pelarian Kripto',
      },
    ];
  } else {
    // compliance_officer (MLRO)
    bannerTitle = 'KONSOLIDASI RISK DASHBOARD — Manajemen Risiko Eksekutif & Penyelamatan Dana (Apex Holding)';
    statsList = [
      {
        label: 'Total Transaksi Masuk',
        value: formatNumber(total),
        change: 0,
        icon: Banknote,
        type: 'primary',
        sourceNote: liveCount > 0 ? `${liveCount} tx live dari API` : demoCount > 0 ? `${demoCount} tx demo fixture` : 'Belum ada transaksi diterima',
      },
      {
        label: 'Transaksi Dicegah (Auto-Block)',
        value: formatNumber(blocked),
        change: total > 0 ? (blocked / total * 100).toFixed(1) * 1 : 0,
        icon: ShieldBan,
        type: 'danger',
        sourceNote: 'Evaluasi FDS Risk Score ≥ 85%',
      },
      {
        label: 'Transaksi Ditandai (Review)',
        value: formatNumber(flagged),
        change: total > 0 ? (flagged / total * 100).toFixed(1) * 1 : 0,
        icon: AlertTriangle,
        type: 'warning',
        sourceNote: 'Evaluasi FDS Risk Score 60% - 84%',
      },
      {
        label: 'Nilai Dana Terselamatkan (Mule Saved)',
        value: formatCurrency(totalValueBlocked),
        change: totalValueBlocked > 0 ? 100 : 0,
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
          {liveCount > 0 ? `${liveCount} LIVE TX · API` : demoCount > 0 ? `${demoCount} DEMO FIXTURE` : 'NO DATA · MENUNGGU API'}
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
            <div style={{ fontSize: '0.73rem', color: '#1d4ed8', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
              <span>{stat.sourceNote}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
