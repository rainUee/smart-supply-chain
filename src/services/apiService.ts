import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type {
  User,
  LoginCredentials,
  AuthResponse,
  InventoryItem,
  InventoryFormData,
  InventoryFilter,
  Supplier,
  SupplierFormData,
  SupplierFilter,
  Order,
  OrderFormData,
  OrderFilter,
  PurchaseOrder,
  Customer,
  DashboardMetrics,
  InventoryAnalytics,
  SalesAnalytics,
  Report,
  ReportParameters,
  Notification,
  ApiResponse,
  PaginationInfo,
  ApiError,
  DateRange,
} from '@/types';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const api: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response handler
const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data;
};

// Authentication Service
export const authService = {
  /**
   * User login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const authData = handleApiResponse(response);
    
    // Store token in localStorage
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
    
    return authData;
  },

  /**
   * User logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    const authData = handleApiResponse(response);
    
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
    
    return authData;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return handleApiResponse(response);
  },
};

// Inventory Service
export const inventoryService = {
  /**
   * Get all inventory items with optional filters
   */
  getAll: async (
    filters?: InventoryFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: InventoryItem[]; pagination: PaginationInfo }> => {
    const params = { ...filters, page, limit };
    const response = await api.get<ApiResponse<{ items: InventoryItem[]; pagination: PaginationInfo }>>(
      '/inventory',
      { params }
    );
    return handleApiResponse(response);
  },

  /**
   * Get single inventory item by ID
   */
  getById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
    return handleApiResponse(response);
  },

  /**
   * Create new inventory item
   */
  create: async (itemData: InventoryFormData): Promise<InventoryItem> => {
    const response = await api.post<ApiResponse<InventoryItem>>('/inventory', itemData);
    return handleApiResponse(response);
  },

  /**
   * Update existing inventory item
   */
  update: async (id: number, itemData: Partial<InventoryFormData>): Promise<InventoryItem> => {
    const response = await api.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, itemData);
    return handleApiResponse(response);
  },

  /**
   * Delete inventory item
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/inventory/${id}`);
    handleApiResponse(response);
  },

  /**
   * Update inventory quantity
   */
  updateQuantity: async (
    id: number,
    quantity: number,
    reason: string = ''
  ): Promise<InventoryItem> => {
    const response = await api.patch<ApiResponse<InventoryItem>>(
      `/inventory/${id}/quantity`,
      { quantity, reason }
    );
    return handleApiResponse(response);
  },

  /**
   * Get low stock items
   */
  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/low-stock');
    return handleApiResponse(response);
  },

  /**
   * Bulk update inventory
   */
  bulkUpdate: async (
    updates: Array<{ id: number; data: Partial<InventoryFormData> }>
  ): Promise<InventoryItem[]> => {
    const response = await api.post<ApiResponse<InventoryItem[]>>(
      '/inventory/bulk-update',
      { updates }
    );
    return handleApiResponse(response);
  },

  /**
   * Import inventory from CSV
   */
  importFromCSV: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<{ imported: number; errors: string[] }>>(
      '/inventory/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return handleApiResponse(response);
  },
};

// Supplier Service
export const supplierService = {
  /**
   * Get all suppliers
   */
  getAll: async (
    filters?: SupplierFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<{ suppliers: Supplier[]; pagination: PaginationInfo }> => {
    const params = { ...filters, page, limit };
    const response = await api.get<ApiResponse<{ suppliers: Supplier[]; pagination: PaginationInfo }>>(
      '/suppliers',
      { params }
    );
    return handleApiResponse(response);
  },

  /**
   * Get supplier by ID
   */
  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return handleApiResponse(response);
  },

  /**
   * Create new supplier
   */
  create: async (supplierData: SupplierFormData): Promise<Supplier> => {
    const response = await api.post<ApiResponse<Supplier>>('/suppliers', supplierData);
    return handleApiResponse(response);
  },

  /**
   * Update supplier
   */
  update: async (id: number, supplierData: Partial<SupplierFormData>): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, supplierData);
    return handleApiResponse(response);
  },

  /**
   * Delete supplier
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/suppliers/${id}`);
    handleApiResponse(response);
  },

  /**
   * Get supplier performance metrics
   */
  getPerformance: async (id: number, dateRange?: DateRange): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/suppliers/${id}/performance`, {
      params: dateRange,
    });
    return handleApiResponse(response);
  },

  /**
   * Rate supplier
   */
  rateSupplier: async (id: number, rating: number, review?: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(`/suppliers/${id}/rate`, {
      rating,
      review,
    });
    handleApiResponse(response);
  },
};

// Order Service
export const orderService = {
  /**
   * Get all orders
   */
  getAll: async (
    filters?: OrderFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: Order[]; pagination: PaginationInfo }> => {
    const params = { ...filters, page, limit };
    const response = await api.get<ApiResponse<{ orders: Order[]; pagination: PaginationInfo }>>(
      '/orders',
      { params }
    );
    return handleApiResponse(response);
  },

  /**
   * Get order by ID
   */
  getById: async (id: number): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return handleApiResponse(response);
  },

  /**
   * Create new order
   */
  create: async (orderData: OrderFormData): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/orders', orderData);
    return handleApiResponse(response);
  },

  /**
   * Update order
   */
  update: async (id: number, orderData: Partial<OrderFormData>): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, orderData);
    return handleApiResponse(response);
  },

  /**
   * Update order status
   */
  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return handleApiResponse(response);
  },

  /**
   * Cancel order
   */
  cancel: async (id: number, reason: string): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
    return handleApiResponse(response);
  },

  /**
   * Get order items
   */
  getItems: async (orderId: number): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(`/orders/${orderId}/items`);
    return handleApiResponse(response);
  },

  /**
   * Add tracking information
   */
  addTracking: async (id: number, trackingNumber: string, carrier: string): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/tracking`, {
      trackingNumber,
      carrier,
    });
    return handleApiResponse(response);
  },
};

// Purchase Order Service
export const purchaseOrderService = {
  /**
   * Get all purchase orders
   */
  getAll: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ purchaseOrders: PurchaseOrder[]; pagination: PaginationInfo }> => {
    const response = await api.get<ApiResponse<{ purchaseOrders: PurchaseOrder[]; pagination: PaginationInfo }>>(
      '/purchase-orders',
      { params: { page, limit } }
    );
    return handleApiResponse(response);
  },

  /**
   * Create purchase order
   */
  create: async (poData: any): Promise<PurchaseOrder> => {
    const response = await api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', poData);
    return handleApiResponse(response);
  },

  /**
   * Update purchase order
   */
  update: async (id: number, poData: any): Promise<PurchaseOrder> => {
    const response = await api.put<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`, poData);
    return handleApiResponse(response);
  },

  /**
   * Approve purchase order
   */
  approve: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/approve`);
    return handleApiResponse(response);
  },

  /**
   * Receive purchase order
   */
  receive: async (id: number, receivedItems: any[]): Promise<PurchaseOrder> => {
    const response = await api.patch<ApiResponse<PurchaseOrder>>(
      `/purchase-orders/${id}/receive`,
      { receivedItems }
    );
    return handleApiResponse(response);
  },
};

// Customer Service
export const customerService = {
  /**
   * Get all customers
   */
  getAll: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ customers: Customer[]; pagination: PaginationInfo }> => {
    const response = await api.get<ApiResponse<{ customers: Customer[]; pagination: PaginationInfo }>>(
      '/customers',
      { params: { page, limit } }
    );
    return handleApiResponse(response);
  },

  /**
   * Get customer by ID
   */
  getById: async (id: number): Promise<Customer> => {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return handleApiResponse(response);
  },

  /**
   * Create new customer
   */
  create: async (customerData: any): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>('/customers', customerData);
    return handleApiResponse(response);
  },

  /**
   * Update customer
   */
  update: async (id: number, customerData: any): Promise<Customer> => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, customerData);
    return handleApiResponse(response);
  },
};

// Dashboard and Analytics Service
export const dashboardService = {
  /**
   * Get dashboard overview data
   */
  getOverview: async (dateRange?: DateRange): Promise<DashboardMetrics> => {
    const response = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/overview', {
      params: dateRange,
    });
    return handleApiResponse(response);
  },

  /**
   * Get inventory analytics
   */
  getInventoryAnalytics: async (dateRange?: DateRange): Promise<InventoryAnalytics> => {
    const response = await api.get<ApiResponse<InventoryAnalytics>>('/dashboard/inventory-analytics', {
      params: dateRange,
    });
    return handleApiResponse(response);
  },

  /**
   * Get sales analytics
   */
  getSalesAnalytics: async (dateRange?: DateRange): Promise<SalesAnalytics> => {
    const response = await api.get<ApiResponse<SalesAnalytics>>('/dashboard/sales-analytics', {
      params: dateRange,
    });
    return handleApiResponse(response);
  },

  /**
   * Get supplier analytics
   */
  getSupplierAnalytics: async (dateRange?: DateRange): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/dashboard/supplier-analytics', {
      params: dateRange,
    });
    return handleApiResponse(response);
  },
};

// Reports Service
export const reportsService = {
  /**
   * Generate inventory report
   */
  generateInventoryReport: async (parameters: ReportParameters): Promise<Blob> => {
    const response = await api.post('/reports/inventory', parameters, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate sales report
   */
  generateSalesReport: async (parameters: ReportParameters): Promise<Blob> => {
    const response = await api.post('/reports/sales', parameters, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate supplier performance report
   */
  generateSupplierReport: async (parameters: ReportParameters): Promise<Blob> => {
    const response = await api.post('/reports/suppliers', parameters, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get report history
   */
  getHistory: async (): Promise<Report[]> => {
    const response = await api.get<ApiResponse<Report[]>>('/reports/history');
    return handleApiResponse(response);
  },

  /**
   * Schedule report
   */
  scheduleReport: async (reportConfig: any): Promise<Report> => {
    const response = await api.post<ApiResponse<Report>>('/reports/schedule', reportConfig);
    return handleApiResponse(response);
  },
};

// Notifications Service
export const notificationsService = {
  /**
   * Get user notifications
   */
  getAll: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; pagination: PaginationInfo }> => {
    const response = await api.get<ApiResponse<{ notifications: Notification[]; pagination: PaginationInfo }>>(
      '/notifications',
      { params: { page, limit } }
    );
    return handleApiResponse(response);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>(`/notifications/${id}/read`);
    handleApiResponse(response);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    const response = await api.patch<ApiResponse<void>>('/notifications/read-all');
    handleApiResponse(response);
  },

  /**
   * Delete notification
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/notifications/${id}`);
    handleApiResponse(response);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    const result = handleApiResponse(response);
    return result.count;
  },
};

// File Upload Service
export const fileService = {
  /**
   * Upload single file
   */
  upload: async (file: File, folder: string = 'general'): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await api.post<ApiResponse<{ url: string; filename: string }>>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Upload multiple files
   */
  uploadMultiple: async (files: File[], folder: string = 'general'): Promise<Array<{ url: string; filename: string }>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);
    
    const response = await api.post<ApiResponse<Array<{ url: string; filename: string }>>>(
      '/files/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Delete file
   */
  delete: async (fileId: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/files/${fileId}`);
    handleApiResponse(response);
  },
};

// Utility Functions
export const apiUtils = {
  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Format date
   */
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(
      typeof date === 'string' ? new Date(date) : date
    );
  },

  /**
   * Download file from blob
   */
  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Debounce function for search inputs
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Calculate inventory status
   */
  getInventoryStatus: (current: number, reorderPoint: number): 'low-stock' | 'medium-stock' | 'in-stock' => {
    if (current <= reorderPoint) return 'low-stock';
    if (current <= reorderPoint * 2) return 'medium-stock';
    return 'in-stock';
  },

  /**
   * Generate color based on status
   */
  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      'active': '#28a745',
      'inactive': '#dc3545',
      'pending': '#ffc107',
      'processing': '#17a2b8',
      'shipped': '#28a745',
      'delivered': '#20c997',
      'cancelled': '#dc3545',
      'low-stock': '#dc3545',
      'medium-stock': '#ffc107',
      'in-stock': '#28a745',
    };
    return colors[status?.toLowerCase()] || '#6c757d';
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  /**
   * Generate random ID
   */
  generateId: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  /**
   * Calculate percentage
   */
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Truncate text
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
};

// Export all services as a single object
export const apiService = {
  auth: authService,
  inventory: inventoryService,
  suppliers: supplierService,
  orders: orderService,
  purchaseOrders: purchaseOrderService,
  customers: customerService,
  dashboard: dashboardService,
  reports: reportsService,
  notifications: notificationsService,
  files: fileService,
  utils: apiUtils,
};

export default apiService;