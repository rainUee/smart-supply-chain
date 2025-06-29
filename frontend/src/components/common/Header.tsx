import React from 'react';
import { User, Notification } from "@/types";
import NotificationSystem from "./NotificationSystem";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  ShoppingCart as OrdersIcon,
  ShoppingBasket as PurchaseOrdersIcon,
  Assessment as ReportsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  notifications?: Notification[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onRemoveNotification?: (id: number) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  activeTab,
  onTabChange,
  userRole,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onRemoveNotification = () => {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'inventory', label: 'Inventory', icon: <InventoryIcon /> },
    { id: 'suppliers', label: 'Suppliers', icon: <BusinessIcon /> },
    { id: 'orders', label: 'Orders', icon: <OrdersIcon /> },
    // { id: 'purchase-orders', label: 'Purchase Orders', icon: <PurchaseOrdersIcon /> },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon /> },
  ];

  const filteredTabs = tabs.filter(tab =>
    tab.id !== 'reports' || ['admin', 'manager'].includes(userRole)
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <InventoryIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" component="h1" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: { xs: 'none', sm: 'block' }
          }}>
            Smart Supply Chain
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5,
          overflow: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          {filteredTabs.map(tab => (
            <Button
              key={tab.id}
              startIcon={tab.icon}
              onClick={() => onTabChange(tab.id)}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                color: activeTab === tab.id ? 'primary.main' : 'text.secondary',
                backgroundColor: activeTab === tab.id ? 'primary.50' : 'transparent',
                '&:hover': {
                  backgroundColor: activeTab === tab.id ? 'primary.100' : 'grey.100',
                },
                display: { xs: 'flex', md: 'flex' },
                fontSize: { xs: '0.75rem', md: '0.875rem' },
              }}
            >
              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                {tab.label}
              </Box>
            </Button>
          ))}
        </Box>

        {/* User Info and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <NotificationSystem
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onRemoveNotification={onRemoveNotification}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* User Info */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
              {user.department && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {user.department}
                </Typography>
              )}
            </Box>
          </Box>

          {/* User Avatar */}
          <Avatar
            sx={{ 
              width: 36, 
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </Avatar>

          {/* Logout Button */}
          <IconButton
            onClick={onLogout}
            sx={{ 
              color: 'error.main',
              '&:hover': { backgroundColor: 'error.50' }
            }}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;