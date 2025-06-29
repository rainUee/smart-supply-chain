import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

import type { User, Notification, LoginCredentials } from '@/types';

// Components
import Header from '@/components/common/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import SupplierManagement from '@/components/suppliers/SupplierManagement';
import OrderManagement from '@/components/orders/OrderManagement';
import PurchaseOrderManagement from '@/components/orders/PurchaseOrderManagement';
import Reports from '@/components/common/Reports';
import Login from '@/components/auth/Login';
import LogoutModal from '@/components/auth/LogoutModal';

// Services
import { authService } from '@/services/apiService';

// Theme
import { theme } from '@/theme';

// Styles
import '@/App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

// Main App Content Component
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Get active tab from current location
  const getActiveTabFromLocation = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'dashboard';
      case '/inventory':
        return 'inventory';
      case '/suppliers':
        return 'suppliers';
      case '/orders':
        return 'orders';
      case '/purchase-orders':
        return 'purchase-orders';
      case '/reports':
        return 'reports';
      default:
        return 'dashboard';
    }
  };

  // Sync active tab with current route
  useEffect(() => {
    const path = location.pathname.substring(1) || 'dashboard';
    setActiveTab(path);
  }, [location]);

  // Load notifications on component mount (if logged in)
  useEffect(() => {
    if (!user) return;
    const loadNotifications = async () => {
      try {
        // Mock notifications for now
        setNotifications([
          {
            id: 1,
            title: 'Low Stock Alert',
            message: 'Product XYZ is running low on stock',
            type: 'low-stock',
            isRead: false,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadNotifications();
  }, [user]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab === 'dashboard' ? '' : tab}`);
  };

  // 登录逻辑
  const handleLogin = async (credentials: LoginCredentials) => {
    setLoginLoading(true);
    setLoginError(undefined);
    try {
      const authResponse = await authService.login(credentials);
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      setLoginError(undefined);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoginError(error.response?.data?.detail || error.message || 'Login failed');
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  // 登出逻辑
  const handleLogout = () => {
    setShowLogoutModal(true);
  };
  
  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  };
  
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleRemoveNotification = async (id: number) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        isLoading={loginLoading}
        error={loginError}
      />
    );
  }

  // Main app layout
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userRole={user.role}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onRemoveNotification={handleRemoveNotification}
      />
      
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/suppliers" element={<SupplierManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/purchase-orders" element={<PurchaseOrderManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Box>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </Box>
  );
};

export default App;