import { DashboardMetrics } from "@/types";
import { formatCurrency } from "@/untils";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { MetricCard } from "@/components/common/MetricCard";

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
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

        setDashboardData(mockData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (!dashboardData) {
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
          value={`${dashboardData.orderFulfillmentRate}%`}
          icon="✅"
          trend="+2.1%"
          trendColor="green"
        />
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Inventory Overview</h3>
          <div className="chart-placeholder">
            📊 Inventory levels by category chart would be here
          </div>
        </div>
        <div className="chart-container">
          <h3>Order Trends</h3>
          <div className="chart-placeholder">
            📈 Order volume trends chart would be here
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;