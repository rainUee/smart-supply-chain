const Reports: React.FC = () => {
  return (
    <div className="reports">
      <h2>Reports & Analytics</h2>

      <div className="report-sections">
        <div className="report-section">
          <h3>Inventory Reports</h3>
          <div className="report-buttons">
            <button className="btn btn-secondary">Stock Levels Report</button>
            <button className="btn btn-secondary">Inventory Aging Report</button>
            <button className="btn btn-secondary">Low Stock Alert Report</button>
          </div>
        </div>

        <div className="report-section">
          <h3>Sales Reports</h3>
          <div className="report-buttons">
            <button className="btn btn-secondary">Sales Performance</button>
            <button className="btn btn-secondary">Revenue Analysis</button>
            <button className="btn btn-secondary">Product Performance</button>
          </div>
        </div>

        <div className="report-section">
          <h3>Supplier Reports</h3>
          <div className="report-buttons">
            <button className="btn btn-secondary">Supplier Performance</button>
            <button className="btn btn-secondary">Purchase Order History</button>
            <button className="btn btn-secondary">Cost Analysis</button>
          </div>
        </div>
      </div>

      <div className="analytics-preview">
        <h3>Quick Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Top Selling Products</h4>
            <div className="chart-placeholder">📊 Chart placeholder</div>
          </div>
          <div className="analytics-card">
            <h4>Inventory Turnover</h4>
            <div className="chart-placeholder">📈 Chart placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;