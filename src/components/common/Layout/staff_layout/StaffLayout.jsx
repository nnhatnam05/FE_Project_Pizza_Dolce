import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
  Chip,
  Collapse as MuiCollapse,
} from '@mui/material';
import { styled, alpha, ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableBarIcon from '@mui/icons-material/TableBar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 240;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '30px',
  backgroundColor: alpha(theme.palette.common.black, 0.06),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function StaffLayoutContent() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const open = Boolean(anchorEl);
  const [appsOpen, setAppsOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleSidebarCollapse = () => {
    setSidebarOpen((prev) => !prev);
  };
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.clear();
    navigate('/login/admin');
  };

  // Sidebar menu cấu hình
  const menuGroups = [
    {
      label: 'HOME',
      items: [
        {
          label: 'Dashboard',
          icon: <DashboardIcon />,
          to: '/staff',
        },
      ],
    },
    {
      label: 'APPS',
      items: [
        {
          label: 'Foods',
          icon: <RestaurantMenuIcon />,
          to: '/staff/foods',
        },
        {
          label: 'Tables',
          icon: <TableBarIcon />,
          to: '/staff/tables',
        },
        {
          label: 'Orders',
          icon: <ReceiptLongIcon />,
          to: '/staff/orders',
        },
      ],
    },
    {
      label: 'PAGES',
      items: [
        {
          label: 'Collapse',
          icon: <ChevronLeftIcon />,
          action: handleSidebarCollapse,
        },
      ],
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', borderRight: '1px solid #e6e8ec', transition: 'width 0.2s', width: sidebarOpen ? drawerWidth : 72 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
        <Typography variant="h6" sx={{ color: '#2ecc7a', fontWeight: 700, letterSpacing: 1, display: sidebarOpen ? 'block' : 'none' }}>
          🍕PIZZA
        </Typography>
        <IconButton onClick={handleSidebarCollapse} sx={{ ml: sidebarOpen ? 1 : 0 }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {menuGroups.map((group, idx) => (
          <Box key={group.label} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ pl: sidebarOpen ? 3 : 1, pt: 2, color: '#8e99af', fontWeight: 600, letterSpacing: 1, display: sidebarOpen ? 'block' : 'none' }}>{group.label}</Typography>
            <List dense>
              {group.items.map((item) => (
                item.to ? (
                  <ListItemButton
                    key={item.label}
                    component={NavLink}
                    to={item.to}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      minHeight: 44,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      px: sidebarOpen ? 2 : 1,
                      '&.active': {
                        bgcolor: '#e6f4ef',
                        color: '#2ecc7a',
                        fontWeight: 700,
                        '& .MuiListItemIcon-root': { color: '#2ecc7a' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                    {sidebarOpen && <ListItemText primary={item.label} />}
                    {item.new && sidebarOpen && <Chip label="New" color="success" size="small" icon={<FiberNewIcon />} sx={{ ml: 1 }} />}
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    key={item.label}
                    onClick={item.action}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      minHeight: 44,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      px: sidebarOpen ? 2 : 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                    {sidebarOpen && <ListItemText primary={item.label} />}
                  </ListItemButton>
                )
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 72}px)` },
          ml: { sm: `${sidebarOpen ? drawerWidth : 72}px` },
          bgcolor: theme.palette.mode === 'light' ? '#fff' : '#222',
          color: theme.palette.mode === 'light' ? '#222' : '#fff',
          boxShadow: '0 2px 8px rgba(44,204,122,0.08)',
          borderBottom: '1px solid #e6e8ec',
          transition: 'width 0.2s, margin 0.2s',
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={theme.palette.mode === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: '#2ecc7a' }}>A</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Setting</MenuItem>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: sidebarOpen ? drawerWidth : 72 }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* Sidebar cho mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarOpen ? drawerWidth : 72,
              bgcolor: '#f8fafc',
              borderRight: '1px solid #e6e8ec',
              transition: 'width 0.2s',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Sidebar cho desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarOpen ? drawerWidth : 72,
              bgcolor: '#f8fafc',
              borderRight: '1px solid #e6e8ec',
              transition: 'width 0.2s',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 72}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: 'width 0.2s',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default function StaffLayout() {
  const [mode, setMode] = React.useState('light');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light' ? {
            primary: {
              main: '#2ecc7a',
              light: '#a5f0ca',
              dark: '#1e8853',
              contrastText: '#ffffff',
            },
            background: {
              default: '#f8fafc',
              paper: '#ffffff',
            },
          } : {
            primary: {
              main: '#2ecc7a',
              light: '#91e0b4',
              dark: '#219e5f',
              contrastText: '#ffffff',
            },
            background: {
              default: '#0d1117',
              paper: '#161b22',
            },
          }),
        },
        typography: {
          fontFamily: '"Inter", sans-serif',
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.25)',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <StaffLayoutContent />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
} 