import type { Severity, ExceptionStatus } from './types';

// ---------------------------------------------------------------------------
// KPI Data
// ---------------------------------------------------------------------------
export const kpiData = {
  activeShipments: 24,
  pendingDocuments: 13,
  openExceptions: 8,
  documentMatchRate: 94.2,
  onTimeHandoffRate: 87.5,
  avgResolutionTime: 4.2,
  shipmentsAtRisk: 3,
  blockedHandoffs: 2,
  completedToday: 7,
  documentErrorRate: 3.2,
  slaAdherence: 91.4,
};

export const kpiTrends: Record<
  string,
  { direction: 'up' | 'down'; value: string; positive: boolean }
> = {
  activeShipments: { direction: 'up', value: '+3', positive: true },
  pendingDocuments: { direction: 'down', value: '-2', positive: true },
  openExceptions: { direction: 'down', value: '-5', positive: true },
  documentMatchRate: { direction: 'up', value: '+1.2%', positive: true },
  onTimeHandoffRate: { direction: 'up', value: '+2.1%', positive: true },
  avgResolutionTime: { direction: 'down', value: '-0.8h', positive: true },
  shipmentsAtRisk: { direction: 'down', value: '-1', positive: true },
  blockedHandoffs: { direction: 'down', value: '-1', positive: true },
  completedToday: { direction: 'up', value: '+2', positive: true },
  documentErrorRate: { direction: 'down', value: '-0.8%', positive: true },
  slaAdherence: { direction: 'up', value: '+1.5%', positive: true },
};

// ---------------------------------------------------------------------------
// AI Insight
// ---------------------------------------------------------------------------
export const aiInsight = {
  title: 'AI Operations Insight',
  text: '3 shipments require immediate attention: SHP-20484 has 2 blocking exceptions with vessel cutoff in 6 hours. SAP PO cross-reference detected a $16,450 value discrepancy on SHP-20482 — awaiting compliance override. OTM milestone "Document Handoff Complete" is pending for 2 shipments blocked by missing ISF and MSDS. Document error rate improved to 3.2% driven by automated EDI validation. Overall SLA adherence at 91.4% — above target.',
  timestamp: 'Updated 2 minutes ago',
};

// ---------------------------------------------------------------------------
// Document Processing Funnel
// ---------------------------------------------------------------------------
export const funnelData = [
  { stage: 'Received', count: 142 },
  { stage: "OCR'd", count: 138 },
  { stage: 'Validated', count: 131 },
  { stage: 'Matched', count: 126 },
  { stage: 'Handed Off', count: 119 },
];

// ---------------------------------------------------------------------------
// 30-Day Exception Trend (daily counts by severity)
// ---------------------------------------------------------------------------
export const exceptionTrendData = [
  { date: 'Feb 9', critical: 2, high: 4, medium: 6, low: 3 },
  { date: 'Feb 10', critical: 1, high: 3, medium: 5, low: 2 },
  { date: 'Feb 11', critical: 3, high: 5, medium: 7, low: 4 },
  { date: 'Feb 12', critical: 2, high: 4, medium: 6, low: 3 },
  { date: 'Feb 13', critical: 1, high: 3, medium: 4, low: 2 },
  { date: 'Feb 14', critical: 0, high: 2, medium: 3, low: 1 },
  { date: 'Feb 15', critical: 1, high: 2, medium: 5, low: 2 },
  { date: 'Feb 16', critical: 2, high: 4, medium: 6, low: 3 },
  { date: 'Feb 17', critical: 3, high: 5, medium: 8, low: 4 },
  { date: 'Feb 18', critical: 2, high: 3, medium: 5, low: 2 },
  { date: 'Feb 19', critical: 1, high: 4, medium: 6, low: 3 },
  { date: 'Feb 20', critical: 2, high: 3, medium: 4, low: 2 },
  { date: 'Feb 21', critical: 0, high: 2, medium: 3, low: 1 },
  { date: 'Feb 22', critical: 1, high: 3, medium: 5, low: 2 },
  { date: 'Feb 23', critical: 2, high: 4, medium: 7, low: 3 },
  { date: 'Feb 24', critical: 1, high: 3, medium: 5, low: 2 },
  { date: 'Feb 25', critical: 2, high: 5, medium: 6, low: 4 },
  { date: 'Feb 26', critical: 1, high: 2, medium: 4, low: 2 },
  { date: 'Feb 27', critical: 0, high: 3, medium: 5, low: 1 },
  { date: 'Feb 28', critical: 1, high: 2, medium: 3, low: 2 },
  { date: 'Mar 1', critical: 2, high: 4, medium: 6, low: 3 },
  { date: 'Mar 2', critical: 1, high: 3, medium: 5, low: 2 },
  { date: 'Mar 3', critical: 3, high: 5, medium: 7, low: 4 },
  { date: 'Mar 4', critical: 2, high: 4, medium: 6, low: 3 },
  { date: 'Mar 5', critical: 1, high: 2, medium: 4, low: 2 },
  { date: 'Mar 6', critical: 0, high: 3, medium: 3, low: 1 },
  { date: 'Mar 7', critical: 1, high: 2, medium: 5, low: 2 },
  { date: 'Mar 8', critical: 2, high: 3, medium: 4, low: 3 },
  { date: 'Mar 9', critical: 1, high: 2, medium: 3, low: 2 },
  { date: 'Mar 10', critical: 1, high: 3, medium: 4, low: 2 },
];

// ---------------------------------------------------------------------------
// Top Exception Types
// ---------------------------------------------------------------------------
export const topExceptionTypes = [
  { type: 'Missing Doc', count: 34 },
  { type: 'Field Mismatch', count: 28 },
  { type: 'Quality Failure', count: 19 },
  { type: 'Cutoff Risk', count: 12 },
  { type: 'Version Conflict', count: 9 },
  { type: 'Compliance Gap', count: 8 },
];

// ---------------------------------------------------------------------------
// Recent Exceptions Table
// ---------------------------------------------------------------------------
export const recentExceptions: Array<{
  id: string;
  document: string;
  scenario: string;
  shipment: string;
  severity: Severity;
  status: ExceptionStatus;
  age: string;
}> = [
  { id: 'EXC-001', document: 'Missing ISF Filing',                    scenario: 'Missing ISF',                  shipment: 'SHP-20481', severity: 'critical', status: 'open',      age: '18h' },
  { id: 'EXC-002', document: 'Commercial Invoice — Value Mismatch',   scenario: 'Invoice Value & Weight Mismatch', shipment: 'SHP-20482', severity: 'high',     status: 'in-review', age: '8h'  },
  { id: 'EXC-003', document: 'MSDS — Unreadable Scan (DG Class 3)',   scenario: 'Unreadable MSDS – Hazmat Cargo', shipment: 'SHP-20483', severity: 'medium',   status: 'waiting',   age: '10h' },
  { id: 'EXC-004', document: 'BOL Version Conflict — Cutoff Risk',    scenario: 'Cutoff Risk Escalation',       shipment: 'SHP-20484', severity: 'critical', status: 'escalated', age: '4h'  },
];

// ---------------------------------------------------------------------------
// ANALYTICS: Document Aging Analysis
// ---------------------------------------------------------------------------
export const agingData = [
  { bucket: 'Current', count: 89, amount: 2840000 },
  { bucket: '1-7 days', count: 24, amount: 920000 },
  { bucket: '8-14 days', count: 11, amount: 480000 },
  { bucket: '15-30 days', count: 5, amount: 210000 },
  { bucket: '30+ days', count: 2, amount: 95000 },
];

// ---------------------------------------------------------------------------
// ANALYTICS: Exception Breakdown (Donut)
// ---------------------------------------------------------------------------
export const exceptionBreakdown = [
  { name: 'Missing Doc', value: 34, color: '#3b82f6' },
  { name: 'Mismatch', value: 28, color: '#f97316' },
  { name: 'Quality', value: 19, color: '#eab308' },
  { name: 'Cutoff Risk', value: 12, color: '#ef4444' },
  { name: 'Compliance', value: 8, color: '#8b5cf6' },
];

// ---------------------------------------------------------------------------
// ANALYTICS: Monthly Shipment Volume
// ---------------------------------------------------------------------------
export const monthlyVolume = [
  { month: 'Oct', shipments: 156, handoffs: 148 },
  { month: 'Nov', shipments: 142, handoffs: 135 },
  { month: 'Dec', shipments: 168, handoffs: 157 },
  { month: 'Jan', shipments: 183, handoffs: 174 },
  { month: 'Feb', shipments: 171, handoffs: 166 },
  { month: 'Mar', shipments: 94, handoffs: 87 },
];

// ---------------------------------------------------------------------------
// ANALYTICS: Carrier Performance (on-time %)
// ---------------------------------------------------------------------------
export const carrierPerformance = [
  { name: 'Maersk', value: 94, color: '#3b82f6' },
  { name: 'MSC', value: 91, color: '#06b6d4' },
  { name: 'CMA CGM', value: 88, color: '#8b5cf6' },
  { name: 'Hapag-Lloyd', value: 86, color: '#f97316' },
  { name: 'ONE', value: 82, color: '#eab308' },
];

// ---------------------------------------------------------------------------
// ANALYTICS: Resolution Time by Severity
// ---------------------------------------------------------------------------
export const resolutionBySeverity = [
  { severity: 'Critical', avgHours: 2.1, color: '#b91c1c' },
  { severity: 'High', avgHours: 4.8, color: '#ea580c' },
  { severity: 'Medium', avgHours: 8.3, color: '#d97706' },
  { severity: 'Low', avgHours: 14.6, color: '#64748b' },
];
