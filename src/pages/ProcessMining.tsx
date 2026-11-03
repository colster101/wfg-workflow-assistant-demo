import { useRef, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Grid, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts';
import { TrendingDown, Warning, Lightbulb, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { wfColors } from '../theme';
import { getMockData } from '../data/mockData';
import { CASES, NIGO } from '../data/wfgSeed';
import { useRegion } from '../context/RegionContext';

/* Rework = share of cases on each stage that have at least one NIGO event (from wfgSeed). */
const reworkData = (() => {
  const stages = Array.from(new Set(CASES.map(c => c.stage)));
  return stages.map(stage => {
    const cs = CASES.filter(c => c.stage === stage);
    const withNigo = cs.filter(c => NIGO.some(n => n.caseId === c.id)).length;
    return { step: stage, reworkRate: Math.round((withNigo / cs.length) * 100), volume: cs.length };
  }).sort((x, y) => y.reworkRate - x.reworkRate);
})();

/* Tactical solutions from the WFG Horizon 1 gap register. No savings figures:
   baselines are not yet measured (see Validation sheet). */
const RECOMMENDATIONS = [
  {
    id: 1,
    type: 'bottleneck',
    title: 'Stand up one shared case tracker across DXC, Ivari and WFG',
    detail: 'Status lives in DocuSign, Outlook and Excel. A single case ID with owner, next action and due date removes the status-chasing loop. Horizon 1, no new system.',
    impact: 'To measure',
    effort: 'Low',
    saving: 'Baseline: status-chase volume',
  },
  {
    id: 2,
    type: 'rework',
    title: 'Two-clock NIGO log with a reason dictionary',
    detail: 'Record first-submission and complete-file dates separately. Agree one reason code list so NIGO rates can be compared across flows.',
    impact: 'To measure',
    effort: 'Low',
    saving: 'Baseline: NIGO open age',
  },
  {
    id: 3,
    type: 'routing',
    title: 'Exam-date and renewal watchlists with manual reminders',
    detail: '120-day exam windows and 30/180-day retake waits are currently missed. A watchlist with an owner on each date is a Horizon 1 control.',
    impact: 'To measure',
    effort: 'Low',
    saving: 'Baseline: expired windows',
  },
  {
    id: 4,
    type: 'routing',
    title: 'Daily approved-vs-active reconciliation',
    detail: 'FINRA approval feeds Caesar daily and Compass overnight. Exceptions where approved is not active are assigned to one owner each day.',
    impact: 'To measure',
    effort: 'Medium',
    saving: 'Baseline: exceptions per week',
  },
];

const IMPACT_COLOR: Record<string, string> = {
  High:   wfColors.red,
  Medium: wfColors.amber,
  Low:    wfColors.success,
};
const EFFORT_COLOR: Record<string, string> = {
  High:   wfColors.slate500,
  Medium: wfColors.blue,
  Low:    wfColors.success,
};

function RecommendationCard({ rec }: { rec: typeof RECOMMENDATIONS[0] }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${wfColors.divider}`, mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ mt: 0.25, flexShrink: 0 }}>
          <Lightbulb sx={{ fontSize: 18, color: wfColors.amber }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: wfColors.slate900 }}>{rec.title}</Typography>
            <Chip label={`Impact: ${rec.impact}`} size="small"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(IMPACT_COLOR[rec.impact] ?? wfColors.slate500, 0.1), color: IMPACT_COLOR[rec.impact] ?? wfColors.slate500 }} />
            <Chip label={`Effort: ${rec.effort}`} size="small"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(EFFORT_COLOR[rec.effort], 0.1), color: EFFORT_COLOR[rec.effort] }} />
            <Chip label={rec.saving} size="small"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(wfColors.success, 0.1), color: wfColors.success }} />
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate600, lineHeight: 1.6 }}>{rec.detail}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function ProcessMining() {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const { region } = useRegion();
  const { stepMetrics, cycleTimeTrend } = useMemo(() => getMockData(region), [region]);
  const avgAll = stepMetrics.reduce((s, m) => s + m.avgHours, 0) / stepMetrics.length;

  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>Process Mining</Typography>
        <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>
          Stage-level view from case dates: where cases wait, where NIGO rework sits, and the Horizon 1 gap register
        </Typography>
      </Box>

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Chip icon={<Warning sx={{ fontSize: '14px !important', color: `${wfColors.red} !important` }} />}
          label={`${stepMetrics.filter(s => s.bottleneck).length} Bottleneck Stages Flagged`}
          sx={{ bgcolor: alpha(wfColors.red, 0.08), color: wfColors.red, border: `1px solid ${alpha(wfColors.red, 0.2)}`, fontWeight: 700, fontSize: '0.75rem' }} />
        <Chip icon={<TrendingDown sx={{ fontSize: '14px !important', color: `${wfColors.success} !important` }} />}
          label="Baseline not yet measured"
          sx={{ bgcolor: alpha(wfColors.success, 0.08), color: wfColors.success, border: `1px solid ${alpha(wfColors.success, 0.2)}`, fontWeight: 700, fontSize: '0.75rem' }} />
        <Chip icon={<Lightbulb sx={{ fontSize: '14px !important', color: `${wfColors.amber} !important` }} />}
          label={`${RECOMMENDATIONS.length} Horizon 1 Opportunities`}
          sx={{ bgcolor: alpha(wfColors.amber, 0.08), color: '#92400e', border: `1px solid ${alpha(wfColors.amber, 0.2)}`, fontWeight: 700, fontSize: '0.75rem' }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Step cycle time */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>Hours Since Last Update, by Stage</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>
              Mean hours since the case was last updated · red = top two stages
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stepMetrics} barSize={22} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={wfColors.divider} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: wfColors.slate500 }} unit="h" />
                <YAxis type="category" dataKey="step" tick={{ fontSize: 11, fill: wfColors.slate700 }} width={130} />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${wfColors.divider}`, fontSize: 12 }}
                  formatter={(v: number) => [`${v}h`, 'Hours since update']} />
                <ReferenceLine x={avgAll} stroke={wfColors.blue} strokeDasharray="4 2"
                  label={{ value: 'Avg', position: 'top', fontSize: 10, fill: wfColors.blue }} />
                <Bar dataKey="avgHours" name="Avg Hours" radius={[0, 4, 4, 0]}>
                  {stepMetrics.map((s, i) => (
                    <Cell key={i} fill={s.bottleneck ? wfColors.red : alpha(wfColors.primary, 0.7)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bottleneck summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}`, height: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>Bottleneck Analysis</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>Top two stages by hours since last update flagged</Typography>
            {stepMetrics.map(m => (
              <Box key={m.step} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                {m.bottleneck
                  ? <ErrorOutline sx={{ fontSize: 16, color: wfColors.red, flexShrink: 0 }} />
                  : <CheckCircle sx={{ fontSize: 16, color: wfColors.success, flexShrink: 0 }} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: m.bottleneck ? wfColors.red : wfColors.slate900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.step}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: wfColors.slate500 }}>{m.avgHours}h avg · {m.volume} items</Typography>
                </Box>
                {m.bottleneck && (
                  <Chip label="Bottleneck" size="small"
                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(wfColors.red, 0.1), color: wfColors.red }} />
                )}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Rework analysis */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>Rework Loop Analysis</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>
              % of items returning to a previous step
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={reworkData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={wfColors.divider} />
                <XAxis dataKey="step" tick={{ fontSize: 10, fill: wfColors.slate500 }} />
                <YAxis tick={{ fontSize: 11, fill: wfColors.slate500 }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${wfColors.divider}`, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Rework Rate']} />
                <ReferenceLine y={10} stroke={wfColors.amber} strokeDasharray="4 2"
                  label={{ value: '10% threshold', position: 'insideTopRight', fontSize: 10, fill: wfColors.amber }} />
                <Bar dataKey="reworkRate" name="Rework Rate" radius={[4, 4, 0, 0]}>
                  {reworkData.map((r, i) => (
                    <Cell key={i} fill={r.reworkRate >= 10 ? wfColors.red : r.reworkRate >= 6 ? wfColors.amber : alpha(wfColors.primary, 0.6)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Cycle time trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>Cycle Time Trend</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>
              Open NIGO by flow — last 21 days
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cycleTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={wfColors.divider} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: wfColors.slate500 }} />
                <YAxis tick={{ fontSize: 11, fill: wfColors.slate500 }} unit="h" />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${wfColors.divider}`, fontSize: 12 }} />
                <Line type="monotone" dataKey="claims" name="CAN Life" stroke={wfColors.red} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="uw" name="US TFA" stroke={wfColors.amber} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="service" name="US TFA Renewal" stroke={wfColors.primaryLight} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Step detail table */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}`, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 2 }}>Step Performance Detail</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Step', 'Avg Cycle Time', 'Volume (MTD)', 'Rework Rate', 'Status'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: wfColors.slate500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stepMetrics.map(m => {
                const rework = reworkData.find(r => r.step === m.step);
                const reworkRate = rework?.reworkRate ?? 2;
                return (
                  <TableRow key={m.step} hover>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{m.step}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: m.bottleneck ? wfColors.red : wfColors.slate900 }}>
                        {m.avgHours}h
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: wfColors.slate700 }}>{m.volume}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: reworkRate >= 10 ? wfColors.red : reworkRate >= 6 ? wfColors.amber : wfColors.success }}>
                        {reworkRate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {m.bottleneck
                        ? <Chip label="Bottleneck" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(wfColors.red, 0.1), color: wfColors.red }} />
                        : <Chip label="Normal" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(wfColors.success, 0.1), color: wfColors.success }} />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recommendations */}
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 1.5 }}>Optimization Recommendations</Typography>
        {RECOMMENDATIONS.map(r => <RecommendationCard key={r.id} rec={r} />)}
      </Box>
    </Box>
  );
}
