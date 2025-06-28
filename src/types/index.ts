// Base Entity Interface
interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// User and Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Inventory Types
export interface InventoryItem extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  quantity: number;
  reorderPoint: number;
  maxStock?: number;
  price: number;
  cost: number;
  location: string;
  warehouse: Warehouse;
  supplier?: Supplier;
  status: InventoryStatus;
  unit: string;
  weight?: number;
  dimensions?: ProductDimensions;
  images?: string[];
  barcode?: string;
  tags?: string[];
}

export interface ProductCategory extends BaseEntity {
  name: string;
  description?: string;
  parentCategory?: ProductCategory;
  isActive: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';

export interface Warehouse extends BaseEntity {
  name: string;
  address: Address;
  type: 'main' | 'distribution' | 'retail';
  capacity: number;
  manager?: User;
  isActive: boolean;
}

// Supplier Types
export interface Supplier extends BaseEntity {
  name: string;
  companyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  status: SupplierStatus;
  rating: number;
  paymentTerms: string;
  leadTime: number; // in days
  minimumOrder?: number;
  currency: string;
  taxId?: string;
  bankDetails?: BankDetails;
  categories: ProductCategory[];
  performance?: SupplierPerformance;
}

export type SupplierStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface SupplierPerformance {
  totalOrders: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  priceCompetitiveness: number;
  responsiveness: number;
  lastEvaluationDate: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swift?: string;
}

// Order Types
export interface Order extends BaseEntity {
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  orderDate: string;
  requiredDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  trackingNumber?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
}

export interface OrderItem {
  id: number;
  product: InventoryItem;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  notes?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

export interface Customer extends BaseEntity {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: Address;
  customerType: 'retail' | 'wholesale' | 'distributor';
  creditLimit?: number;
  paymentTerms: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
}

// Purchase Order Types
export interface PurchaseOrder extends BaseEntity {
  poNumber: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  terms: string;
  notes?: string;
  approvedBy?: User;
  receivedBy?: User;
}

export interface PurchaseOrderItem {
  id: number;
  product: InventoryItem;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  total: number;
  notes?: string;
}

export type PurchaseOrderStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'sent' 
  | 'partial' 
  | 'received' 
  | 'cancelled';

// Common Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Dashboard and Analytics Types
export interface DashboardMetrics {
  totalInventoryValue: number;
  lowStockItems: number;
  pendingOrders: number;
  activeSuppliers: number;
  monthlyRevenue: number;
  inventoryTurnover: number;
  orderFulfillmentRate: number;
  averageOrderValue: number;
}

export interface InventoryAnalytics {
  stockLevels: StockLevelData[];
  categoryDistribution: CategoryData[];
  warehouseUtilization: WarehouseData[];
  stockMovement: StockMovementData[];
}

export interface StockLevelData {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

export interface WarehouseData {
  name: string;
  utilized: number;
  capacity: number;
  utilizationRate: number;
}

export interface StockMovementData {
  date: string;
  inbound: number;
  outbound: number;
  net: number;
}

export interface SalesAnalytics {
  revenue: RevenueData[];
  topProducts: ProductSalesData[];
  customerSegments: CustomerSegmentData[];
  salesTrends: SalesTrendData[];
}

export interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProductSalesData {
  product: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface CustomerSegmentData {
  segment: string;
  customers: number;
  revenue: number;
  percentage: number;
}

export interface SalesTrendData {
  date: string;
  sales: number;
  orders: number;
}

// Notification Types
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: number;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'low-stock' 
  | 'order-update' 
  | 'supplier-alert' 
  | 'system' 
  | 'payment' 
  | 'shipment';

// Report Types
export interface Report extends BaseEntity {
  name: string;
  type: ReportType;
  description?: string;
  parameters: ReportParameters;
  generatedBy: User;
  fileUrl?: string;
  status: ReportStatus;
  scheduleConfig?: ReportSchedule;
}

export type ReportType = 
  | 'inventory' 
  | 'sales' 
  | 'supplier-performance' 
  | 'financial' 
  | 'custom';

export type ReportStatus = 'generating' | 'completed' | 'failed' | 'scheduled';

export interface ReportParameters {
  dateRange: DateRange;
  filters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  isActive: boolean;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, any>;
}

// Filter and Search Types
export interface InventoryFilter {
  category?: string;
  warehouse?: string;
  status?: InventoryStatus;
  supplier?: number;
  priceRange?: [number, number];
  stockLevel?: 'all' | 'low' | 'normal' | 'high';
  search?: string;
}

export interface OrderFilter {
  status?: OrderStatus;
  customer?: number;
  dateRange?: DateRange;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export interface SupplierFilter {
  status?: SupplierStatus;
  category?: string;
  rating?: [number, number];
  search?: string;
}

// Form Types
export interface InventoryFormData {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  quantity: number;
  reorderPoint: number;
  maxStock?: number;
  price: number;
  cost: number;
  warehouseId: number;
  supplierId?: number;
  unit: string;
  weight?: number;
  dimensions?: ProductDimensions;
  barcode?: string;
  tags?: string[];
}

export interface SupplierFormData {
  name: string;
  companyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  paymentTerms: string;
  leadTime: number;
  minimumOrder?: number;
  currency: string;
  taxId?: string;
  categoryIds: number[];
}

export interface OrderFormData {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
    discount: number;
  }[];
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  paymentMethod: string;
  discount: number;
}

// Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

// Hook Types
export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems: number;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}