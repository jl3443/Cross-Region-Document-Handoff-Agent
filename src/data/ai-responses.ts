export interface AiAction {
  label: string;
  type: 'navigate' | 'action';
  target: string;
}

export interface AiResponse {
  text: string;
  actions?: AiAction[];
}

export const viewSuggestions: Record<string, string[]> = {
  dashboard: [
    "Summarize today's exceptions",
    "Which shipments are at risk?",
    "What's the match rate trend?",
    "Prioritize my work queue",
  ],
  overview: [
    "What's blocking this shipment?",
    "When is the ISF deadline?",
    "Draft a reminder email",
    "Assess cutoff risk",
  ],
  exceptions: [
    "Explain this exception",
    "What's the resolution path?",
    "Similar past exceptions",
    "Auto-draft communication",
  ],
  documents: [
    "Which docs are still missing?",
    "Check OCR confidence scores",
    "Why is the match rate low?",
    "Run compliance check",
  ],
  communications: [
    "Draft a follow-up email",
    "Summarize pending outreach",
    "Who hasn't responded?",
    "Escalation email templates",
  ],
  timeline: [
    "Summarize the timeline",
    "Which event is most critical?",
    "How long has this been open?",
    "What happened first?",
  ],
  analytics: [
    "Explain the match rate dip",
    "Which carrier performs best?",
    "Show resolution time trends",
    "Portfolio health summary",
  ],
};

export const aiResponses: Record<string, AiResponse> = {
  "Summarize today's exceptions": {
    text: "**Today's Exception Summary**\n\nYou have **8 open exceptions** across 4 active shipments:\n\n- **2 Critical** — SHP-20484 (War Room): BOL consignee mismatch + ISF not filed\n- **3 High** — SHP-20481: ISF missing (18h to cutoff), SHP-20482: Invoice value mismatch\n- **2 Medium** — SHP-20483: MSDS quality failure (DG Class 3)\n- **1 Low** — SHP-20485: Packing list formatting\n\n**Immediate focus**: SHP-20484 is in War Room mode with 4 hours remaining. Two blocking exceptions must be resolved before vessel cutoff.",
    actions: [{ label: "Open Exception Workbench", type: "navigate", target: "exceptions" }],
  },
  "Which shipments are at risk?": {
    text: "**At-Risk Shipments**\n\n- **SHP-20484** — BLOCKED · War Room Active · 4h to cutoff · 2 blocking exceptions · Vessel: CMA CGM Christophe Colomb\n- **SHP-20481** — AT RISK · 18h to cutoff · ISF not filed · CBP penalty exposure: $5,000\n- **SHP-20483** — AT RISK · DG Class 3 compliance gap · MSDS quality failure · Trade sign-off required\n\n**Recommended action**: Prioritize SHP-20484 immediately. SHP-20481 ISF filing must begin within 2 hours to avoid rollover.",
    actions: [
      { label: "View War Room Shipment", type: "navigate", target: "overview" },
      { label: "Go to Exceptions", type: "navigate", target: "exceptions" },
    ],
  },
  "What's the match rate trend?": {
    text: "**Document Match Rate Analysis**\n\nCurrent match rate: **94.2%** (+1.2% vs last week)\n\nKey drivers of improvement:\n- Automated ISF validation catching errors pre-submission\n- Supplier portal integration reducing manual re-keying errors\n- BOL field standardization across 3 major carriers\n\nRemaining gap areas:\n- Commercial invoice value mismatches (most common — 28 this month)\n- OCR confidence below 90% on older document formats\n- DG declaration formatting differences across carriers\n\nAt this trajectory, the portfolio is on track to reach **95%** match rate by end of month.",
  },
  "Prioritize my work queue": {
    text: "**Recommended Work Priority**\n\n**1. SHP-20484 — IMMEDIATE** (4h cutoff)\nResolve BOL consignee mismatch + confirm ISF filing with backup broker\n\n**2. SHP-20481 — URGENT** (18h cutoff)\nEmail Global Forwarding Co. ISF filing escalation. If no response in 2h, escalate to manager\n\n**3. SHP-20483 — TODAY** (DG compliance)\nRequest MSDS resubmission from supplier. Arrange Trade Compliance sign-off\n\n**4. SHP-20482 — THIS WEEK**\nConfirm invoice amendment with Procurement before chasing supplier\n\n**5. SHP-20485 — LOW** (packing list formatting)\nCan be handled end of day — low risk, no blocking issue",
    actions: [{ label: "View All Exceptions", type: "navigate", target: "exceptions" }],
  },
  "What's blocking this shipment?": {
    text: "**Blocking Issues for This Shipment**\n\nBased on the active exceptions, the following are blocking handoff:\n\n- **ISF Not Filed** (CRITICAL) — CBP requires ISF 24h before loading. Currently 18h to cutoff. 3 reminders sent, no response from freight forwarder.\n- **No secondary blockers** detected at this time\n\n**Gate Check Status**:\n- Docs Received: Active (ISF missing)\n- Validated: Locked pending ISF\n- Compliance: Locked\n- Handoff Ready: Locked\n\nReadiness score is currently below 70%. Resolving the ISF exception will unlock the remaining gates.",
    actions: [
      { label: "View Exception Details", type: "navigate", target: "exceptions" },
      { label: "Launch Escalation", type: "action", target: "escalation" },
    ],
  },
  "When is the ISF deadline?": {
    text: "**ISF Filing Deadline Analysis**\n\nCBP 19 CFR §149 requires ISF filing **at least 24 hours before vessel loading**.\n\nCurrent status:\n- Vessel cutoff: **18 hours** from now\n- ISF filing window: **PAST DUE** (should have been filed 6+ hours ago)\n- Reminders sent: 3 (last sent 6:00 AM)\n- No response received from Global Forwarding Co.\n\n**Risk assessment**: At 18h remaining, there is a **65% probability** of missing the cutoff without immediate action.\n\n**Penalty exposure**: $5,000 per CBP violation + 7-10 day cargo rollover to next sailing.",
    actions: [
      { label: "Email Freight Forwarder", type: "action", target: "draft-email" },
      { label: "Escalate Now", type: "action", target: "escalation" },
    ],
  },
  "Draft a reminder email": {
    text: "**Pre-Written Communication Drafts Ready**\n\nThe AI has prepared **2 draft emails** for this exception:\n\n- **Draft 1**: Urgent ISF filing reminder → Sarah Chen (Global Forwarding Co.)\n- **Draft 2**: ISF status update → Maersk Booking Team (SHA)\n\nBoth drafts include full shipment context (SHP-20481, MSKU-7294810, Maersk Eindhoven 248E) and CBP compliance language. Review and send from the Communications panel.",
    actions: [{ label: "Review Drafts", type: "navigate", target: "communications" }],
  },
  "Assess cutoff risk": {
    text: "**Cutoff Risk Assessment**\n\n**Risk Level: HIGH (65% probability of miss)**\n\nFactors increasing risk:\n- ISF overdue by 6+ hours (historical filing time: 28h before cutoff)\n- No response from freight forwarder after 3 reminders\n- Less than 1 filing window remaining\n\nFactors that could reduce risk:\n- Direct escalation to Global Forwarding Co. operations desk\n- Carrier (Maersk) may grant a 2-4h extension if notified proactively\n- Backup broker (Flexport) could file emergency ISF within 4-6 hours\n\n**Recommended immediate actions**:\n- Call Sarah Chen directly (do not wait for email)\n- Notify Maersk of potential late ISF\n- Place backup broker on standby",
    actions: [
      { label: "Launch Escalation", type: "action", target: "escalation" },
      { label: "Email Carrier", type: "action", target: "draft-email" },
    ],
  },
  "Explain this exception": {
    text: "**Exception Types in DocHandoff**\n\n- **Missing Document** — A required document for this lane has not been received. Blocking until resolved. Most common: ISF, Bill of Lading, Certificate of Origin.\n\n- **Field Mismatch** — A received document has one or more fields that don't match the shipment record (e.g., invoice value differs from PO). May require reissuance or override approval.\n\n- **Quality Failure** — Document was received but OCR confidence is too low to validate, or the document is illegible/incomplete. Requires resubmission.\n\n- **Cutoff Risk** — Not a document issue, but a time-based exception triggered when cutoff is within threshold and outstanding items remain unresolved.",
    actions: [{ label: "View Active Exceptions", type: "navigate", target: "exceptions" }],
  },
  "What's the resolution path?": {
    text: "**Standard Resolution Path for Missing Documents**\n\n1. **Identify owner** — Who was supposed to supply this document? Check the shipment's freight forwarder and supplier contacts.\n\n2. **Send reminder** — Use the pre-written email draft. CC the ops team. Log the outreach in the audit trail.\n\n3. **Wait window** — Standard SLA is 2-4 hours for response. For critical exceptions near cutoff, reduce to 1 hour.\n\n4. **Escalate if no response** — Escalate to the operations manager and notify the carrier proactively about potential delay.\n\n5. **Execute override (if applicable)** — For some exception types, a compliance override with manager approval can unblock handoff.\n\n6. **Mark resolved** — Once the document is received and validated, mark the exception resolved. Readiness score updates automatically.",
    actions: [{ label: "Take Action on Exceptions", type: "navigate", target: "exceptions" }],
  },
  "Similar past exceptions": {
    text: "**Historical Exception Patterns**\n\nBased on the last 30 days of portfolio data:\n\n- **ISF missing exceptions**: 12 occurrences — average resolution time 3.2 hours, 8 resolved before cutoff\n- **Invoice value mismatches**: 28 this month — most common cause: supplier price amendments not reflected in PO\n- **BOL amendments**: 6 cases — 4 involved unauthorized consignee changes, 2 were carrier corrections\n\n**Global Forwarding Co. history**: This forwarder has had ISF delays on 3 prior shipments (October, January, February). Average delay: 8 hours past recommended filing window. Escalation to ops desk resolved all 3 cases.",
  },
  "Auto-draft communication": {
    text: "**AI-Generated Communications Ready**\n\nFor each active exception, the AI has pre-drafted outreach emails:\n\n- Freight forwarder reminders (urgent + escalation tone)\n- Carrier notification emails (ISF status, amendment requests)\n- Internal coordination notes (for audit trail)\n\nAll drafts include full shipment context and are calibrated to the appropriate urgency level based on cutoff proximity.",
    actions: [{ label: "Review All Drafts", type: "navigate", target: "communications" }],
  },
  "Which docs are still missing?": {
    text: "**Document Status for Active Shipment**\n\n- Commercial Invoice — Validated\n- Packing List — Validated\n- Bill of Lading — Validated\n- Certificate of Origin — Validated\n- **Importer Security Filing (ISF) — MISSING** ← Blocking\n\n**4 of 5** documents received. The ISF is the only outstanding item and is blocking the handoff gate.",
    actions: [{ label: "View Document Status", type: "navigate", target: "documents" }],
  },
  "Check OCR confidence scores": {
    text: "**OCR Confidence Scores**\n\n- Commercial Invoice: **97%** — High confidence, validated\n- Packing List: **95%** — High confidence, validated\n- Bill of Lading: **99%** — Excellent, validated\n- Certificate of Origin: **93%** — Acceptable, validated\n- ISF: **N/A** — Not received\n\nAll received documents exceed the 90% OCR confidence threshold. No quality exceptions for this shipment.",
  },
  "Why is the match rate low?": {
    text: "**Document Match Rate Analysis**\n\nFor this shipment, 4 of 4 received documents matched successfully (100% for received docs).\n\nPortfolio-wide, the 94.2% match rate gap is driven by:\n\n- **Invoice value mismatches** (largest contributor) — 28 cases, usually supplier price differences\n- **HS code discrepancies** — 11 cases, typically classification disagreements\n- **Consignee/shipper name format** — 8 cases, abbreviation vs. full legal name\n\nRecommendation: Implement a pre-submission validation rule for invoice totals against PO value tolerance of ±2%.",
  },
  "Run compliance check": {
    text: "**Lane Compliance Check — CN → US Ocean (CNSHA → USLAX)**\n\nApplicable regulations:\n- **CBP 19 CFR §149** (ISF/10+2) — ISF MISSING — NON-COMPLIANT\n- **FDA Prior Notice** — Required for this commodity? Verify with Trade Compliance\n- **CPSC Certificate** — Consumer Electronics category requires CPSC product safety certificate\n\n**Compliance Score: 60%** (ISF blocking)\n\nOnce ISF is filed, compliance score will rise to 85%. Full compliance requires CPSC certificate verification.",
    actions: [{ label: "View Lane Requirements", type: "navigate", target: "documents" }],
  },
  "Draft a follow-up email": {
    text: "**Follow-Up Email Options**\n\nBased on the current exception status, I recommend:\n\n- **Escalation-tone follow-up** to the freight forwarder (response overdue by 6+ hours)\n- **Proactive carrier notification** to Maersk booking team about potential ISF delay\n- **Internal status update** to the export coordinator with current risk assessment\n\nAll drafts are pre-written and ready for review in the Communications panel.",
    actions: [{ label: "Open Communications", type: "navigate", target: "communications" }],
  },
  "Summarize pending outreach": {
    text: "**Pending Outreach Summary**\n\n- **3 reminders sent** to Global Forwarding Co. (Sarah Chen) — no response\n- **0 carrier notifications** sent to Maersk — recommended to send proactively\n- **1 internal escalation** pending — Export Coordinator has not been notified\n\nRecommended: Send carrier notification immediately and escalate internally if no freight forwarder response within 1 hour.",
    actions: [{ label: "Review Drafts", type: "navigate", target: "communications" }],
  },
  "Who hasn't responded?": {
    text: "**Unresponsive Contacts**\n\n- **Sarah Chen** (Global Forwarding Co.) — 3 reminders sent over 12 hours, no response. Role: ISF filing responsibility.\n- **Maersk Booking Team (SHA)** — Not yet contacted. Should be notified proactively about potential ISF delay.\n\nAll other stakeholders have acknowledged or are not yet in the communication chain.",
  },
  "Escalation email templates": {
    text: "**Available Escalation Templates**\n\n- **Supplier Escalation** — Formal request for immediate document submission with penalty language\n- **Carrier Notification** — Proactive delay warning with shipment context\n- **Internal Escalation** — Management notification with impact assessment and recommended actions\n- **Customs Broker Alert** — Urgent filing request with compliance deadline\n\nEach template auto-populates with the current shipment, exception, and timeline data.",
    actions: [{ label: "Open Communications", type: "navigate", target: "communications" }],
  },
  "Summarize the timeline": {
    text: "**Timeline Summary**\n\nThis shipment has **6 recorded events** spanning the last 24 hours:\n\n- Shipment created and booking confirmed with carrier\n- 4 documents received progressively from supplier portal and carrier EDI\n- ISF filing flagged overdue — automated reminder dispatched\n- ISF exception escalated to CRITICAL — readiness score dropped\n\nThe timeline shows a healthy document intake flow that stalled on ISF filing, which is now the single blocking item.",
  },
  "Which event is most critical?": {
    text: "**Most Critical Event**\n\nThe ISF exception being raised as CRITICAL is the most significant event. This occurred when the system detected that the ISF filing window had passed without submission, triggering an automatic severity escalation.\n\nThis event directly caused:\n- Readiness score drop to 68%\n- Gate check progression to stall at \"Docs Received\"\n- Automated reminder dispatch to the freight forwarder",
  },
  "How long has this been open?": {
    text: "**Exception Age Analysis**\n\nThe ISF missing exception has been open for approximately **6 hours**.\n\n- First detected: ~12 hours after shipment creation\n- 3 automated reminders sent at 2-hour intervals\n- No manual intervention recorded yet\n- SLA threshold: 4 hours (currently **2 hours overdue**)\n\nHistorically, ISF exceptions resolved within SLA have a 95% on-time handoff rate. Exceptions exceeding SLA by 4+ hours have only a 35% on-time rate.",
  },
  "What happened first?": {
    text: "**Chronological Event Order**\n\n1. **Shipment created** — Booking confirmed with Maersk (Eindhoven 248E)\n2. **Documents received** — Invoice + Packing List via Supplier Portal\n3. **Certificate of Origin** received and validated\n4. **Bill of Lading** received from Carrier EDI\n5. **ISF filing overdue** — Automated reminder dispatched\n6. **ISF exception raised as CRITICAL** — Readiness score dropped to 68%\n\nThe first 4 events show a healthy intake flow. The problem began at event 5 when the ISF filing deadline passed.",
  },
  "Explain the match rate dip": {
    text: "**Match Rate Dip Analysis**\n\nThe match rate dropped from 95.4% to 94.2% this week, driven by:\n\n- **3 new invoice value mismatches** — All from the same supplier (Shanghai Electronics Co.) with price amendments not reflected in POs\n- **1 BOL consignee discrepancy** — War room shipment SHP-20484\n- **1 MSDS quality failure** — DG Class 3 shipment SHP-20483\n\nThe dip is temporary and concentrated in 2 shipments. Portfolio health remains strong with the automated validation improvements offsetting the new exceptions.",
  },
  "Which carrier performs best?": {
    text: "**Carrier Performance Ranking**\n\n1. **Maersk** — 96% on-time document handoff, 98% match rate, lowest exception rate\n2. **Hapag-Lloyd** — 93% on-time, 95% match rate, strong DG compliance\n3. **COSCO** — 89% on-time, 94% match rate, improving trend\n4. **CMA CGM** — 85% on-time, 91% match rate, highest exception volume\n\nMaersk leads primarily due to their EDI integration quality and consistent BOL formatting. CMA CGM's lower scores are driven by legacy document formats requiring manual OCR correction.",
  },
  "Show resolution time trends": {
    text: "**Resolution Time Trends (Last 30 Days)**\n\n- **Critical exceptions**: Average 2.8h resolution (down from 4.1h last month)\n- **High exceptions**: Average 5.2h resolution (stable)\n- **Medium exceptions**: Average 8.4h resolution (up from 7.1h — DG compliance cases)\n- **Low exceptions**: Average 12.6h resolution (stable)\n\nThe improvement in critical resolution times is driven by the new automated escalation workflow. Medium exception times increased due to complex DG Class 3 compliance requirements on 3 hazmat shipments.",
  },
  "Portfolio health summary": {
    text: "**Portfolio Health Dashboard**\n\n- **Active Shipments**: 24 (+3 vs last week)\n- **Open Exceptions**: 8 (-5 vs last week — improvement)\n- **Match Rate**: 94.2% (+1.2%)\n- **On-Time Handoff**: 87.5% (+2.1%)\n- **Avg Resolution**: 4.2h (-0.8h)\n\n**Overall Assessment**: Portfolio health is IMPROVING. Exception volume is trending down while match rate and handoff performance are trending up. The main risk factor is the war room shipment SHP-20484 which requires immediate attention.",
    actions: [{ label: "View Analytics", type: "navigate", target: "analytics" }],
  },
};

export const aiFallbackResponse: AiResponse = {
  text: "I can help you with document exceptions, shipment status, compliance checks, and resolution actions. Try one of the suggested prompts, or ask me something specific like:\n\n- \"What's blocking this shipment?\"\n- \"Draft an escalation email\"\n- \"Run compliance check\"\n- \"Prioritize my work queue\"",
};
