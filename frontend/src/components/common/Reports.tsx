import React, { useState, useEffect } from 'react';
import { Report, ReportType, ReportStatus, DateRange } from '@/types';
import { formatDate, formatCurrency, formatPercentage } from '@/untils';
import LoadingSpinner from './LoadingSpinner';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('inventory');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchReports = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockReports: Report[] = [
          {
            id: 1,
            name: 'Inventory Status Report',
            type: 'inventory',
            description: 'Current inventory levels and stock status',
            parameters: {
              dateRange: {
                startDate: '2025-01-01',
                endDate: '2025-01-31'
              },
              filters: { category: 'all', warehouse: 'all' },
              format: 'pdf',
              includeCharts: true
            },
            generatedBy: {
              id: 1,
              name: 'John Manager',
              email: 'john.manager@company.com',
              role: 'manager',
              isActive: true
            },
            status: 'completed',
            fileUrl: '/reports/inventory-status-2025-01.pdf',
            scheduleConfig: {
              frequency: 'weekly',
              dayOfWeek: 1,
              time: '09:00',
              isActive: true
            },
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Sales Performance Report',
            type: 'sales',
            description: 'Monthly sales performance and trends',
            parameters: {
              dateRange: {
                startDate: '2025-01-01',
                endDate: '2025-01-31'
              },
              filters: { customerType: 'all', productCategory: 'all' },
              format: 'excel',
              includeCharts: true
            },
            generatedBy: {
              id: 1,
              name: 'John Manager',
              email: 'john.manager@company.com',
              role: 'manager',
              isActive: true
            },
            status: 'completed',
            fileUrl: '/reports/sales-performance-2025-01.xlsx',
            createdAt: '2025-01-14T14:00:00Z',
            updatedAt: '2025-01-14T14:15:00Z'
          },
          {
            id: 3,
            name: 'Supplier Performance Report',
            type: 'supplier-performance',
            description: 'Supplier performance metrics and ratings',
            parameters: {
              dateRange: {
                startDate: '2025-01-01',
                endDate: '2025-01-31'
              },
              filters: { supplierStatus: 'active' },
              format: 'pdf',
              includeCharts: false
            },
            generatedBy: {
              id: 1,
              name: 'John Manager',
              email: 'john.manager@company.com',
              role: 'manager',
              isActive: true
            },
            status: 'generating',
            createdAt: '2025-01-15T11:00:00Z',
            updatedAt: '2025-01-15T11:00:00Z'
          }
        ];

        setReports(mockReports);
      } catch (err) {
        setError('Failed to load reports');
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const generateReport = async (): Promise<void> => {
    try {
      // Mock report generation
      const newReport: Report = {
        id: reports.length + 1,
        name: `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report`,
        type: selectedReportType,
        description: `Generated ${selectedReportType} report for ${dateRange.startDate} to ${dateRange.endDate}`,
        parameters: {
          dateRange,
          filters: {},
          format: 'pdf',
          includeCharts: true
        },
        generatedBy: {
          id: 1,
          name: 'John Manager',
          email: 'john.manager@company.com',
          role: 'manager',
          isActive: true
        },
        status: 'generating',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const downloadReport = (report: Report): void => {
    if (report.fileUrl) {
      // Mock download
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.name}.${report.parameters.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: ReportStatus): string => {
    const colors = {
      'generating': 'blue',
      'completed': 'green',
      'failed': 'red',
      'scheduled': 'orange'
    };
    return colors[status] || 'gray';
  };

  const getReportTypeIcon = (type: ReportType): string => {
    const icons = {
      'inventory': '📦',
      'sales': '📊',
      'supplier-performance': '🏢',
      'financial': '💰',
      'custom': '📋'
    };
    return icons[type] || '📄';
  };

  // Mock chart data for report previews
  const getChartData = (type: ReportType) => {
    switch (type) {
      case 'inventory':
        return [
          { category: 'Electronics', inStock: 450, lowStock: 25, outOfStock: 5 },
          { category: 'Accessories', inStock: 320, lowStock: 15, outOfStock: 2 },
          { category: 'Office Supplies', inStock: 280, lowStock: 8, outOfStock: 0 },
        ];
      case 'sales':
        return [
          { month: 'Jan', revenue: 85000, orders: 180 },
          { month: 'Feb', revenue: 92000, orders: 195 },
          { month: 'Mar', revenue: 88000, orders: 185 },
        ];
      case 'supplier-performance':
        return [
          { supplier: 'TechCorp', rating: 4.5, deliveryRate: 94.5 },
          { supplier: 'Electronics Wholesale', rating: 3.8, deliveryRate: 87.2 },
          { supplier: 'Global Supplies', rating: 4.2, deliveryRate: 91.0 },
        ];
      default:
        return [];
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
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

  return (
    <div className="reports">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h3>Generate New Report</h3>
          <div className="report-form">
            <div className="form-group">
              <label>Report Type:</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                className="form-select"
              >
                <option value="inventory">Inventory Report</option>
                <option value="sales">Sales Report</option>
                <option value="supplier-performance">Supplier Performance</option>
                <option value="financial">Financial Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date Range:</label>
              <div className="date-range">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="form-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Format:</label>
              <select className="form-select">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" defaultChecked /> Include Charts
              </label>
            </div>

            <button 
              className="btn btn-primary"
              onClick={generateReport}
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="report-section">
          <h3>Report Preview</h3>
          <div className="report-preview">
            <div className="preview-header">
              <span className="preview-icon">{getReportTypeIcon(selectedReportType)}</span>
              <h4>{selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report Preview</h4>
            </div>
            
            <div className="preview-chart">
              <ResponsiveContainer width="100%" height={200}>
                {selectedReportType === 'inventory' ? (
                  <BarChart data={getChartData(selectedReportType)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inStock" fill="#82ca9d" name="In Stock" />
                    <Bar dataKey="lowStock" fill="#ffc658" name="Low Stock" />
                    <Bar dataKey="outOfStock" fill="#ff8042" name="Out of Stock" />
                  </BarChart>
                ) : selectedReportType === 'sales' ? (
                  <LineChart data={getChartData(selectedReportType)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <BarChart data={getChartData(selectedReportType)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplier" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rating" fill="#82ca9d" name="Rating" />
                    <Bar dataKey="deliveryRate" fill="#ffc658" name="Delivery Rate %" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Recent Reports</h3>
          <div className="reports-list">
            {reports.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <div className="report-header">
                    <span className="report-icon">{getReportTypeIcon(report.type)}</span>
                    <div className="report-details">
                      <h4>{report.name}</h4>
                      <p>{report.description}</p>
                      <div className="report-meta">
                        <span>Generated by {report.generatedBy.name}</span>
                        <span>• {formatDate(report.createdAt)}</span>
                        <span>• {report.parameters.format.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="report-status">
                    <span className={`status-badge ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="report-actions">
                  {report.status === 'completed' && report.fileUrl && (
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => downloadReport(report)}
                    >
                      Download
                    </button>
                  )}
                  {report.status === 'generating' && (
                    <span className="generating-indicator">Generating...</span>
                  )}
                  <button className="btn btn-small btn-secondary">
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h3>Scheduled Reports</h3>
          <div className="scheduled-reports">
            {reports.filter(r => r.scheduleConfig?.isActive).map(report => (
              <div key={report.id} className="scheduled-report-item">
                <div className="schedule-info">
                  <h4>{report.name}</h4>
                  <p>
                    {report.scheduleConfig?.frequency} at {report.scheduleConfig?.time}
                    {report.scheduleConfig?.dayOfWeek && ` (Day ${report.scheduleConfig.dayOfWeek})`}
                  </p>
                </div>
                <div className="schedule-actions">
                  <button className="btn btn-small btn-secondary">Edit</button>
                  <button className="btn btn-small btn-secondary">Disable</button>
                </div>
              </div>
            ))}
            
            {reports.filter(r => r.scheduleConfig?.isActive).length === 0 && (
              <p className="no-scheduled-reports">No scheduled reports found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;