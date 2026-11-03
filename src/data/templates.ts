import type { RegionPack } from './regions';

export type RuleBuiltIn = {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export type IntegrationBuiltIn = {
  id: string;
  name: string;
  category: 'Policy Admin' | 'Claims Platform' | 'Document Repository' | 'Billing' | 'CRM' | 'Identity & Risk' | 'Third-Party' | 'Analytics' | 'Reinsurance';
  description: string;
  defaultEnabled: boolean;
};

export type StepBuiltIn = {
  id: string;
  name: string;
  defaultRole: string;
  defaultQueue: string;
  defaultSlaHours: number;
  defaultDescription: string;
};

export type ProcessTemplate = {
  id: string;
  name: string;
  category: 'Claims' | 'Underwriting' | 'Policy Servicing' | 'New Business' | 'Registration' | 'Licensing' | 'Renewal';
  shortDescription: string;
  longDescription: string;
  badge?: 'Most Used' | 'New' | 'Recommended';
  defaultSlaHours: number;
  steps: StepBuiltIn[];
  roles: string[];
  queues: string[];
  rules: RuleBuiltIn[];
  integrations: IntegrationBuiltIn[];
  isPrimaryDemo?: boolean;
};

export const PROCESS_TEMPLATES: ProcessTemplate[] = [
  {
    id: 'us-tfa-registration',
    name: 'US TFA Registration',
    category: 'Registration',
    shortDescription: 'Securities registration for US agents: application, interview, FINRA U4 filing, exams and training.',
    longDescription: 'Five-stage registration from applicant intake through FINRA/CRD filing, exam windows and final approval. Current state is email-driven with no single status view. This workflow adds a shared case ID, a NIGO log with two clocks (first submission and complete file), exam-window watchlists and an approved-vs-active reconciliation.',
    badge: 'Recommended',
    defaultSlaHours: 720,
    isPrimaryDemo: true,
    steps: [
      { id: 'initiate', name: 'Initiate & submit', defaultRole: 'BOS / Field Office Supervisor', defaultQueue: 'TFA Onboard', defaultSlaHours: 72, defaultDescription: 'Initiate applicant in TFA Onboard; complete OBA, 10-year history, fingerprints, exams and fees. Mandatory-field checklist applies.' },
      { id: 'review', name: 'Review & approve', defaultRole: 'TFA Home Office / RBM', defaultQueue: 'TFA Review Queue', defaultSlaHours: 96, defaultDescription: 'Screen application, social media and OBA. Clarifications via the daily aging queue. RBM interview (45–60 min).' },
      { id: 'filing', name: 'Regulatory filing', defaultRole: 'US Registration', defaultQueue: 'US Registration Queue', defaultSlaHours: 48, defaultDescription: 'Send U4 to FINRA; confirm CRD update accepted. Exception log for duplicate or partial CRD updates.' },
      { id: 'exams', name: 'Exams / window', defaultRole: 'TFA Training', defaultQueue: 'Exam Watchlist', defaultSlaHours: 120, defaultDescription: 'Track 120-day exam window; 30-day wait after two failures, 180-day after the third. Report failures and book retakes.' },
      { id: 'approved', name: 'Registration approved', defaultRole: 'TFA Registration', defaultQueue: 'Status Reconciliation', defaultSlaHours: 24, defaultDescription: 'FINRA approval → Caesar (daily) → Compass (overnight). Reconcile approved vs active. Training due within 30 days.' },
    ],
    roles: ['BOS / Field Office Supervisor', 'TFA Home Office / RBM', 'US Registration', 'TFA Training'],
    queues: ['TFA Onboard', 'TFA Review Queue', 'US Registration Queue', 'Exam Watchlist', 'Status Reconciliation'],
    rules: [
      { id: 'tfa-r1', label: 'Two clocks on every NIGO', description: 'Record first-submission and complete-file dates separately before any SLA is reported.', defaultEnabled: true },
      { id: 'tfa-r2', label: 'CRD update needs accepted receipt', description: 'A filing is not complete until the CRD receipt shows accepted.', defaultEnabled: true },
      { id: 'tfa-r3', label: 'Approved is not active', description: 'FINRA approval does not authorise activity. Compass active status is checked separately.', defaultEnabled: true },
    ],
    integrations: [
      { id: 'tfa-i1', name: 'TFA Onboard (AOB)', category: 'Policy Admin', description: 'Applicant intake, clarifications and RBM notes.', defaultEnabled: true },
      { id: 'tfa-i2', name: 'FINRA CRD', category: 'Third-Party', description: 'U4 filing and CRD update receipts.', defaultEnabled: true },
      { id: 'tfa-i3', name: 'Caesar', category: 'Policy Admin', description: 'Daily feed of FINRA approvals.', defaultEnabled: true },
      { id: 'tfa-i4', name: 'Compass', category: 'Policy Admin', description: 'Overnight agent status update.', defaultEnabled: true },
      { id: 'tfa-i5', name: 'AWD', category: 'Third-Party', description: 'Exam window and test eligibility workflow.', defaultEnabled: true },
    ],
  },
  {
    id: 'can-life-licensing',
    name: 'CAN Life Licensing',
    category: 'Licensing',
    shortDescription: 'Canadian life licensing and carrier contracting: course, exam, application, agreement, screening, activation.',
    longDescription: 'Covers the Canadian licensing chain from onboarding through carrier contracting to ready-to-sell. The workflow keeps regulator, carrier and internal statuses separate, and shows readiness as a gated checklist. Regulator status never implies selling authority.',
    badge: 'New',
    defaultSlaHours: 960,
    steps: [
      { id: 'onboard', name: 'Application / onboarding', defaultRole: 'SMD / WFG Onboarding Ops', defaultQueue: 'Onboarding Queue', defaultSlaHours: 168, defaultDescription: 'Route recruit, complete DocuSign agreement and SMD approval (7-day target). Access email matched to recruit status.' },
      { id: 'education', name: 'Education / exam', defaultRole: 'Recruit / Provider', defaultQueue: 'Education Watchlist', defaultSlaHours: 720, defaultDescription: 'State or provincial course and exam. Confirm exam date and training provider report.' },
      { id: 'contracting', name: 'Contracting review', defaultRole: 'DXC / Ivari Contracting Lead', defaultQueue: 'Contracting Queue', defaultSlaHours: 96, defaultDescription: 'Review and screen application, IGO/NIGO, disclosure and sponsorship.' },
      { id: 'regulator', name: 'Regulator application', defaultRole: 'WFG Licensing', defaultQueue: 'Licensing Queue', defaultSlaHours: 240, defaultDescription: 'Provincial application and payment. Track nine-month deadline and extension.' },
      { id: 'activation', name: 'Licence activation', defaultRole: 'Ivari / DXC', defaultQueue: 'Licence Reconciliation', defaultSlaHours: 48, defaultDescription: 'Confirm licence from NIPR/DOI feed and reconcile to Compass expiry.' },
      { id: 'carrier', name: 'Carrier contracting', defaultRole: 'Carrier Relations', defaultQueue: 'Carrier Board', defaultSlaHours: 120, defaultDescription: 'Carrier written approval and appointment. Consolidated carrier status with decline reasons.' },
      { id: 'ready', name: 'Ready to sell', defaultRole: 'Carrier Relations', defaultQueue: 'Readiness Gate', defaultSlaHours: 24, defaultDescription: 'Only when licence, carrier, E&O, AML and training gates are all verified in source systems.' },
    ],
    roles: ['SMD / WFG Onboarding Ops', 'Recruit / Provider', 'DXC / Ivari Contracting Lead', 'WFG Licensing', 'Ivari / DXC', 'Carrier Relations'],
    queues: ['Onboarding Queue', 'Education Watchlist', 'Contracting Queue', 'Licensing Queue', 'Licence Reconciliation', 'Carrier Board', 'Readiness Gate'],
    rules: [
      { id: 'can-r1', label: 'Readiness is a gated checklist', description: 'Ready to sell requires licence, carrier, E&O, AML and training evidence in source systems.', defaultEnabled: true },
      { id: 'can-r2', label: 'Nine-month licence deadline watched', description: 'Flag licence applications nearing nine months, with a three-month extension recorded.', defaultEnabled: true },
      { id: 'can-r3', label: 'Daily licence-vs-Compass reconciliation', description: 'Exceptions assigned to one owner with a due date.', defaultEnabled: true },
    ],
    integrations: [
      { id: 'can-i1', name: 'WFG Launch / MyWFG', category: 'CRM', description: 'Recruit profile, course enrolment, access and training.', defaultEnabled: true },
      { id: 'can-i2', name: 'Compass', category: 'Policy Admin', description: 'Agent status; overnight activation batch.', defaultEnabled: true },
      { id: 'can-i3', name: 'Ivari', category: 'Policy Admin', description: 'Contracting and licence record.', defaultEnabled: true },
      { id: 'can-i4', name: 'DocuSign', category: 'Document Repository', description: 'Agent agreement signature.', defaultEnabled: true },
      { id: 'can-i5', name: 'NIPR / DOI feed', category: 'Third-Party', description: 'Licence results with days of latency.', defaultEnabled: true },
    ],
  },
  {
    id: 'us-tfa-renewal',
    name: 'US TFA Renewal',
    category: 'Renewal',
    shortDescription: 'Annual US renewal: continuing education, renewal fees and fee reconciliation against FINRA statements.',
    longDescription: 'Tracks annual US TFA renewals as a separate control from the Canadian licence calendar. Covers CE and good-standing evidence, renewal fee payment and reconciliation of fees against FINRA statements.',
    badge: 'New',
    defaultSlaHours: 480,
    steps: [
      { id: 'ce', name: 'CE / good standing', defaultRole: 'Field Services', defaultQueue: 'Renewal Queue', defaultSlaHours: 120, defaultDescription: 'Verify completion credits and good standing in CRD source report.' },
      { id: 'fees', name: 'Renewal fees', defaultRole: 'Field Services', defaultQueue: 'Payment Exceptions', defaultSlaHours: 72, defaultDescription: 'Confirm renewal payment in MyWFG Payment Central.' },
      { id: 'recon', name: 'Financial reconciliation', defaultRole: 'Accounting', defaultQueue: 'Fee Reconciliation', defaultSlaHours: 96, defaultDescription: 'Reconcile fees against FINRA statement. Log discrepancies.' },
    ],
    roles: ['Field Services', 'Accounting'],
    queues: ['Renewal Queue', 'Payment Exceptions', 'Fee Reconciliation'],
    rules: [
      { id: 'ren-r1', label: 'Separate from Canada calendar', description: 'US TFA renewal controls are not combined with Canadian licence or NRD renewal dates.', defaultEnabled: true },
    ],
    integrations: [
      { id: 'ren-i1', name: 'CRD source report', category: 'Third-Party', description: 'Good-standing and CE evidence.', defaultEnabled: true },
      { id: 'ren-i2', name: 'MyWFG Payment Central', category: 'Billing', description: 'Renewal fee payment status.', defaultEnabled: true },
      { id: 'ren-i3', name: 'FINRA statement', category: 'Third-Party', description: 'Fee statement for reconciliation.', defaultEnabled: true },
    ],
  },
];

export function getTemplate(id: string): ProcessTemplate | undefined {
  return PROCESS_TEMPLATES.find(t => t.id === id);
}

/* ---------------- region-aware overlay ---------------------------------- */
/* Some rule labels and template descriptions contain currency thresholds.
   We swap those into the local currency using values from the region pack
   without duplicating the entire template tree. */
function applyRegionToRule(rule: RuleBuiltIn, region: RegionPack): RuleBuiltIn {
  if (rule.id === 'pe-r1') {
    return {
      ...rule,
      label: `Auto-approve premium changes < ${region.currency.symbol}${region.currency.smallChangeThreshold}/mo`,
    };
  }
  if (rule.id === 'cl-r3') {
    return {
      ...rule,
      label: `Fraud screening on claims > ${region.currency.fraudThresholdLabel}`,
    };
  }
  return rule;
}

export function getRegionalTemplates(region: RegionPack): ProcessTemplate[] {
  return PROCESS_TEMPLATES.map(t => ({
    ...t,
    rules: t.rules.map(r => applyRegionToRule(r, region)),
  }));
}

export function getRegionalTemplate(id: string, region: RegionPack): ProcessTemplate | undefined {
  const base = getTemplate(id);
  if (!base) return undefined;
  return { ...base, rules: base.rules.map(r => applyRegionToRule(r, region)) };
}
