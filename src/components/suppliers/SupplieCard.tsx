import { Supplier } from "@/types";

interface SupplierCardProps {
  supplier: Supplier;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'inactive': return 'red';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };

  const renderStars = (rating: number): string => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - Math.ceil(rating));
  };

  return (
    <div className="supplier-card">
      <div className="supplier-header">
        <h3>{supplier.name}</h3>
        <span className={`status-badge ${getStatusColor(supplier.status)}`}>
          {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
        </span>
      </div>

      <div className="supplier-details">
        <p><strong>Contact:</strong> {supplier.contactPerson}</p>
        <p><strong>Email:</strong> {supplier.email}</p>
        <p><strong>Phone:</strong> {supplier.phone}</p>
        <p><strong>Lead Time:</strong> {supplier.leadTime} days</p>
        <div className="rating">
          <strong>Rating:</strong>
          <span className="stars">{renderStars(supplier.rating)}</span>
          <span className="rating-number">({supplier.rating})</span>
        </div>
        {supplier.performance && (
          <div className="performance-summary">
            <p><strong>On-time Delivery:</strong> {supplier.performance.onTimeDeliveryRate}%</p>
            <p><strong>Total Orders:</strong> {supplier.performance.totalOrders}</p>
          </div>
        )}
      </div>

      <div className="supplier-actions">
        <button className="btn btn-small btn-primary">View Details</button>
        <button className="btn btn-small btn-secondary">Create PO</button>
      </div>
    </div>
  );
};

export default SupplierCard;