import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Clock } from 'lucide-react';
import { hourlyActivity } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: colors.shadow,
      }}
    >
      <p style={{ color: colors.textSecondary, fontSize: '0.78rem', marginBottom: 4 }}>{label}:00 WIB</p>
      <p style={{ color: colors.textPrimary, fontSize: '0.85rem', fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>
        {payload[0]?.value} transaksi
      </p>
    </div>
  );
}

export default function HourlyActivityChart({ transactions = [] }) {
  const chartTheme = useChartTheme();
  const isLive = transactions.length > 0;

  let chartData;
  if (isLive) {
    // Bangun 24 jam dan hitung transaksi berdasarkan jam timestamp
    const hourCounts = Array(24).fill(0);
    transactions.forEach(tx => {
      if (tx.timestamp) {
        try {
          const date = new Date(tx.timestamp.replace(' ', 'T'));
          const h = date.getHours();
          if (!isNaN(h) && h >= 0 && h < 24) {
            hourCounts[h]++;
          } else {
            // fallback acak atau jam default jika format tidak standar
            hourCounts[new Date().getHours()]++;
          }
        } catch (_) {
          hourCounts[new Date().getHours()]++;
        }
      }
    });

    chartData = hourCounts.map((count, idx) => ({
      hour: idx.toString().padStart(2, '0'),
      count: count,
    }));
  } else {
    chartData = hourlyActivity;
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.5 }}
      id="hourly-activity-card"
    >
      <div className="card-header">
        <div className="card-title">
          <Clock />
          Aktivitas Per Jam
        </div>
        {isLive && (
          <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700, background: 'rgba(129,140,248,0.1)', padding: '2px 8px', borderRadius: 6 }}>
            🟢 LIVE
          </span>
        )}
      </div>
      <div className="card-body">
        <ResponsiveChartWrapper height={220}>
          {(w, h) => (
            <BarChart width={w} height={h} data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis
                dataKey="hour"
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 10 }}
                axisLine={{ stroke: chartTheme.axisLine }}
                interval={2}
              />
              <YAxis
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 10 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <Tooltip content={<ChartTooltip colors={chartTheme.tooltip} />} cursor={{ fill: chartTheme.cursor }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={12}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.count > 10 ? '#6366f1' : entry.count > 0 ? '#818cf8' : 'rgba(99,102,241,0.2)'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveChartWrapper>
      </div>
    </motion.div>
  );
}
