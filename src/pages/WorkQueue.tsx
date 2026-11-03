import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Button, IconButton, TextField, MenuItem,
  Select, FormControl, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  Search, ArrowForward, Close, Warning, CheckCircle,
  ErrorOutline, Description, Note,
  Send, AttachFile, MoreHoriz, PlayArrow, Pause,
  CallMade, AssignmentTurnedIn, Flag,
} from '@mui/icons-material';
import { wfColors } from '../theme';
import { getMockData } from '../data/mockData';
import { useRegion } from '../context/RegionContext';
import type { WorkItem } from '../types';

const SLA_COLOR = {
  'On Track': wfColors.success,
  'At Risk':  wfColors.amber,
  'Breached': wfColors.red,
};
const STATUS_COLOR: Record<string, string> = {
  'Open':        wfColors.blue,
  'In Progress': wfColors.primaryMed,
  'Pending':     wfColors.amber,
  'Escalated':   wfColors.red,
  'On Hold':     wfColors.slate500,
  'Complete':    wfColors.success,
};
const PRIORITY_COLOR: Record<string, string> = {
  'Critical': wfColors.red,
  'High':     wfColors.amber,
  'Medium':   wfColors.blue,
  'Low':      wfColors.slate400,
};

function slaLabel(hrs: number) {
  if (hrs < 0) return `${Math.abs(hrs)}h overdue`;
  if (hrs < 24) return `${hrs}h left`;
  return `${Math.round(hrs / 24)}d left`;
}

// Context-aware routing actions based on current step
function getActions(item: WorkItem): { label: string; color: string; icon: React.ReactNode }[] {
  const actions: { label: string; color: string; icon: React.ReactNode }[] = [];
  const step = item.currentStep.toLowerCase();
  const type = item.type;

  if (item.status === 'Escalated') {
    actions.push({ label: 'Acknowledge Escalation', color: wfColors.red, icon: <Flag fontSize="small" /> });
  }
  if (step.includes('intake') || step.includes('submission')) {
    actions.push({ label: 'Advance to Review', color: wfColors.primary, icon: <PlayArrow fontSize="small" /> });
    actions.push({ label: 'Request Documents', color: wfColors.blue, icon: <Description fontSize="small" /> });
  }
  if (step.includes('review') || step.includes('eligibility')) {
    actions.push({ label: 'Advance to Processing', color: wfColors.primary, icon: <PlayArrow fontSize="small" /> });
    actions.push({ label: 'Request Additional Info', color: wfColors.blue, icon: <Send fontSize="small" /> });
    actions.push({ label: 'Pend — Awaiting Response', color: wfColors.amber, icon: <Pause fontSize="small" /> });
  }
  if (step.includes('investigation') || step.includes('medical') || step.includes('risk')) {
    actions.push({ label: 'Advance to Decision', color: wfColors.primary, icon: <PlayArrow fontSize="small" /> });
    if (type === 'US TFA Registration') {
      actions.push({ label: 'Route to Regulatory Filing', color: wfColors.purple, icon: <CallMade fontSize="small" /> });
    }
    actions.push({ label: 'Pend — Awaiting Info', color: wfColors.amber, icon: <Pause fontSize="small" /> });
  }
  if (step.includes('decision') || step.includes('approval') || step.includes('underwriting')) {
    actions.push({ label: 'Approve', color: wfColors.success, icon: <CheckCircle fontSize="small" /> });
    actions.push({ label: 'Decline', color: wfColors.red, icon: <ErrorOutline fontSize="small" /> });
    actions.push({ label: 'Request More Info', color: wfColors.blue, icon: <Send fontSize="small" /> });
  }
  if (step.includes('payment') || step.includes('issue') || step.includes('quality')) {
    actions.push({ label: 'Complete & Close', color: wfColors.success, icon: <AssignmentTurnedIn fontSize="small" /> });
    actions.push({ label: 'Return to Previous Step', color: wfColors.amber, icon: <MoreHoriz fontSize="small" /> });
  }
  if (step.includes('processing') || step.includes('verification')) {
    actions.push({ label: 'Advance to QA', color: wfColors.primary, icon: <PlayArrow fontSize="small" /> });
    actions.push({ label: 'Pend — Awaiting Signature', color: wfColors.amber, icon: <Pause fontSize="small" /> });
  }

  if (!actions.some(a => a.label.toLowerCase().includes('escalat'))) {
    actions.push({ label: 'Escalate', color: wfColors.red, icon: <CallMade fontSize="small" /> });
  }
  actions.push({ label: 'Add Note', color: wfColors.slate600, icon: <Note fontSize="small" /> });

  return actions;
}

function DetailPanel({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const { region } = useRegion();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [actionDone, setActionDone] = useState<string | null>(null);
  const actions = getActions(item);
  const slaColor = SLA_COLOR[item.slaStatus];

  return (
    <Box sx={{ width: { xs: '100vw', md: 480 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${wfColors.divider}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: wfColors.slate900 }}>{item.id}</Typography>
            <Chip label={item.slaStatus === 'Breached' ? 'Missed' : item.slaStatus} size="small"
              sx={{ bgcolor: alpha(slaColor, 0.1), color: slaColor, border: `1px solid ${alpha(slaColor, 0.3)}`, fontWeight: 700, fontSize: '0.65rem' }} />
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: wfColors.slate600 }}>{item.type} · {item.customerName}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
        {/* SLA bar */}
        <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, border: `1px solid ${alpha(slaColor, 0.2)}`, bgcolor: alpha(slaColor, 0.04) }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: slaColor }}>
              {item.slaStatus === 'Breached' ? 'SLA Missed' : `SLA: ${slaLabel(item.slaHoursRemaining)}`}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500 }}>
              Due: {new Date(item.dueBy).toLocaleDateString(region.dateLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
          <LinearProgress variant="determinate"
            value={item.slaStatus === 'Breached' ? 100 : Math.min(100, Math.max(0, ((120 - item.slaHoursRemaining) / 120) * 100))}
            sx={{ height: 6, borderRadius: 4, bgcolor: alpha(slaColor, 0.12), '& .MuiLinearProgress-bar': { bgcolor: slaColor, borderRadius: 4 } }} />
        </Box>

        {/* Step progress */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: wfColors.slate500, mb: 1.5 }}>
            Progress — Step {item.stepIndex + 1} of {item.totalSteps}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {item.steps.map((s, i) => (
              <Box key={s} sx={{
                px: 1.25, py: 0.5, borderRadius: 1.5, fontSize: '0.72rem', fontWeight: 600,
                bgcolor: i < item.stepIndex ? alpha(wfColors.success, 0.1) : i === item.stepIndex ? alpha(wfColors.primary, 0.1) : alpha(wfColors.slate200, 0.5),
                color: i < item.stepIndex ? wfColors.success : i === item.stepIndex ? wfColors.primary : wfColors.slate400,
                border: `1px solid ${i === item.stepIndex ? alpha(wfColors.primary, 0.3) : 'transparent'}`,
              }}>
                {i < item.stepIndex ? '✓ ' : ''}{s}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Details grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
          {[
            { label: 'Assigned To', value: item.assignedTo },
            { label: 'Team',        value: item.team },
            { label: 'Priority',    value: item.priority },
            { label: 'Channel',     value: item.channel },
            { label: 'Case ID',      value: item.policyNumber },
            { label: 'Time in Step', value: `${item.timeInStepHours}h` },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: wfColors.slate400, mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate900, fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        {/* Description */}
        <Box sx={{ mb: 2.5, p: 1.5, borderRadius: 2, bgcolor: wfColors.bgDefault }}>
          <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate700, lineHeight: 1.6 }}>{item.description}</Typography>
        </Box>

        {/* Routing actions */}
        {actionDone ? (
          <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, border: `1px solid ${alpha(wfColors.success, 0.3)}`, bgcolor: alpha(wfColors.success, 0.06), display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: wfColors.success, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: wfColors.success }}>Action recorded: {actionDone}</Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: wfColors.slate500, mb: 1 }}>
              Routing Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {actions.map(a => (
                <Button key={a.label} size="small" startIcon={a.icon} onClick={() => {
                  if (a.label === 'Add Note') { setNoteOpen(true); return; }
                  setActionDone(a.label);
                }}
                  sx={{
                    justifyContent: 'flex-start', textAlign: 'left', px: 1.5, py: 0.75,
                    borderRadius: 2, fontSize: '0.8125rem', fontWeight: 600,
                    color: a.color, bgcolor: alpha(a.color, 0.06),
                    border: `1px solid ${alpha(a.color, 0.15)}`,
                    '&:hover': { bgcolor: alpha(a.color, 0.12) },
                  }}
                >
                  {a.label}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {/* Documents */}
        {item.documents.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: wfColors.slate500, mb: 1 }}>
              Documents ({item.documents.length})
            </Typography>
            {item.documents.map(d => (
              <Box key={d.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.875, borderBottom: `1px solid ${wfColors.divider}` }}>
                <AttachFile sx={{ fontSize: 16, color: wfColors.slate400 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{d.name}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: wfColors.slate500 }}>{d.type} · {d.size}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* History */}
        {item.notes.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: wfColors.slate500, mb: 1 }}>
              History
            </Typography>
            {item.notes.map(n => (
              <Box key={n.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', bgcolor: alpha(wfColors.primary, 0.12), color: wfColors.primary, flexShrink: 0 }}>
                  {n.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{n.user}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: wfColors.slate500 }}>
                      {new Date(n.timestamp).toLocaleDateString(region.dateLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Chip label={n.action} size="small" sx={{ height: 18, fontSize: '0.65rem', mr: 0.5, bgcolor: alpha(wfColors.primary, 0.08), color: wfColors.primary }} />
                  <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate700, mt: 0.5, lineHeight: 1.5 }}>{n.detail}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Add note dialog */}
      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Add Note</DialogTitle>
        <DialogContent>
          <TextField multiline rows={4} fullWidth placeholder="Enter note..." value={noteText} onChange={e => setNoteText(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setNoteOpen(false); setNoteText(''); setActionDone('Note added'); }}>Save Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function WorkQueue() {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSla, setFilterSla] = useState('All');
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [selected, setSelected] = useState<WorkItem | null>(null);

  const { region } = useRegion();
  const { workItems } = useMemo(() => getMockData(region), [region]);

  const filtered = workItems.filter(w => {
    const matchSearch = !search ||
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.customerName.toLowerCase().includes(search.toLowerCase()) ||
      w.policyNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || w.status === filterStatus;
    const matchSla    = filterSla === 'All'    || w.slaStatus === filterSla;
    const matchTeam   = filterTeam === 'All'   || w.team === filterTeam;
    const matchPri    = filterPriority === 'All' || w.priority === filterPriority;
    return matchSearch && matchStatus && matchSla && matchTeam && matchPri;
  }).sort((a, b) => {
    const slaOrder = { Breached: 0, 'At Risk': 1, 'On Track': 2 };
    const priOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (priOrder[a.priority] - priOrder[b.priority]) || (slaOrder[a.slaStatus] - slaOrder[b.slaStatus]);
  });

  const breachedCount = workItems.filter(w => w.slaStatus === 'Breached').length;

  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 }, display: 'flex', gap: 2, height: '100%', boxSizing: 'border-box' }}>
      {/* Main panel */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>Work Queue</Typography>
            <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>
              {filtered.length} items · {breachedCount} SLA misses
            </Typography>
          </Box>
          {breachedCount > 0 && (
            <Chip
              icon={<Warning sx={{ fontSize: '14px !important', color: `${wfColors.red} !important` }} />}
              label={`${breachedCount} Missed`}
              sx={{ bgcolor: alpha(wfColors.red, 0.1), color: wfColors.red, border: `1px solid ${alpha(wfColors.red, 0.25)}`, fontWeight: 700, fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: `1px solid ${wfColors.divider}` }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search ID, name, policy…" value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: wfColors.slate400 }} /></InputAdornment> }}
              sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }} />
            {[
              { label: 'Status', value: filterStatus, set: setFilterStatus, opts: ['All', 'Open', 'In Progress', 'Pending', 'Escalated', 'On Hold'] },
              { label: 'SLA', value: filterSla, set: setFilterSla, opts: ['All', 'Breached', 'At Risk', 'On Track'] },
              { label: 'Team', value: filterTeam, set: setFilterTeam, opts: ['All', 'DXC', 'WFG Licensing', 'Applicant', 'Carrier Relations', 'Ivari/DXC', 'Field Services', 'SMD', 'TFA Registration', 'TFA Training', 'Accounting'] },
              { label: 'Priority', value: filterPriority, set: setFilterPriority, opts: ['All', 'Critical', 'High', 'Medium', 'Low'] },
            ].map(f => (
              <FormControl key={f.label} size="small" sx={{ minWidth: 120 }}>
                <Select value={f.value} onChange={e => f.set(e.target.value)} displayEmpty
                  sx={{ fontSize: '0.875rem' }}
                  renderValue={v => v === 'All' ? <Box sx={{ color: wfColors.slate500 }}>{f.label}</Box> : v === 'Breached' ? 'Missed' : v}>
                  {f.opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: '0.875rem' }}>{o === 'Breached' ? 'Missed' : o}</MenuItem>)}
                </Select>
              </FormControl>
            ))}
            {(search || filterStatus !== 'All' || filterSla !== 'All' || filterTeam !== 'All' || filterPriority !== 'All') && (
              <Button size="small" onClick={() => { setSearch(''); setFilterStatus('All'); setFilterSla('All'); setFilterTeam('All'); setFilterPriority('All'); }}
                sx={{ color: wfColors.slate500, fontSize: '0.8125rem' }}>Clear filters</Button>
            )}
          </Box>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${wfColors.divider}`, flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['ID', 'Type / Customer', 'Status', 'SLA', 'Priority', 'Assigned To', 'Step', 'Due'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: wfColors.slate500, bgcolor: wfColors.bgDefault, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
                <TableCell sx={{ bgcolor: wfColors.bgDefault }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(item => {
                const slaColor = SLA_COLOR[item.slaStatus];
                const isSelected = selected?.id === item.id;
                return (
                  <TableRow key={item.id} hover onClick={() => setSelected(isSelected ? null : item)}
                    sx={{ cursor: 'pointer', bgcolor: isSelected ? alpha(wfColors.primary, 0.04) : undefined,
                      '&:hover': { bgcolor: alpha(wfColors.primary, 0.03) } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: wfColors.primary, whiteSpace: 'nowrap' }}>{item.id}</TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: wfColors.slate900 }}>{item.type}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500 }}>{item.customerName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.status} size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(STATUS_COLOR[item.status] ?? wfColors.slate400, 0.1), color: STATUS_COLOR[item.status] ?? wfColors.slate600 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: slaColor, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.75rem', color: slaColor, fontWeight: 700, whiteSpace: 'nowrap' }}>{slaLabel(item.slaHoursRemaining)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.priority} size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(PRIORITY_COLOR[item.priority], 0.1), color: PRIORITY_COLOR[item.priority] }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate700, whiteSpace: 'nowrap' }}>{item.assignedTo}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate700, whiteSpace: 'nowrap' }}>{item.currentStep}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: wfColors.slate500, whiteSpace: 'nowrap' }}>
                      {new Date(item.dueBy).toLocaleDateString(region.dateLocale, { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <ArrowForward sx={{ fontSize: 16, color: isSelected ? wfColors.primary : wfColors.slate400 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Detail side panel */}
      {selected && (
        <Paper elevation={0} sx={{ width: 480, flexShrink: 0, borderRadius: 2, border: `1px solid ${wfColors.divider}`, overflow: 'hidden', display: { xs: 'none', lg: 'block' } }}>
          <DetailPanel item={selected} onClose={() => setSelected(null)} />
        </Paper>
      )}
    </Box>
  );
}
