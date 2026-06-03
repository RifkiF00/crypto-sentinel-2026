import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Building2 } from 'lucide-react';
import { bankDistribution } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';

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
      <p style={{ color: colors.textPrimary, fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '0.78rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
          <span style={{ color: colors.textSecondary }}>{item.name}:</span>
          <span style={{ color: colors.textPrimary, fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>
            {item.value.toLocaleString('id-ID')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BankDistribution() {
  const chartTheme = useChartTheme();

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      id="bank-distribution-card"
    >
      <div className="card-header">
        <div className="card-title">
          <Building2 />
          Distribusi Per Bank
        </div>
      </div>
      <div className="card-body">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bankDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis
                dataKey="bank"
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <YAxis
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                axisLine={{ stroke: chartTheme.axisLine }}
              />
              <Tooltip content={<ChartTooltip colors={chartTheme.tooltip} />} cursor={{ fill: chartTheme.cursor }} />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="flagged" name="Ditandai" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="blocked" name="Diblokir" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
