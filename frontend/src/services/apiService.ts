import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
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

// Extend AxiosRequestConfig to include _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// API Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
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
    const token = localStorage.getItem('accessToken');
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
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data;

          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
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
    const response = await api.post('/auth/login', credentials);
    const { access_token, refresh_token, expires_in } = response.data;

    // Store tokens in localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);

    return {
      token: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      user: {} as User, // Will be fetched separately
    };
  },

  /**
   * User logout
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token, refresh_token, expires_in } = response.data;

    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);

    return {
      token: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      user: {} as User,
    };
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: any): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
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
    const params = { 
      ...filters, 
      page, 
      limit 
    };
    const response = await api.get('/products', { params });
    
    // Transform products to inventory items
    const items: InventoryItem[] = response.data.items.map((product: any) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: {
        id: 1, // Default category ID
        name: product.category || 'Uncategorized',
        description: product.category || 'Uncategorized products',
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      quantity: product.current_stock,
      reorderPoint: product.reorder_point,
      maxStock: product.max_stock_level,
      price: product.selling_price,
      cost: product.cost_price,
      location: 'Main Warehouse', // Default location
      warehouse: {
        id: 1,
        name: 'Main Warehouse',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country'
        },
        type: 'main',
        capacity: 10000,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      supplier: product.supplier_id ? {
        id: product.supplier_id,
        name: 'Supplier',
        contactPerson: 'Contact',
        email: 'supplier@example.com',
        phone: '+1234567890',
        address: 'Supplier St',
        city: 'Supplier City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
        taxId: 'TAX123',
        paymentTerms: 'Net 30',
        creditLimit: 10000,
        rating: 4.5,
        isPreferred: true,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      } : undefined,
      status: product.current_stock > product.reorder_point ? 'in-stock' : 
             product.current_stock === 0 ? 'out-of-stock' : 'low-stock',
      unit: product.unit_of_measure || 'pcs',
      weight: product.weight,
      dimensions: product.dimensions ? {
        length: 10,
        width: 10,
        height: 10,
        unit: 'cm'
      } : undefined,
      barcode: product.sku, // Use SKU as barcode for now
      tags: product.category ? [product.category.toLowerCase()] : [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
    
    return {
      items,
      pagination: {
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.total_pages,
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
      },
    };
  },

  /**
   * Get single inventory item by ID
   */
  getById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/products/${id}`);
    const product = response.data;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: {
        id: 1, // Default category ID
        name: product.category || 'Uncategorized',
        description: product.category || 'Uncategorized products',
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      quantity: product.current_stock,
      reorderPoint: product.reorder_point,
      maxStock: product.max_stock_level,
      price: product.selling_price,
      cost: product.cost_price,
      location: 'Main Warehouse',
      warehouse: {
        id: 1,
        name: 'Main Warehouse',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country'
        },
        type: 'main',
        capacity: 10000,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      supplier: product.supplier_id ? {
        id: product.supplier_id,
        name: 'Supplier',
        contactPerson: 'Contact',
        email: 'supplier@example.com',
        phone: '+1234567890',
        address: 'Supplier St',
        city: 'Supplier City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
        taxId: 'TAX123',
        paymentTerms: 'Net 30',
        creditLimit: 10000,
        rating: 4.5,
        isPreferred: true,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      } : undefined,
      status: product.current_stock > product.reorder_point ? 'in-stock' :
        product.current_stock === 0 ? 'out-of-stock' : 'low-stock',
      unit: product.unit_of_measure || 'pcs',
      weight: product.weight,
      dimensions: product.dimensions ? {
        length: 10,
        width: 10,
        height: 10,
        unit: 'cm'
      } : undefined,
      barcode: product.sku, // Use SKU as barcode for now
      tags: product.category ? [product.category.toLowerCase()] : [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  },

  /**
   * Create new inventory item
   */
  create: async (itemData: InventoryFormData): Promise<InventoryItem> => {
    const response = await api.post('/products', itemData);
    const product = response.data;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: {
        id: 1, // Default category ID
        name: product.category || 'Uncategorized',
        description: product.category || 'Uncategorized products',
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      quantity: product.current_stock,
      reorderPoint: product.reorder_point,
      maxStock: product.max_stock_level,
      price: product.selling_price,
      cost: product.cost_price,
      location: 'Main Warehouse',
      warehouse: {
        id: 1,
        name: 'Main Warehouse',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country'
        },
        type: 'main',
        capacity: 10000,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      supplier: product.supplier_id ? {
        id: product.supplier_id,
        name: 'Supplier',
        contactPerson: 'Contact',
        email: 'supplier@example.com',
        phone: '+1234567890',
        address: 'Supplier St',
        city: 'Supplier City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
        taxId: 'TAX123',
        paymentTerms: 'Net 30',
        creditLimit: 10000,
        rating: 4.5,
        isPreferred: true,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      } : undefined,
      status: product.current_stock > product.reorder_point ? 'in-stock' :
        product.current_stock === 0 ? 'out-of-stock' : 'low-stock',
      unit: product.unit_of_measure || 'pcs',
      weight: product.weight,
      dimensions: product.dimensions ? {
        length: 10,
        width: 10,
        height: 10,
        unit: 'cm'
      } : undefined,
      barcode: product.sku, // Use SKU as barcode for now
      tags: product.category ? [product.category.toLowerCase()] : [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  },

  /**
   * Update existing inventory item
   */
  update: async (id: number, itemData: Partial<InventoryFormData>): Promise<InventoryItem> => {
    const response = await api.put(`/products/${id}`, itemData);
    const product = response.data;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: {
        id: 1, // Default category ID
        name: product.category || 'Uncategorized',
        description: product.category || 'Uncategorized products',
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      quantity: product.current_stock,
      reorderPoint: product.reorder_point,
      maxStock: product.max_stock_level,
      price: product.selling_price,
      cost: product.cost_price,
      location: 'Main Warehouse',
      warehouse: {
        id: 1,
        name: 'Main Warehouse',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country'
        },
        type: 'main',
        capacity: 10000,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      supplier: product.supplier_id ? {
        id: product.supplier_id,
        name: 'Supplier',
        contactPerson: 'Contact',
        email: 'supplier@example.com',
        phone: '+1234567890',
        address: 'Supplier St',
        city: 'Supplier City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
        taxId: 'TAX123',
        paymentTerms: 'Net 30',
        creditLimit: 10000,
        rating: 4.5,
        isPreferred: true,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      } : undefined,
      status: product.current_stock > product.reorder_point ? 'in-stock' :
        product.current_stock === 0 ? 'out-of-stock' : 'low-stock',
      unit: product.unit_of_measure || 'pcs',
      weight: product.weight,
      dimensions: product.dimensions ? {
        length: 10,
        width: 10,
        height: 10,
        unit: 'cm'
      } : undefined,
      barcode: product.sku, // Use SKU as barcode for now
      tags: product.category ? [product.category.toLowerCase()] : [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  },

  /**
   * Delete inventory item
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  /**
   * Update inventory quantity
   */
  updateQuantity: async (
    id: number,
    quantity: number,
    reason: string = ''
  ): Promise<InventoryItem> => {
    const response = await api.put(`/products/${id}`, { current_stock: quantity });
    const product = response.data;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: {
        id: 1, // Default category ID
        name: product.category || 'Uncategorized',
        description: product.category || 'Uncategorized products',
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      quantity: product.current_stock,
      reorderPoint: product.reorder_point,
      maxStock: product.max_stock_level,
      price: product.selling_price,
      cost: product.cost_price,
      location: 'Main Warehouse',
      warehouse: {
        id: 1,
        name: 'Main Warehouse',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country'
        },
        type: 'main',
        capacity: 10000,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      supplier: product.supplier_id ? {
        id: product.supplier_id,
        name: 'Supplier',
        contactPerson: 'Contact',
        email: 'supplier@example.com',
        phone: '+1234567890',
        address: 'Supplier St',
        city: 'Supplier City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
        taxId: 'TAX123',
        paymentTerms: 'Net 30',
        creditLimit: 10000,
        rating: 4.5,
        isPreferred: true,
        isActive: true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      } : undefined,
      status: product.current_stock > product.reorder_point ? 'in-stock' :
        product.current_stock === 0 ? 'out-of-stock' : 'low-stock',
      unit: product.unit_of_measure || 'pcs',
      weight: product.weight,
      dimensions: product.dimensions ? {
        length: 10,
        width: 10,
        height: 10,
        unit: 'cm'
      } : undefined,
      barcode: product.sku, // Use SKU as barcode for now
      tags: product.category ? [product.category.toLowerCase()] : [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  },

  /**
   * Get low stock items
   */
  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/products');
    const products = response.data;

    return products
      .filter((product: any) => product.current_stock <= product.min_stock_level)
      .map((product: any) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        quantity: product.current_stock,
        reorderPoint: product.reorder_point,
        maxStock: product.max_stock_level,
        price: product.selling_price,
        cost: product.cost_price,
        location: 'Main Warehouse',
        warehouse: {
          id: 1,
          name: 'Main Warehouse',
          address: {
            street: '123 Main St',
            city: 'City',
            state: 'State',
            zipCode: '12345',
            country: 'Country'
          },
          type: 'main',
          capacity: 10000,
          isActive: true,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        },
        supplier: product.supplier_id ? {
          id: product.supplier_id,
          name: 'Supplier',
          contactPerson: 'Contact',
          email: 'supplier@example.com',
          phone: '+1234567890',
          address: 'Supplier St',
          city: 'Supplier City',
          state: 'State',
          country: 'Country',
          postalCode: '12345',
          taxId: 'TAX123',
          paymentTerms: 'Net 30',
          creditLimit: 10000,
          rating: 4.5,
          isPreferred: true,
          isActive: true,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        } : undefined,
        status: 'low-stock',
        unit: product.unit_of_measure || 'pcs',
        weight: product.weight,
        dimensions: product.dimensions ? {
          length: 10,
          width: 10,
          height: 10,
          unit: 'cm'
        } : undefined,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
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
   * Get all suppliers with optional filters
   */
  getAll: async (
    filters?: SupplierFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: Supplier[]; pagination: PaginationInfo }> => {
    const params = { ...filters, skip: (page - 1) * limit, limit };
    const response = await api.get('/suppliers', { params });
    const total = response.data.length; // Backend doesn't provide total count yet
    const totalPages = Math.ceil(total / limit);

    return {
      items: response.data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get single supplier by ID
   */
  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  /**
   * Create new supplier
   */
  create: async (supplierData: SupplierFormData): Promise<Supplier> => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  /**
   * Update existing supplier
   */
  update: async (id: number, supplierData: Partial<SupplierFormData>): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  /**
   * Delete supplier
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
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
   * Get all purchase orders with optional filters
   */
  getAll: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: PurchaseOrder[]; pagination: PaginationInfo }> => {
    const params = { skip: (page - 1) * limit, limit };
    const response = await api.get('/purchase-orders', { params });

    return {
      items: response.data,
      pagination: {
        page,
        limit,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / limit),
        hasNext: response.data.length === limit,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get a specific purchase order by ID
   */
  getById: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  /**
   * Create a new purchase order
   */
  create: async (purchaseOrderData: any): Promise<PurchaseOrder> => {
    const response = await api.post('/purchase-orders', purchaseOrderData);
    return response.data;
  },

  /**
   * Update an existing purchase order
   */
  update: async (id: number, purchaseOrderData: any): Promise<PurchaseOrder> => {
    const response = await api.put(`/purchase-orders/${id}`, purchaseOrderData);
    return response.data;
  },

  /**
   * Delete a purchase order
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },

  /**
   * Approve a purchase order
   */
  approve: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.patch(`/purchase-orders/${id}/approve`);
    return response.data;
  },

  /**
   * Mark purchase order as received
   */
  receive: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.patch(`/purchase-orders/${id}/receive`);
    return response.data;
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