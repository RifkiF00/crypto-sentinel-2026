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

export default function BlockedPatternsChart({ transactions = [] }) {
  const chartTheme = useChartTheme();
  const isLive = transactions.length > 0;

  let chartData;
  if (isLive) {
    // Ekstrak pola-pola pemblokiran dari transaksi live
    const reasonsCount = {};
    let totalBlocked = 0;

    transactions.forEach(tx => {
      if (tx.status === 'blocked' || tx.status === 'BLOCK' || tx.status === 'flagged') {
        totalBlocked++;
        const rules = tx.flaggedRules || (tx.reason ? [tx.reason] : ['Pola Structuring Berulang']);
        rules.forEach(r => {
          // sederhanakan nama rule agar muat di grafik
          let cleanName = r;
          if (cleanName.includes('threat intelligence') || cleanName.includes('crypto')) cleanName = 'VASP / Crypto Outflow';
          else if (cleanName.includes('Smurfing') || cleanName.includes('Structuring')) cleanName = 'Smurfing / Structuring';
          else if (cleanName.includes('Odd-Hour') || cleanName.includes('jam')) cleanName = 'Odd-Hour Activity';
          else if (cleanName.includes('Dormant')) cleanName = 'Dormant Account';
          else if (cleanName.includes('Drain') || cleanName.includes('Kuras')) cleanName = 'Drain to Zero';
          else if (cleanName.includes('GNN') || cleanName.includes('Mule')) cleanName = 'Mule Ring (GNN)';
          else cleanName = cleanName.substring(0, 24);

          reasonsCount[cleanName] = (reasonsCount[cleanName] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(reasonsCount);
    if (entries.length > 0) {
      chartData = entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern, count]) => ({
          pattern,
          count,
          percentage: totalBlocked > 0 ? Math.round((count / totalBlocked) * 100) : 0,
        }));
    } else {
      chartData = topBlockedPatterns;
    }
  } else {
    chartData = topBlockedPatterns;
  }

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
        {isLive && (
          <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 700, background: 'rgba(168,85,247,0.1)', padding: '2px 8px', borderRadius: 6 }}>
            🟢 LIVE RULES
          </span>
        )}
      </div>
      <div className="card-body">
        <ResponsiveChartWrapper height={220}>
          {(w, h) => (
            <BarChart
              width={w}
              height={h}
              data={chartData}
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
                width={Math.min(w * 0.38, 120)}
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
