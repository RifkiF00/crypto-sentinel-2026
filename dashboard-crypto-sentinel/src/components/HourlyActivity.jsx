import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock } from 'lucide-react';
import { hourlyActivity } from '../data/mockData';
import { useChartTheme } from '../hooks/useChartTheme';
import { checkHealth, fetchHourlyActivity } from '../services/api';

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
      <p style={{ color: colors.textSecondary, fontSize: '0.78rem', marginBottom: 4 }}>{label}:00</p>
      <p style={{ color: colors.textPrimary, fontSize: '0.85rem', fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>
        {payload[0]?.value} transaksi
      </p>
    </div>
  );
}

export default function HourlyActivityChart() {
  const [data, setData] = useState(hourlyActivity);
  const chartTheme = useChartTheme();

  useEffect(() => {
    let active = true;
    async function loadHourly() {
      try {
        const online = await checkHealth();
        if (!active) return;
        if (online) {
          const res = await fetchHourlyActivity();
          if (active) setData(res);
        }
      } catch (e) {
        console.error("Failed to load hourly activity:", e);
      }
    }
    loadHourly();
  }, []);

  const maxVal = Math.max(...data.map(d => d.count), 1);

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
          Aktivitas Per Jam (Hari Ini)
        </div>
      </div>
      <div className="card-body">
        <div className="chart-container small">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
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
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.count > maxVal * 0.7 ? '#6366f1' : entry.count > maxVal * 0.4 ? '#818cf8' : 'rgba(99,102,241,0.35)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

