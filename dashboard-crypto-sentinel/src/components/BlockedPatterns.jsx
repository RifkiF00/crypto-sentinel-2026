import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { topBlockedPatterns } from '../data/mockData';
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
      <p style={{ color: colors.textPrimary, fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ color: colors.textSecondary, fontSize: '0.78rem' }}>
        {payload[0]?.value} kasus ({payload[0]?.payload?.percentage}%)
      </p>
    </div>
  );
}

export default function BlockedPatternsChart() {
  const chartTheme = useChartTheme();

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
      id="blocked-patterns-card"
    >
      <div className="card-header">
        <div className="card-title">
          <BarChart3 />
          Pola Pemblokiran Teratas
        </div>
      </div>
      <div className="card-body">
        <ResponsiveChartWrapper height={220}>
          {(w, h) => (
            <BarChart
              width={w}
              height={h}
              data={topBlockedPatterns}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
              <XAxis
                type="number"
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <YAxis
                dataKey="pattern"
                type="category"
                width={Math.min(w * 0.38, 110)}
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 10 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <Tooltip content={<ChartTooltip colors={chartTheme.tooltip} />} cursor={{ fill: chartTheme.cursor }} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={18} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          )}
        </ResponsiveChartWrapper>
      </div>
    </motion.div>
  );
}
