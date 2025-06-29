import { DashboardMetrics, InventoryAnalytics, SalesAnalytics } from "@/types";
import { formatCurrency, formatPercentage, formatNumber } from "@/untils";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { MetricCard } from "@/components/common/MetricCard";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Mock API call - replace with actual service
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockData: DashboardMetrics = {
          totalInventoryValue: 125000,
          lowStockItems: 3,
          pendingOrders: 12,
          activeSuppliers: 8,
          monthlyRevenue: 89500,
          inventoryTurnover: 4.2,
          orderFulfillmentRate: 96.5,
          averageOrderValue: 450.75,
        };

        const mockInventoryAnalytics: InventoryAnalytics = {
          stockLevels: [
            { category: 'Electronics', inStock: 450, lowStock: 25, outOfStock: 5 },
            { category: 'Accessories', inStock: 320, lowStock: 15, outOfStock: 2 },
            { category: 'Office Supplies', inStock: 280, lowStock: 8, outOfStock: 0 },
            { category: 'Furniture', inStock: 120, lowStock: 5, outOfStock: 1 },
          ],
          categoryDistribution: [
            { name: 'Electronics', value: 35, percentage: 35 },
            { name: 'Accessories', value: 25, percentage: 25 },
            { name: 'Office Supplies', value: 22, percentage: 22 },
            { name: 'Furniture', value: 18, percentage: 18 },
          ],
          warehouseUtilization: [
            { name: 'Warehouse A', utilized: 7500, capacity: 10000, utilizationRate: 75 },
            { name: 'Warehouse B', utilized: 3200, capacity: 5000, utilizationRate: 64 },
            { name: 'Warehouse C', utilized: 1800, capacity: 3000, utilizationRate: 60 },
          ],
          stockMovement: [
            { date: '2025-01-10', inbound: 150, outbound: 120, net: 30 },
            { date: '2025-01-11', inbound: 200, outbound: 180, net: 20 },
            { date: '2025-01-12', inbound: 180, outbound: 200, net: -20 },
            { date: '2025-01-13', inbound: 220, outbound: 190, net: 30 },
            { date: '2025-01-14', inbound: 160, outbound: 210, net: -50 },
            { date: '2025-01-15', inbound: 190, outbound: 170, net: 20 },
          ],
        };

        const mockSalesAnalytics: SalesAnalytics = {
          revenue: [
            { period: 'Jan', revenue: 85000, orders: 180, averageOrderValue: 472 },
            { period: 'Feb', revenue: 92000, orders: 195, averageOrderValue: 472 },
            { period: 'Mar', revenue: 88000, orders: 185, averageOrderValue: 476 },
            { period: 'Apr', revenue: 95000, orders: 200, averageOrderValue: 475 },
            { period: 'May', revenue: 102000, orders: 215, averageOrderValue: 474 },
            { period: 'Jun', revenue: 98000, orders: 210, averageOrderValue: 467 },
          ],
          topProducts: [
            { product: 'Wireless Headphones', quantity: 450, revenue: 44955, profit: 15734 },
            { product: 'USB Cable', quantity: 1200, revenue: 15588, profit: 10188 },
            { product: 'Laptop Stand', quantity: 280, revenue: 12600, profit: 6440 },
            { product: 'Mouse Pad', quantity: 800, revenue: 8000, profit: 4800 },
            { product: 'Keyboard', quantity: 150, revenue: 6750, profit: 2700 },
          ],
          customerSegments: [
            { segment: 'Wholesale', customers: 25, revenue: 45000, percentage: 50 },
            { segment: 'Retail', customers: 180, revenue: 35000, percentage: 39 },
            { segment: 'Distributor', customers: 15, revenue: 9500, percentage: 11 },
          ],
          salesTrends: [
            { date: '2025-01-10', sales: 3200, orders: 8 },
            { date: '2025-01-11', sales: 3800, orders: 10 },
            { date: '2025-01-12', sales: 2900, orders: 7 },
            { date: '2025-01-13', sales: 4200, orders: 11 },
            { date: '2025-01-14', sales: 3600, orders: 9 },
            { date: '2025-01-15', sales: 4100, orders: 12 },
          ],
        };

        setDashboardData(mockData);
        setInventoryAnalytics(mockInventoryAnalytics);
        setSalesAnalytics(mockSalesAnalytics);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData || !inventoryAnalytics || !salesAnalytics) {
    return <div>No data available</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      
      <div className="metrics-grid">
        <MetricCard
          title="Total Inventory Value"
          value={formatCurrency(dashboardData.totalInventoryValue)}
          icon="💰"
          trend="+5.2%"
          trendColor="green"
        />
        <MetricCard
          title="Low Stock Items"
          value={dashboardData.lowStockItems.toString()}
          icon="⚠️"
          trend="-2"
          trendColor="green"
        />
        <MetricCard
          title="Pending Orders"
          value={dashboardData.pendingOrders.toString()}
          icon="📋"
          trend="+3"
          trendColor="blue"
        />
        <MetricCard
          title="Active Suppliers"
          value={dashboardData.activeSuppliers.toString()}
          icon="🏢"
          trend="0"
          trendColor="gray"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(dashboardData.monthlyRevenue)}
          icon="💵"
          trend="+12.5%"
          trendColor="green"
        />
        <MetricCard
          title="Order Fulfillment Rate"
          value={formatPercentage(dashboardData.orderFulfillmentRate)}
          icon="✅"
          trend="+2.1%"
          trendColor="green"
        />
        <MetricCard
          title="Inventory Turnover"
          value={formatNumber(dashboardData.inventoryTurnover)}
          icon="🔄"
          trend="+0.3"
          trendColor="green"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(dashboardData.averageOrderValue)}
          icon="📊"
          trend="+5.8%"
          trendColor="green"
        />
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesAnalytics.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#667eea" 
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryAnalytics.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {inventoryAnalytics.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} items`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Stock Movement (Last 6 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={inventoryAnalytics.stockMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="inbound" 
                stackId="1" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Inbound"
              />
              <Area 
                type="monotone" 
                dataKey="outbound" 
                stackId="1" 
                stroke="#ffc658" 
                fill="#ffc658" 
                name="Outbound"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryAnalytics.warehouseUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar 
                dataKey="utilizationRate" 
                fill="#667eea" 
                name="Utilization Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesAnalytics.topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={120} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Customer Segments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesAnalytics.customerSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, percentage }) => `${segment} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {salesAnalytics.customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;