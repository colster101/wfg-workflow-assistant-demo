/* WFG demo data layer. Everything here is derived from wfgSeed.ts (synthetic).
   Keeps the shape the WFA pages already consume, so Work Queue, SLA Monitor and
   Process Mining run on real case dates rather than invented metrics.
   The `region` argument is accepted for compatibility and ignored. */

import type { WorkItem, TeamMetric, StepMetric, WorkStatus, SlaStatus, Priority } from '../types';
import type { RegionPack } from './regions';
import { AS_OF, CASES, NIGO, FLOW_STAGES, FLOW_WORKTYPE, type SeedCase } from './wfgSeed';

export type MockData = {
  workItems: WorkItem[];
  teamMetrics: TeamMetric[];
  stepMetrics: StepMetric[];
  cycleTimeTrend: Array<{ day: string; claims: number; uw: number; service: number }>;
  slaComplianceTrend: Array<{ week: string; compliance: number }>;
  volumeByType: Array<{ type: string; volume: number; complete: number }>;
};

const DAY = 86400000;
export const ASOF_MS = Date.parse(`${AS_OF}T00:00:00Z`);
const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
const daysBetween = (a: number, b: number) => Math.round((a - b) / DAY);
const isClosed = (c: SeedCase) => c.status === 'Verified Complete' || c.status === 'Declined';

export function caseOpenNigo(caseId: string) {
  return NIGO.filter(n => n.caseId === caseId && n.status === 'Open');
}

export function caseAgeDays(c: SeedCase) {
  return daysBetween(ASOF_MS, toMs(c.received));
}

export function caseOverdue(c: SeedCase) {
  return !isClosed(c) && toMs(c.due) < ASOF_MS;
}

export function nigoAgeDays(caseOpenDate: string) {
  return daysBetween(ASOF_MS, toMs(caseOpenDate));
}

function slaFor(c: SeedCase): SlaStatus {
  if (isClosed(c)) return 'On Track';
  const diff = daysBetween(toMs(c.due), ASOF_MS);
  if (diff < 0) return 'Breached';
  if (diff <= 2) return 'At Risk';
  return 'On Track';
}

function statusFor(c: SeedCase): WorkStatus {
  switch (c.status) {
    case 'In Review': return 'In Progress';
    case 'Action Required': return 'Pending';
    case 'Pending External': return 'On Hold';
    case 'Verified Complete':
    case 'Declined': return 'Complete';
  }
}

function priorityFor(c: SeedCase): Priority {
  const sla = slaFor(c);
  const open = caseOpenNigo(c.id).length;
  if (sla === 'Breached' && open > 0) return 'Critical';
  if (sla === 'Breached' || open > 0) return 'High';
  if (sla === 'At Risk') return 'Medium';
  return 'Low';
}

function toWorkItem(c: SeedCase): WorkItem {
  const stages = FLOW_STAGES[c.flow];
  const dueEndMs = toMs(c.due) + DAY; // due date treated as end of that day
  const notes = NIGO.filter(n => n.caseId === c.id).flatMap(n => {
    const entries = [{
      id: `${n.id}-open`, timestamp: `${n.opened}T09:00:00Z`, user: n.owner,
      action: 'NIGO opened', detail: `${n.reason} (source: ${n.source})`,
    }];
    if (n.resolved) entries.push({
      id: `${n.id}-res`, timestamp: `${n.resolved}T09:00:00Z`, user: n.owner,
      action: 'NIGO resolved', detail: n.reason,
    });
    return entries;
  });
  const openNigo = caseOpenNigo(c.id).length;
  return {
    id: c.id,
    type: FLOW_WORKTYPE[c.flow] as WorkItem['type'],
    priority: priorityFor(c),
    status: statusFor(c),
    slaStatus: slaFor(c),
    policyNumber: c.id,
    customerName: c.applicant,
    currentStep: c.stage,
    stepIndex: Math.max(0, stages.indexOf(c.stage)),
    totalSteps: stages.length,
    steps: stages,
    assignedTo: c.owner,
    team: c.owner,
    createdAt: `${c.received}T00:00:00Z`,
    dueBy: new Date(dueEndMs).toISOString(),
    slaHoursRemaining: Math.round((dueEndMs - ASOF_MS) / 3600000),
    timeInStepHours: Math.max(0, daysBetween(ASOF_MS, toMs(c.lastUpdate))) * 24,
    description: `${c.jurisdiction} · ${c.stage}. Next action: ${c.nextAction}. Evidence: ${c.evidence}. Proof verified: ${c.proofVerified ? 'yes' : 'no'}. Open NIGO: ${openNigo}.`,
    channel: c.flow === 'CAN Life' ? 'Agent' : 'Digital',
    notes: notes.reverse(),
    documents: [{ id: `${c.id}-ev`, name: `${c.id} — ${c.evidence}`, type: 'Status evidence', uploadedAt: `${c.lastUpdate}T00:00:00Z`, size: '—' }],
  };
}

export function getMockData(_region?: RegionPack): MockData {
  const workItems = CASES.map(toWorkItem);

  // Team (owner) metrics
  const owners = Array.from(new Set(CASES.map(c => c.owner)));
  const teamMetrics: TeamMetric[] = owners.map(owner => {
    const cs = CASES.filter(c => c.owner === owner);
    const open = cs.filter(c => !isClosed(c));
    const breached = cs.filter(caseOverdue).length;
    const atRisk = cs.filter(c => slaFor(c) === 'At Risk').length;
    const avgAge = open.length ? open.reduce((s, c) => s + caseAgeDays(c), 0) / open.length : 0;
    return {
      team: owner,
      open: open.length,
      atRisk,
      breached,
      avgCycleHrs: Math.round(avgAge * 24),
      slaCompliance: Math.round(((cs.length - breached) / cs.length) * 100),
    };
  });

  // Step metrics: average days since last update per stage (activity age)
  const stageNames = Array.from(new Set(CASES.map(c => c.stage)));
  const stepRaw = stageNames.map(stage => {
    const cs = CASES.filter(c => c.stage === stage);
    const avgHours = cs.reduce((s, c) => s + Math.max(0, daysBetween(ASOF_MS, toMs(c.lastUpdate))) * 24, 0) / cs.length;
    return { step: stage, avgHours: Math.round(avgHours), volume: cs.length, bottleneck: false };
  });
  const sorted = [...stepRaw].sort((a, b) => b.avgHours - a.avgHours);
  const stepMetrics: StepMetric[] = stepRaw.map(s => ({ ...s, bottleneck: sorted.slice(0, 2).some(t => t.step === s.step) }));

  // Daily open-NIGO trend over the last 21 days, by flow (derived from opened/resolved dates)
  const cycleTimeTrend = Array.from({ length: 21 }, (_, i) => {
    const dayMs = ASOF_MS - (20 - i) * DAY;
    const label = new Date(dayMs).toISOString().slice(5, 10);
    const openOn = (flow: string) => NIGO.filter(n => {
      const c = CASES.find(x => x.id === n.caseId);
      if (!c || c.flow !== flow) return false;
      const opened = toMs(n.opened) <= dayMs;
      const resolvedBy = n.resolved ? toMs(n.resolved) <= dayMs : false;
      return opened && !resolvedBy;
    }).length;
    return { day: label, claims: openOn('CAN Life'), uw: openOn('US TFA'), service: openOn('US TFA Renewal') };
  });

  // SLA compliance by week: share of cases received by that date that were not past due then
  const slaComplianceTrend = Array.from({ length: 8 }, (_, i) => {
    const weekMs = ASOF_MS - (7 - i) * 7 * DAY;
    const seen = CASES.filter(c => toMs(c.received) <= weekMs);
    const ok = seen.filter(c => !(toMs(c.due) < weekMs && (!isClosed(c) || toMs(c.lastUpdate) > weekMs))).length;
    return { week: `W${i + 1}`, compliance: seen.length ? Math.round((ok / seen.length) * 100) : 100 };
  });

  const volumeByType = (['CAN Life', 'US TFA', 'US TFA Renewal'] as const).map(flow => ({
    type: FLOW_WORKTYPE[flow],
    volume: CASES.filter(c => c.flow === flow && !isClosed(c)).length,
    complete: CASES.filter(c => c.flow === flow && c.status === 'Verified Complete').length,
  }));

  return { workItems, teamMetrics, stepMetrics, cycleTimeTrend, slaComplianceTrend, volumeByType };
}
