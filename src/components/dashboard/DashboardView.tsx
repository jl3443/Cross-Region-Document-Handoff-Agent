import {
  Ship,
  FileText,
  AlertTriangle,
  TrendingUp,
  Zap,
  Timer,
  AlertCircle,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { AiInsightsCard } from './AiInsightsCard';
import { KpiCard } from './KpiCard';
import {
  kpiData,
  kpiTrends,
  funnelData,
  exceptionTrendData,
  topExceptionTypes,
  recentExceptions,
} from '../../data/dashboard-data';
import { chartColors, tooltipStyle, axisStyle } from '../../lib/chart-config';

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  low: 'bg-neutral-500/10 text-neutral-400 ring-1 ring-neutral-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  waiting: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  'in-review': 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20',
  escalated: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
};

export function DashboardView() {
  return (
    <div className="space-y-4">
      {/* AI Insights Hero */}
      <AiInsightsCard />

      {/* KPI Row 1: 6 main metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Active Shipments"
          value={kpiData.activeShipments}
          icon={Ship}
          trend={kpiTrends.activeShipments}
        />
        <KpiCard
          title="Pending Documents"
          value={kpiData.pendingDocuments}
          icon={FileText}
          trend={kpiTrends.pendingDocuments}
        />
        <KpiCard
          title="Open Exceptions"
          value={kpiData.openExceptions}
          icon={AlertTriangle}
          trend={kpiTrends.openExceptions}
        />
        <KpiCard
          title="Match Rate"
          value={kpiData.documentMatchRate}
          suffix="%"
          icon={TrendingUp}
          trend={kpiTrends.documentMatchRate}
        />
        <KpiCard
          title="On-Time Handoff"
          value={kpiData.onTimeHandoffRate}
          suffix="%"
          icon={Zap}
          trend={kpiTrends.onTimeHandoffRate}
        />
        <KpiCard
          title="Avg Resolution"
          value={kpiData.avgResolutionTime}
          suffix="h"
          icon={Timer}
          trend={kpiTrends.avgResolutionTime}
        />
      </div>

      {/* KPI Row 2: 3 status metrics */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          title="Shipments At Risk"
          value={kpiData.shipmentsAtRisk}
          icon={AlertCircle}
          trend={kpiTrends.shipmentsAtRisk}
        />
        <KpiCard
          title="Blocked Handoffs"
          value={kpiData.blockedHandoffs}
          icon={Ban}
          trend={kpiTrends.blockedHandoffs}
        />
        <KpiCard
          title="Completed Today"
          value={kpiData.completedToday}
          icon={CheckCircle2}
          trend={kpiTrends.completedToday}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Document Processing Funnel */}
        <Card title="Document Processing Funnel">
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {funnelData.map((_entry, index) => (
                    <Cell key={index} fill={chartColors.funnel[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exception Trend (30-day) */}
        <Card title="Exception Trend (30 Days)">
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={exceptionTrendData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="date"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  interval={6}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Geist, system-ui, sans-serif', color: '#a3a3a3' }}
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke={chartColors.critical}
                  strokeWidth={2}
                  dot={false}
                  name="Critical"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke={chartColors.high}
                  strokeWidth={2}
                  dot={false}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke={chartColors.medium}
                  strokeWidth={2}
                  dot={false}
                  name="Medium"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke={chartColors.low}
                  strokeWidth={2}
                  dot={false}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Exception Types */}
        <Card title="Top Exception Types">
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={topExceptionTypes} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="type"
                  tick={{ ...axisStyle, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Exceptions Table */}
      <Card title="Recent Exceptions" contentClassName="px-0 py-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Document</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Shipment</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Severity</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Age</th>
              </tr>
            </thead>
            <tbody>
              {recentExceptions.map((exc) => (
                <tr key={exc.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-neutral-300">{exc.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{exc.document}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-400">{exc.shipment}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${severityColors[exc.severity]}`}>
                      {exc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${statusColors[exc.status]}`}>
                      {exc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-400">{exc.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
