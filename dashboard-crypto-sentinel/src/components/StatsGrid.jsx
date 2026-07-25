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
import { useState, useEffect } from 'react';
import { dashboardStats, formatNumber, formatCurrency } from '../data/mockData';
import { checkHealth, fetchStatistics } from '../services/api';

export default function StatsGrid() {
  const [currentStats, setCurrentStats] = useState(dashboardStats);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const online = await checkHealth();
        if (!active) return;
        if (online) {
          const statsData = await fetchStatistics();
          if (active) {
            setCurrentStats(statsData);
          }
        } else {
          if (active) {
            setCurrentStats(dashboardStats);
          }
        }
      } catch (e) {
        console.error("Failed to load stats:", e);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const statsList = [
    {
      label: 'Total Transaksi',
      value: formatNumber(currentStats.totalTransactions),
      change: currentStats.totalTransactionsChange,
      icon: Banknote,
      type: 'primary',
      sourceNote: 'Dataset PaySim & Telemetri Live SNAP BI',
    },
    {
      label: 'Transaksi Diblokir',
      value: formatNumber(currentStats.blockedTransactions),
      change: currentStats.blockedTransactionsChange,
      icon: ShieldBan,
      type: 'danger',
      sourceNote: 'Evaluasi FDS Risk Score ≥ 85%',
    },
    {
      label: 'Transaksi Ditandai',
      value: formatNumber(currentStats.flaggedTransactions),
      change: currentStats.flaggedTransactionsChange,
      icon: AlertTriangle,
      type: 'warning',
      sourceNote: 'Evaluasi FDS Risk Score 50% - 84%',
    },
    {
      label: 'Nilai Diblokir',
      value: formatCurrency(currentStats.totalValueBlocked),
      change: currentStats.totalValueBlockedChange,
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
          <span>SUMBER DATASET: PaySim Synthetic Financial Fraud Dataset + Telemetri Live Stream API SNAP BI Expresso</span>
        </div>
        <span className="dataset-source-tag">
          Sample Size: 50.000 Transaksi
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
