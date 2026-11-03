import { useRef, useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Grid, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Tab, Tabs,
} from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Warning, ErrorOutline, CheckCircle } from '@mui/icons-material';
import { wfColors } from '../theme';
import { getMockData } from '../data/mockData';
import { useRegion } from '../context/RegionContext';

const SLA_COLOR = {
  'On Track': wfColors.success,
  'At Risk':  wfColors.amber,
  'Breached': wfColors.red,
};

function slaLabel(hrs: number) {
  if (hrs < 0) return `${Math.abs(hrs)}h overdue`;
  if (hrs < 24) return `${hrs}h remaining`;
  return `${Math.round(hrs / 24)}d remaining`;
}

export default function SLAMonitor() {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const [tab, setTab] = useState(0);

  const { region } = useRegion();
  const { workItems, slaComplianceTrend, teamMetrics } = useMemo(() => getMockData(region), [region]);
  const teamComparisonData = teamMetrics.map(t => ({
    team: t.team.replace(' ', '\n'),
    compliance: t.slaCompliance,
    target: 90,
  }));

  const breached = workItems.filter(w => w.slaStatus === 'Breached');
  const atRisk   = workItems.filter(w => w.slaStatus === 'At Risk');
  const onTrack  = workItems.filter(w => w.slaStatus === 'On Track');
  const compliance = Math.round((onTrack.length / workItems.length) * 100);

  const urgentItems = [...breached, ...atRisk].sort((a, b) => a.slaHoursRemaining - b.slaHoursRemaining);
  const filteredItems = tab === 0 ? urgentItems : tab === 1 ? breached : atRisk;

  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>SLA Monitor</Typography>
        <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>
          Service level tracking — real-time miss detection and compliance analytics
        </Typography>
      </Box>

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Overall Compliance', value: `${compliance}%`, sub: 'Target: 90%', color: compliance >= 90 ? wfColors.success : compliance >= 80 ? wfColors.amber : wfColors.red },
          { label: 'SLA Missed', value: breached.length, sub: 'Requires immediate action', color: wfColors.red },
          { label: 'At Risk', value: atRisk.length, sub: '< 12h remaining', color: wfColors.amber },
          { label: 'On Track', value: onTrack.length, sub: 'Within SLA threshold', color: wfColors.success },
        ].map(k => (
          <Grid key={k.label} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(k.color, 0.2)}`, borderLeft: `4px solid ${k.color}` }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: wfColors.slate500, mb: 0.5 }}>
                {k.label}
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#000000', lineHeight: 1 }}>{k.value}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mt: 0.5 }}>{k.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Miss alert */}
      {breached.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${alpha(wfColors.red, 0.2)}`, borderLeft: `4px solid ${wfColors.red}`, bgcolor: alpha(wfColors.red, 0.03) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Warning sx={{ color: wfColors.red, fontSize: 20, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: wfColors.red }}>
                {breached.length} Active SLA Miss{breached.length > 1 ? 'es' : ''} — Immediate Action Required
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate600 }}>
                {breached.map(b => b.id).join(', ')} — escalation to the named owner recommended
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Compliance trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>SLA Compliance Trend</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>Weekly compliance rate — 8-week rolling</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={slaComplianceTrend}>
                <defs>
                  <linearGradient id="gCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={wfColors.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={wfColors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={wfColors.divider} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: wfColors.slate500 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: wfColors.slate500 }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${wfColors.divider}`, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Compliance']} />
                <ReferenceLine y={90} stroke={wfColors.success} strokeDasharray="4 2"
                  label={{ value: '90% target', position: 'insideTopRight', fontSize: 10, fill: wfColors.success }} />
                <Area type="monotone" dataKey="compliance" name="Compliance" stroke={wfColors.primary} fill="url(#gCompliance)" strokeWidth={2.5} dot={{ r: 3, fill: wfColors.primary }} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Team compliance */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>Team Compliance</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>vs. 90% target</Typography>
            {teamMetrics.map(t => (
              <Box key={t.team} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{t.team}</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700,
                    color: t.slaCompliance >= 90 ? wfColors.success : t.slaCompliance >= 80 ? wfColors.amber : wfColors.red }}>
                    {t.slaCompliance}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={t.slaCompliance}
                  sx={{ height: 6, borderRadius: 4, bgcolor: alpha(wfColors.slate200, 0.8),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: t.slaCompliance >= 90 ? wfColors.success : t.slaCompliance >= 80 ? wfColors.amber : wfColors.red,
                      borderRadius: 4,
                    } }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
                  {t.breached > 0 && <Typography sx={{ fontSize: '0.7rem', color: wfColors.red, fontWeight: 600 }}>{t.breached} missed</Typography>}
                  {t.atRisk > 0 && <Typography sx={{ fontSize: '0.7rem', color: wfColors.amber, fontWeight: 600 }}>{t.atRisk} at risk</Typography>}
                  {t.breached === 0 && t.atRisk === 0 && <Typography sx={{ fontSize: '0.7rem', color: wfColors.success }}>All clear</Typography>}
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Team comparison bar chart */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}`, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>Team Comparison</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>SLA compliance by team vs. 90% target</Typography>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={teamComparisonData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke={wfColors.divider} />
            <XAxis dataKey="team" tick={{ fontSize: 11, fill: wfColors.slate700 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: wfColors.slate500 }} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${wfColors.divider}`, fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v}%`, name === 'compliance' ? 'Compliance' : 'Target']} />
            <ReferenceLine y={90} stroke={wfColors.success} strokeDasharray="4 2" />
            <Bar dataKey="compliance" name="Compliance" radius={[4, 4, 0, 0]}
              fill={wfColors.primary} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Items table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 1 }}>Work Items Requiring Attention</Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: `1px solid ${wfColors.divider}` }}>
            <Tab label={`All Urgent (${urgentItems.length})`} sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none', minHeight: 40 }} />
            <Tab label={`Missed (${breached.length})`} sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none', minHeight: 40, color: wfColors.red }} />
            <Tab label={`At Risk (${atRisk.length})`} sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none', minHeight: 40, color: wfColors.amber }} />
          </Tabs>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['ID', 'Type', 'Customer', 'Team', 'Assigned To', 'Current Step', 'SLA Status', 'Priority'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: wfColors.slate500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map(item => {
                const slaColor = SLA_COLOR[item.slaStatus];
                return (
                  <TableRow key={item.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: wfColors.primary }}>{item.id}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate700 }}>{item.type}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate900, fontWeight: 500 }}>{item.customerName}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate600 }}>{item.team}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate600 }}>{item.assignedTo}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate700 }}>{item.currentStep}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {item.slaStatus === 'Breached'
                          ? <ErrorOutline sx={{ fontSize: 14, color: wfColors.red }} />
                          : <Warning sx={{ fontSize: 14, color: wfColors.amber }} />}
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: slaColor }}>{item.slaStatus === 'Breached' ? 'Missed' : item.slaStatus}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: slaColor }}>{slaLabel(item.slaHoursRemaining)}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.priority} size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700,
                          bgcolor: alpha(item.priority === 'Critical' ? wfColors.red : item.priority === 'High' ? wfColors.amber : wfColors.blue, 0.1),
                          color: item.priority === 'Critical' ? wfColors.red : item.priority === 'High' ? wfColors.amber : wfColors.blue }} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 32, color: wfColors.success, mb: 1 }} />
                    <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>No items in this category</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
