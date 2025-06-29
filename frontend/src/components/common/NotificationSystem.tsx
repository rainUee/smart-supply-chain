import React, { useState } from 'react';
import { Notification, NotificationType } from '@/types';
import { formatDateTime } from '@/untils';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification: (id: number) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const isOpen = Boolean(anchorEl);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      'low-stock': <WarningIcon color="warning" />,
      'order-update': <AssignmentIcon color="info" />,
      'supplier-alert': <BusinessIcon color="error" />,
      'system': <SettingsIcon color="action" />,
      'payment': <PaymentIcon color="success" />,
      'shipment': <ShippingIcon color="primary" />
    };
    return icons[type] || <NotificationsIcon color="action" />;
  };

  const getNotificationColor = (type: NotificationType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colors = {
      'low-stock': 'warning' as const,
      'order-update': 'info' as const,
      'supplier-alert': 'error' as const,
      'system': 'default' as const,
      'payment': 'success' as const,
      'shipment': 'primary' as const
    };
    return colors[type] || 'default';
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as NotificationType | 'all');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="h3">
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                startIcon={<CheckCircleIcon />}
              >
                Mark All Read
              </Button>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Filter */}
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={handleFilterChange}
              startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
            >
              <MenuItem value="all">All Notifications</MenuItem>
              <MenuItem value="low-stock">Low Stock</MenuItem>
              <MenuItem value="order-update">Order Updates</MenuItem>
              <MenuItem value="supplier-alert">Supplier Alerts</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="shipment">Shipment</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications found
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: !notification.isRead ? 'action.hover' : 'transparent',
                      borderLeft: !notification.isRead ? 3 : 0,
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: !notification.isRead ? 600 : 400 }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(notification.createdAt)}
                            </Typography>
                            <Chip
                              label={notification.type.replace('-', ' ')}
                              size="small"
                              color={getNotificationColor(notification.type)}
                              variant="outlined"
                            />
                            {notification.metadata && Object.entries(notification.metadata).map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {!notification.isRead && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          color="primary"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveNotification(notification.id);
                        }}
                        color="error"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationSystem; 