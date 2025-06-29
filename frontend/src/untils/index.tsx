export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const formatNumber = (number: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'in-stock': 'green',
    'low-stock': 'orange',
    'out-of-stock': 'red',
    'discontinued': 'gray',
    'active': 'green',
    'inactive': 'gray',
    'pending': 'blue',
    'suspended': 'red',
    'confirmed': 'green',
    'processing': 'orange',
    'shipped': 'blue',
    'delivered': 'green',
    'cancelled': 'red',
    'returned': 'purple',
    'paid': 'green',
    'failed': 'red',
    'refunded': 'orange',
    'partial': 'yellow',
  };
  return statusColors[status] || 'gray';
};

export const generateSKU = (category: string, id: number): string => {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}${id.toString().padStart(6, '0')}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const calculateInventoryValue = (items: Array<{ quantity: number; cost: number }>): number => {
  return items.reduce((total, item) => total + (item.quantity * item.cost), 0);
};

export const calculateReorderQuantity = (
  currentStock: number,
  reorderPoint: number,
  maxStock: number,
  averageDailyUsage: number
): number => {
  const safetyStock = reorderPoint - (averageDailyUsage * 7); // 7 days safety stock
  const orderQuantity = maxStock - currentStock + safetyStock;
  return Math.max(orderQuantity, 0);
};

export const getInventoryStatus = (quantity: number, reorderPoint: number): string => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= reorderPoint) return 'low-stock';
  return 'in-stock';
};

export const formatAddress = (address: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}): string => {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
};

export const calculateOrderMetrics = (orders: Array<{ total: number; status: string }>) => {
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  return {
    totalOrders,
    completedOrders,
    totalRevenue,
    averageOrderValue,
    fulfillmentRate,
  };
};