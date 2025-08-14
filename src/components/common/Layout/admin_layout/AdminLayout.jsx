import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { validatePhoneNumber } from '../../../../utils/phoneValidation';
import { DashboardProvider } from '../../../../contexts/DashboardContext';
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
  Badge,
  ClickAwayListener,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { styled, alpha, ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableBarIcon from '@mui/icons-material/TableBar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import SellIcon from '@mui/icons-material/Sell';
import KeyIcon from '@mui/icons-material/Key';
import axios from 'axios';
import './AdminLayout.css';

// Add these styled components for better UI
const ProfileSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  border: '1px solid #f0f0f0',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    fontSize: '1.25rem',
  }
}));

const ProfileLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const ProfileValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.primary,
  fontWeight: 500,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 30,
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
}));

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

const NotificationDropdown = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '48px',
  right: 0,
  zIndex: 1000,
  minWidth: 300,
  maxWidth: 350,
  maxHeight: 400,
  overflowY: 'auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  borderRadius: '12px',
}));

const NotificationItem = styled(Box)(({ theme, isRead }) => ({
  padding: '12px 16px',
  borderBottom: '1px solid #eee',
  backgroundColor: isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const EmptyNotification = styled(Box)(({ theme }) => ({
  padding: '20px',
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const NotificationTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: '4px',
}));

function AdminLayoutContent() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const open = Boolean(anchorEl);
  const [appsOpen, setAppsOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    match: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const intervalRef = useRef(null);

  // Submenu states
  const [ordersSubmenuOpen, setOrdersSubmenuOpen] = useState(false);

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

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/me', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If 401 Unauthorized, token might be expired
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form change
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar change
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Open file dialog
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate password as user types
    validatePassword(name, value);
  };
  
  // Password validation
  const validatePassword = (field, value) => {
    let errors = { ...passwordErrors };
    
    if (field === 'newPassword') {
      // Check password strength
      if (value.length === 0) {
        errors.newPassword = '';
      } else if (value.length < 10) {
        errors.newPassword = 'Password must be at least 10 characters';
      } else if (!/[A-Z]/.test(value)) {
        errors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(value)) {
        errors.newPassword = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(value)) {
        errors.newPassword = 'Password must contain at least one number';
      } else {
        errors.newPassword = '';
      }
      
      // Check if passwords match
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        errors.match = 'Passwords do not match';
      } else {
        errors.match = '';
      }
    }
    
    if (field === 'confirmPassword') {
      if (value.length === 0) {
        errors.confirmPassword = '';
      } else if (value !== passwords.newPassword) {
        errors.match = 'Passwords do not match';
      } else {
        errors.match = '';
      }
    }
    
    setPasswordErrors(errors);
  };
  
  // Check if password is valid
  const isPasswordValid = () => {
    return (
      passwords.newPassword.length >= 10 &&
      /[A-Z]/.test(passwords.newPassword) &&
      /[a-z]/.test(passwords.newPassword) &&
      /[0-9]/.test(passwords.newPassword) &&
      passwords.newPassword === passwords.confirmPassword
    );
  };

  // Open change password dialog
  const handleOpenChangePassword = () => {
    setProfileOpen(false);
    setChangePasswordOpen(true);
  };

  // Handle password submit
  const handlePasswordSubmit = async () => {
    if (!isPasswordValid()) {
      return;
    }
    
    try {
      await axios.put(
        `http://localhost:8080/api/auth/users/${user.id}`,
        { newPassword: passwords.newPassword },
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );
      
      // Reset form and close dialog
      setPasswords({ newPassword: '', confirmPassword: '' });
      setPasswordErrors({ newPassword: '', confirmPassword: '', match: '' });
      setChangePasswordOpen(false);
      
      // Show success message
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  // Using imported validatePhoneNumber function

  // Submit profile updates
  const handleProfileSubmit = async () => {
    try {
      // Validate phone number if provided
      if (editFormData.phone) {
        const phoneError = validatePhoneNumber(editFormData.phone);
        if (phoneError) {
          alert(phoneError);
          return;
        }
      }

      // For other roles, allow full profile edit
      const formData = new FormData();
      
      // Append text fields
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) {
          formData.append(key, editFormData[key]);
        }
      });
      
      // Append avatar if changed
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        // Update user state with new data
        setUser(response.data);
        setEditProfileOpen(false);
        // Reset file input
        setAvatarFile(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Open profile dialog
  const handleViewProfile = () => {
    setProfileOpen(true);
    setAnchorEl(null);
  };

  // Open edit profile dialog
  const handleEditProfile = () => {
    // Pre-fill form with current user data
    setEditFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setProfileOpen(false);
    setEditProfileOpen(true);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/notification?unreadOnly=true', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await axios.put(`http://localhost:8080/api/notification/${notification.id}/mark-read`, {}, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      // Remove from notification list
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate to related page if requestId exists
      if (notification.requestId) {
        setShowNotifications(false);
        navigate(`/admin/request/${notification.requestId}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Toggle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Close notification dropdown when clicking away
  const handleClickAway = () => {
    setShowNotifications(false);
  };

  // Set up polling and fetch user data when component mounts
  useEffect(() => {
    // Fetch user data
    fetchCurrentUser();

    // Initial fetch notifications
    fetchNotifications();

    // Set up polling interval (every 10 seconds)
    intervalRef.current = setInterval(fetchNotifications, 10000);

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sidebar menu cấu hình
  const menuGroups = [
    {
      label: 'HOME',
      items: [
        {
          label: 'Dashboard',
          icon: <DashboardIcon />,
          to: '/admin',
        },
      ],
    },
    {
      label: 'STORE MANAGEMENT',
      items: [
        {
          label: 'Foods',
          icon: <RestaurantMenuIcon />,
          to: '/admin/foods',
        },
        {
          label: 'Tables',
          icon: <TableBarIcon />,
          to: '/admin/tables',
        },
        {
          label: 'Orders',
          icon: <ReceiptLongIcon />,
          hasSubmenu: true,
          submenuOpen: ordersSubmenuOpen,
          toggleSubmenu: () => setOrdersSubmenuOpen(!ordersSubmenuOpen),
          submenuItems: [
            // {
            //   label: 'Overview',
            //   icon: <ReceiptLongIcon />,
            //   to: '/admin/orders',
            // },
            {
              label: 'Delivery',
              icon: <DeliveryDiningIcon />,
              to: '/admin/orders',
            },
            {
              label: 'Dine-In',
              icon: <RestaurantIcon />,
              to: '/admin/orders/dine-in',
            },
            {
              label: 'Take-Away',
              icon: <TakeoutDiningIcon />,
              to: '/admin/orders/take-away',
            },
          ],
        },
        {
          label: 'Vouchers',
          icon: <SellIcon />,
          to: '/admin/vouchers',
          new: true,
        },
        {
          label: 'Users',
          icon: <AccountCircleIcon />,
          to: '/admin/users',
        },
        {
          label: 'Customers',
          icon: <PersonIcon />,
          to: '/admin/customers',
        },
      ],
    },
    {
      label: 'STAFF MANAGEMENT',
      items: [
        {
          label: 'Attendance',
          icon: <ReceiptLongIcon />,
          to: '/admin/attendance',
        },
        {
          label: 'Request',
          icon: <RequestPageIcon />,
          to: '/admin/request',
          new: true,
        },
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
                <React.Fragment key={item.label}>
                  {item.hasSubmenu ? (
                    <>
                      <ListItemButton
                        onClick={item.toggleSubmenu}
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
                        {sidebarOpen && (item.submenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                      </ListItemButton>
                      <MuiCollapse in={item.submenuOpen && sidebarOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.submenuItems.map((subItem) => (
                            <ListItemButton
                              key={subItem.label}
                              component={NavLink}
                              to={subItem.to}
                              sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                minHeight: 40,
                                pl: 4,
                                pr: 2,
                                '&.active': {
                                  bgcolor: '#e6f4ef',
                                  color: '#2ecc7a',
                                  fontWeight: 700,
                                  '& .MuiListItemIcon-root': { color: '#2ecc7a' },
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>{subItem.icon}</ListItemIcon>
                              <ListItemText primary={subItem.label} />
                            </ListItemButton>
                          ))}
                        </List>
                      </MuiCollapse>
                    </>
                  ) : item.to ? (
                    <ListItemButton
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
                  )}
                </React.Fragment>
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
          bgcolor: '#fff',
          color: '#222',
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

          {/* Notification Bell */}
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position: 'relative' }}>
              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={toggleNotifications}
                  sx={{ ml: 1 }}
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    overlap="rectangular"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    sx={{ '& .MuiBadge-badge': { top: -8, right: -8 } }}
                    max={99}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Notification Dropdown */}
              {showNotifications && (
                <NotificationDropdown>
                  <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                  </Box>
                  <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <EmptyNotification>
                        <Typography variant="body2">No new notifications</Typography>
                      </EmptyNotification>
                    ) : (
                      notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          isRead={notification.read}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ ml: 1, flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                {notification.message}
                              </Typography>
                              <NotificationTime>
                                {formatRelativeTime(notification.createdAt)}
                              </NotificationTime>
                            </Box>
                          </Box>
                        </NotificationItem>
                      ))
                    )}
                  </Box>
                  {notifications.length > 0 && (
                    <Box sx={{ p: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: 'pointer', fontWeight: 500 }}
                        onClick={() => navigate('/admin/notifications')}
                      >
                        View All
                      </Typography>
                    </Box>
                  )}
                </NotificationDropdown>
              )}
            </Box>
          </ClickAwayListener>

          {/* User Avatar */}
          <Tooltip title={user?.name || 'User'}>
            <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
              {user?.imageUrl ? (
                <Avatar
                  src={`http://localhost:8080${user.imageUrl}`}
                  alt={user.name}
                  sx={{ bgcolor: '#2ecc7a' }}
                />
              ) : (
                <Avatar sx={{ bgcolor: '#2ecc7a' }}>
                  {getUserInitials()}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>


          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                borderRadius: 2,
                minWidth: 180,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                },
              },
            }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.75rem">{user.email}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleViewProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            {/* <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem> */}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log Out
            </MenuItem>
          </Menu>

          {/* View Profile Dialog */}
          <Dialog 
            open={profileOpen} 
            onClose={() => setProfileOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: 2,
                overflow: 'hidden',
              }
            }}
          >
            <Box sx={{ 
              bgcolor: 'background.paper', 
              position: 'relative',
            }}>
              <Box sx={{ 
                height: 140, 
                bgcolor: 'primary.main', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0,
                zIndex: 0
              }} />
              
              <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 1,
                color: 'white'
              }}>
                <Box display="flex" alignItems="center">
                  <ArrowBackIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Profile</Typography>
                </Box>
                <IconButton onClick={() => setProfileOpen(false)} sx={{ color: 'white' }}>
                  <ChevronLeftIcon />
                </IconButton>
              </DialogTitle>
              
              {user && (
                <DialogContent sx={{ pt: 0, pb: 4 }}>
                  <Box sx={{ pt: 3, pb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar 
                      src={user.imageUrl ? `http://localhost:8080${user.imageUrl}` : undefined}
                      alt={user.name}
                      sx={{ 
                        width: 140, 
                        height: 140, 
                        border: '4px solid white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        fontSize: '3.5rem',
                        bgcolor: 'primary.main',
                        color: 'white',
                        position: 'relative',
                        zIndex: 1,
                        mb: 2
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{user.name}</Typography>
                    <Chip 
                      label={user.role} 
                      color="primary" 
                      size="small" 
                      sx={{ fontWeight: 600, px: 1 }} 
                    />
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ProfileSection>
                        <SectionTitle>
                          <PersonIcon color="primary" />
                          Personal Information
                        </SectionTitle>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <ProfileLabel>Full Name</ProfileLabel>
                            <ProfileValue>{user.name}</ProfileValue>
                          </Grid>
                          {user.email && (
                            <Grid item xs={12}>
                              <ProfileLabel>Email</ProfileLabel>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <ProfileValue>{user.email}</ProfileValue>
                              </Box>
                            </Grid>
                          )}
                          {user.phone && (
                            <Grid item xs={12}>
                              <ProfileLabel>Phone</ProfileLabel>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <ProfileValue>{user.phone}</ProfileValue>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </ProfileSection>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <ProfileSection>
                        <SectionTitle>
                          <BadgeIcon color="primary" />
                          Account Information
                        </SectionTitle>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <ProfileLabel>Username</ProfileLabel>
                            <ProfileValue>{user.username}</ProfileValue>
                          </Grid>
                          <Grid item xs={12}>
                            <ProfileLabel>Role</ProfileLabel>
                            <Chip 
                              size="small" 
                              label={user.role} 
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          </Grid>
                        </Grid>
                      </ProfileSection>
                    </Grid>
                  </Grid>
                </DialogContent>
              )}
              <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'space-between' }}>
                <ActionButton 
                  variant="outlined" 
                  color="inherit"
                  onClick={() => setProfileOpen(false)}
                  startIcon={<ArrowBackIcon />}
                >
                  Close
                </ActionButton>
                <ActionButton 
                  variant="contained" 
                  color="primary" 
                  startIcon={<KeyIcon />}
                  onClick={handleOpenChangePassword}
                >
                  Change Password
                </ActionButton>
              </DialogActions>
            </Box>
          </Dialog>
          
          {/* Change Password Dialog */}
          <Dialog 
            open={changePasswordOpen} 
            onClose={() => setChangePasswordOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: 2,
                overflow: 'hidden',
              }
            }}
          >
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box display="flex" alignItems="center">
                <KeyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Change Password</Typography>
              </Box>
              <IconButton onClick={() => setChangePasswordOpen(false)} sx={{ color: 'white' }}>
                <ChevronLeftIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please enter your new password. Password must be at least 10 characters long and contain uppercase letters, lowercase letters, and numbers.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword}
                      InputProps={{
                        startAdornment: (
                          <LockIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      error={!!passwordErrors.match}
                      helperText={passwordErrors.match}
                      InputProps={{
                        startAdornment: (
                          <LockIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
                {/* Password strength indicator */}
                {passwords.newPassword && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Password strength:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box 
                        sx={{ 
                          height: 6, 
                          flex: 1,
                          borderRadius: 3,
                          bgcolor: 
                            !isPasswordValid() ? '#f44336' :
                            passwords.newPassword.length >= 12 ? '#2ecc7a' : '#ff9800'
                        }} 
                      />
                      <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
                        {!isPasswordValid() ? 'Weak' : 
                         passwords.newPassword.length >= 12 ? 'Strong' : 'Medium'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <ActionButton 
                variant="outlined"
                color="inherit"
                onClick={() => setChangePasswordOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton 
                variant="contained" 
                color="primary"
                onClick={handlePasswordSubmit}
                disabled={!isPasswordValid()}
                startIcon={<KeyIcon />}
              >
                Update Password
              </ActionButton>
            </DialogActions>
          </Dialog>

          {/* Edit Profile Dialog */}
          <Dialog 
            open={editProfileOpen} 
            onClose={() => setEditProfileOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: 2,
                overflow: 'hidden',
              }
            }}
          >
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box display="flex" alignItems="center">
                <EditIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Edit Profile</Typography>
              </Box>
              <IconButton onClick={() => setEditProfileOpen(false)} sx={{ color: 'white' }}>
                <ChevronLeftIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ pt: 1 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                  {avatarFile ? (
                    <Avatar 
                      src={URL.createObjectURL(avatarFile)} 
                      alt="Preview"
                      sx={{ width: 140, height: 140, mb: 2, border: '4px solid #e6f4ef' }}
                    />
                  ) : user?.imageUrl ? (
                    <Avatar 
                      src={`http://localhost:8080${user.imageUrl}`} 
                      alt={user.name}
                      sx={{ width: 140, height: 140, mb: 2, border: '4px solid #e6f4ef' }}
                    />
                  ) : (
                    <Avatar sx={{ width: 140, height: 140, mb: 2, fontSize: '3.5rem', border: '4px solid #e6f4ef' }}>
                      {getUserInitials()}
                    </Avatar>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={triggerFileInput}
                    startIcon={<EditIcon fontSize="small" />}
                    sx={{ mt: 1 }}
                  >
                    Change Avatar
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <ProfileSection>
                      <SectionTitle>
                        <PersonIcon />
                        Personal Information
                      </SectionTitle>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={editFormData.name}
                            onChange={handleProfileFormChange}
                            InputProps={{
                              startAdornment: (
                                <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleProfileFormChange}
                            disabled
                            InputProps={{
                              startAdornment: (
                                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={editFormData.phone}
                            onChange={handleProfileFormChange}
                            InputProps={{
                              startAdornment: (
                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={editFormData.address}
                            onChange={handleProfileFormChange}
                            multiline
                            rows={2}
                            InputProps={{
                              startAdornment: (
                                <HomeIcon fontSize="small" sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </ProfileSection>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <ActionButton 
                variant="outlined"
                color="inherit"
                onClick={() => setEditProfileOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton 
                variant="contained" 
                color="primary"
                onClick={handleProfileSubmit}
                startIcon={<CheckIcon />}
              >
                Save Changes
              </ActionButton>
            </DialogActions>
          </Dialog>
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
        <DashboardProvider>
          <Outlet />
        </DashboardProvider>
      </Box>
    </Box>
  );
}

export default function AdminLayout() {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#2ecc7a',
          },
          background: {
            default: '#f4f6f8',
            paper: '#fff',
          },
        },
        typography: {
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <AdminLayoutContent />
    </ThemeProvider>
  );
} 