import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import type { User } from '@/types';

// Components
import Header from '@/components/common/Header';
import Navigation from '@/components/common/Navigation';
import Dashboard from '@/components/dashboard/Dashboard';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import SupplierManagement from '@/components/suppliers/SupplierManagement';
import OrderManagement from '@/components/orders/OrderManagement';
import Reports from '@/components/common/Reports';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Services
import { apiService } from '@/services/apiService';

// Styles
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Navigation tab type
type NavigationTab = 'dashboard' | 'inventory' | 'suppliers' | 'orders' | 'reports';

interface NavigationTabConfig {
  id: NavigationTab;
  label: string;
  icon: string;
  requiredRole?: string[];
}

// App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
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
        </div>
      </Router>
    </QueryClientProvider>
  );
};

// Main App Content Component
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mock user data - replace with actual authentication
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: 1,
          name: 'John Manager',
          email: 'john.manager@company.com',
          role: 'manager',
          department: 'Supply Chain',
          avatar: undefined,
          isActive: true,
          lastLogin: new Date().toISOString(),
        };

        setUser(mockUser);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleTabChange = (tab: NavigationTab): void => {
    setActiveTab(tab);
  };

  const handleLogout = (): void => {
    setUser(null);
    // Redirect to login or perform logout logic
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} userRole={user.role} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/inventory"
            element={<InventoryManagement />}
          />
          <Route
            path="/suppliers"
            element={<SupplierManagement />}
          />
          <Route
            path="/orders"
            element={<OrderManagement />}
          />
          <Route
            path="/reports"
            element={<Reports />}
          />
        </Routes>
      </main>
    </>
  );
};
export default App;