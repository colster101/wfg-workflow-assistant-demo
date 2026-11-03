/* WFG Distribution demo seed — SYNTHETIC DATA ONLY.
   Source: WFG_Process_analysis_1.xlsx ("Demo Status Cases", "Demo NIGO", "Demo Settings").
   Applicant names are invented. No WFG case records. */

export const AS_OF = '2026-11-02';

export type WfgFlow = 'CAN Life' | 'US TFA' | 'US TFA Renewal';

export type SeedCase = {
  id: string;
  jurisdiction: string;
  flow: WfgFlow;
  stage: string;
  status: 'In Review' | 'Action Required' | 'Pending External' | 'Verified Complete' | 'Declined';
  owner: string;
  applicant: string;
  received: string;
  lastUpdate: string;
  due: string;
  nextAction: string;
  evidence: string;
  proofVerified: boolean;
  note: string;
};

export type SeedNigo = {
  id: string;
  caseId: string;
  reason: string;
  owner: string;
  opened: string;
  resubmitted?: string;
  resolved?: string;
  status: 'Open' | 'Closed';
  source: string;
};

/* Stage order per flow (left → right) — drives the progress bar in Work Queue */
export const FLOW_STAGES: Record<WfgFlow, string[]> = {
  'CAN Life': ['Application / onboarding', 'Education / exam', 'Contracting review', 'Regulator application', 'Licence activation', 'Carrier contracting', 'Ready to sell'],
  'US TFA': ['Initiate & submit', 'Review & approve', 'Regulatory filing', 'Exams / window', 'Registration approved'],
  'US TFA Renewal': ['CE / good standing', 'Renewal fees', 'Financial reconciliation'],
};

export const FLOW_WORKTYPE: Record<WfgFlow, string> = {
  'CAN Life': 'CAN Life Licensing',
  'US TFA': 'US TFA Registration',
  'US TFA Renewal': 'US TFA Renewal',
};

export const CASES: SeedCase[] = [
  { id: 'DEMO-001', jurisdiction: 'Ontario', flow: 'CAN Life', stage: 'Contracting review', status: 'In Review', owner: 'DXC', applicant: 'Harper Quinn', received: '2026-10-14', lastUpdate: '2026-10-30', due: '2026-11-04', nextAction: 'Complete suitability review', evidence: 'DXC manual status', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-002', jurisdiction: 'British Columbia', flow: 'CAN Life', stage: 'Regulator application', status: 'Pending External', owner: 'WFG Licensing', applicant: 'Marcus Bell', received: '2026-09-20', lastUpdate: '2026-10-23', due: '2026-11-04', nextAction: 'Confirm nominee response', evidence: 'Applicant portal confirmation', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-003', jurisdiction: 'Quebec', flow: 'CAN Life', stage: 'Contracting review', status: 'Action Required', owner: 'Applicant', applicant: 'Dana Okafor', received: '2026-10-12', lastUpdate: '2026-10-20', due: '2026-10-27', nextAction: 'Return signed disclosure', evidence: 'DXC status report', proofVerified: true, note: 'Fictional sample only' },
  { id: 'DEMO-004', jurisdiction: 'Alberta', flow: 'CAN Life', stage: 'Licence activation', status: 'In Review', owner: 'WFG Licensing', applicant: 'Leo Varga', received: '2026-10-02', lastUpdate: '2026-10-28', due: '2026-11-01', nextAction: 'Investigate Compass mismatch', evidence: 'Ivari / Compass exports', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-005', jurisdiction: 'Ontario', flow: 'CAN Life', stage: 'Carrier contracting', status: 'Pending External', owner: 'Carrier Relations', applicant: 'Priya Shah', received: '2026-09-08', lastUpdate: '2026-10-27', due: '2026-10-30', nextAction: 'Confirm carrier contract', evidence: 'Carrier manual status', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-006', jurisdiction: 'Saskatchewan', flow: 'CAN Life', stage: 'Ready to sell', status: 'Verified Complete', owner: 'Carrier Relations', applicant: 'Tomas Reyes', received: '2026-08-05', lastUpdate: '2026-10-29', due: '2026-10-29', nextAction: 'None — confirmed in both sources', evidence: 'Licence + carrier proof', proofVerified: true, note: 'Fictional sample only' },
  { id: 'DEMO-007', jurisdiction: 'Ontario', flow: 'CAN Life', stage: 'Education / exam', status: 'In Review', owner: 'Applicant', applicant: 'Nina Calder', received: '2026-09-28', lastUpdate: '2026-10-21', due: '2026-11-02', nextAction: 'Confirm HLLQP exam date', evidence: 'Training provider report', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-008', jurisdiction: 'British Columbia', flow: 'CAN Life', stage: 'Application / onboarding', status: 'Action Required', owner: 'SMD', applicant: 'Owen Pryce', received: '2026-10-25', lastUpdate: '2026-10-25', due: '2026-11-01', nextAction: 'Approve pending agreement', evidence: 'DocuSign manual log', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-009', jurisdiction: 'US / NY', flow: 'US TFA', stage: 'Regulatory filing', status: 'In Review', owner: 'TFA Registration', applicant: 'Grace Mirza', received: '2026-09-18', lastUpdate: '2026-10-26', due: '2026-11-04', nextAction: 'Resolve CRD partial update', evidence: 'FINRA report', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-010', jurisdiction: 'US / CA', flow: 'US TFA', stage: 'Exams / window', status: 'Action Required', owner: 'TFA Training', applicant: 'Felix Honda', received: '2026-09-03', lastUpdate: '2026-10-22', due: '2026-10-31', nextAction: 'Book retake before window closes', evidence: 'Exam provider report', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-011', jurisdiction: 'US / FL', flow: 'US TFA', stage: 'Registration approved', status: 'Verified Complete', owner: 'TFA Registration', applicant: 'Ruth Adair', received: '2026-08-21', lastUpdate: '2026-10-24', due: '2026-10-24', nextAction: 'Monitor required training', evidence: 'CRD + Caesar', proofVerified: true, note: 'Fictional sample only' },
  { id: 'DEMO-012', jurisdiction: 'US / TX', flow: 'US TFA Renewal', stage: 'Renewal fees', status: 'Pending External', owner: 'Field Services', applicant: 'Sam Kowal', received: '2026-10-12', lastUpdate: '2026-10-27', due: '2026-11-01', nextAction: 'Confirm outstanding renewal payment', evidence: 'MyWFG Payment Central', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-013', jurisdiction: 'US / AZ', flow: 'US TFA Renewal', stage: 'CE / good standing', status: 'Action Required', owner: 'Field Services', applicant: 'Isla Brandt', received: '2026-10-01', lastUpdate: '2026-10-15', due: '2026-11-01', nextAction: 'Verify completion credits', evidence: 'CRD source report', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-014', jurisdiction: 'Ontario', flow: 'CAN Life', stage: 'Contracting review', status: 'Declined', owner: 'DXC', applicant: 'Noah Ferris', received: '2026-10-07', lastUpdate: '2026-10-29', due: '2026-10-29', nextAction: 'Record appeal decision if initiated', evidence: 'Ivari approval note', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-015', jurisdiction: 'Manitoba', flow: 'CAN Life', stage: 'Licence activation', status: 'In Review', owner: 'Ivari/DXC', applicant: 'Maya Sorensen', received: '2026-10-11', lastUpdate: '2026-11-01', due: '2026-11-03', nextAction: 'Validate expiry value', evidence: 'Licence image / feed', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-016', jurisdiction: 'US / WA', flow: 'US TFA Renewal', stage: 'Financial reconciliation', status: 'Action Required', owner: 'Accounting', applicant: 'Caleb Imura', received: '2026-10-25', lastUpdate: '2026-10-28', due: '2026-10-30', nextAction: 'Investigate fee discrepancy', evidence: 'FINRA statement', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-017', jurisdiction: 'Quebec', flow: 'CAN Life', stage: 'Carrier contracting', status: 'Pending External', owner: 'Carrier Relations', applicant: 'Elena Vance', received: '2026-10-16', lastUpdate: '2026-11-01', due: '2026-11-05', nextAction: 'Request carrier written approval', evidence: 'Carrier status email', proofVerified: false, note: 'Fictional sample only' },
  { id: 'DEMO-018', jurisdiction: 'US / NY', flow: 'US TFA', stage: 'Registration approved', status: 'Verified Complete', owner: 'TFA Registration', applicant: 'Jonah Ashby', received: '2026-09-09', lastUpdate: '2026-10-31', due: '2026-10-31', nextAction: 'Recorded FINRA approval and training', evidence: 'CRD / training record', proofVerified: true, note: 'Fictional sample only' },
];

/* Note: the source workbook's N-013 is tagged "US TFA Renewal" but its case (DEMO-017) is CAN Life.
   The demo uses the case's flow. See the source-issues note. */
export const NIGO: SeedNigo[] = [
  { id: 'N-001', caseId: 'DEMO-001', reason: 'OBA incomplete', owner: 'DXC', opened: '2026-10-24', resubmitted: '2026-10-29', status: 'Open', source: 'DXC review' },
  { id: 'N-002', caseId: 'DEMO-003', reason: 'OBA incomplete', owner: 'Applicant', opened: '2026-10-15', resubmitted: '2026-10-18', resolved: '2026-10-21', status: 'Closed', source: 'Advisor response' },
  { id: 'N-003', caseId: 'DEMO-003', reason: 'Unsigned form', owner: 'Applicant', opened: '2026-10-22', status: 'Open', source: 'DXC review' },
  { id: 'N-004', caseId: 'DEMO-009', reason: 'CRD update failed', owner: 'TFA Registration', opened: '2026-10-28', status: 'Open', source: 'FINRA daily check' },
  { id: 'N-005', caseId: 'DEMO-014', reason: 'Criminal query', owner: 'DXC', opened: '2026-10-19', resubmitted: '2026-10-23', resolved: '2026-10-29', status: 'Closed', source: 'Ivari decision' },
  { id: 'N-006', caseId: 'DEMO-004', reason: 'Incorrect expiry', owner: 'WFG Licensing', opened: '2026-10-28', status: 'Open', source: 'Compass export' },
  { id: 'N-007', caseId: 'DEMO-015', reason: 'Missing ID', owner: 'Ivari/DXC', opened: '2026-10-23', resubmitted: '2026-10-29', status: 'Open', source: 'DXC status' },
  { id: 'N-008', caseId: 'DEMO-010', reason: 'Exam result missing', owner: 'TFA Training', opened: '2026-10-27', status: 'Open', source: 'Exam provider' },
  { id: 'N-009', caseId: 'DEMO-002', reason: 'Wrong province form', owner: 'WFG Licensing', opened: '2026-10-10', resubmitted: '2026-10-19', resolved: '2026-10-21', status: 'Closed', source: 'Applicant portal' },
  { id: 'N-010', caseId: 'DEMO-013', reason: 'CE proof absent', owner: 'Field Services', opened: '2026-10-17', status: 'Open', source: 'CRD review' },
  { id: 'N-011', caseId: 'DEMO-005', reason: 'Carrier proof missing', owner: 'Carrier Relations', opened: '2026-10-20', status: 'Open', source: 'Carrier follow-up' },
  { id: 'N-012', caseId: 'DEMO-016', reason: 'Fee discrepancy', owner: 'Accounting', opened: '2026-10-26', status: 'Open', source: 'FINRA statement' },
  { id: 'N-013', caseId: 'DEMO-017', reason: 'Fee discrepancy', owner: 'Field Services', opened: '2026-10-22', status: 'Open', source: 'FINRA statement' },
];
