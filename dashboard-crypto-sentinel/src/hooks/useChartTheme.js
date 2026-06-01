import { useTheme } from '../context/ThemeContext';

// Reusable chart theme colors based on current theme
export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    tooltip: {
      background: isDark ? '#1e2a3a' : '#ffffff',
      border: isDark ? 'rgba(148,163,184,0.15)' : '#e2e8f0',
      textPrimary: isDark ? '#f1f5f9' : '#1e293b',
      textSecondary: isDark ? '#94a3b8' : '#64748b',
      shadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
    },
    grid: isDark ? 'rgba(148,163,184,0.06)' : 'rgba(148,163,184,0.12)',
    axis: isDark ? '#64748b' : '#94a3b8',
    axisLine: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.15)',
    cursor: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.05)',
  };
}
