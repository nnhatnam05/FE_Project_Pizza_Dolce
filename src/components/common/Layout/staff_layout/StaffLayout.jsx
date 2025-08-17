import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { validatePhoneNumber } from '../../../../utils/phoneValidation';
import useAccountStatusWebSocket from '../../../../hooks/useAccountStatusWebSocket';
import AccountDeactivationModal from '../../AccountDeactivationModal';
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
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import './StaffLayout.css';
import LockIcon from '@mui/icons-material/Lock';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';


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

// Add these styled components near the top of the file
const ProfileSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(2),
}));

function StaffLayoutContent() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const open = Boolean(anchorEl);

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

  // Account deactivation states
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
  const [deactivationNotification, setDeactivationNotification] = useState(null);

  // Use account status WebSocket hook
  const { connectWebSocket, disconnectWebSocket } = useAccountStatusWebSocket();

  // Handle account deactivation
  const handleAccountDeactivated = (notification) => {
    console.log('[StaffLayout] Account deactivated:', notification);
    setDeactivationNotification(notification);
    setDeactivationModalOpen(true);
  };

  // Handle account activation
  const handleAccountActivated = (notification) => {
    console.log('[StaffLayout] Account activated:', notification);
    // You can show a success notification here if needed
  };

  // Connect WebSocket when user data is available
  useEffect(() => {
    if (user && user.id) {
      connectWebSocket(user.id.toString(), handleAccountDeactivated, handleAccountActivated);
    }
  }, [user, connectWebSocket]);

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

  // Using imported validatePhoneNumber function

  // Submit profile updates
  const handleProfileSubmit = async () => {
    try {
      // For staff role, only allow password change
      if (user?.role?.toLowerCase() === 'staff') {
        if (!passwords.newPassword || !passwords.confirmPassword) {
          alert('Please enter new password and confirm password.');
          return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        await axios.put(
          `http://localhost:8080//api/auth/change-password`,
          { newPassword: passwords.newPassword },
          {
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          }
        );
        alert('Password changed successfully!');
        setEditProfileOpen(false);
        setPasswords({ newPassword: '', confirmPassword: '' });
        return;
      }
      
      // For other roles, allow full profile edit
      // Validate phone number if provided
      if (editFormData.phone) {
        const phoneError = validatePhoneNumber(editFormData.phone);
        if (phoneError) {
          alert(phoneError);
          return;
        }
      }
      
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
  
  // Handle password submit
  const handlePasswordSubmit = async () => {
    if (!isPasswordValid()) {
      return;
    }
    
    try {
      await axios.put(
        `http://localhost:8080/api/auth/change-password`,
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

  // Open change password dialog
  const handleOpenChangePassword = () => {
    setProfileOpen(false);
    setChangePasswordOpen(true);
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
        navigate(`/staff/request/${notification.requestId}`);
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
      label: 'DASHBOARD',
      items: [
        {
          label: 'TAKE-AWAY',
          icon: <ShoppingBagIcon />,
          to: '/staff/takeaway-dashboard', 
        },
        {
          label: 'DINE-IN',
          icon: <DashboardIcon />,
          to: '/staff/dinein-dashboard',
        },
        {
          label: 'DELIVERY',
          icon: <DeliveryDiningIcon />,
          to: '/staff/delivery-status',
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
          label: 'Request',
          icon: <RequestPageIcon />,
          to: '/staff/request',
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
                        onClick={() => navigate('/staff/notifications')}
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
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Staff Profile</Typography>
                <IconButton onClick={() => setProfileOpen(false)}>
                  <ChevronLeftIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {user && (
                <Box sx={{ pt: 2 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                    {user.imageUrl ? (
                      <Avatar 
                        src={`http://localhost:8080${user.imageUrl}`} 
                        alt={user.name}
                        sx={{ width: 120, height: 120, mb: 2, border: '4px solid #e6f4ef' }}
                      />
                    ) : (
                      <Avatar sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem', border: '4px solid #e6f4ef' }}>
                        {getUserInitials()}
                      </Avatar>
                    )}
                    <Typography variant="h5" fontWeight={600}>{user.name}</Typography>
                    <Chip 
                      label={user.staffProfile?.position || user.role} 
                      color="primary" 
                      size="small" 
                      sx={{ mt: 1, fontWeight: 500 }} 
                    />
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ProfileSection>
                        <SectionTitle>Personal Information</SectionTitle>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                            <Typography variant="body1" fontWeight={500}>{user.name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography variant="body1">{user.email}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                            <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Gender</Typography>
                            <Typography variant="body1">{user.staffProfile?.gender || 'Not specified'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                            <Typography variant="body1">{user.staffProfile?.dob || 'Not provided'}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Address</Typography>
                            <Typography variant="body1">{user.staffProfile?.address || 'Not provided'}</Typography>
                          </Grid>
                        </Grid>
                      </ProfileSection>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <ProfileSection>
                        <SectionTitle>Employment Details</SectionTitle>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Staff Code</Typography>
                            <Typography variant="body1" fontWeight={500}>{user.staffProfile?.staffCode}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Position</Typography>
                            <Typography variant="body1">{user.staffProfile?.position || 'Not assigned'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Typography variant="body1">
                              <Chip 
                                size="small" 
                                label={user.staffProfile?.status || 'Active'} 
                                color={user.staffProfile?.status === 'Active' ? 'success' : 'default'}
                              />
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Shift Type</Typography>
                            <Typography variant="body1">{user.staffProfile?.shiftType || 'Not assigned'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Join Date</Typography>
                            <Typography variant="body1">{user.staffProfile?.joinDate || 'Not provided'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Work Location</Typography>
                            <Typography variant="body1">{user.staffProfile?.workLocation || 'Not assigned'}</Typography>
                          </Grid>
                        </Grid>
                      </ProfileSection>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProfileOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<LockIcon />}
                onClick={handleOpenChangePassword}
              >
                Change Password
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Change Password Dialog */}
          <Dialog 
            open={changePasswordOpen} 
            onClose={() => setChangePasswordOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Change Password</Typography>
                <IconButton onClick={() => setChangePasswordOpen(false)}>
                  <ChevronLeftIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
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
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Password strength:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box 
                        sx={{ 
                          height: 4, 
                          flex: 1,
                          borderRadius: 2,
                          bgcolor: 
                            !isPasswordValid() ? '#f44336' :
                            passwords.newPassword.length >= 12 ? '#2ecc7a' : '#ff9800'
                        }} 
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {!isPasswordValid() ? 'Weak' : 
                         passwords.newPassword.length >= 12 ? 'Strong' : 'Medium'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handlePasswordSubmit}
                disabled={!isPasswordValid()}
              >
                Update Password
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Edit Profile Dialog */}
          <Dialog 
            open={editProfileOpen} 
            onClose={() => setEditProfileOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Edit Profile</Typography>
                <IconButton onClick={() => setEditProfileOpen(false)}>
                  <ChevronLeftIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                  {avatarFile ? (
                    <Avatar 
                      src={URL.createObjectURL(avatarFile)} 
                      alt="Preview"
                      sx={{ width: 120, height: 120, mb: 2, border: '4px solid #e6f4ef' }}
                    />
                  ) : user?.imageUrl ? (
                    <Avatar 
                      src={`http://localhost:8080${user.imageUrl}`} 
                      alt={user.name}
                      sx={{ width: 120, height: 120, mb: 2, border: '4px solid #e6f4ef' }}
                    />
                  ) : (
                    <Avatar sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem', border: '4px solid #e6f4ef' }}>
                      {getUserInitials()}
                    </Avatar>
                  )}
                  
                  {user?.role?.toLowerCase() !== 'staff' && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={triggerFileInput}
                      startIcon={<EditIcon fontSize="small" />}
                      sx={{ mt: 1 }}
                    >
                      Change Avatar
                    </Button>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                </Box>
                
                {user?.role?.toLowerCase() === 'staff' ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ProfileSection>
                        <SectionTitle>Personal Information</SectionTitle>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Full Name" value={user.name || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email" value={user.email || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" value={user.phone || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Gender" value={user.staffProfile?.gender || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date of Birth" value={user.staffProfile?.dob || ''} disabled />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth label="Address" value={user.staffProfile?.address || ''} disabled multiline rows={2} />
                          </Grid>
                        </Grid>
                      </ProfileSection>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <ProfileSection>
                        <SectionTitle>Employment Details</SectionTitle>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Staff Code" value={user.staffProfile?.staffCode || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Position" value={user.staffProfile?.position || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Status" value={user.staffProfile?.status || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Shift Type" value={user.staffProfile?.shiftType || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Join Date" value={user.staffProfile?.joinDate || ''} disabled />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Work Location" value={user.staffProfile?.workLocation || ''} disabled />
                          </Grid>
                        </Grid>
                      </ProfileSection>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleProfileFormChange}
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleProfileFormChange}
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
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleProfileSubmit}
              >
                Save Changes
              </Button>
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
        <Outlet />
      </Box>
      
      {/* Account Deactivation Modal */}
      <AccountDeactivationModal
        isOpen={deactivationModalOpen}
        onClose={() => {
          setDeactivationModalOpen(false);
          setDeactivationNotification(null);
          // Clear storage and redirect to login
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login');
        }}
        notification={deactivationNotification}
      />
    </Box>
  );
}

export default function StaffLayout() {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
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
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              },
            },
          },
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <StaffLayoutContent />
    </ThemeProvider>
  );
} 