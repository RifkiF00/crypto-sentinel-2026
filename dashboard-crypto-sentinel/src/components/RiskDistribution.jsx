import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { riskDistribution } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function ChartTooltip({ active, payload, colors }) {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0];
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: data.payload.color }} />
        <span style={{ color: colors.textPrimary, fontSize: '0.82rem', fontWeight: 600 }}>{data.name}</span>
      </div>
      <span style={{ color: colors.textSecondary, fontSize: '0.78rem' }}>
        {data.value.toLocaleString('id-ID')} transaksi
      </span>
    </div>
  );
}

export default function RiskDistributionChart() {
  const total = riskDistribution.reduce((sum, item) => sum + item.value, 0);
  const chartTheme = useChartTheme();

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      id="risk-distribution-card"
    >
      <div className="card-header">
        <div className="card-title">
          <PieIcon />
          Distribusi Risiko
        </div>
      </div>
      <div className="card-body">
        <div className="chart-container small" style={{ display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="55%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip colors={chartTheme.tooltip} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {riskDistribution.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.value.toLocaleString('id-ID')} ({((item.value / total) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
