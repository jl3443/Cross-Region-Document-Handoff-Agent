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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AiInsightsCard } from './AiInsightsCard';
import { KpiCard } from './KpiCard';
import {
  kpiData,
  kpiTrends,
  funnelData,
  exceptionTrendData,
  topExceptionTypes,
  recentExceptions,
} from '@/data/dashboard-data';
import { chartColors, tooltipStyle, axisStyle } from '@/lib/chart-config';

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  waiting: 'bg-amber-100 text-amber-700',
  'in-review': 'bg-purple-100 text-purple-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
};

export function DashboardView() {
  return (
    <div className="space-y-2">
      {/* AI Insights Hero */}
      <AiInsightsCard />

      {/* KPI Row 1: 6 main metrics */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Active Shipments" value={kpiData.activeShipments} icon={Ship} iconBgColor="bg-blue-100" iconColor="text-blue-600" trend={kpiTrends.activeShipments} />
        <KpiCard title="Pending Documents" value={kpiData.pendingDocuments} icon={FileText} iconBgColor="bg-amber-100" iconColor="text-amber-600" trend={kpiTrends.pendingDocuments} />
        <KpiCard title="Open Exceptions" value={kpiData.openExceptions} icon={AlertTriangle} iconBgColor="bg-red-100" iconColor="text-red-600" trend={kpiTrends.openExceptions} />
        <KpiCard title="Match Rate" value={kpiData.documentMatchRate} suffix="%" icon={TrendingUp} iconBgColor="bg-green-100" iconColor="text-green-600" trend={kpiTrends.documentMatchRate} />
        <KpiCard title="On-Time Handoff" value={kpiData.onTimeHandoffRate} suffix="%" icon={Zap} iconBgColor="bg-purple-100" iconColor="text-purple-600" trend={kpiTrends.onTimeHandoffRate} />
        <KpiCard title="Avg Resolution" value={kpiData.avgResolutionTime} suffix="h" icon={Timer} iconBgColor="bg-cyan-100" iconColor="text-cyan-600" trend={kpiTrends.avgResolutionTime} />
      </div>

      {/* KPI Row 2: 3 status metrics */}
      <div className="grid grid-cols-3 gap-2">
        <KpiCard title="Shipments At Risk" value={kpiData.shipmentsAtRisk} icon={AlertCircle} iconBgColor="bg-orange-100" iconColor="text-orange-600" trend={kpiTrends.shipmentsAtRisk} />
        <KpiCard title="Blocked Handoffs" value={kpiData.blockedHandoffs} icon={Ban} iconBgColor="bg-red-100" iconColor="text-red-600" trend={kpiTrends.blockedHandoffs} />
        <KpiCard title="Completed Today" value={kpiData.completedToday} icon={CheckCircle2} iconBgColor="bg-green-100" iconColor="text-green-600" trend={kpiTrends.completedToday} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        {/* Document Processing Funnel */}
        <Card>
          <CardHeader><CardTitle>Document Processing Funnel</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={axisStyle} axisLine={false} tickLine={false} width={72} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {funnelData.map((_entry, index) => (
                      <Cell key={index} fill={chartColors.funnel[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Exception Trend (30-day) */}
        <Card>
          <CardHeader><CardTitle>Exception Trend (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <LineChart data={exceptionTrendData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontFamily: 'Geist, system-ui, sans-serif' }} />
                  <Line type="monotone" dataKey="critical" stroke={chartColors.critical} strokeWidth={2} dot={false} name="Critical" />
                  <Line type="monotone" dataKey="high" stroke={chartColors.high} strokeWidth={2} dot={false} name="High" />
                  <Line type="monotone" dataKey="medium" stroke={chartColors.medium} strokeWidth={2} dot={false} name="Medium" />
                  <Line type="monotone" dataKey="low" stroke={chartColors.low} strokeWidth={2} dot={false} name="Low" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Exception Types */}
        <Card>
          <CardHeader><CardTitle>Top Exception Types</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={topExceptionTypes} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="type" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exceptions Table */}
      <Card>
        <CardHeader><CardTitle>Recent Exceptions</CardTitle></CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">ID</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Document</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Shipment</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Severity</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">Age</th>
                </tr>
              </thead>
              <tbody>
                {recentExceptions.map((exc) => (
                  <tr key={exc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-mono text-xs font-medium text-slate-700">{exc.id}</td>
                    <td className="px-4 py-2 font-medium text-slate-800">{exc.document}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{exc.shipment}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityColors[exc.severity]}`}>{exc.severity}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[exc.status]}`}>{exc.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-slate-500">{exc.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
