import type { InboxEmail, EmailDraft, ResolveDocType } from './types';

export const INITIAL_INBOX_EMAILS: InboxEmail[] = [
  {
    id: 'inbox-1',
    from: 'no-reply@maersk.com',
    fromName: 'Maersk Booking System',
    subject: 'Booking Confirmation — BKG-448291 / Maersk Eindhoven V.248E',
    body: `Dear Valued Customer,

Your booking BKG-448291 has been confirmed for the following voyage:

  Vessel:       Maersk Eindhoven V.248E
  Port of Load: Shanghai (CNSHA)
  Port of Disc: Los Angeles (USLAX)
  ETD Shanghai: 2024-03-10
  ETA Los Angeles: 2024-03-24

Container: MSKU-7294810 (40HC)
Cargo Cut-off: 2024-03-08 18:00 local

Please ensure all required documents are submitted to customs at least 24 hours prior to departure.

Maersk Customer Service
bookings.sha@maersk.com`,
    timestamp: '2024-03-05T08:00:00Z',
    read: true,
  },
  {
    id: 'inbox-2',
    from: 'auto@cbp.dhs.gov',
    fromName: 'U.S. Customs & Border Protection',
    subject: 'ISF-10 Filing Required — MSKU-7294810 / CNSHA→USLAX',
    body: `Automated Notice — U.S. Customs and Border Protection

This is a system-generated reminder that an Importer Security Filing (ISF-10) must be filed at least 24 hours prior to vessel departure for your inbound ocean shipment.

Shipment Reference: MSKU-7294810
Route: CNSHA → USLAX
Vessel Departure: 2024-03-10

Required ISF data elements include:
  - Seller name and address
  - Buyer name and address
  - Importer of Record number
  - Consignee number
  - Manufacturer (or supplier) name and address
  - Ship-to name and address
  - Country of origin
  - Commodity HTSUS number

Failure to file ISF may result in liquidated damages of up to $5,000 per violation and possible cargo hold.

CBP Automated Systems
Department of Homeland Security`,
    timestamp: '2024-03-05T10:15:00Z',
    read: false,
  },
  {
    id: 'inbox-3',
    from: 'docs@globalforwarding.com',
    fromName: 'Global Forwarding — Docs Team',
    subject: 'Document Checklist — SHP-20481 / CN→US Lane',
    body: `Dear Operations Team,

Please find below the required document checklist for your CN→US ocean shipment SHP-20481.

Required Documents (all must be received before cargo cut-off):
  ✓ Commercial Invoice (received 2024-03-04)
  ✗ Packing List (not yet received)
  ✗ Bill of Lading (awaiting carrier)
  ✗ ISF-10 Filing (ACTION REQUIRED — file immediately)
  ✗ Certificate of Origin (Form A) (not yet received)

Cargo Cut-off: 2024-03-08 18:00 CST Shanghai

Please ensure all documents are received no later than 2024-03-07 EOD to allow for processing time.

If you have any questions, please contact your assigned coordinator.

Global Forwarding — Documentation Team
docs@globalforwarding.com | +1 (213) 555-0182`,
    timestamp: '2024-03-05T11:30:00Z',
    read: true,
  },
  {
    id: 'inbox-4',
    from: 'noreply@hapag-lloyd.com',
    fromName: 'Hapag-Lloyd Customer Portal',
    subject: 'DG Pre-Approval Required — HLBU1234567 / Class 3 Flammables',
    body: `Dear Customer,

Your booking includes Dangerous Goods (Class 3 — Flammable Liquids, UN 1993).

DG Pre-Approval is required before we can confirm the booking. Please submit:
  1. Material Safety Data Sheet (MSDS / SDS) — pages must be legible
  2. IMDG Dangerous Goods Declaration (DGD)
  3. Packing Certificate

Please upload documents via the Hapag-Lloyd Customer Portal or email to dg-desk.sha@hapag-lloyd.com

Note: Incomplete or illegible documentation will result in booking cancellation.

Hapag-Lloyd DG Desk
dg-desk.sha@hapag-lloyd.com`,
    timestamp: '2024-03-05T14:00:00Z',
    read: true,
  },
];

export function generateReply(draft: EmailDraft): InboxEmail {
  const subjectLower = draft.subject.toLowerCase();
  const isISF = subjectLower.includes('isf') || subjectLower.includes('security filing');
  const isInvoice =
    subjectLower.includes('invoice') ||
    subjectLower.includes('mismatch') ||
    subjectLower.includes('discrepancy');
  const isDG =
    subjectLower.includes('hazmat') ||
    subjectLower.includes('dangerous') ||
    subjectLower.includes('msds') ||
    subjectLower.includes('dg');

  let body: string;

  if (isISF) {
    body = `Dear Operations Team,

Thank you for the urgent follow-up regarding the ISF filing.

We are pleased to confirm that the ISF-10 has now been submitted to U.S. Customs & Border Protection.

  ISF Confirmation Number: ISF-2024-88412
  Filed by: Global Forwarding LLC (Bond #12-345678)
  Filed at: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} today

All 10 required data elements have been included. A copy of the ISF filing receipt is attached to this email.

We apologize for the delay and confirm that all customs requirements are now met for this shipment.

Please let us know if you need anything further.

Best regards,
Sarah Chen
Global Forwarding — Operations
sarah.chen@globalforwarding.com`;
  } else if (isInvoice) {
    body = `Dear Documentation Team,

Thank you for flagging the discrepancy in the Commercial Invoice for shipment SHP-20482.

After review, we have identified the error and have issued a corrected Commercial Invoice (Revision 2):

  Original Invoice Value:  USD 48,000.00
  Corrected Invoice Value: USD 52,000.00 ← correct value
  Invoice Number:          INV-2024-8821-R2
  Revision Date:           ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}

The corrected invoice is attached. Please update your records accordingly and confirm receipt.

We apologize for any inconvenience caused.

Kind regards,
James Liu
Shenzhen Export Desk — Accounts
james.liu@shenzhen-exports.com`;
  } else if (isDG) {
    body = `Dear DG Documentation Team,

Thank you for your message regarding the MSDS for our Class 3 shipment (UN 1993 — Flammable Liquid N.O.S.).

We have re-issued the Material Safety Data Sheet in a high-resolution format with all sections clearly legible. The updated MSDS (Version 3.1) is attached.

Key sections confirmed complete:
  ✓ Section 2: Hazard Identification
  ✓ Section 3: Composition / Information on Ingredients
  ✓ Section 4: First-Aid Measures
  ✓ Emergency Contact: +1 (800) 555-CHEM (24/7)

Please let us know if any additional documentation is required.

Regards,
EuroChem Supply — Export Compliance
export.compliance@eurochem-supply.eu`;
  } else {
    body = `Dear Team,

Thank you for your message. We have received your request and are processing it urgently.

Please find the updated documentation attached to this email.

We will continue to monitor the situation and will provide updates as they become available.

Please confirm receipt of the attached documents.

Best regards,
Counterpart Operations Team`;
  }

  let resolveDocType: ResolveDocType;
  let attachmentName: string;
  let attachmentSizeKb: number;

  if (isISF) {
    resolveDocType = 'isf';
    attachmentName = 'ISF-Filing-Confirmation-ISF-2024-88412.pdf';
    attachmentSizeKb = 187;
  } else if (isInvoice) {
    resolveDocType = 'invoice';
    attachmentName = 'Commercial-Invoice-INV-2024-8821-R2.pdf';
    attachmentSizeKb = 243;
  } else if (isDG) {
    resolveDocType = 'msds';
    attachmentName = 'MSDS-UN1993-FlammableLiquid-v3.1.pdf';
    attachmentSizeKb = 312;
  } else {
    resolveDocType = 'general';
    attachmentName = 'Document-Update-Reference.pdf';
    attachmentSizeKb = 156;
  }

  return {
    id: `reply-${Date.now()}`,
    from: draft.to,
    fromName: draft.tab,
    subject: `Re: ${draft.subject}`,
    body,
    timestamp: new Date().toISOString(),
    isReply: true,
    read: false,
    attachment: { name: attachmentName, sizeKb: attachmentSizeKb, docType: resolveDocType },
    resolveDocType,
  };
}
