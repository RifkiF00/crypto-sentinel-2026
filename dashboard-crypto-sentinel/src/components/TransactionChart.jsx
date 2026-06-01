import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { transactionTrend } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';
import { checkHealth, fetchTransactionTrend } from '../services/api';

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: colors.shadow,
      }}
    >
      <p style={{ color: colors.textSecondary, fontSize: '0.78rem', marginBottom: 8 }}>{label}</p>
      {payload.map((item) => (
        <div
          key={item.dataKey}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
            fontSize: '0.82rem',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.color,
            }}
          />
          <span style={{ color: colors.textSecondary }}>{item.name}:</span>
          <span style={{ color: colors.textPrimary, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TransactionChart() {
  const [timeRange, setTimeRange] = useState('30d');
  const [trendData, setTrendData] = useState(transactionTrend);
  const chartTheme = useChartTheme();

  useEffect(() => {
    let active = true;

    async function loadTrend() {
      try {
        const online = await checkHealth();
        if (!active) return;
        if (online) {
          const daysLimit = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
          const res = await fetchTransactionTrend();
          if (active) {
            // Take last N days from response
            setTrendData(res.slice(-daysLimit));
          }
        } else {
          if (active) {
            const daysLimit = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 15;
            setTrendData(transactionTrend.slice(-daysLimit));
          }
        }
      } catch (e) {
        console.error("Failed to load transaction trend:", e);
      }
    }

    loadTrend();
    const interval = setInterval(loadTrend, 6000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [timeRange]);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      id="transaction-chart-card"
    >
      <div className="card-header">
        <div className="card-title">
          <TrendingUp />
          Tren Transaksi & Pemblokiran
        </div>
        <div className="card-actions">
          {['7d', '14d', '30d'].map((range) => (
            <button
              key={range}
              className={`card-action-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <div className="chart-container large">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientFlagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis
                dataKey="date"
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <YAxis
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <Tooltip content={<ChartTooltip colors={chartTheme.tooltip} />} />
              <Legend wrapperStyle={{ fontSize: '0.78rem', color: chartTheme.axis }} />
              <Area
                type="monotone"
                dataKey="approved"
                name="Disetujui"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradientApproved)"
              />
              <Area
                type="monotone"
                dataKey="flagged"
                name="Ditandai"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradientFlagged)"
              />
              <Area
                type="monotone"
                dataKey="blocked"
                name="Diblokir"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradientBlocked)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

