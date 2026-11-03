import { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Grid, Button, alpha,
} from '@mui/material';
import {
  CheckCircle, Edit as EditIcon, Add,
} from '@mui/icons-material';
import { wfColors } from '../theme';
import { getRegionalTemplates } from '../data/templates';
import { useDemo } from '../context/DemoContext';
import { useRegion } from '../context/RegionContext';

const CATEGORY_COLOR: Record<string, string> = {
  'Claims':           wfColors.red,
  'Underwriting':     wfColors.amber,
  'Policy Servicing': wfColors.primary,
  'New Business':     wfColors.blue,
  'Registration':     wfColors.primary,
  'Licensing':        wfColors.blue,
  'Renewal':          wfColors.amber,
};

export default function ProcessLibrary() {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);

  const navigate = useNavigate();
  const { configs } = useDemo();
  const { region } = useRegion();
  const templates = useMemo(() => getRegionalTemplates(region), [region]);


  return (
    <Box ref={topRef} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: wfColors.slate900 }}>Process Library</Typography>
          <Typography sx={{ color: wfColors.slate500, fontSize: '0.875rem' }}>
            WFG distribution flows. Pick a template, review the stages and owners, then configure and activate.
          </Typography>
        </Box>

      </Box>

      <Grid container spacing={2.5}>
        {templates.map(t => {
          const cfg = configs[t.id];
          const isActive = cfg?.status === 'Active';
          const categoryColor = CATEGORY_COLOR[t.category];

          return (
            <Grid key={t.id} size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 3, height: '100%',
                border: `1px solid ${wfColors.divider}`,
                borderLeft: `4px solid ${categoryColor}`,
                position: 'relative',
                display: 'flex', flexDirection: 'column',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: wfColors.slate900 }}>{t.name}</Typography>
                      {t.badge && (
                        <Chip label={t.badge} size="small"
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(wfColors.amber, 0.12), color: '#92400e' }} />
                      )}
                      {isActive && (
                        <Chip icon={<CheckCircle sx={{ fontSize: '12px !important', color: `${wfColors.success} !important` }} />}
                          label="Active" size="small"
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(wfColors.success, 0.1), color: wfColors.success }} />
                      )}
                    </Box>
                    <Chip label={t.category} size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(categoryColor, 0.08), color: categoryColor }} />
                  </Box>
                </Box>

                <Typography sx={{ fontSize: '0.875rem', color: wfColors.slate700, mb: 1.5, lineHeight: 1.55 }}>
                  {t.shortDescription}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={`${t.steps.length} steps`} size="small"
                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(wfColors.slate200, 0.4), color: wfColors.slate700 }} />
                  <Chip label={`${t.defaultSlaHours}h default SLA`} size="small"
                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(wfColors.slate200, 0.4), color: wfColors.slate700 }} />
                  <Chip label={`${t.integrations.length} integrations`} size="small"
                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(wfColors.slate200, 0.4), color: wfColors.slate700 }} />
                </Box>

                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: wfColors.bgDefault, mb: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: wfColors.slate500, mb: 0.75 }}>
                    Workflow steps
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                    {t.steps.map((s, i) => (
                      <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ px: 1, py: 0.4, borderRadius: 1.25, fontSize: '0.7rem', fontWeight: 600,
                          bgcolor: '#fff', border: `1px solid ${wfColors.divider}`, color: wfColors.slate700 }}>
                          {s.name}
                        </Box>
                        {i < t.steps.length - 1 && <Typography sx={{ color: wfColors.slate400, fontSize: '0.7rem' }}>›</Typography>}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    variant={isActive ? 'outlined' : 'contained'}
                    startIcon={isActive ? <EditIcon /> : <Add />}
                    onClick={() => navigate(`/library/${t.id}/configure`)}
                    fullWidth
                    sx={isActive
                      ? { borderColor: wfColors.primary, color: wfColors.primary }
                      : { bgcolor: wfColors.primary, '&:hover': { bgcolor: '#065f46' } }}>
                    {isActive ? 'Edit Configuration' : 'Configure'}
                  </Button>

                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
