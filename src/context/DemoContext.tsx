import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import { getRegionalTemplate, getRegionalTemplates, type ProcessTemplate, type StepBuiltIn } from '../data/templates';
import { useRegion } from './RegionContext';
import type { RegionPack } from '../data/regions';

export type StepConfig = StepBuiltIn & {
  queue: string;
  role: string;
  slaHours: number;
};

export type ProcessConfig = {
  templateId: string;
  name: string;
  ownerTeam: string;
  steps: StepConfig[];
  rules: { id: string; label: string; description: string; enabled: boolean }[];
  integrations: { id: string; name: string; category: string; enabled: boolean }[];
  status: 'Draft' | 'Configured' | 'Active';
  activatedAt?: string;
};

export type WalkthroughEvent = {
  id: string;
  timestamp: string;
  stepName: string;
  user: string;
  action: string;
  detail?: string;
};

export type WalkthroughState = {
  caseId: string;
  customerName: string;
  policyNumber: string;
  productName: string;
  requestType: string;
  riderType: string;
  currentPremium: number;
  newPremium: number;
  faceAmount: number;
  startedAt: string;
  effectiveDate: string;
  currentStepIndex: number;
  completed: boolean;
  events: WalkthroughEvent[];
};

const DEFAULT_OWNER_TEAM_BY_CATEGORY: Record<string, string> = {
  Registration: 'TFA Registration',
  Licensing: 'WFG Licensing',
  Renewal: 'Field Services',
  'New Business': 'New Business',
};

function buildDefaultConfig(template: ProcessTemplate): ProcessConfig {
  return {
    templateId: template.id,
    name: template.name,
    ownerTeam: DEFAULT_OWNER_TEAM_BY_CATEGORY[template.category] ?? 'WFG Licensing',
    steps: template.steps.map(s => ({
      ...s,
      role: s.defaultRole,
      queue: s.defaultQueue,
      slaHours: s.defaultSlaHours,
    })),
    rules: template.rules.map(r => ({ id: r.id, label: r.label, description: r.description, enabled: r.defaultEnabled })),
    integrations: template.integrations.map(i => ({ id: i.id, name: i.name, category: i.category, enabled: i.defaultEnabled })),
    status: 'Draft',
  };
}

function buildInitialConfigs(region: RegionPack): Record<string, ProcessConfig> {
  return Object.fromEntries(
    getRegionalTemplates(region).map(t => [t.id, buildDefaultConfig(t)])
  );
}

/* Re-overlay region-specific labels (currency thresholds in rule names, etc.)
   AND the latest template integrations list onto existing configs without
   losing user edits (enabled flags, SLA tweaks). Integrations that disappear
   from the template are dropped; new ones inherit defaultEnabled. */
function reapplyRegionalLabels(
  configs: Record<string, ProcessConfig>,
  region: RegionPack,
): Record<string, ProcessConfig> {
  const out: Record<string, ProcessConfig> = {};
  for (const [id, cfg] of Object.entries(configs)) {
    const rt = getRegionalTemplate(id, region);
    if (!rt) { out[id] = cfg; continue; }
    out[id] = {
      ...cfg,
      rules: cfg.rules.map(r => {
        const fresh = rt.rules.find(rr => rr.id === r.id);
        return fresh ? { ...r, label: fresh.label, description: fresh.description } : r;
      }),
      integrations: rt.integrations.map(ti => {
        const existing = cfg.integrations.find(ci => ci.id === ti.id);
        return {
          id: ti.id,
          name: ti.name,
          category: ti.category,
          enabled: existing ? existing.enabled : ti.defaultEnabled,
        };
      }),
    };
  }
  return out;
}

/* The walkthrough's primary customer is region-specific. We map index 1 of
   the customer pool to "Margaret Chen / Mei Lin Chua / Aisha Patel" — i.e.
   a representative servicing case that the demo always opens with. */
const WALKTHROUGH_CUSTOMER_INDEX = 1;

/* Refresh the region-driven fields on an in-flight walkthrough so a region
   switch mid-demo updates currency, customer, and product without losing
   step progress, timestamps, or the activity log. */
function reapplyRegionalCaseData(prev: WalkthroughState, region: RegionPack): WalkthroughState {
  const customer = region.customers[WALKTHROUGH_CUSTOMER_INDEX];
  return {
    ...prev,
    customerName: customer.name,
    productName: region.product.name,
    riderType: region.product.defaultRider,
    currentPremium: region.product.currentPremium,
    newPremium: region.product.newPremium,
    faceAmount: region.product.faceAmount,
  };
}

function makeWalkthroughCase(config: ProcessConfig, region: RegionPack): WalkthroughState {
  const caseId = `WF-2026-${String(Math.floor(100 + Math.random() * 899)).padStart(4, '0')}`;
  const now = new Date();
  const customer = region.customers[WALKTHROUGH_CUSTOMER_INDEX];
  return {
    caseId,
    customerName: customer.name,
    policyNumber: 'POL-558290',
    productName: region.product.name,
    requestType: 'Rider Addition',
    riderType: region.product.defaultRider,
    currentPremium: region.product.currentPremium,
    newPremium: region.product.newPremium,
    faceAmount: region.product.faceAmount,
    startedAt: now.toISOString(),
    effectiveDate: new Date(now.getTime() + 86400000).toISOString().slice(0, 10),
    currentStepIndex: 0,
    completed: false,
    events: [
      {
        id: 'evt-init',
        timestamp: now.toISOString(),
        stepName: config.steps[0].name,
        user: 'System',
        action: 'Case Created',
        detail: `${config.name} case ${caseId} opened from inbound customer service call.`,
      },
    ],
  };
}

export type DocumentNote = {
  id: string;
  timestamp: string;
  author: string;
  body: string;
};

type DemoContextValue = {
  configs: Record<string, ProcessConfig>;
  saveConfig: (cfg: ProcessConfig) => void;
  saveDraft: (cfg: ProcessConfig) => void;
  walkthrough: WalkthroughState | null;
  startWalkthrough: () => void;
  advanceWalkthrough: (action: string, detail?: string, user?: string) => void;
  resetWalkthrough: () => void;
  resetDemo: () => void;
  documentNotes: Record<string, DocumentNote[]>;
  addDocumentNote: (docId: string, body: string, author: string) => void;
};

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

/* Activated workflows survive a page reload so the demo keeps what was
   configured. Stored per browser; resetDemo() clears it for the next run. */
const STORAGE_KEY = 'wfg-demo-configs-v1';

function loadStoredConfigs(region: RegionPack): Record<string, ProcessConfig> {
  const fresh = buildInitialConfigs(region);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const stored = JSON.parse(raw) as Record<string, ProcessConfig>;
    for (const id of Object.keys(fresh)) {
      if (stored[id]) fresh[id] = stored[id];
    }
  } catch {
    /* storage blocked or corrupt: fall back to defaults */
  }
  return fresh;
}

function saveStoredConfigs(configs: Record<string, ProcessConfig>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    /* storage unavailable: demo still works in memory */
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const { region } = useRegion();
  const [configs, setConfigs] = useState<Record<string, ProcessConfig>>(() => loadStoredConfigs(region));
  const [walkthrough, setWalkthrough] = useState<WalkthroughState | null>(null);
  const [documentNotes, setDocumentNotes] = useState<Record<string, DocumentNote[]>>({});

  useEffect(() => {
    saveStoredConfigs(configs);
  }, [configs]);

  useEffect(() => {
    setConfigs(prev => reapplyRegionalLabels(prev, region));
    setWalkthrough(prev => prev ? reapplyRegionalCaseData(prev, region) : prev);
  }, [region]);

  const value = useMemo<DemoContextValue>(() => ({
    configs,
    saveConfig: (cfg) => setConfigs(prev => ({ ...prev, [cfg.templateId]: { ...cfg, status: 'Active', activatedAt: new Date().toISOString() } })),
    walkthrough,
    startWalkthrough: () => {
      const endorsement = configs['policy-endorsement'];
      setWalkthrough(makeWalkthroughCase(endorsement, region));
    },
    advanceWalkthrough: (action, detail, user) => {
      setWalkthrough(prev => {
        if (!prev) return prev;
        const endorsementCfg = configs['policy-endorsement'];
        const nextIndex = Math.min(prev.currentStepIndex + 1, endorsementCfg.steps.length - 1);
        const completed = nextIndex >= endorsementCfg.steps.length - 1 && prev.currentStepIndex === endorsementCfg.steps.length - 2;
        const stepName = endorsementCfg.steps[prev.currentStepIndex].name;
        const newEvent: WalkthroughEvent = {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stepName,
          user: user ?? endorsementCfg.steps[prev.currentStepIndex].role,
          action,
          detail,
        };
        return {
          ...prev,
          currentStepIndex: nextIndex,
          completed: completed || prev.completed,
          events: [...prev.events, newEvent],
        };
      });
    },
    resetWalkthrough: () => setWalkthrough(null),
    saveDraft: (cfg) => setConfigs(prev => ({ ...prev, [cfg.templateId]: { ...cfg, status: cfg.status === 'Active' ? 'Active' : 'Draft' } })),
    resetDemo: () => {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setConfigs(buildInitialConfigs(region));
      setWalkthrough(null);
      setDocumentNotes({});
    },
    documentNotes,
    addDocumentNote: (docId, body, author) => {
      setDocumentNotes(prev => ({
        ...prev,
        [docId]: [
          ...(prev[docId] ?? []),
          { id: `note-${Date.now()}`, timestamp: new Date().toISOString(), author, body },
        ],
      }));
    },
  }), [configs, walkthrough, region, documentNotes]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}
