import { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Chip, Table, TableHead, TableRow, TableCell, TableBody, alpha } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { wfColors } from '../theme';
import { CASES, NIGO, FLOW_STAGES, AS_OF } from '../data/wfgSeed';
import { caseOverdue, nigoAgeDays } from '../data/mockData';

function Kpi({ label, value, sub, color, onClick }: { label: string; value: string | number; sub?: string; color: string; onClick?: () => void }) {
  return (
    <Paper elevation={0} onClick={onClick}
      sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(color, 0.18)}`, borderLeft: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default', height: '100%' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: wfColors.slate500, mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: wfColors.slate900, lineHeight: 1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mt: 0.5 }}>{sub}</Typography>}
    </Paper>
  );
}

const Card = ({ children, ...rest }: { children: React.ReactNode } & Record<string, unknown>) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${wfColors.divider}`, height: '100%' }} {...rest}>{children}</Paper>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const k = useMemo(() => {
    const totalNigo = NIGO.length;
    const openNigo = NIGO.filter(n => n.status === 'Open');
    const openPct = Math.round((openNigo.length / totalNigo) * 100);
    const overdue = CASES.filter(caseOverdue).length;
    const avgAge = openNigo.length ? Math.round(openNigo.reduce((s, n) => s + nigoAgeDays(n.opened), 0) / openNigo.length) : 0;
    const chase = openNigo.filter(n => nigoAgeDays(n.opened) > 5).length;

    // NIGO by process stage
    const stageRows = Object.values(FLOW_STAGES).flat().filter((s, i, a) => a.indexOf(s) === i).map(stage => {
      const ids = CASES.filter(c => c.stage === stage).map(c => c.id);
      const evs = NIGO.filter(n => ids.includes(n.caseId));
      return { stage, total: evs.length, open: evs.filter(n => n.status === 'Open').length };
    }).filter(r => r.total > 0);

    // Owner accountability
    const owners = Array.from(new Set(CASES.map(c => c.owner)));
    const ownerRows = owners.map(owner => {
      const cs = CASES.filter(c => c.owner === owner);
      return {
        owner,
        cases: cs.length,
        overdue: cs.filter(caseOverdue).length,
        actionReq: cs.filter(c => c.status === 'Action Required').length,
        openNigo: NIGO.filter(n => n.owner === owner && n.status === 'Open').length,
      };
    }).sort((a, b) => b.overdue - a.overdue || b.openNigo - a.openNigo);

    // Case status profile
    const statusOrder = ['In Review', 'Action Required', 'Pending External', 'Verified Complete', 'Declined'] as const;
    const statusRows = statusOrder.map(s => ({ status: s, cases: CASES.filter(c => c.status === s).length }));

    return { totalNigo, openCount: openNigo.length, openPct, overdue, avgAge, chase, stageRows, ownerRows, statusRows };
  }, []);

  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>NIGO &amp; Case Operations</Typography>
        <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>
          WFG Distribution · as of {AS_OF} · Synthetic demonstration data, no WFG case records
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><Kpi label="Total NIGO Events" value={k.totalNigo} sub="All flows" color={wfColors.primary} onClick={() => navigate('/queue')} /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Kpi label="Open NIGO" value={k.openCount} sub={`${k.chase} past 5 days`} color={wfColors.red} onClick={() => navigate('/queue')} /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Kpi label="NIGO Open %" value={`${k.openPct}%`} sub="Open ÷ total events" color={wfColors.amber} /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Kpi label="Overdue Cases" value={k.overdue} sub="Next action past due" color={wfColors.red} onClick={() => navigate('/sla')} /></Grid>
        <Grid size={{ xs: 12, md: 2.4 }}><Kpi label="Avg Open NIGO Age" value={`${k.avgAge}d`} sub="Days since opened" color={wfColors.blue} /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>NIGO Event Status by Process Stage</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>Total vs open NIGO events, grouped by the stage of the case they sit on</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={k.stageRows} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={wfColors.divider} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: wfColors.slate500 }} />
                <YAxis type="category" dataKey="stage" width={150} tick={{ fontSize: 11, fill: wfColors.slate700 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" name="Total" fill={alpha(wfColors.primary, 0.35)} radius={[0, 3, 3, 0]} />
                <Bar dataKey="open" name="Open" fill={wfColors.red} radius={[0, 3, 3, 0]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Case Action Flag Profile</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>Cases by current status. Verified Complete is not a selling authority.</Typography>
            {k.statusRows.map(r => (
              <Box key={r.status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: `1px solid ${wfColors.divider}` }}>
                <Typography sx={{ fontSize: '0.875rem' }}>{r.status}</Typography>
                <Chip size="small" label={r.cases}
                  sx={{ fontWeight: 700, bgcolor: r.status === 'Action Required' ? alpha(wfColors.red, 0.1) : alpha(wfColors.slate500, 0.08), color: r.status === 'Action Required' ? wfColors.red : wfColors.slate700 }} />
              </Box>
            ))}
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(wfColors.blue, 0.06) }}>
              <Typography sx={{ fontSize: '0.78rem', color: wfColors.slate700 }}>
                Regulatory restriction: no status in this view authorises selling or files changes automatically.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Owner Accountability — Current Case Status</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: wfColors.slate500, mb: 2 }}>Who holds the next action. Sorted by overdue, then open NIGO.</Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Owner', 'Cases', 'Overdue', 'Action Required', 'Open NIGO'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: wfColors.slate600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {k.ownerRows.map(r => (
                <TableRow key={r.owner} hover onClick={() => navigate('/queue')} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{r.owner}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{r.cases}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem', color: r.overdue ? wfColors.red : wfColors.slate700, fontWeight: r.overdue ? 700 : 400 }}>{r.overdue}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{r.actionReq}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{r.openNigo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
