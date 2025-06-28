import { Supplier } from "@/types";
import { useEffect, useState } from "react";
import SupplierCard from "./SupplieCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockSuppliers: Supplier[] = [
          {
            id: 1,
            name: 'TechCorp Ltd',
            companyName: 'TechCorp Limited',
            contactPerson: 'John Smith',
            email: 'john@techcorp.com',
            phone: '+1-555-0123',
            address: {
              street: '789 Tech Ave',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94105',
              country: 'USA'
            },
            status: 'active',
            rating: 4.5,
            paymentTerms: 'Net 30',
            leadTime: 7,
            minimumOrder: 1000,
            currency: 'USD',
            taxId: 'US123456789',
            categories: [
              { id: 1, name: 'Electronics', isActive: true, createdAt: '', updatedAt: '' }
            ],
            performance: {
              totalOrders: 45,
              onTimeDeliveryRate: 94.5,
              qualityRating: 4.3,
              priceCompetitiveness: 4.1,
              responsiveness: 4.6,
              lastEvaluationDate: '2025-01-01T00:00:00Z'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z'
          },
          {
            id: 2,
            name: 'Electronics Wholesale',
            companyName: 'Electronics Wholesale Inc.',
            contactPerson: 'Sarah Johnson',
            email: 'sales@elecwholesale.com',
            phone: '+1-555-0456',
            address: {
              street: '456 Commerce St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            status: 'active',
            rating: 3.8,
            paymentTerms: 'Net 15',
            leadTime: 10,
            minimumOrder: 500,
            currency: 'USD',
            taxId: 'US987654321',
            categories: [
              { id: 1, name: 'Electronics', isActive: true, createdAt: '', updatedAt: '' },
              { id: 2, name: 'Accessories', isActive: true, createdAt: '', updatedAt: '' }
            ],
            performance: {
              totalOrders: 32,
              onTimeDeliveryRate: 87.2,
              qualityRating: 3.9,
              priceCompetitiveness: 4.5,
              responsiveness: 3.7,
              lastEvaluationDate: '2024-12-15T00:00:00Z'
            },
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2025-01-10T15:30:00Z'
          }
        ];

        setSuppliers(mockSuppliers);
      } catch (err) {
        setError('Failed to load suppliers data');
        console.error('Suppliers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading suppliers..." />;
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
    <div className="supplier-management">
      <div className="page-header">
        <h2>Supplier Management</h2>
        <button className="btn btn-primary">Add New Supplier</button>
      </div>

      <div className="suppliers-grid">
        {suppliers.map(supplier => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>
    </div>
  );
};
export default SupplierManagement;