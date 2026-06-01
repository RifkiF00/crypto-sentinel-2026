import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, CalendarDays } from 'lucide-react';
import { weeklyComparison, formatCurrency, formatNumber } from '../data/mockData';

const metrics = [
  {
    label: 'Total Transaksi',
    thisWeek: weeklyComparison.thisWeek.total,
    lastWeek: weeklyComparison.lastWeek.total,
    format: formatNumber,
  },
  {
    label: 'Diblokir',
    thisWeek: weeklyComparison.thisWeek.blocked,
    lastWeek: weeklyComparison.lastWeek.blocked,
    format: formatNumber,
  },
  {
    label: 'Ditandai',
    thisWeek: weeklyComparison.thisWeek.flagged,
    lastWeek: weeklyComparison.lastWeek.flagged,
    format: formatNumber,
  },
  {
    label: 'Nilai Diblokir',
    thisWeek: weeklyComparison.thisWeek.valueBlocked,
    lastWeek: weeklyComparison.lastWeek.valueBlocked,
    format: formatCurrency,
  },
];

export default function WeeklyComparison() {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.5 }}
      id="weekly-comparison-card"
    >
      <div className="card-header">
        <div className="card-title">
          <CalendarDays />
          Perbandingan Mingguan
        </div>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {metrics.map((metric) => {
            const change = ((metric.thisWeek - metric.lastWeek) / metric.lastWeek) * 100;
            const isUp = change >= 0;

            return (
              <div
                key={metric.label}
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid var(--border-color)',
                  transition: 'background 0.35s, border-color 0.35s',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  {metric.label}
                </div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}
                >
                  {metric.format(metric.thisWeek)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    color: isUp ? 'var(--status-success)' : 'var(--status-danger)',
                  }}
                >
                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span style={{ fontWeight: 600 }}>{Math.abs(change).toFixed(1)}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>vs minggu lalu</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
