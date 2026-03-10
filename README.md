# DocFlow — Cross-Region Document Handoff Exception Manager

An AI-native **Document Handoff Exception Resolution Cockpit** built for enterprise trade operations. The system detects, classifies, and drives resolution of document exceptions before shipment cutoff — bridging the gap between "document received" and "handoff complete."

> **Demo narrative:** Matching is done. Problems were found. Now the agent drives resolution before cutoff.

---

## What This Is

A polished frontend demo showing how an AI operations agent handles cross-border trade document exceptions in real time. Designed around the TCS enterprise use case for cross-region document handoff workflows, integrated with SAP, Oracle OTM, EDI carriers, and forwarder portals.

**This is NOT:** a TMS, customs filing system, ERP replacement, or OCR/extraction tool.

**The gap it fills:** Oracle/SAP handle filing and compliance blocks. Descartes/CargoWise handle alerting and workflow triggers. Flexport/project44 handle shipment visibility. AI startups handle extraction and filing. **Nobody provides a purpose-built exception resolution cockpit for document handoff** — the highest-risk, most manual stage of the process.

---

## Demo Scenarios

| # | Scenario | Shipment | Lane | Exception Type | Severity | Status |
|---|----------|----------|------|----------------|----------|--------|
| 1 | **Missing ISF** | SHP-20481 | CNSHA → USLAX · Maersk | Missing mandatory document (ISF filing) | Critical | open |
| 2 | **Invoice Value & Weight Mismatch** | SHP-20482 | CNSZX → USLGB · COSCO | Field mismatch (value / weight / incoterms) | High | in-review |
| 3 | **Unreadable MSDS – Hazmat Cargo** | SHP-20483 | NLRTM → USHOU · Hapag-Lloyd | OCR quality failure on dangerous goods doc | Medium | waiting |
| 4 | **Cutoff Risk Escalation – War Room** | SHP-20484 | CNSHA → USLAX · Maersk | Multiple unresolved blockers, 4h to cutoff | Critical | escalated |

Scenarios 1–3 show individual exception types. Scenario 4 shows what happens when exceptions go unresolved — triggering War Room mode with red banner, pulsing countdown, and auto-escalation.

---

## Features

### Dashboard
- 11 KPI cards: Active Shipments, Pending Documents, Open Exceptions, Match Rate, On-Time Handoff, Avg Resolution, Shipments At Risk, Blocked Handoffs, Completed Today, Document Error Rate, SLA Adherence
- Document Processing Funnel chart
- 30-day Exception Trend by severity (line chart)
- Top Exception Types (bar chart)
- Recent Exceptions table — one row per demo scenario, clickable to navigate directly to Shipment Overview
- Export CSV button

### Shipment Overview
- Shipment header: ID, carrier, vessel, lane (origin → destination with port codes), PO/container references
- Cutoff countdown timer with color-coded urgency (green → amber → orange → red → pulsing)
- Readiness Score (radial progress, real-time updates as exceptions resolve)
- Gate Check: Documents Received → Validated → Compliance Clear → Handoff Ready
- Required Documents checklist with ERP source badges (SAP, OTM, EDI, Email, Broker Portal)
- Matching Summary card
- Document upload drop zone
- Human-in-the-Loop (HITL) panel: Approve Escalations, Override Mismatches, Final Sign-off

### Exception Workbench
- Full exception table with severity, type, status, owner, age, SLA, blocking indicator
- Exception Detail Panel (right drawer):
  - What happened / Why it matters / Impact tags
  - SAP Fiori-style side-by-side field comparison (for mismatch scenarios)
  - OCR quality analysis with failure reasons (for quality scenarios)
  - Multiple resolution paths as action cards
  - Mini resolution timeline per exception
- Mark Resolved interaction → readiness score updates live
- Escalation flow with confirmation modal and AI reasoning

### Communications
- AI-generated email drafts per recipient (Broker, Forwarder, Compliance, Escalation)
- Tabbed layout, editable body, send confirmation toast
- Sent email log with full thread view

### Resolution Timeline
- Vertical timeline with color-coded events (blue = system, amber = warning, red = critical, green = resolved)
- Expandable event details

### Analytics
- Document aging analysis
- Exception breakdown donut chart
- Monthly shipment volume
- Carrier on-time performance
- Resolution time by severity

### War Room Mode (Scenario 4)
- Persistent red critical banner with live blocker count and countdown
- Global accent color shifts to destructive red
- Pulsing cutoff timer
- Auto-escalation trail in timeline

---

## ERP Source Badges

All documents are labelled with their originating system — matching real TCS integration architecture:

| Badge | System |
|-------|--------|
| `SAP` | SAP — Supplier Portal (invoices, packing lists) |
| `OTM` | Oracle TMS (milestones, routing) |
| `EDI` | EDI — Carrier (BOL, container events) |
| `Email` | Email — Forwarder (ad-hoc document submissions) |
| `Broker Portal` | Customs broker portal (ISF, entry docs) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | Sonner |
| State | useState / useMemo / useCallback (no external store) |

---

## Project Structure

```
src/
  components/
    layout/         # Sidebar, TopBar
    dashboard/      # DashboardView, KpiCard, AiInsightsCard
    shipment/       # ShipmentListView, RequiredDocsChecklist, ReadinessScore,
                    # GateCheck, MatchingSummaryCard
    exceptions/     # ExceptionTable, ExceptionDetailPanel
    communications/ # CommunicationDraftPanel, EmailPreview
    timeline/       # ResolutionTimeline
    alerts/         # RiskBanner, EscalationModal
    hitl/           # HitlPanel
    ai/             # AiChatPanel
    analytics/      # AnalyticsView
    email/          # EmailView
    auth/           # LoginPage
    ui/             # shadcn/ui components + ScenarioUploadModal
  data/
    scenarios.ts    # All 4 scenarios with complete mock data (~1660 lines)
    dashboard-data.ts
    types.ts
    inbox-emails.ts
  lib/
    utils.ts
    chart-config.ts
  App.tsx           # Root — view routing, scenario state, all handlers
```

---

## Getting Started

```bash
cd doc-exception-demo
npm install
npm run dev
```

App runs at `http://localhost:5173`. Select any demo account role to sign in (no real auth — credentials are pre-filled).

**Demo accounts:**

| Role | Email |
|------|-------|
| Export Coordinator | e.coordinator@docflow.io |
| Import Team | import.team@docflow.io |
| Broker | broker@docflow.io |
| Trade Compliance | compliance@docflow.io |

Password for all: `Demo@2024`

---

## Design System

Based on TCS enterprise style:

- **Primary:** `#0f172a` (dark navy sidebar)
- **Accent:** `#0000B3` (TCS blue)
- **Destructive:** `#b91c1c` (War Room red)
- **Font:** Geist (sans) / Geist Mono (code)
- **Direction:** Enterprise control tower — clean, no consumer-app feel, no neon

---

## Custom Scenario Import

Click **Import** in the top bar to upload a JSON scenario file. The schema follows the `Scenario` type defined in `src/data/types.ts`. Imported scenarios appear as additional tabs in the shipment selector.
