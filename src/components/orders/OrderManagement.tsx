import { Order } from "@/types";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrderRow from "./OderRow";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 900));
        
        const mockOrders: Order[] = [
          {
            id: 1,
            orderNumber: 'ORD-2025-001',
            customer: {
              id: 1,
              name: 'ABC Corp',
              email: 'orders@abccorp.com',
              phone: '+1-555-1111',
              address: {
                street: '123 Business Ave',
                city: 'Boston',
                state: 'MA',
                zipCode: '02101',
                country: 'USA'
              },
              customerType: 'wholesale',
              paymentTerms: 'Net 30',
              isActive: true,
              totalOrders: 25,
              totalSpent: 45000,
              createdAt: '',
              updatedAt: ''
            },
            items: [],
            status: 'processing',
            orderDate: '2025-01-15T10:00:00Z',
            requiredDate: '2025-01-20T10:00:00Z',
            subtotal: 1500.00,
            tax: 90.00,
            shipping: 9.85,
            discount: 0.00,
            total: 1599.85,
            currency: 'USD',
            shippingAddress: {
              street: '123 Business Ave',
              city: 'Boston',
              state: 'MA',
              zipCode: '02101',
              country: 'USA'
            },
            paymentStatus: 'paid',
            paymentMethod: 'Credit Card',
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z'
          },
          {
            id: 2,
            orderNumber: 'ORD-2025-002',
            customer: {
              id: 2,
              name: 'XYZ Ltd',
              email: 'purchasing@xyzltd.com',
              phone: '+1-555-2222',
              address: {
                street: '456 Industry Rd',
                city: 'Cambridge',
                state: 'MA',
                zipCode: '02139',
                country: 'USA'
              },
              customerType: 'retail',
              paymentTerms: 'Net 15',
              isActive: true,
              totalOrders: 12,
              totalSpent: 18500,
              createdAt: '',
              updatedAt: ''
            },
            items: [],
            status: 'shipped',
            orderDate: '2025-01-14T14:30:00Z',
            shippedDate: '2025-01-15T09:00:00Z',
            subtotal: 850.00,
            tax: 42.50,
            shipping: 7.49,
            discount: 0.00,
            total: 899.99,
            currency: 'USD',
            shippingAddress: {
              street: '456 Industry Rd',
              city: 'Cambridge',
              state: 'MA',
              zipCode: '02139',
              country: 'USA'
            },
            paymentStatus: 'paid',
            paymentMethod: 'Bank Transfer',
            trackingNumber: 'TRK123456789',
            createdAt: '2025-01-14T14:30:00Z',
            updatedAt: '2025-01-15T09:00:00Z'
          }
        ];
        
        setOrders(mockOrders);
      } catch (err) {
        setError('Failed to load orders data');
        console.error('Orders fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
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
    <div className="order-management">
      <div className="page-header">
        <h2>Order Management</h2>
        <button className="btn btn-primary">Create New Order</button>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OrderManagement;