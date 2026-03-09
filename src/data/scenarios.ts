import type { Scenario } from './types';

// ---------------------------------------------------------------------------
// Scenario 1 -- Missing ISF (Importer Security Filing)
// ---------------------------------------------------------------------------
const scenario1: Scenario = {
  id: 'scenario-1',
  name: 'Missing ISF',
  description:
    'Importer Security Filing has not been received 18 hours before vessel cutoff. CBP compliance at risk.',
  warRoom: false,
  laneRequirements: {
    label: 'CN → US Ocean (CNSHA → USLAX)',
    regulations: ['CBP 19 CFR §149 (ISF/10+2)', 'FDA Prior Notice', 'CPSC Certificate'],
  },

  shipment: {
    id: 'SHP-20481',
    poId: 'PO-2024-8891',
    mode: 'ocean',
    origin: { city: 'Shanghai', port: 'CNSHA', country: 'CN' },
    destination: { city: 'Los Angeles', port: 'USLAX', country: 'US' },
    carrier: 'Maersk',
    vessel: 'Maersk Eindhoven',
    voyage: '248E',
    container: 'MSKU-7294810',
    cutoffHours: 18,
    cargoDescription: 'Consumer Electronics - LCD Panels',
    cargoWeight: '12,400 kg',
    status: 'on-track',
    readinessScore: 68,
  },

  documents: [
    {
      id: 'DOC-101',
      name: 'Commercial Invoice',
      fileName: 'CI_PO8891_20240315.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T08:22:00Z',
      source: 'Supplier Portal',
      ocrConfidence: 97,
    },
    {
      id: 'DOC-102',
      name: 'Packing List',
      fileName: 'PL_PO8891_20240315.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T08:22:00Z',
      source: 'Supplier Portal',
      ocrConfidence: 95,
    },
    {
      id: 'DOC-103',
      name: 'Bill of Lading',
      fileName: 'BOL_MSKU7294810.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T14:05:00Z',
      source: 'Carrier EDI',
      ocrConfidence: 99,
    },
    {
      id: 'DOC-104',
      name: 'Certificate of Origin',
      fileName: 'COO_PO8891.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T10:30:00Z',
      source: 'Email - supplier@lcdglobal.cn',
      ocrConfidence: 93,
    },
    {
      id: 'DOC-105',
      name: 'Importer Security Filing (ISF)',
      status: 'missing',
      remindersSent: 3,
      lastReminderAt: '2024-03-15T06:00:00Z',
    },
  ],

  matchingSummary: {
    totalRequired: 5,
    received: 4,
    matched: 4,
    exceptionsDetected: 1,
    blockingIssues: 1,
  },

  exceptions: [
    {
      id: 'EXC-001',
      type: 'missing-doc',
      severity: 'critical',
      status: 'open',
      blocking: true,
      documentName: 'Importer Security Filing (ISF)',
      owner: 'Sarah Chen',
      ownerRole: 'Export Coordinator - Global Forwarding Co.',
      ageHours: 6,
      dueInHours: 18,
      slaHours: 24,
      summary:
        'ISF has not been filed for shipment SHP-20481. CBP requires ISF filing at least 24 hours before vessel loading. Current cutoff is 18 hours away.',
      impact:
        'Vessel will sail without cargo if ISF is not filed before cutoff. Potential CBP hold and $5,000 penalty per violation. Shipment delay of 7-10 days to next sailing.',
      aiAssessment:
        'Based on historical patterns, Global Forwarding Co. files ISF an average of 28 hours before cutoff. This is 10 hours overdue from their typical filing window. Recommended action: immediate escalation to Sarah Chen with carrier deadline. If no response within 2 hours, escalate to operations manager. Risk of missing cutoff: 65% if no action taken in the next 4 hours.',
      resolutionActions: [
        {
          id: 'ACT-001',
          label: 'Email Freight Forwarder',
          description: 'Send urgent ISF filing reminder to Global Forwarding Co.',
          target: 'sarah.chen@globalforwarding.com',
          type: 'email',
        },
        {
          id: 'ACT-002',
          label: 'Notify Carrier',
          description: 'Alert Maersk booking team about potential ISF delay',
          target: 'bookings.sha@maersk.com',
          type: 'email',
        },
        {
          id: 'ACT-003',
          label: 'Escalate to Manager',
          description: 'Escalate to Operations Manager if no response in 2 hours',
          target: 'David Park - VP Operations',
          type: 'escalation',
        },
        {
          id: 'ACT-004',
          label: 'Log Internal Note',
          description: 'Record exception in shipment audit trail',
          target: 'Internal System',
          type: 'internal',
        },
      ],
      emailDrafts: [
        {
          to: 'sarah.chen@globalforwarding.com',
          cc: 'ops.team@globalforwarding.com',
          subject:
            'URGENT: ISF Filing Required - SHP-20481 / MSKU-7294810 / Maersk Eindhoven 248E',
          body: `Dear Sarah,

This is an urgent reminder regarding the Importer Security Filing (ISF) for the following shipment:

Shipment: SHP-20481
PO: PO-2024-8891
Container: MSKU-7294810
Vessel: Maersk Eindhoven / Voyage 248E
Origin: Shanghai (CNSHA)
Destination: Los Angeles (USLAX)
Cargo: Consumer Electronics - LCD Panels (12,400 kg)

The ISF has not yet been received and the vessel cutoff is in approximately 18 hours. CBP requires ISF filing at least 24 hours prior to loading. We are now past the recommended filing window.

Please confirm:
1. The expected filing time for the ISF
2. Whether all 10+2 data elements are available
3. If there are any data issues preventing filing

Failure to file before cutoff will result in the cargo being rolled to the next available sailing (est. 7-10 day delay) and potential CBP penalties.

Please treat this as highest priority.

Best regards,
Documentation Control Team`,
          tab: 'Freight Forwarder',
        },
        {
          to: 'bookings.sha@maersk.com',
          cc: 'customer.service@maersk.com',
          subject:
            'ISF Filing Status Update - BKG-448291 / MSKU-7294810 / Eindhoven 248E',
          body: `Dear Maersk Booking Team,

We are writing to advise that the ISF filing for the below booking is currently pending:

Booking: BKG-448291
Container: MSKU-7294810
Vessel: Maersk Eindhoven / Voyage 248E
Shipper: LCD Global Manufacturing Co.
Consignee: TechRetail Inc.

We are actively following up with our customs broker and expect the filing to be completed within the next 4-6 hours. We wanted to flag this proactively in case any accommodations can be made regarding the documentation cutoff.

We will provide an update as soon as the ISF has been transmitted to CBP.

Thank you for your understanding.

Best regards,
Documentation Control Team`,
          tab: 'Carrier',
        },
      ],
      timeline: [
        {
          id: 'TL-001',
          timestamp: '2024-03-14T06:00:00Z',
          description: 'Booking confirmed - Maersk Eindhoven 248E. Document checklist generated.',
          type: 'system',
        },
        {
          id: 'TL-002',
          timestamp: '2024-03-14T08:22:00Z',
          description: 'Commercial Invoice and Packing List received from supplier portal. OCR validation passed.',
          type: 'positive',
        },
        {
          id: 'TL-003',
          timestamp: '2024-03-14T10:30:00Z',
          description: 'Certificate of Origin received via email. Matched to PO-2024-8891.',
          type: 'positive',
        },
        {
          id: 'TL-004',
          timestamp: '2024-03-14T12:00:00Z',
          description: 'ISF filing window opened. Expected filing from Global Forwarding Co.',
          type: 'info',
        },
        {
          id: 'TL-005',
          timestamp: '2024-03-14T14:05:00Z',
          description: 'Bill of Lading received via Carrier EDI. Validated against booking.',
          type: 'positive',
        },
        {
          id: 'TL-006',
          timestamp: '2024-03-14T16:00:00Z',
          description: 'ISF not yet received. Automated reminder sent to Global Forwarding Co.',
          type: 'warning',
        },
        {
          id: 'TL-007',
          timestamp: '2024-03-14T18:00:00Z',
          description: 'ISF still outstanding. Exception raised - severity: CRITICAL. 18 hours to cutoff.',
          type: 'critical',
        },
      ],
    },
  ],

  globalTimeline: [
    {
      id: 'GTL-001',
      timestamp: '2024-03-14T06:00:00Z',
      description: 'Shipment SHP-20481 created. Booking confirmed with Maersk.',
      type: 'system',
    },
    {
      id: 'GTL-002',
      timestamp: '2024-03-14T08:22:00Z',
      description: '2 documents received from supplier portal (Invoice, Packing List).',
      type: 'positive',
    },
    {
      id: 'GTL-003',
      timestamp: '2024-03-14T10:30:00Z',
      description: 'Certificate of Origin received. 3 of 5 documents validated.',
      type: 'positive',
    },
    {
      id: 'GTL-004',
      timestamp: '2024-03-14T14:05:00Z',
      description: 'Bill of Lading received. 4 of 5 documents validated.',
      type: 'positive',
    },
    {
      id: 'GTL-005',
      timestamp: '2024-03-14T16:00:00Z',
      description: 'ISF filing overdue. Automated reminder dispatched.',
      type: 'warning',
    },
    {
      id: 'GTL-006',
      timestamp: '2024-03-14T18:00:00Z',
      description: 'ISF exception raised as CRITICAL. Readiness score dropped to 68%.',
      type: 'critical',
    },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 2 -- Value / Weight Mismatch on Commercial Invoice
// ---------------------------------------------------------------------------
const scenario2: Scenario = {
  id: 'scenario-2',
  name: 'Invoice Value & Weight Mismatch',
  description:
    'Commercial Invoice values do not match the Purchase Order. Declared value and gross weight both deviate beyond tolerance.',
  warRoom: false,
  laneRequirements: {
    label: 'CN → US Ocean (CNSZX → USLGB)',
    regulations: ['CBP 19 CFR §149 (ISF/10+2)', 'Anti-Dumping Duty Order (A-570-967)', 'CPSC Certificate'],
  },

  shipment: {
    id: 'SHP-20482',
    poId: 'PO-2024-7763',
    mode: 'ocean',
    origin: { city: 'Shenzhen', port: 'CNSZX', country: 'CN' },
    destination: { city: 'Long Beach', port: 'USLGB', country: 'US' },
    carrier: 'COSCO',
    vessel: 'COSCO Shipping Rose',
    voyage: '038W',
    container: 'CSLU-6182940',
    cutoffHours: 36,
    cargoDescription: 'Industrial Valves & Fittings - Stainless Steel',
    cargoWeight: '8,750 kg',
    status: 'on-track',
    readinessScore: 55,
  },

  documents: [
    {
      id: 'DOC-201',
      name: 'Commercial Invoice',
      fileName: 'CI_PO7763_20240318.pdf',
      status: 'mismatch',
      receivedAt: '2024-03-17T09:15:00Z',
      source: 'Email - export@zhengda-valves.cn',
      ocrConfidence: 96,
    },
    {
      id: 'DOC-202',
      name: 'Packing List',
      fileName: 'PL_PO7763_20240318.pdf',
      status: 'mismatch',
      receivedAt: '2024-03-17T09:15:00Z',
      source: 'Email - export@zhengda-valves.cn',
      ocrConfidence: 94,
    },
    {
      id: 'DOC-203',
      name: 'Bill of Lading',
      fileName: 'BOL_CSLU6182940.pdf',
      status: 'validated',
      receivedAt: '2024-03-17T16:40:00Z',
      source: 'Carrier EDI',
      ocrConfidence: 98,
    },
    {
      id: 'DOC-204',
      name: 'Certificate of Origin',
      fileName: 'COO_PO7763.pdf',
      status: 'validated',
      receivedAt: '2024-03-17T11:00:00Z',
      source: 'Email - export@zhengda-valves.cn',
      ocrConfidence: 91,
    },
    {
      id: 'DOC-205',
      name: 'Importer Security Filing (ISF)',
      fileName: 'ISF_SHP20482.pdf',
      status: 'validated',
      receivedAt: '2024-03-17T13:30:00Z',
      source: 'Kuehne+Nagel Portal',
      ocrConfidence: 99,
    },
  ],

  matchingSummary: {
    totalRequired: 5,
    received: 5,
    matched: 3,
    exceptionsDetected: 2,
    blockingIssues: 0,
  },

  exceptions: [
    {
      id: 'EXC-002',
      type: 'mismatch',
      severity: 'high',
      status: 'in-review',
      blocking: false,
      documentName: 'Commercial Invoice',
      owner: 'James Liu',
      ownerRole: 'Trade Compliance Analyst',
      ageHours: 8,
      dueInHours: 36,
      slaHours: 48,
      summary:
        'Commercial Invoice total value ($48,000.00 USD) does not match PO value ($52,000.00 USD). Variance of $4,000 (7.7%) exceeds the 2% tolerance threshold.',
      impact:
        'Customs entry will be filed with incorrect value, risking CBP audit and potential duty underpayment penalty. Letter of Credit payment may be rejected by issuing bank if invoice does not match LC terms.',
      aiAssessment:
        'The $4,000 variance likely stems from a pricing amendment on line items 3-5 (Gate Valves DN100) that was negotiated after PO issuance but not reflected in the system. Zhengda Valves has a history of issuing invoices against amended pricing without formal PO revision. Recommended: confirm with procurement whether a PO amendment was approved, then request a revised invoice or update the PO accordingly.',
      comparisonFields: [
        {
          field: 'Invoice Number',
          documentValue: 'ZDV-2024-03188',
          systemValue: 'ZDV-2024-03188',
          match: true,
        },
        {
          field: 'PO Reference',
          documentValue: 'PO-2024-7763',
          systemValue: 'PO-2024-7763',
          match: true,
        },
        {
          field: 'Total Value (USD)',
          documentValue: '$48,000.00',
          systemValue: '$52,000.00',
          match: false,
        },
        {
          field: 'Currency',
          documentValue: 'USD',
          systemValue: 'USD',
          match: true,
        },
        {
          field: 'Incoterms',
          documentValue: 'FOB Shenzhen',
          systemValue: 'FOB Shenzhen',
          match: true,
        },
        {
          field: 'Payment Terms',
          documentValue: 'L/C at Sight',
          systemValue: 'L/C at Sight',
          match: true,
        },
        {
          field: 'Line Item Count',
          documentValue: '12',
          systemValue: '12',
          match: true,
        },
        {
          field: 'HS Code (Primary)',
          documentValue: '8481.80.5090',
          systemValue: '8481.80.5090',
          match: true,
        },
      ],
      resolutionActions: [
        {
          id: 'ACT-010',
          label: 'Request Revised Invoice',
          description: 'Ask supplier to issue corrected Commercial Invoice matching PO value',
          target: 'export@zhengda-valves.cn',
          type: 'email',
        },
        {
          id: 'ACT-011',
          label: 'Confirm with Procurement',
          description: 'Check if PO amendment was approved for the price difference',
          target: 'Maria Santos - Procurement Manager',
          type: 'internal',
        },
        {
          id: 'ACT-012',
          label: 'Accept with Override',
          description: 'Accept the invoice value and update PO (requires manager approval)',
          target: 'David Park - VP Operations',
          type: 'override',
        },
        {
          id: 'ACT-013',
          label: 'Notify Customs Broker',
          description: 'Alert Kuehne+Nagel about value discrepancy before entry filing',
          target: 'customs.us@kuehne-nagel.com',
          type: 'email',
        },
      ],
      emailDrafts: [
        {
          to: 'export@zhengda-valves.cn',
          cc: 'james.liu@company.com; procurement@company.com',
          subject:
            'Invoice Value Discrepancy - CI# ZDV-2024-03188 / PO-2024-7763 / SHP-20482',
          body: `Dear Zhengda Valves Export Team,

We have received Commercial Invoice ZDV-2024-03188 for PO-2024-7763 and have identified a value discrepancy:

Invoice Total: $48,000.00 USD
PO Total: $52,000.00 USD
Variance: -$4,000.00 (7.7%)

Our records show the PO was issued at $52,000.00 USD. The invoice amount of $48,000.00 falls outside our acceptable tolerance of 2%.

Could you please clarify:
1. Whether this reflects an agreed price amendment
2. If a revised invoice can be issued to match the PO value
3. Which line items were affected by the price change

We need to resolve this within 24 hours to avoid delays in customs clearance at Long Beach. The vessel cutoff is in approximately 36 hours.

Shipment Details:
- Shipment: SHP-20482
- Container: CSLU-6182940
- Vessel: COSCO Shipping Rose / 038W
- Cargo: Industrial Valves & Fittings

Please respond at your earliest convenience.

Best regards,
Trade Compliance Team`,
          tab: 'Supplier',
        },
        {
          to: 'customs.us@kuehne-nagel.com',
          cc: 'james.liu@company.com',
          subject:
            'HOLD: Value Discrepancy on Entry Filing - SHP-20482 / CSLU-6182940',
          body: `Dear Kuehne+Nagel Customs Team,

Please hold the customs entry filing for the following shipment pending resolution of a value discrepancy:

Shipment: SHP-20482
Container: CSLU-6182940
Vessel: COSCO Shipping Rose / Voyage 038W
Port of Entry: Long Beach (USLGB)

The Commercial Invoice reflects $48,000.00 USD, while the PO value is $52,000.00 USD. We are currently confirming with the supplier whether this reflects an approved price amendment.

We expect to have clarification within 12-18 hours. Please do not file the entry until we provide an updated invoice or written confirmation to proceed with the current values.

We will keep you updated on the resolution timeline.

Best regards,
Trade Compliance Team`,
          tab: 'Customs Broker',
        },
      ],
      timeline: [
        {
          id: 'TL-020',
          timestamp: '2024-03-17T09:15:00Z',
          description: 'Commercial Invoice received from supplier via email.',
          type: 'system',
        },
        {
          id: 'TL-021',
          timestamp: '2024-03-17T09:16:00Z',
          description: 'OCR extraction completed. Confidence: 96%.',
          type: 'system',
        },
        {
          id: 'TL-022',
          timestamp: '2024-03-17T09:17:00Z',
          description: 'Value mismatch detected: Invoice $48,000 vs PO $52,000 (7.7% variance). Exceeds 2% tolerance.',
          type: 'warning',
        },
        {
          id: 'TL-023',
          timestamp: '2024-03-17T09:30:00Z',
          description: 'Exception EXC-002 created. Assigned to James Liu (Trade Compliance).',
          type: 'system',
        },
        {
          id: 'TL-024',
          timestamp: '2024-03-17T10:45:00Z',
          description: 'James Liu opened case. Status changed to IN-REVIEW.',
          type: 'info',
        },
        {
          id: 'TL-025',
          timestamp: '2024-03-17T14:00:00Z',
          description: 'Internal note: Procurement team checking for PO amendment history.',
          type: 'info',
        },
      ],
    },
    {
      id: 'EXC-005',
      type: 'mismatch',
      severity: 'high',
      status: 'in-review',
      blocking: false,
      documentName: 'Packing List',
      owner: 'James Liu',
      ownerRole: 'Trade Compliance Analyst',
      ageHours: 8,
      dueInHours: 36,
      slaHours: 48,
      summary:
        'Packing List gross weight (8,200 kg) does not match PO specification (8,750 kg). Variance of 550 kg (6.3%) exceeds the 3% tolerance threshold.',
      impact:
        'Incorrect weight declaration may cause issues with container weight verification (VGM) and could trigger inspection at destination port. Freight charges may also be affected.',
      aiAssessment:
        'The weight discrepancy of 550 kg suggests possible short-shipment of 1-2 pallets or a packing configuration change. Cross-referencing with the invoice line items, all 12 SKUs are listed on the packing list. The per-unit weight for Gate Valves DN100 (lines 3-5) appears lower than specification. Recommended: request updated packing list with individual carton weights and verify against VGM declaration.',
      comparisonFields: [
        {
          field: 'Packing List Number',
          documentValue: 'ZDV-PL-03188',
          systemValue: 'ZDV-PL-03188',
          match: true,
        },
        {
          field: 'PO Reference',
          documentValue: 'PO-2024-7763',
          systemValue: 'PO-2024-7763',
          match: true,
        },
        {
          field: 'Gross Weight (kg)',
          documentValue: '8,200',
          systemValue: '8,750',
          match: false,
        },
        {
          field: 'Net Weight (kg)',
          documentValue: '7,400',
          systemValue: '7,900',
          match: false,
        },
        {
          field: 'Total Packages',
          documentValue: '48 cartons / 12 pallets',
          systemValue: '48 cartons / 12 pallets',
          match: true,
        },
        {
          field: 'Total Volume (CBM)',
          documentValue: '18.6',
          systemValue: '19.2',
          match: false,
        },
        {
          field: 'Container',
          documentValue: 'CSLU-6182940',
          systemValue: 'CSLU-6182940',
          match: true,
        },
      ],
      resolutionActions: [
        {
          id: 'ACT-014',
          label: 'Request Updated Packing List',
          description: 'Ask supplier for revised packing list with verified weights',
          target: 'export@zhengda-valves.cn',
          type: 'email',
        },
        {
          id: 'ACT-015',
          label: 'Verify VGM Declaration',
          description: 'Cross-check against Verified Gross Mass declaration from terminal',
          target: 'Internal System',
          type: 'internal',
        },
        {
          id: 'ACT-016',
          label: 'Accept with Override',
          description: 'Accept weight variance and update system records (requires manager approval)',
          target: 'David Park - VP Operations',
          type: 'override',
        },
      ],
      emailDrafts: [
        {
          to: 'export@zhengda-valves.cn',
          cc: 'james.liu@company.com',
          subject:
            'Weight Discrepancy - PL# ZDV-PL-03188 / PO-2024-7763 / SHP-20482',
          body: `Dear Zhengda Valves Export Team,

In addition to the invoice query, we have also identified a weight discrepancy on the Packing List:

Packing List Gross Weight: 8,200 kg
PO Expected Gross Weight: 8,750 kg
Variance: -550 kg (6.3%)

Could you please:
1. Confirm the actual gross weight of the shipment
2. Provide individual carton weights if available
3. Confirm whether all items on PO-2024-7763 have been packed

This information is also needed for VGM verification at the terminal.

Shipment: SHP-20482
Container: CSLU-6182940

Thank you.

Best regards,
Trade Compliance Team`,
          tab: 'Supplier',
        },
      ],
      timeline: [
        {
          id: 'TL-030',
          timestamp: '2024-03-17T09:15:00Z',
          description: 'Packing List received from supplier via email.',
          type: 'system',
        },
        {
          id: 'TL-031',
          timestamp: '2024-03-17T09:17:00Z',
          description: 'Weight mismatch detected: PL 8,200 kg vs PO 8,750 kg (6.3% variance). Exceeds 3% tolerance.',
          type: 'warning',
        },
        {
          id: 'TL-032',
          timestamp: '2024-03-17T09:30:00Z',
          description: 'Exception EXC-005 created. Assigned to James Liu (Trade Compliance).',
          type: 'system',
        },
        {
          id: 'TL-033',
          timestamp: '2024-03-17T10:45:00Z',
          description: 'James Liu reviewing alongside EXC-002 (value mismatch). Status: IN-REVIEW.',
          type: 'info',
        },
      ],
    },
  ],

  globalTimeline: [
    {
      id: 'GTL-010',
      timestamp: '2024-03-17T06:00:00Z',
      description: 'Shipment SHP-20482 created. Booking confirmed with COSCO.',
      type: 'system',
    },
    {
      id: 'GTL-011',
      timestamp: '2024-03-17T09:15:00Z',
      description: 'Invoice and Packing List received. 2 mismatches detected during OCR validation.',
      type: 'warning',
    },
    {
      id: 'GTL-012',
      timestamp: '2024-03-17T09:30:00Z',
      description: '2 exceptions created: EXC-002 (value), EXC-005 (weight). Assigned to James Liu.',
      type: 'warning',
    },
    {
      id: 'GTL-013',
      timestamp: '2024-03-17T11:00:00Z',
      description: 'Certificate of Origin received and validated.',
      type: 'positive',
    },
    {
      id: 'GTL-014',
      timestamp: '2024-03-17T13:30:00Z',
      description: 'ISF filed by Kuehne+Nagel. Validated against booking.',
      type: 'positive',
    },
    {
      id: 'GTL-015',
      timestamp: '2024-03-17T16:40:00Z',
      description: 'Bill of Lading received from COSCO EDI. All docs received, 2 exceptions pending.',
      type: 'info',
    },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 3 -- Unreadable MSDS (Hazmat Shipment)
// ---------------------------------------------------------------------------
const scenario3: Scenario = {
  id: 'scenario-3',
  name: 'Unreadable MSDS - Hazmat Cargo',
  description:
    'Material Safety Data Sheet scan is unreadable. OCR confidence at 42%. Hazmat documentation is mandatory for port acceptance.',
  warRoom: false,
  laneRequirements: {
    label: 'NL → US Ocean (NLRTM → USHOU)',
    regulations: ['IMDG Code (DG Class 3)', 'REACH Regulation (EC 1907/2006)', '49 CFR §172 (US DOT Hazmat)', 'TSCA Import Certification'],
  },
  hazmat: {
    dgClass: 'Class 3 — Flammable Liquids',
    unNumber: 'UN 1993',
    properShippingName: 'Flammable Liquid, N.O.S. (Isopropanol, Methanol)',
  },

  shipment: {
    id: 'SHP-20483',
    poId: 'PO-2024-9102',
    mode: 'ocean',
    origin: { city: 'Rotterdam', port: 'NLRTM', country: 'NL' },
    destination: { city: 'Houston', port: 'USHOU', country: 'US' },
    carrier: 'Hapag-Lloyd',
    vessel: 'Osaka Express',
    voyage: '112S',
    container: 'HLXU-3019574',
    cutoffHours: 48,
    cargoDescription: 'Industrial Solvents & Cleaning Agents (DG Class 3)',
    cargoWeight: '6,200 kg',
    status: 'on-track',
    readinessScore: 72,
  },

  documents: [
    {
      id: 'DOC-301',
      name: 'Commercial Invoice',
      fileName: 'CI_PO9102_20240320.pdf',
      status: 'validated',
      receivedAt: '2024-03-19T07:45:00Z',
      source: 'Supplier Portal',
      ocrConfidence: 97,
    },
    {
      id: 'DOC-302',
      name: 'Packing List',
      fileName: 'PL_PO9102_20240320.pdf',
      status: 'validated',
      receivedAt: '2024-03-19T07:45:00Z',
      source: 'Supplier Portal',
      ocrConfidence: 95,
    },
    {
      id: 'DOC-303',
      name: 'Bill of Lading',
      fileName: 'BOL_HLXU3019574.pdf',
      status: 'validated',
      receivedAt: '2024-03-19T15:20:00Z',
      source: 'Carrier EDI',
      ocrConfidence: 99,
    },
    {
      id: 'DOC-304',
      name: 'Material Safety Data Sheet (MSDS)',
      fileName: 'MSDS_PO9102_scan.pdf',
      status: 'unreadable',
      receivedAt: '2024-03-19T10:10:00Z',
      source: 'Email - logistics@eurochemsupply.nl',
      ocrConfidence: 42,
      qualityIssues: [
        'Sections 2-4 heavily blurred - chemical composition unreadable',
        'Page 3 of 6 missing from scan',
        'Emergency contact and signature block cropped at bottom',
      ],
      dgClassification: 'DG Class 3',
      remindersSent: 1,
      lastReminderAt: '2024-03-19T16:00:00Z',
    },
    {
      id: 'DOC-305',
      name: 'Dangerous Goods Declaration (IMO)',
      fileName: 'DGD_HLXU3019574.pdf',
      status: 'pending',
      receivedAt: '2024-03-19T10:10:00Z',
      source: 'Email - logistics@eurochemsupply.nl',
      ocrConfidence: 88,
      dgClassification: 'DG Class 3',
    },
    {
      id: 'DOC-306',
      name: 'Importer Security Filing (ISF)',
      fileName: 'ISF_SHP20483.pdf',
      status: 'validated',
      receivedAt: '2024-03-19T12:00:00Z',
      source: 'DB Schenker Portal',
      ocrConfidence: 99,
    },
  ],

  matchingSummary: {
    totalRequired: 6,
    received: 5,
    matched: 4,
    exceptionsDetected: 1,
    blockingIssues: 1,
  },

  exceptions: [
    {
      id: 'EXC-003',
      type: 'quality',
      severity: 'medium',
      status: 'waiting',
      blocking: true,
      documentName: 'Material Safety Data Sheet (MSDS)',
      owner: 'Anna de Vries',
      ownerRole: 'EHS Compliance Coordinator - EuroChem Supply BV',
      ageHours: 10,
      dueInHours: 48,
      slaHours: 72,
      summary:
        'The MSDS scan for DG Class 3 solvents has critical quality issues. OCR confidence is 42%, well below the 85% minimum threshold. Chemical composition sections are unreadable, one page is missing, and the emergency contact block is cropped.',
      impact:
        'Hapag-Lloyd will reject the DG booking without a legible MSDS. Port of Rotterdam requires complete MSDS for all Class 3 cargo prior to gate-in. The DG Declaration cannot be validated without readable MSDS data. Shipment will be blocked from loading.',
      aiAssessment:
        'The scan quality suggests the document was photographed rather than scanned using a flatbed scanner. The missing page (3 of 6) likely contains the physical/chemical properties and stability data required for DG classification. Without this data, the IMO DG Declaration cannot be cross-verified. Recommended: request a clean digital copy (not a re-scan) from the chemical manufacturer. Most EU chemical suppliers maintain MSDS in digital format per REACH regulation. Resolution probability is high if the supplier provides the original PDF.',
      ocrConfidence: 42,
      qualityIssues: [
        'Sections 2-4 heavily blurred - chemical composition unreadable',
        'Page 3 of 6 missing from scan',
        'Emergency contact and signature block cropped at bottom of page 6',
        'Overall image resolution below 150 DPI (minimum 300 DPI required)',
        'Skewed scan angle causing text line distortion',
      ],
      resolutionActions: [
        {
          id: 'ACT-020',
          label: 'Request Clean MSDS',
          description: 'Request original digital MSDS from EuroChem Supply BV',
          target: 'logistics@eurochemsupply.nl',
          type: 'email',
        },
        {
          id: 'ACT-021',
          label: 'Contact Manufacturer',
          description: 'Request MSDS directly from chemical manufacturer if supplier cannot provide',
          target: 'msds@basf.com',
          type: 'email',
        },
        {
          id: 'ACT-022',
          label: 'Notify DG Desk',
          description: 'Alert Hapag-Lloyd DG desk about documentation delay',
          target: 'dg.booking@hapag-lloyd.com',
          type: 'email',
        },
        {
          id: 'ACT-023',
          label: 'Escalate to EHS Manager',
          description: 'Escalate if clean copy not received within 12 hours',
          target: 'Robert Jansen - EHS Manager',
          type: 'escalation',
        },
      ],
      emailDrafts: [
        {
          to: 'logistics@eurochemsupply.nl',
          cc: 'anna.devries@eurochemsupply.nl; dg.compliance@company.com',
          subject:
            'RESEND REQUIRED: MSDS Unreadable - PO-2024-9102 / SHP-20483 / DG Class 3',
          body: `Dear EuroChem Supply Logistics Team,

We have received the Material Safety Data Sheet for PO-2024-9102, however the scan quality is insufficient for regulatory compliance:

Issues Identified:
- Sections 2-4 (Chemical Composition) are heavily blurred and unreadable
- Page 3 of 6 is missing entirely from the scan
- Emergency contact and signature block on page 6 is cropped
- Overall scan resolution is below the required 300 DPI

Shipment Details:
- Shipment: SHP-20483
- PO: PO-2024-9102
- Container: HLXU-3019574
- Vessel: Osaka Express / Voyage 112S
- Cargo: Industrial Solvents & Cleaning Agents (DG Class 3)
- Port of Loading: Rotterdam (NLRTM)
- Cutoff: 48 hours

As this is Dangerous Goods Class 3 cargo, a complete and legible MSDS is mandatory for:
1. Hapag-Lloyd DG booking confirmation
2. Rotterdam port gate-in authorization
3. IMO DG Declaration validation

Please provide the ORIGINAL DIGITAL PDF of the MSDS (not a re-scan). Under REACH regulation, digital copies should be available from the manufacturer.

This is time-sensitive - we need the document within 12 hours to meet the vessel cutoff.

Best regards,
Documentation Control Team`,
          tab: 'Supplier',
        },
        {
          to: 'dg.booking@hapag-lloyd.com',
          cc: 'bookings.rtm@hapag-lloyd.com',
          subject:
            'DG Documentation Update - BKG-HL-90281 / HLXU-3019574 / Osaka Express 112S',
          body: `Dear Hapag-Lloyd DG Desk,

We are writing regarding the DG booking for the following shipment:

Booking: BKG-HL-90281
Container: HLXU-3019574
Vessel: Osaka Express / Voyage 112S
Cargo: Industrial Solvents (UN 1993, Class 3, PG III)
Weight: 6,200 kg

The MSDS received from our supplier has quality issues and we have requested a replacement copy. We expect to receive a clean digital version within 12 hours.

The DG Declaration has been prepared and will be submitted as soon as we can validate it against the corrected MSDS.

Could you please confirm the latest acceptable submission time for DG documentation on this voyage?

Thank you for your patience.

Best regards,
Documentation Control Team`,
          tab: 'Carrier DG Desk',
        },
      ],
      timeline: [
        {
          id: 'TL-040',
          timestamp: '2024-03-19T07:45:00Z',
          description: 'Commercial Invoice and Packing List received from supplier portal. Validated.',
          type: 'positive',
        },
        {
          id: 'TL-041',
          timestamp: '2024-03-19T10:10:00Z',
          description: 'MSDS and DG Declaration received via email from EuroChem Supply.',
          type: 'system',
        },
        {
          id: 'TL-042',
          timestamp: '2024-03-19T10:11:00Z',
          description: 'OCR processing failed on MSDS. Confidence: 42%. Multiple quality issues detected.',
          type: 'critical',
        },
        {
          id: 'TL-043',
          timestamp: '2024-03-19T10:15:00Z',
          description: 'Exception EXC-003 created. MSDS flagged as UNREADABLE. Blocking issue for DG cargo.',
          type: 'warning',
        },
        {
          id: 'TL-044',
          timestamp: '2024-03-19T10:30:00Z',
          description: 'Automated request for clean MSDS copy sent to EuroChem Supply.',
          type: 'system',
        },
        {
          id: 'TL-045',
          timestamp: '2024-03-19T12:00:00Z',
          description: 'ISF filed by DB Schenker. Validated successfully.',
          type: 'positive',
        },
        {
          id: 'TL-046',
          timestamp: '2024-03-19T15:20:00Z',
          description: 'Bill of Lading received from Hapag-Lloyd EDI. Validated.',
          type: 'positive',
        },
        {
          id: 'TL-047',
          timestamp: '2024-03-19T18:00:00Z',
          description: 'No response from supplier on MSDS resend. Status: WAITING. 10 hours elapsed.',
          type: 'warning',
        },
      ],
    },
  ],

  globalTimeline: [
    {
      id: 'GTL-020',
      timestamp: '2024-03-19T06:00:00Z',
      description: 'Shipment SHP-20483 created. DG booking confirmed with Hapag-Lloyd.',
      type: 'system',
    },
    {
      id: 'GTL-021',
      timestamp: '2024-03-19T07:45:00Z',
      description: 'Invoice and Packing List received and validated.',
      type: 'positive',
    },
    {
      id: 'GTL-022',
      timestamp: '2024-03-19T10:10:00Z',
      description: 'MSDS received but flagged UNREADABLE (OCR 42%). DG Declaration on hold.',
      type: 'critical',
    },
    {
      id: 'GTL-023',
      timestamp: '2024-03-19T10:30:00Z',
      description: 'Clean MSDS copy requested from supplier. Exception EXC-003 active.',
      type: 'warning',
    },
    {
      id: 'GTL-024',
      timestamp: '2024-03-19T12:00:00Z',
      description: 'ISF validated. 4 of 6 documents clear.',
      type: 'positive',
    },
    {
      id: 'GTL-025',
      timestamp: '2024-03-19T15:20:00Z',
      description: 'Bill of Lading received. Awaiting clean MSDS to complete doc set.',
      type: 'info',
    },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 4 -- Cutoff Risk Escalation (War Room)
// ---------------------------------------------------------------------------
const scenario4: Scenario = {
  id: 'scenario-4',
  name: 'Cutoff Risk Escalation',
  description:
    'Shipment SHP-20481 has escalated to critical status. ISF remains unfiled after 12 hours of chase. BOL version conflict discovered. 4 hours to cutoff. War room activated.',
  warRoom: true,
  laneRequirements: {
    label: 'CN → US Ocean (CNSHA → USLAX)',
    regulations: ['CBP 19 CFR §149 (ISF/10+2)', 'FDA Prior Notice', 'CPSC Certificate'],
  },

  shipment: {
    id: 'SHP-20481',
    poId: 'PO-2024-8891',
    mode: 'ocean',
    origin: { city: 'Shanghai', port: 'CNSHA', country: 'CN' },
    destination: { city: 'Los Angeles', port: 'USLAX', country: 'US' },
    carrier: 'Maersk',
    vessel: 'Maersk Eindhoven',
    voyage: '248E',
    container: 'MSKU-7294810',
    cutoffHours: 4,
    cargoDescription: 'Consumer Electronics - LCD Panels',
    cargoWeight: '12,400 kg',
    status: 'at-risk',
    readinessScore: 38,
  },

  documents: [
    {
      id: 'DOC-401',
      name: 'Commercial Invoice',
      fileName: 'CI_PO8891_20240315.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T08:22:00Z',
      source: 'Supplier Portal',
      ocrConfidence: 97,
    },
    {
      id: 'DOC-402',
      name: 'Packing List',
      fileName: 'PL_PO8891_20240315.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T08:22:00Z',
      source: 'Supplier Portal',
      ocrConfidence: 95,
    },
    {
      id: 'DOC-403',
      name: 'Bill of Lading',
      fileName: 'BOL_MSKU7294810_v2.pdf',
      status: 'mismatch',
      receivedAt: '2024-03-14T14:05:00Z',
      source: 'Carrier EDI',
      ocrConfidence: 99,
    },
    {
      id: 'DOC-404',
      name: 'Certificate of Origin',
      fileName: 'COO_PO8891.pdf',
      status: 'validated',
      receivedAt: '2024-03-14T10:30:00Z',
      source: 'Email - supplier@lcdglobal.cn',
      ocrConfidence: 93,
    },
    {
      id: 'DOC-405',
      name: 'Importer Security Filing (ISF)',
      status: 'missing',
      remindersSent: 4,
      lastReminderAt: '2024-03-15T12:00:00Z',
    },
  ],

  matchingSummary: {
    totalRequired: 5,
    received: 4,
    matched: 3,
    exceptionsDetected: 2,
    blockingIssues: 2,
  },

  exceptions: [
    {
      id: 'EXC-001-ESC',
      type: 'cutoff-risk',
      severity: 'critical',
      status: 'escalated',
      blocking: true,
      documentName: 'Importer Security Filing (ISF)',
      owner: 'David Park',
      ownerRole: 'VP Operations (Escalated from Sarah Chen)',
      ageHours: 18,
      dueInHours: 4,
      slaHours: 24,
      summary:
        'ISF remains unfiled after 18 hours. Original owner Sarah Chen (Global Forwarding Co.) has been unresponsive for the last 6 hours. Auto-escalated to VP Operations. Vessel cutoff in 4 hours. CBP filing deadline has passed.',
      impact:
        'IMMEDIATE: Cargo will be rolled to next sailing (March 22, 7-day delay). Customer TechRetail Inc. has confirmed this will cause stockout at 3 distribution centers. Estimated revenue impact: $180,000. Maersk late-filing penalty: $5,000. Potential CBP enforcement action.',
      aiAssessment:
        'This exception has been unresolved for 18 hours across 4 chase attempts. Global Forwarding Co. response rate on similar urgency cases is typically within 2 hours. The extended non-response suggests a possible internal issue at the forwarder (staff absence, system outage). Recommended immediate actions: (1) Contact Global Forwarding Co. operations desk directly by phone, (2) Engage backup customs broker Flexport as contingency, (3) Request Maersk for 2-hour cutoff extension citing documentation delay. Historical data shows Maersk grants extensions in 40% of similar requests when filed 4+ hours before cutoff.',
      resolutionActions: [
        {
          id: 'ACT-030',
          label: 'Final Notice to Forwarder',
          description: 'Send final escalation notice to Global Forwarding Co. management',
          target: 'ops.director@globalforwarding.com',
          type: 'email',
        },
        {
          id: 'ACT-031',
          label: 'Request Cutoff Extension',
          description: 'Request 2-hour documentation cutoff extension from Maersk',
          target: 'bookings.sha@maersk.com',
          type: 'email',
        },
        {
          id: 'ACT-032',
          label: 'Activate Backup Broker',
          description: 'Engage Flexport as backup customs broker for emergency ISF filing',
          target: 'emergency@flexport.com',
          type: 'email',
        },
        {
          id: 'ACT-033',
          label: 'Notify Customer',
          description: 'Proactive notification to TechRetail about potential delay',
          target: 'supply.chain@techretail.com',
          type: 'email',
        },
        {
          id: 'ACT-034',
          label: 'Escalate to C-Suite',
          description: 'Escalate to Chief Operations Officer given revenue impact',
          target: 'Jennifer Walsh - COO',
          type: 'escalation',
        },
      ],
      emailDrafts: [
        {
          to: 'ops.director@globalforwarding.com',
          cc: 'sarah.chen@globalforwarding.com; david.park@company.com; legal@company.com',
          subject:
            'FINAL NOTICE: ISF Filing Overdue 18 Hours - SHP-20481 / MSKU-7294810 - Immediate Action Required',
          body: `Dear Global Forwarding Co. Operations Director,

This is a final escalation notice regarding the critically overdue ISF filing:

SHIPMENT AT RISK OF ROLLING:
- Shipment: SHP-20481
- PO: PO-2024-8891
- Container: MSKU-7294810
- Vessel: Maersk Eindhoven / Voyage 248E
- Cutoff: 4 HOURS REMAINING
- Cargo Value: ~$85,000

TIMELINE OF NON-RESPONSE:
- 18 hours ago: ISF filing window opened
- 12 hours ago: First automated reminder sent to Sarah Chen
- 8 hours ago: Second reminder sent, no response
- 6 hours ago: Third reminder + phone call attempted, no response
- 4 hours ago: Escalation to your operations team, no response
- NOW: Final notice. 4 hours to cutoff.

CONSEQUENCES IF ISF NOT FILED WITHIN 2 HOURS:
1. Cargo rolled to next sailing (est. March 22)
2. Customer stockout at 3 distribution centers
3. Revenue impact: $180,000
4. CBP penalty: $5,000
5. Service level agreement breach

We require immediate confirmation:
1. Will the ISF be filed within the next 2 hours?
2. If not, what is preventing the filing?
3. Do you need any data from our side to complete the filing?

If we do not receive a response within 60 minutes, we will engage our backup customs broker for emergency filing.

This communication is being logged for SLA review purposes.

Regards,
David Park
VP Operations`,
          tab: 'Forwarder Escalation',
        },
        {
          to: 'bookings.sha@maersk.com',
          cc: 'customer.service@maersk.com; david.park@company.com',
          subject:
            'URGENT: Documentation Cutoff Extension Request - BKG-448291 / Eindhoven 248E',
          body: `Dear Maersk Shanghai Booking Team,

We are requesting a 2-hour extension on the documentation cutoff for the following booking:

Booking: BKG-448291
Container: MSKU-7294810
Vessel: Maersk Eindhoven / Voyage 248E
Current Cutoff: 4 hours

Reason: Our customs broker is experiencing an operational delay in filing the ISF. We have escalated internally and expect the filing to be completed within the next 2-3 hours.

All other documentation (Commercial Invoice, Packing List, BOL, Certificate of Origin) has been received and validated.

We understand this is an exceptional request and appreciate any accommodation you can provide. We are a long-standing Maersk customer with booking volume reference MCC-2024-TIER1.

Please confirm whether an extension is possible.

Thank you.

David Park
VP Operations`,
          tab: 'Carrier Extension',
        },
        {
          to: 'emergency@flexport.com',
          cc: 'david.park@company.com',
          subject:
            'EMERGENCY ISF Filing Request - SHP-20481 / MSKU-7294810 / 4hr Cutoff',
          body: `Dear Flexport Emergency Filing Team,

We may need emergency ISF filing services for the following shipment:

Shipment: SHP-20481
Container: MSKU-7294810
Vessel: Maersk Eindhoven / Voyage 248E
Origin: Shanghai (CNSHA)
Destination: Los Angeles (USLAX)
Cutoff: Approximately 4 hours

Our primary customs broker (Global Forwarding Co.) has been unresponsive for 6 hours. We are making a final attempt to reach them, but need to have a backup plan in place.

If we engage your services, we will need:
1. ISF filing within 2 hours of engagement
2. All 10+2 data elements will be provided immediately upon confirmation
3. CBP bond information: Continuous Bond #CBP-2024-88291

Please confirm:
- Your availability for emergency filing
- Estimated time to complete once data is provided
- Emergency filing fee structure

We will confirm whether to proceed within the next 60 minutes.

Regards,
David Park
VP Operations`,
          tab: 'Backup Broker',
        },
        {
          to: 'supply.chain@techretail.com',
          cc: 'david.park@company.com; account.manager@company.com',
          subject:
            'Shipment Status Advisory - PO-2024-8891 / SHP-20481 - Potential Delay',
          body: `Dear TechRetail Supply Chain Team,

We are writing to provide a proactive status update on your shipment:

PO: PO-2024-8891
Shipment: SHP-20481
Cargo: Consumer Electronics - LCD Panels
Vessel: Maersk Eindhoven / Voyage 248E
Original ETA Los Angeles: March 28

Current Status: AT RISK

We are experiencing a documentation delay with the customs filing for this shipment. Our team is actively working to resolve the issue before the vessel cutoff (approximately 4 hours remaining).

Possible Outcomes:
1. BEST CASE: Issue resolved within 2 hours, shipment proceeds on schedule (ETA March 28)
2. CONTINGENCY: If the filing cannot be completed, the cargo will be moved to the next available sailing (est. ETA April 4)

We understand the importance of this shipment to your inventory planning and are treating this as our highest priority. We will provide an update within 2 hours.

Please do not hesitate to contact David Park directly at d.park@company.com if you have questions.

Sincerely,
Documentation Control Team`,
          tab: 'Customer Advisory',
        },
      ],
      timeline: [
        {
          id: 'TL-050',
          timestamp: '2024-03-14T06:00:00Z',
          description: 'Booking confirmed. Document checklist generated. ISF filing window opened.',
          type: 'system',
        },
        {
          id: 'TL-051',
          timestamp: '2024-03-14T12:00:00Z',
          description: 'ISF not received. First automated reminder sent to Sarah Chen at Global Forwarding Co.',
          type: 'warning',
        },
        {
          id: 'TL-052',
          timestamp: '2024-03-14T16:00:00Z',
          description: 'ISF still outstanding (10h elapsed). Second reminder sent. No acknowledgment.',
          type: 'warning',
        },
        {
          id: 'TL-053',
          timestamp: '2024-03-14T18:00:00Z',
          description: 'Third reminder sent + phone call to Sarah Chen. No answer. Voicemail left.',
          type: 'critical',
        },
        {
          id: 'TL-054',
          timestamp: '2024-03-14T20:00:00Z',
          description: 'Escalation triggered: Email sent to Global Forwarding Co. operations desk. 14 hours elapsed.',
          type: 'critical',
        },
        {
          id: 'TL-055',
          timestamp: '2024-03-14T22:00:00Z',
          description: 'No response from forwarder operations. Auto-escalated to David Park (VP Operations). Status: ESCALATED.',
          type: 'critical',
        },
        {
          id: 'TL-056',
          timestamp: '2024-03-14T23:00:00Z',
          description: 'David Park activated war room. Backup broker (Flexport) put on standby. Maersk cutoff extension requested.',
          type: 'critical',
        },
        {
          id: 'TL-057',
          timestamp: '2024-03-15T00:00:00Z',
          description: 'CURRENT: 4 hours to cutoff. ISF unfiled for 18 hours. Final notice sent to forwarder management.',
          type: 'critical',
        },
      ],
    },
    {
      id: 'EXC-006',
      type: 'mismatch',
      severity: 'high',
      status: 'open',
      blocking: true,
      documentName: 'Bill of Lading',
      owner: 'David Park',
      ownerRole: 'VP Operations',
      ageHours: 2,
      dueInHours: 4,
      slaHours: 24,
      summary:
        'BOL version conflict detected. Carrier EDI shows BOL v2 with amended consignee details, but the original BOL v1 was already validated and matched to booking. The v2 amendment was not requested by our team.',
      impact:
        'Customs entry cannot be filed with conflicting BOL versions. If the v2 consignee change is unauthorized, this could indicate a booking amendment error or potential fraud. Must be resolved before ISF can reference correct BOL data.',
      aiAssessment:
        'BOL version conflicts on Maersk shipments from CNSHA have occurred 3 times in the past 6 months, all traced to carrier-side data entry corrections. The v2 amendment to the consignee field (TechRetail Inc. vs Tech Retail International Inc.) is likely a carrier correction to match their records. Recommended: confirm with Maersk whether this was a carrier-initiated amendment and verify which entity name matches the importer bond and ISF data.',
      comparisonFields: [
        {
          field: 'BOL Number',
          documentValue: 'MAEU-SHA248E-7294810',
          systemValue: 'MAEU-SHA248E-7294810',
          match: true,
        },
        {
          field: 'BOL Version',
          documentValue: 'v2 (amended)',
          systemValue: 'v1 (original)',
          match: false,
        },
        {
          field: 'Consignee',
          documentValue: 'Tech Retail International Inc.',
          systemValue: 'TechRetail Inc.',
          match: false,
        },
        {
          field: 'Shipper',
          documentValue: 'LCD Global Manufacturing Co.',
          systemValue: 'LCD Global Manufacturing Co.',
          match: true,
        },
        {
          field: 'Notify Party',
          documentValue: 'Same as Consignee',
          systemValue: 'TechRetail Inc.',
          match: false,
        },
        {
          field: 'Port of Loading',
          documentValue: 'CNSHA',
          systemValue: 'CNSHA',
          match: true,
        },
        {
          field: 'Port of Discharge',
          documentValue: 'USLAX',
          systemValue: 'USLAX',
          match: true,
        },
        {
          field: 'Container',
          documentValue: 'MSKU-7294810',
          systemValue: 'MSKU-7294810',
          match: true,
        },
      ],
      resolutionActions: [
        {
          id: 'ACT-040',
          label: 'Confirm with Carrier',
          description: 'Ask Maersk to confirm whether BOL amendment was carrier-initiated',
          target: 'documentation.sha@maersk.com',
          type: 'email',
        },
        {
          id: 'ACT-041',
          label: 'Verify Consignee Name',
          description: 'Confirm correct legal entity name with customer (TechRetail)',
          target: 'legal@techretail.com',
          type: 'email',
        },
        {
          id: 'ACT-042',
          label: 'Accept v2 BOL',
          description: 'Accept the amended BOL and update system records (requires compliance sign-off)',
          target: 'James Liu - Trade Compliance',
          type: 'override',
        },
        {
          id: 'ACT-043',
          label: 'Request BOL Revert',
          description: 'Request Maersk revert to BOL v1 if amendment was unauthorized',
          target: 'documentation.sha@maersk.com',
          type: 'email',
        },
      ],
      emailDrafts: [
        {
          to: 'documentation.sha@maersk.com',
          cc: 'customer.service@maersk.com; david.park@company.com',
          subject:
            'URGENT: BOL Version Conflict - MAEU-SHA248E-7294810 / Eindhoven 248E',
          body: `Dear Maersk Documentation Team,

We have identified a version conflict on the Bill of Lading for the following shipment:

BOL: MAEU-SHA248E-7294810
Container: MSKU-7294810
Vessel: Maersk Eindhoven / Voyage 248E
Cutoff: 4 HOURS

We originally received and validated BOL v1 via EDI. We have now received BOL v2 with the following amendment:

CHANGED FIELDS:
- Consignee: "TechRetail Inc." (v1) changed to "Tech Retail International Inc." (v2)
- Notify Party: Updated to match new consignee

This amendment was NOT requested by our team. Could you please urgently confirm:
1. Was this a carrier-initiated correction?
2. What triggered the amendment?
3. Which version should be considered the final BOL?

This is blocking our customs filing as the ISF and entry must reference the correct consignee. Given the 4-hour cutoff, we need a response within 1 hour.

Regards,
David Park
VP Operations`,
          tab: 'Carrier Documentation',
        },
      ],
      timeline: [
        {
          id: 'TL-060',
          timestamp: '2024-03-14T14:05:00Z',
          description: 'BOL v1 received via Carrier EDI. Validated and matched to booking.',
          type: 'positive',
        },
        {
          id: 'TL-061',
          timestamp: '2024-03-14T22:00:00Z',
          description: 'BOL v2 received via Carrier EDI. Consignee name amended without request.',
          type: 'warning',
        },
        {
          id: 'TL-062',
          timestamp: '2024-03-14T22:01:00Z',
          description: 'Version conflict detected. BOL v2 consignee does not match system records.',
          type: 'critical',
        },
        {
          id: 'TL-063',
          timestamp: '2024-03-14T22:05:00Z',
          description: 'Exception EXC-006 created. Assigned to David Park (war room active).',
          type: 'system',
        },
        {
          id: 'TL-064',
          timestamp: '2024-03-15T00:00:00Z',
          description: 'CURRENT: Awaiting Maersk confirmation on BOL amendment source. 4 hours to cutoff.',
          type: 'critical',
        },
      ],
    },
  ],

  globalTimeline: [
    {
      id: 'GTL-030',
      timestamp: '2024-03-14T06:00:00Z',
      description: 'Shipment SHP-20481 created. Booking confirmed with Maersk. ISF filing window opened.',
      type: 'system',
    },
    {
      id: 'GTL-031',
      timestamp: '2024-03-14T08:22:00Z',
      description: 'Invoice and Packing List received and validated.',
      type: 'positive',
    },
    {
      id: 'GTL-032',
      timestamp: '2024-03-14T10:30:00Z',
      description: 'Certificate of Origin received and validated.',
      type: 'positive',
    },
    {
      id: 'GTL-033',
      timestamp: '2024-03-14T12:00:00Z',
      description: 'ISF filing overdue from expected window. First reminder sent.',
      type: 'warning',
    },
    {
      id: 'GTL-034',
      timestamp: '2024-03-14T14:05:00Z',
      description: 'BOL v1 received and validated. 4 of 5 docs complete.',
      type: 'positive',
    },
    {
      id: 'GTL-035',
      timestamp: '2024-03-14T16:00:00Z',
      description: 'Second ISF reminder sent. No response from Global Forwarding Co.',
      type: 'warning',
    },
    {
      id: 'GTL-036',
      timestamp: '2024-03-14T18:00:00Z',
      description: 'Third ISF reminder + phone call. No answer. Exception severity: CRITICAL.',
      type: 'critical',
    },
    {
      id: 'GTL-037',
      timestamp: '2024-03-14T20:00:00Z',
      description: 'Escalated to Global Forwarding Co. operations desk. 14 hours without ISF.',
      type: 'critical',
    },
    {
      id: 'GTL-038',
      timestamp: '2024-03-14T22:00:00Z',
      description: 'BOL v2 received with unauthorized consignee amendment. Second blocking exception created.',
      type: 'critical',
    },
    {
      id: 'GTL-039',
      timestamp: '2024-03-14T22:00:00Z',
      description: 'Auto-escalated to VP Operations. WAR ROOM ACTIVATED. Readiness score: 38%.',
      type: 'critical',
    },
    {
      id: 'GTL-040',
      timestamp: '2024-03-14T23:00:00Z',
      description: 'Backup broker (Flexport) put on standby. Maersk cutoff extension requested.',
      type: 'info',
    },
    {
      id: 'GTL-041',
      timestamp: '2024-03-15T00:00:00Z',
      description: 'CURRENT: 2 blocking exceptions, 4 hours to cutoff. Final escalation notices sent.',
      type: 'critical',
    },
  ],
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const scenarios: Scenario[] = [scenario1, scenario2, scenario3, scenario4];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
