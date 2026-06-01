import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldBan,
  AlertTriangle,
  CheckCircle2,
  Banknote,
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
    },
    {
      label: 'Transaksi Diblokir',
      value: formatNumber(currentStats.blockedTransactions),
      change: currentStats.blockedTransactionsChange,
      icon: ShieldBan,
      type: 'danger',
    },
    {
      label: 'Transaksi Ditandai',
      value: formatNumber(currentStats.flaggedTransactions),
      change: currentStats.flaggedTransactionsChange,
      icon: AlertTriangle,
      type: 'warning',
    },
    {
      label: 'Nilai Diblokir',
      value: formatCurrency(currentStats.totalValueBlocked),
      change: currentStats.totalValueBlockedChange,
      icon: CheckCircle2,
      type: 'success',
    },
  ];

  return (
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
        </motion.div>
      ))}
    </div>
  );
}
