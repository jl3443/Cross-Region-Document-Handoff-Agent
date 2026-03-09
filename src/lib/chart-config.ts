// Chart color palette for dark theme
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#22c55e',
  tertiary: '#06b6d4',
  quaternary: '#8b5cf6',
  quinary: '#f97316',

  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',

  funnel: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  aging: ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'],
};

// Shared dark tooltip style for all Recharts tooltips
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#171717',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: '#fafafa',
    fontSize: '12px',
    fontFamily: 'Geist, system-ui, sans-serif',
    padding: '10px 14px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
  },
  itemStyle: { color: '#a3a3a3', fontSize: '11px' },
  labelStyle: { color: '#fafafa', fontWeight: 600 as const, marginBottom: '4px' },
};

// Shared axis tick style for dark theme
export const axisStyle = {
  fontSize: 11,
  fontFamily: 'Geist, system-ui, sans-serif',
  fill: '#737373',
};

// Grid style for dark theme
export const gridStyle = {
  stroke: '#262626',
  strokeDasharray: '3 3',
};
