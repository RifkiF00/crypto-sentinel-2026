import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { riskDistribution } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';

const RADIAN = Math.PI / 180;

const RISK_COLORS = {
  approved: '#10b981',
  flagged:  '#f59e0b',
  blocked:  '#ef4444',
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
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
    <div style={{ background: colors.background, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '10px 14px', boxShadow: colors.shadow }}>
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

export default function RiskDistributionChart({ transactions = [] }) {
  const chartTheme = useChartTheme();

  // Hitung distribusi risiko dari transaksi live
  const isLive = transactions.length > 0;
  let chartData;

  if (isLive) {
    const approved = transactions.filter(tx => tx.status === 'approved' || tx.status === 'ALLOW').length;
    const flagged  = transactions.filter(tx => tx.status === 'flagged' || tx.status === 'REVIEW').length;
    const blocked  = transactions.filter(tx => tx.status === 'blocked' || tx.status === 'BLOCK').length;

    chartData = [
      { name: 'Aman (ALLOW)',       value: approved, color: RISK_COLORS.approved },
      { name: 'Ditandai (REVIEW)',  value: flagged,  color: RISK_COLORS.flagged  },
      { name: 'Diblokir (BLOCK)',   value: blocked,  color: RISK_COLORS.blocked  },
    ].filter(d => d.value > 0);

    if (chartData.length === 0) {
      chartData = [{ name: 'Memuat...', value: 1, color: '#334155' }];
    }
  } else {
    chartData = riskDistribution;
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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
        {isLive && (
          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6 }}>
            🟢 LIVE
          </span>
        )}
      </div>
      <div className="card-body">
        <ResponsiveChartWrapper height={220}>
          {(w, h) => (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: h }}>
              <PieChart width={Math.max(w * 0.48, 140)} height={h}>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip colors={chartTheme.tooltip} />} />
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 10 }}>
                {chartData.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.value.toLocaleString('id-ID')} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ResponsiveChartWrapper>
      </div>
    </motion.div>
  );
}
