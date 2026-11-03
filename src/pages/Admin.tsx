import { useRef, useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Grid, alpha, Button, Switch,
  TextField, IconButton, Select,
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import {
  Add, Edit, Delete, CheckCircle, Route,
  AccountTree, Schedule, Notifications, Save,
} from '@mui/icons-material';
import { wfColors } from '../theme';

const INITIAL_RULES = [
  { id: 1, name: 'NIGO Chase After 5 Days', trigger: 'NIGO open > 5 days', action: 'Flag Chase and notify owner', team: 'All Teams', active: true },
  { id: 2, name: 'CRD Update Failed', trigger: 'Regulatory filing = CRD update failed', action: 'Open CRD exception; route to TFA Registration', team: 'TFA Registration', active: true },
  { id: 3, name: 'Exam Window Watch', trigger: 'Exam window < 14 days remaining', action: 'Add to exam watchlist; remind owner', team: 'TFA Training', active: true },
  { id: 4, name: 'Approved vs Active Mismatch', trigger: 'FINRA approved AND Compass not active', action: 'Daily exception to Status Reconciliation', team: 'Ivari/DXC', active: true },
  { id: 5, name: 'Renewal Fee Discrepancy', trigger: 'Fee discrepancy logged', action: 'Route to Accounting', team: 'Accounting', active: false },
];

const FLOWS = [
  { id: 'tfa', name: 'US TFA Registration', steps: ['Initiate & submit', 'Review & approve', 'Regulatory filing', 'Exams / window', 'Registration approved'], slaHours: 720 },
  { id: 'can', name: 'CAN Life Licensing', steps: ['Application / onboarding', 'Education / exam', 'Contracting review', 'Regulator application', 'Licence activation', 'Carrier contracting', 'Ready to sell'], slaHours: 960 },
  { id: 'ren', name: 'US TFA Renewal', steps: ['CE / good standing', 'Renewal fees', 'Financial reconciliation'], slaHours: 480 },
];

const NOTIF_SETTINGS = [
  { label: 'SLA Miss Alert', desc: 'Notify team lead immediately on miss', enabled: true },
  { label: 'At-Risk Warning (< 8h)', desc: 'Send warning when < 8h SLA remaining', enabled: true },
  { label: 'Daily Digest', desc: 'Morning summary email to all managers', enabled: true },
  { label: 'Escalation Confirmation', desc: 'Confirm escalation via email to assignee', enabled: false },
  { label: 'Process Mining Alerts', desc: 'Notify when new bottleneck detected', enabled: true },
];

export default function Admin() {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const [rules, setRules] = useState(INITIAL_RULES);
  const [notifs, setNotifs] = useState(NOTIF_SETTINGS);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [slaOverrides, setSlaOverrides] = useState<Record<string, number>>({
    tfa: 720, can: 960, ren: 480,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>Configuration</Typography>
          <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>
            Routing rules, workflow flows, SLA thresholds, and notification settings
          </Typography>
        </Box>
        <Button variant="contained" startIcon={saved ? <CheckCircle /> : <Save />}
          onClick={handleSave}
          sx={{ bgcolor: saved ? wfColors.success : wfColors.primary, '&:hover': { bgcolor: saved ? '#16a34a' : '#065f46' } }}>
          {saved ? 'Saved' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Routing rules */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}`, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Route sx={{ fontSize: 20, color: wfColors.primary }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Routing Rules</Typography>
              </Box>
              <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setRuleDialog(true)}
                sx={{ fontSize: '0.8125rem' }}>
                Add Rule
              </Button>
            </Box>
            {rules.map((rule, i) => (
              <Box key={rule.id} sx={{
                p: 1.75, mb: 1, borderRadius: 2,
                border: `1px solid ${rule.active ? alpha(wfColors.primary, 0.15) : wfColors.divider}`,
                bgcolor: rule.active ? alpha(wfColors.primary, 0.02) : alpha(wfColors.slate200, 0.3),
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Switch size="small" checked={rule.active}
                    onChange={() => setRules(prev => prev.map((r, j) => j === i ? { ...r, active: !r.active } : r))}
                    sx={{ mt: 0.25, '& .MuiSwitch-track': { bgcolor: rule.active ? wfColors.primary : undefined } }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: rule.active ? wfColors.slate900 : wfColors.slate400 }}>
                        {rule.name}
                      </Typography>
                      <Chip label={rule.team} size="small"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(wfColors.primary, 0.08), color: wfColors.primary }} />
                      {!rule.active && <Chip label="Disabled" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(wfColors.slate400, 0.1), color: wfColors.slate500 }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500, mt: 0.25 }}>
                      <strong>Trigger:</strong> {rule.trigger}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500 }}>
                      <strong>Action:</strong> {rule.action}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Edit rule">
                      <IconButton size="small" sx={{ color: wfColors.slate400 }}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete rule">
                      <IconButton size="small" onClick={() => setRules(prev => prev.filter((_, j) => j !== i))}
                        sx={{ color: wfColors.slate400, '&:hover': { color: wfColors.red } }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Workflow flows */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccountTree sx={{ fontSize: 20, color: wfColors.primary }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Workflow Flows</Typography>
            </Box>
            {FLOWS.map(flow => (
              <Box key={flow.id} sx={{ mb: 2, p: 2, borderRadius: 2, border: `1px solid ${wfColors.divider}`, cursor: 'pointer',
                bgcolor: activeFlow === flow.id ? alpha(wfColors.primary, 0.03) : undefined,
                borderColor: activeFlow === flow.id ? alpha(wfColors.primary, 0.25) : wfColors.divider,
              }}
                onClick={() => setActiveFlow(activeFlow === flow.id ? null : flow.id)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: activeFlow === flow.id ? 1.5 : 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{flow.name}</Typography>
                    <Chip label={`${flow.steps.length} steps`} size="small"
                      sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(wfColors.blue, 0.08), color: wfColors.blue }} />
                    <Chip label={`${slaOverrides[flow.id]}h SLA`} size="small"
                      sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(wfColors.amber, 0.08), color: '#92400e' }} />
                  </Box>
                  <Button size="small" sx={{ color: wfColors.primary, fontSize: '0.75rem', fontWeight: 600 }}>
                    {activeFlow === flow.id ? 'Close' : 'Configure'}
                  </Button>
                </Box>
                {activeFlow === flow.id && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
                      {flow.steps.map((s, i) => (
                        <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ px: 1.25, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 600,
                            bgcolor: alpha(wfColors.primary, 0.08), color: wfColors.primary,
                            border: `1px solid ${alpha(wfColors.primary, 0.2)}` }}>
                            {i + 1}. {s}
                          </Box>
                          {i < flow.steps.length - 1 && <Typography sx={{ color: wfColors.slate400, fontSize: '0.75rem' }}>→</Typography>}
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: wfColors.slate700 }}>SLA Hours:</Typography>
                      <TextField type="number" size="small" value={slaOverrides[flow.id]}
                        onChange={e => setSlaOverrides(prev => ({ ...prev, [flow.id]: Number(e.target.value) }))}
                        sx={{ width: 100, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                        inputProps={{ min: 1, max: 720 }} />
                      <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>hours from intake to completion</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* SLA thresholds */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}`, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Schedule sx={{ fontSize: 20, color: wfColors.primary }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>SLA Thresholds</Typography>
            </Box>
            {[
              { label: 'At-Risk Warning', desc: 'Trigger "At Risk" status', defaultVal: 12, unit: 'h remaining' },
              { label: 'Critical Threshold', desc: 'Auto-escalate if < this', defaultVal: 4, unit: 'h remaining' },
              { label: 'Dashboard Refresh', desc: 'Real-time update interval', defaultVal: 5, unit: 'min' },
            ].map(t => (
              <Box key={t.label} sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 0.25 }}>{t.label}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500, mb: 0.75 }}>{t.desc}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField type="number" size="small" defaultValue={t.defaultVal}
                    sx={{ width: 80, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }} />
                  <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500 }}>{t.unit}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Notifications */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Notifications sx={{ fontSize: 20, color: wfColors.primary }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Notifications</Typography>
            </Box>
            {notifs.map((n, i) => (
              <Box key={n.label} sx={{ mb: 1.5, pb: 1.5, borderBottom: i < notifs.length - 1 ? `1px solid ${wfColors.divider}` : 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{n.label}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500 }}>{n.desc}</Typography>
                  </Box>
                  <Switch size="small" checked={n.enabled}
                    onChange={() => setNotifs(prev => prev.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Add rule dialog */}
      <Dialog open={ruleDialog} onClose={() => setRuleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Routing Rule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Rule Name" size="small" fullWidth />
            <TextField label="Trigger Condition" size="small" fullWidth placeholder="e.g. SLA < 4h remaining" />
            <TextField label="Action" size="small" fullWidth placeholder="e.g. Escalate to team lead" />
            <FormControl size="small" fullWidth>
              <InputLabel>Applies To</InputLabel>
              <Select label="Applies To" defaultValue="All Teams">
                {['All Teams', 'TFA Registration', 'TFA Training', 'WFG Licensing', 'Ivari/DXC', 'Field Services', 'Accounting'].map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRuleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setRules(prev => [...prev, { id: Date.now(), name: 'New Rule', trigger: '—', action: '—', team: 'All Teams', active: true }]);
            setRuleDialog(false);
          }}>Add Rule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
