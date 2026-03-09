export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type ExceptionStatus = 'open' | 'waiting' | 'escalated' | 'in-review' | 'resolved';
export type DocStatus = 'validated' | 'mismatch' | 'unreadable' | 'pending' | 'missing';
export type TransportMode = 'ocean' | 'air' | 'road';
export type ExceptionType = 'missing-doc' | 'mismatch' | 'quality' | 'cutoff-risk';

export interface Shipment {
  id: string;
  poId: string;
  mode: TransportMode;
  origin: { city: string; port: string; country: string };
  destination: { city: string; port: string; country: string };
  carrier: string;
  vessel: string;
  voyage: string;
  container: string;
  cutoffHours: number;
  cargoDescription: string;
  cargoWeight: string;
  status: 'on-track' | 'at-risk' | 'blocked';
  readinessScore: number;
}

export interface RequiredDocument {
  id: string;
  name: string;
  fileName?: string;
  status: DocStatus;
  receivedAt?: string;
  source?: string;
  ocrConfidence?: number;
  qualityIssues?: string[];
  remindersSent?: number;
  lastReminderAt?: string;
  dgClassification?: string;
}

export interface MatchingSummary {
  totalRequired: number;
  received: number;
  matched: number;
  exceptionsDetected: number;
  blockingIssues: number;
}

export interface ComparisonField {
  field: string;
  documentValue: string;
  systemValue: string;
  match: boolean;
}

export interface ResolutionAction {
  id: string;
  label: string;
  description: string;
  target: string;
  type: 'email' | 'internal' | 'escalation' | 'override';
}

export interface EmailDraft {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  tab: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  description: string;
  type: 'system' | 'warning' | 'critical' | 'positive' | 'info';
}

export interface DocumentException {
  id: string;
  type: ExceptionType;
  severity: Severity;
  status: ExceptionStatus;
  blocking: boolean;
  documentName: string;
  owner: string;
  ownerRole: string;
  ageHours: number;
  dueInHours: number;
  slaHours: number;
  summary: string;
  impact: string;
  aiAssessment: string;
  comparisonFields?: ComparisonField[];
  qualityIssues?: string[];
  ocrConfidence?: number;
  resolutionActions: ResolutionAction[];
  emailDrafts: EmailDraft[];
  timeline: TimelineEvent[];
}

export interface LaneRequirement {
  label: string;
  regulations: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  warRoom: boolean;
  shipment: Shipment;
  documents: RequiredDocument[];
  matchingSummary: MatchingSummary;
  exceptions: DocumentException[];
  globalTimeline: TimelineEvent[];
  laneRequirements?: LaneRequirement;
  hazmat?: { dgClass: string; unNumber: string; properShippingName: string };
}
