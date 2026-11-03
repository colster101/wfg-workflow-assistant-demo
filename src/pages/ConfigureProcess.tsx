import { useRef, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Button, alpha, Stepper, Step, StepLabel,
  TextField, MenuItem, Select, FormControl, InputLabel, Switch, Divider,
  IconButton, Tooltip,
} from '@mui/material';
import {
  ArrowBack, ArrowForward, CheckCircle, Info, RocketLaunch,
  Person, Schedule, Rule, Hub, Edit as EditIcon,
} from '@mui/icons-material';
import { wfColors } from '../theme';
import { getRegionalTemplate } from '../data/templates';
import { useDemo, type ProcessConfig } from '../context/DemoContext';
import { useRegion } from '../context/RegionContext';

const STEPS = ['Basics', 'Steps & SLAs', 'Roles & Queues', 'Approvals & Exceptions', 'Integrations', 'Review'];

const CATEGORY_OPTIONS = ['TFA Registration', 'WFG Licensing', 'TFA Training', 'Ivari/DXC', 'Carrier Relations', 'Field Services', 'Accounting', 'DXC'];

export default function ConfigureProcess() {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { configs, saveConfig } = useDemo();
  const { region } = useRegion();

  const template = id ? getRegionalTemplate(id, region) : undefined;
  const initialCfg = id ? configs[id] : undefined;

  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState<ProcessConfig | null>(initialCfg ?? null);
  const [activated, setActivated] = useState(false);

  // Resync draft if the template/route changes
  useEffect(() => {
    if (initialCfg) setDraft({ ...initialCfg, steps: initialCfg.steps.map(s => ({ ...s })), rules: initialCfg.rules.map(r => ({ ...r })), integrations: initialCfg.integrations.map(i => ({ ...i })) });
    setActive(0);
    setActivated(false);
  }, [id]);

  const enabledRulesCount = useMemo(() => draft?.rules.filter(r => r.enabled).length ?? 0, [draft]);
  const enabledIntegrationsCount = useMemo(() => draft?.integrations.filter(i => i.enabled).length ?? 0, [draft]);
  const totalSlaHours = useMemo(() => draft?.steps.reduce((acc, s) => acc + s.slaHours, 0) ?? 0, [draft]);

  if (!template || !draft) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Template not found.</Typography>
        <Button onClick={() => navigate('/library')} sx={{ mt: 2 }}>Back to Library</Button>
      </Box>
    );
  }

  function updateDraft(patch: Partial<ProcessConfig>) {
    setDraft(prev => prev ? { ...prev, ...patch } : prev);
  }

  function handleActivate() {
    if (!draft) return;
    saveConfig(draft);
    setActivated(true);
  }


  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/library')}
          sx={{ color: wfColors.slate600, fontSize: '0.8125rem', mb: 1, '&:hover': { bgcolor: alpha(wfColors.primary, 0.04) } }}>
          Back to Library
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>Configure {template.name}</Typography>
              <Chip label={template.category} size="small"
                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(wfColors.primary, 0.1), color: wfColors.primary }} />
            </Box>
            <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem', maxWidth: 720 }}>{template.longDescription}</Typography>
          </Box>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
        <Stepper activeStep={active} sx={{ mb: 4 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.8125rem', fontWeight: 600 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step content */}
        <Box sx={{ minHeight: 360 }}>
          {active === 0 && (
            <BasicsStep draft={draft} updateDraft={updateDraft} />
          )}
          {active === 1 && (
            <StepsAndSlasStep draft={draft} setDraft={setDraft} />
          )}
          {active === 2 && (
            <RolesAndQueuesStep draft={draft} setDraft={setDraft} />
          )}
          {active === 3 && (
            <RulesStep draft={draft} setDraft={setDraft} />
          )}
          {active === 4 && (
            <IntegrationsStep draft={draft} setDraft={setDraft} />
          )}
          {active === 5 && (
            <ReviewStep
              draft={draft}
              enabledRulesCount={enabledRulesCount}
              enabledIntegrationsCount={enabledIntegrationsCount}
              totalSlaHours={totalSlaHours}
              activated={activated}
              onActivate={handleActivate}
              onEdit={(stepIndex) => setActive(stepIndex)}
            />
          )}
        </Box>

        {/* Footer nav */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: `1px solid ${wfColors.divider}` }}>
          <Button startIcon={<ArrowBack />} onClick={() => setActive(a => Math.max(0, a - 1))} disabled={active === 0}>
            Back
          </Button>
          <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>
            Step {active + 1} of {STEPS.length}
          </Typography>
          {active < STEPS.length - 1 ? (
            <Button variant="contained" endIcon={<ArrowForward />} onClick={() => setActive(a => Math.min(STEPS.length - 1, a + 1))}
              sx={{ bgcolor: wfColors.primary, '&:hover': { bgcolor: '#065f46' } }}>
              Continue
            </Button>
          ) : (
            <Box sx={{ width: 80 }} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}

/* ----------------------------- Step components ----------------------------- */

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        {icon}
        <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: wfColors.slate900 }}>{title}</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.875rem', color: wfColors.slate500 }}>{subtitle}</Typography>
    </Box>
  );
}

function BasicsStep({ draft, updateDraft }: { draft: ProcessConfig; updateDraft: (p: Partial<ProcessConfig>) => void }) {
  return (
    <Box>
      <SectionHeader icon={<Info sx={{ color: wfColors.primary, fontSize: 22 }} />}
        title="Process Basics"
        subtitle="Name this process and assign an owning operations team. You can change these later." />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 560 }}>
        <TextField size="small" label="Process Name" value={draft.name} onChange={e => updateDraft({ name: e.target.value })} fullWidth />
        <FormControl size="small" fullWidth>
          <InputLabel>Owning Team</InputLabel>
          <Select label="Owning Team" value={draft.ownerTeam} onChange={e => updateDraft({ ownerTeam: e.target.value })}>
            {CATEGORY_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: wfColors.bgDefault }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: wfColors.slate500, mb: 0.5 }}>
            Built-in foundation
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate700, lineHeight: 1.55 }}>
            Case creation, routing, SLA tracking, NIGO logging and owner views are already built in. You configure owners, queues, rules and reporting for how WFG operates.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

function StepsAndSlasStep({ draft, setDraft }: { draft: ProcessConfig; setDraft: React.Dispatch<React.SetStateAction<ProcessConfig | null>> }) {
  return (
    <Box>
      <SectionHeader icon={<Schedule sx={{ color: wfColors.primary, fontSize: 22 }} />}
        title="Steps & Service Levels"
        subtitle="Tune the SLA per step. Total SLA is the sum across all steps." />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {draft.steps.map((step, i) => (
          <Paper key={step.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${wfColors.divider}`, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(wfColors.primary, 0.1), color: wfColors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
              {i + 1}
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: wfColors.slate900 }}>{step.name}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>{step.defaultDescription}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField type="number" size="small" label="SLA Hours" value={step.slaHours}
                onChange={e => setDraft(prev => prev ? { ...prev, steps: prev.steps.map((s, j) => j === i ? { ...s, slaHours: Number(e.target.value) } : s) } : prev)}
                sx={{ width: 110, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                inputProps={{ min: 0, max: 720 }} />
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Chip label={`Total SLA: ${draft.steps.reduce((s, x) => s + x.slaHours, 0)}h`} size="small"
          sx={{ fontWeight: 700, bgcolor: alpha(wfColors.primary, 0.1), color: wfColors.primary }} />
      </Box>
    </Box>
  );
}

function RolesAndQueuesStep({ draft, setDraft }: { draft: ProcessConfig; setDraft: React.Dispatch<React.SetStateAction<ProcessConfig | null>> }) {
  const { region } = useRegion();
  const template = getRegionalTemplate(draft.templateId, region)!;
  return (
    <Box>
      <SectionHeader icon={<Person sx={{ color: wfColors.primary, fontSize: 22 }} />}
        title="Roles & Queues"
        subtitle="Map each step to a role and routing queue. Defaults reflect industry-standard practice." />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {draft.steps.map((step, i) => (
          <Paper key={step.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${wfColors.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: alpha(wfColors.primary, 0.1), color: wfColors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
                {i + 1}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{step.name}</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={step.role}
                  onChange={e => setDraft(prev => prev ? { ...prev, steps: prev.steps.map((s, j) => j === i ? { ...s, role: String(e.target.value) } : s) } : prev)}>
                  {template.roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  <MenuItem value="Automated">Automated</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Queue</InputLabel>
                <Select label="Queue" value={step.queue}
                  onChange={e => setDraft(prev => prev ? { ...prev, steps: prev.steps.map((s, j) => j === i ? { ...s, queue: String(e.target.value) } : s) } : prev)}>
                  {template.queues.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
                  <MenuItem value="—">— (none)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function RulesStep({ draft, setDraft }: { draft: ProcessConfig; setDraft: React.Dispatch<React.SetStateAction<ProcessConfig | null>> }) {
  return (
    <Box>
      <SectionHeader icon={<Rule sx={{ color: wfColors.primary, fontSize: 22 }} />}
        title="Approvals & Exceptions"
        subtitle="Auto-routing and escalation rules that fire while a case is in flight." />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {draft.rules.map((rule, i) => (
          <Paper key={rule.id} elevation={0} sx={{
            p: 2, borderRadius: 2,
            border: `1px solid ${rule.enabled ? alpha(wfColors.primary, 0.2) : wfColors.divider}`,
            bgcolor: rule.enabled ? alpha(wfColors.primary, 0.02) : '#fff',
            display: 'flex', alignItems: 'flex-start', gap: 1.5,
          }}>
            <Switch checked={rule.enabled} size="small"
              onChange={() => setDraft(prev => prev ? { ...prev, rules: prev.rules.map((r, j) => j === i ? { ...r, enabled: !r.enabled } : r) } : prev)}
              sx={{ mt: 0.25 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: rule.enabled ? wfColors.slate900 : wfColors.slate500 }}>
                {rule.label}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mt: 0.25 }}>
                {rule.description}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function IntegrationsStep({ draft, setDraft }: { draft: ProcessConfig; setDraft: React.Dispatch<React.SetStateAction<ProcessConfig | null>> }) {
  return (
    <Box>
      <SectionHeader icon={<Hub sx={{ color: wfColors.primary, fontSize: 22 }} />}
        title="Integrations"
        subtitle="Connect to the systems your operations team already uses. No rip-and-replace required." />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {draft.integrations.map((ig, i) => (
          <Paper key={ig.id} elevation={0} sx={{
            p: 2, borderRadius: 2,
            border: `1px solid ${ig.enabled ? alpha(wfColors.primary, 0.2) : wfColors.divider}`,
            bgcolor: ig.enabled ? alpha(wfColors.primary, 0.02) : '#fff',
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Switch checked={ig.enabled} size="small"
              onChange={() => setDraft(prev => prev ? { ...prev, integrations: prev.integrations.map((r, j) => j === i ? { ...r, enabled: !r.enabled } : r) } : prev)} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: ig.enabled ? wfColors.slate900 : wfColors.slate500 }}>
                  {ig.name}
                </Typography>
                <Chip label={ig.category} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(wfColors.blue, 0.08), color: wfColors.blue }} />
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mt: 0.25 }}>
                {(draft.integrations[i] as any).description ?? ''}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function ReviewStep({
  draft, enabledRulesCount, enabledIntegrationsCount, totalSlaHours, activated, onActivate, onEdit,
}: {
  draft: ProcessConfig;
  enabledRulesCount: number;
  enabledIntegrationsCount: number;
  totalSlaHours: number;
  activated: boolean;
  onActivate: () => void;
  onEdit: (stepIndex: number) => void;
}) {
  return (
    <Box>
      <SectionHeader icon={<RocketLaunch sx={{ color: wfColors.primary, fontSize: 22 }} />}
        title="Review & Activate"
        subtitle="Confirm the configuration and activate the workflow. Cases can be routed once the workflow is live." />

      {activated && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: `1px solid ${alpha(wfColors.success, 0.3)}`, bgcolor: alpha(wfColors.success, 0.05) }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <CheckCircle sx={{ color: wfColors.success, fontSize: 24, flexShrink: 0, mt: 0.25 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: wfColors.success }}>
                Workflow activated
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: wfColors.slate700, mt: 0.25 }}>
                {draft.name} is live. New cases will route per the configuration you defined.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <SummaryCard title="Basics" onEdit={() => onEdit(0)}>
          <SummaryRow label="Process Name"  value={draft.name} />
          <SummaryRow label="Owning Team"   value={draft.ownerTeam} />
          <SummaryRow label="Total Steps"   value={String(draft.steps.length)} />
          <SummaryRow label="Total SLA"     value={`${totalSlaHours} hours`} />
        </SummaryCard>

        <SummaryCard title="Steps" onEdit={() => onEdit(1)}>
          {draft.steps.map((s, i) => (
            <Box key={s.id} sx={{ py: 0.75, borderBottom: i < draft.steps.length - 1 ? `1px solid ${wfColors.divider}` : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{i + 1}. {s.name}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>{s.slaHours}h</Typography>
              </Box>
            </Box>
          ))}
        </SummaryCard>

        <SummaryCard title="Roles & Queues" onEdit={() => onEdit(2)}>
          {draft.steps.map((s, i) => (
            <Box key={s.id} sx={{ py: 0.75, borderBottom: i < draft.steps.length - 1 ? `1px solid ${wfColors.divider}` : 'none' }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.name}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500 }}>
                {s.role} · {s.queue}
              </Typography>
            </Box>
          ))}
        </SummaryCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SummaryCard title="Approvals & Exceptions" onEdit={() => onEdit(3)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={`${enabledRulesCount} active`} size="small"
                sx={{ height: 20, fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha(wfColors.primary, 0.1), color: wfColors.primary }} />
              <Chip label={`${draft.rules.length - enabledRulesCount} disabled`} size="small"
                sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha(wfColors.slate400, 0.1), color: wfColors.slate500 }} />
            </Box>
            {draft.rules.filter(r => r.enabled).slice(0, 4).map(r => (
              <Typography key={r.id} sx={{ fontSize: '0.8125rem', color: wfColors.slate700, py: 0.25 }}>
                · {r.label}
              </Typography>
            ))}
          </SummaryCard>

          <SummaryCard title="Integrations" onEdit={() => onEdit(4)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={`${enabledIntegrationsCount} connected`} size="small"
                sx={{ height: 20, fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha(wfColors.primary, 0.1), color: wfColors.primary }} />
            </Box>
            {draft.integrations.filter(i => i.enabled).slice(0, 4).map(i => (
              <Typography key={i.id} sx={{ fontSize: '0.8125rem', color: wfColors.slate700, py: 0.25 }}>
                · {i.name} <span style={{ color: wfColors.slate500 }}>({i.category})</span>
              </Typography>
            ))}
          </SummaryCard>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {!activated ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>
            Activating will make this workflow available to route new cases.
          </Typography>
          <Button variant="contained" startIcon={<RocketLaunch />} onClick={onActivate}
            sx={{ bgcolor: wfColors.primary, '&:hover': { bgcolor: '#065f46' } }}>
            Activate Workflow
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          <Chip icon={<CheckCircle sx={{ fontSize: '14px !important', color: `${wfColors.success} !important` }} />}
            label="Active" sx={{ fontWeight: 700, bgcolor: alpha(wfColors.success, 0.1), color: wfColors.success, border: `1px solid ${alpha(wfColors.success, 0.3)}` }} />
        </Box>
      )}
    </Box>
  );
}

function SummaryCard({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${wfColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: wfColors.slate500 }}>
          {title}
        </Typography>
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit} sx={{ color: wfColors.slate400, '&:hover': { color: wfColors.primary } }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {children}
    </Paper>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: wfColors.slate900 }}>{value}</Typography>
    </Box>
  );
}
