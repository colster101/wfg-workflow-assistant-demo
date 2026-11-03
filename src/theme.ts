import { createTheme, alpha } from '@mui/material/styles';

// Color palette matching Policy-Update project design tokens
export const wfColors = {
  // Brand greens (from Policy-Update --color-brand-*)
  primary:      '#047857',   // dark emerald
  primaryMed:   '#059669',   // medium emerald
  primaryLight: '#10b981',   // light emerald
  primaryBg:    '#ecfdf5',   // pale green tint

  // Accents
  amber:        '#f59e0b',
  amberLight:   '#fef3c7',
  red:          '#ef4444',
  redLight:     '#fef2f2',
  blue:         '#0284c7',
  blueLight:    '#e0f2fe',
  purple:       '#0284c7',
  purpleLight:  '#e0f2fe',

  // Success / warning / error
  success:      '#22c55e',
  successLight: '#dcfce7',
  warning:      '#f59e0b',
  warningLight: '#fef3c7',
  error:        '#ef4444',
  errorLight:   '#fef2f2',

  // Neutrals (from Policy-Update --color-text-*)
  slate900:   '#0f172a',
  slate700:   '#334155',
  slate600:   '#475569',
  slate500:   '#64748b',
  slate400:   '#94a3b8',
  slate200:   '#e2e8f0',
  slate100:   '#f1f5f9',
  bgDefault:  '#f4f6f8',
  bgPaper:    '#ffffff',
  divider:    '#e2e8f0',
};

export const theme = createTheme({
  palette: {
    primary: {
      main:         wfColors.primary,
      light:        wfColors.primaryMed,
      dark:         '#065f46',
      contrastText: '#ffffff',
    },
    secondary: {
      main:         wfColors.amber,
      light:        '#fbbf24',
      dark:         '#d97706',
      contrastText: '#ffffff',
    },
    success:  { main: wfColors.success,  light: '#4ade80',  dark: '#16a34a' },
    warning:  { main: wfColors.warning,  light: '#fbbf24',  dark: '#d97706' },
    error:    { main: wfColors.red,      light: '#f87171',  dark: '#dc2626' },
    info:     { main: wfColors.blue,     light: '#38bdf8',  dark: '#0369a1' },
    background: {
      default: wfColors.bgDefault,
      paper:   wfColors.bgPaper,
    },
    text: {
      primary:   wfColors.slate900,
      secondary: wfColors.slate600,
    },
    divider: wfColors.divider,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 4px rgba(0,0,0,0.07)',
    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    '0 6px 10px -2px rgba(0,0,0,0.1)',
    '0 10px 15px -3px rgba(0,0,0,0.1)',
    '0 14px 20px -4px rgba(0,0,0,0.1)',
    '0 20px 25px -5px rgba(0,0,0,0.1)',
    '0 25px 30px -6px rgba(0,0,0,0.12)',
    '0 30px 36px -7px rgba(0,0,0,0.14)',
    ...Array(15).fill('none'),
  ] as import('@mui/material/styles').Shadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 18px', minHeight: 38 },
        contained: {
          backgroundColor: wfColors.primary,
          '&:hover': { backgroundColor: '#065f46' },
          boxShadow: 'none',
          '&:active': { boxShadow: 'none' },
        },
        outlined: {
          borderColor: wfColors.primary,
          color: wfColors.primary,
          '&:hover': { backgroundColor: alpha(wfColors.primary, 0.04) },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          border: `1px solid ${wfColors.divider}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: wfColors.slate500,
          backgroundColor: wfColors.bgDefault,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default theme;
