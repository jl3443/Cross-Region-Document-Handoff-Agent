import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import {
  agingData,
  exceptionBreakdown,
  monthlyVolume,
  carrierPerformance,
  resolutionBySeverity,
} from '../../data/dashboard-data';
import { chartColors, tooltipStyle, axisStyle } from '../../lib/chart-config';

function PieLegend({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
      {data.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-neutral-400">
            {entry.name} <span className="font-semibold text-white">{Math.round((entry.value / total) * 100)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsView() {
  const avgCarrierPerformance = Math.round(
    carrierPerformance.reduce((sum, c) => sum + c.value, 0) / carrierPerformance.length
  );

  return (
    <div className="space-y-4">
      {/* Row 1: 2 charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Document Aging Analysis */}
        <Card title="Document Aging Analysis">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={agingData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? `$${(value / 1000).toFixed(0)}K` : value,
                    name === 'amount' ? 'Amount' : 'Count',
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Geist, system-ui, sans-serif', color: '#a3a3a3' }}
                />
                <Bar dataKey="count" name="Documents" radius={[4, 4, 0, 0]} barSize={28}>
                  {agingData.map((_entry, index) => (
                    <Cell key={index} fill={chartColors.aging[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exception Breakdown (Donut) */}
        <Card title="Exception Breakdown by Type">
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={exceptionBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {exceptionBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number) => [value, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <PieLegend data={exceptionBreakdown} />
        </Card>
      </div>

      {/* Row 2: 3 charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly Shipment Volume */}
        <Card title="Monthly Shipment Volume">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyVolume} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Geist, system-ui, sans-serif', color: '#a3a3a3' }}
                />
                <Bar
                  dataKey="shipments"
                  name="Shipments"
                  fill={chartColors.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                <Bar
                  dataKey="handoffs"
                  name="Handoffs"
                  fill={chartColors.quaternary}
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Carrier Performance (Donut) */}
        <Card title="Carrier On-Time Performance">
          <div style={{ width: '100%', height: 240 }} className="relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={carrierPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {carrierPerformance.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number) => [`${value}%`, 'On-Time Rate']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{avgCarrierPerformance}%</p>
                <p className="text-[11px] font-medium text-neutral-500">Avg On-Time</p>
              </div>
            </div>
          </div>
          <PieLegend data={carrierPerformance} />
        </Card>

        {/* Resolution Time by Severity */}
        <Card title="Avg Resolution Time (Hours)">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={resolutionBySeverity} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis
                  type="number"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  unit="h"
                />
                <YAxis
                  type="category"
                  dataKey="severity"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number) => [`${value}h`, 'Avg Time']}
                />
                <Bar dataKey="avgHours" radius={[0, 4, 4, 0]} barSize={22}>
                  {resolutionBySeverity.map((entry) => (
                    <Cell key={entry.severity} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
