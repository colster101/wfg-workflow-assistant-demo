import { useState, useRef, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography,
  IconButton, Avatar, Menu, MenuItem, Divider, Chip, alpha,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme as useMuiTheme, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, PlaylistPlay, AutoGraph,
  Speed, Settings, AccountCircle, Logout, LibraryBooks,
  NotificationsOutlined, ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import { theme, wfColors } from './theme';
import Dashboard_ from './pages/Dashboard';
import WorkQueue from './pages/WorkQueue';
import ProcessMining from './pages/ProcessMining';
import SLAMonitor from './pages/SLAMonitor';
import Admin from './pages/Admin';
import ProcessLibrary from './pages/ProcessLibrary';
import ConfigureProcess from './pages/ConfigureProcess';
import { DemoProvider } from './context/DemoContext';
import { RegionProvider, useRegion } from './context/RegionContext';
import { CASES } from './data/wfgSeed';
import { caseOverdue } from './data/mockData';

const DRAWER_W = 240;
const DRAWER_COLLAPSED = 64;

const NAV_GROUPS = [
  {
    label: 'WORKFLOW',
    items: [
      { path: '/',        label: 'Dashboard',       icon: <Dashboard fontSize="small" /> },
      { path: '/library', label: 'Process Library', icon: <LibraryBooks fontSize="small" /> },
      { path: '/queue',   label: 'Case Queue',      icon: <PlaylistPlay fontSize="small" /> },
      { path: '/process', label: 'Process Mining',  icon: <AutoGraph fontSize="small" /> },
      { path: '/sla',     label: 'SLA Monitor',     icon: <Speed fontSize="small" /> },
      { path: '/admin',   label: 'Configuration',   icon: <Settings fontSize="small" /> },
    ],
  },
];

const NAV_FLAT = NAV_GROUPS.flatMap(g => g.items);

const NOTIFS = [
  { id: 1, text: 'DEMO-009 CRD update failed — NIGO open since 28 Oct', time: 'Demo', urgent: true },
  { id: 2, text: 'DEMO-004 Compass expiry mismatch — NIGO open since 28 Oct', time: 'Demo', urgent: true },
  { id: 3, text: 'DEMO-016 fee discrepancy assigned to Accounting', time: 'Demo', urgent: false },
];

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const { region } = useRegion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
  const [notifMenu, setNotifMenu] = useState<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overdueCount = useMemo(() => CASES.filter(caseOverdue).length, []);

  const drawerW = collapsed ? DRAWER_COLLAPSED : DRAWER_W;

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [location.pathname]);

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderRight: `1px solid ${wfColors.divider}` }}>
      <Box
        sx={{
          px: collapsed ? 1 : 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64, borderBottom: `1px solid ${wfColors.divider}`, cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box sx={{
            width: collapsed ? 36 : 40, height: 36, borderRadius: 2, bgcolor: wfColors.primary, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
          }}>WFG</Box>
          {!collapsed && (
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: wfColors.slate900, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                Workflow Assistant
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: wfColors.slate500, fontWeight: 500 }}>
                Synthetic demo
              </Typography>
            </Box>
          )}
        </Box>
        {!isMobile && !collapsed && (
          <IconButton size="small" onClick={e => { e.stopPropagation(); setCollapsed(true); }} sx={{ color: wfColors.slate400 }}>
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}
      </Box>

      {collapsed && !isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, borderBottom: `1px solid ${wfColors.divider}` }}>
          <IconButton size="small" onClick={() => setCollapsed(false)} sx={{ color: wfColors.slate400 }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
      )}

      <List sx={{ flex: 1, px: 1, py: 1.5, overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <Box key={group.label}>
            {!collapsed && (
              <Typography sx={{ px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: wfColors.slate400 }}>
                {group.label}
              </Typography>
            )}
            {group.items.map(item => {
              const active = isActive(item.path);
              return (
                <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                    sx={{
                      mb: 0.5, borderRadius: 2, minHeight: 40, px: 1.5,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: active ? alpha(wfColors.primary, 0.08) : 'transparent',
                      borderLeft: active ? `3px solid ${wfColors.primary}` : '3px solid transparent',
                      '&:hover': { bgcolor: active ? alpha(wfColors.primary, 0.10) : alpha(wfColors.primary, 0.04) },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: active ? wfColors.primary : wfColors.slate500 }}>{item.icon}</ListItemIcon>
                    {!collapsed && (
                      <ListItemText primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: active ? wfColors.primary : wfColors.slate700 }} />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </List>

      {!collapsed && (
        <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${wfColors.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: wfColors.primary, fontSize: '0.75rem', fontWeight: 700 }}>{region.operator.initials}</Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: wfColors.slate900, lineHeight: 1.2 }}>{region.operator.name}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: wfColors.slate500 }}>{region.operator.role}</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? DRAWER_W : drawerW, flexShrink: 0,
          '& .MuiDrawer-paper': { width: isMobile ? DRAWER_W : drawerW, boxSizing: 'border-box', border: 'none', transition: 'width 0.2s ease', overflowX: 'hidden' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: `1px solid ${wfColors.divider}`, color: 'text.primary', zIndex: t => t.zIndex.drawer + 1 }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 }, gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{ color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: wfColors.slate900 }}>
              {NAV_FLAT.find(n => isActive(n.path))?.label ?? 'Workflow Assistant'}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip
              label={`${overdueCount} overdue`}
              size="small"
              sx={{ bgcolor: alpha(wfColors.red, 0.1), color: wfColors.red, border: `1px solid ${alpha(wfColors.red, 0.25)}`, fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}
              onClick={() => navigate('/sla')}
            />
            <IconButton onClick={e => setNotifMenu(e.currentTarget)} size="small" sx={{ color: wfColors.slate600 }}>
              <Box sx={{ position: 'relative' }}>
                <NotificationsOutlined fontSize="small" />
                <Box sx={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', bgcolor: wfColors.red, border: '1.5px solid #fff' }} />
              </Box>
            </IconButton>
            <Menu anchorEl={notifMenu} open={Boolean(notifMenu)} onClose={() => setNotifMenu(null)}
              PaperProps={{ sx: { mt: 1.5, width: 360, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: `1px solid ${wfColors.divider}` } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${wfColors.divider}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</Typography>
              </Box>
              {NOTIFS.map(n => (
                <MenuItem key={n.id} onClick={() => setNotifMenu(null)} sx={{ py: 1.5, px: 2, alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.urgent ? wfColors.red : wfColors.primaryLight, flexShrink: 0, mt: 0.75 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>{n.text}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: wfColors.slate500, mt: 0.25 }}>{n.time}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
            <Avatar onClick={e => setUserMenu(e.currentTarget)}
              sx={{ width: 32, height: 32, bgcolor: wfColors.primary, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              {region.operator.initials}
            </Avatar>
            <Menu anchorEl={userMenu} open={Boolean(userMenu)} onClose={() => setUserMenu(null)}
              PaperProps={{ sx: { mt: 1.5, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: `1px solid ${wfColors.divider}` } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${wfColors.divider}` }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{region.operator.name}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: wfColors.slate500 }}>{region.operator.role}</Typography>
              </Box>
              <MenuItem sx={{ py: 1.25 }}><ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>Profile</MenuItem>
              <Divider />
              <MenuItem sx={{ py: 1.25, color: wfColors.red }}><ListItemIcon><Logout fontSize="small" sx={{ color: wfColors.red }} /></ListItemIcon>Sign Out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box ref={contentRef} sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<Dashboard_ />} />
            <Route path="/library" element={<ProcessLibrary />} />
            <Route path="/library/:id/configure" element={<ConfigureProcess />} />
            <Route path="/queue" element={<WorkQueue />} />
            <Route path="/process" element={<ProcessMining />} />
            <Route path="/sla" element={<SLAMonitor />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RegionProvider>
        <DemoProvider>
          <Router>
            <AppContent />
          </Router>
        </DemoProvider>
      </RegionProvider>
    </ThemeProvider>
  );
}
