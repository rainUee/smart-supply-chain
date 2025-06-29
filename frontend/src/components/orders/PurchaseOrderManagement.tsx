import React, { useState, useEffect } from 'react';
import { PurchaseOrder, Supplier, InventoryItem } from '@/types';
import { formatCurrency, formatDate } from '@/untils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { purchaseOrderService, supplierService, inventoryService } from '@/services/apiService';

const PurchaseOrderManagement: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from APIs
        const [poResponse, suppliersResponse, productsResponse] = await Promise.all([
          purchaseOrderService.getAll(),
          supplierService.getAll(),
          inventoryService.getAll()
        ]);

        setPurchaseOrders(poResponse.items);
        setSuppliers(suppliersResponse.items);
        setProducts(productsResponse.items);
      } catch (err) {
        console.error('Purchase orders fetch error:', err);

        // Fallback to test data if API fails
        const testPurchaseOrders: PurchaseOrder[] = [
          {
            id: 1,
            poNumber: 'PO-2025-001',
            supplierId: 1,
            supplier: {
              id: 1,
              name: 'TechCorp Ltd',
              contactPerson: 'John Smith',
              email: 'john@techcorp.com',
              phone: '+1-555-0123',
              address: '789 Tech Ave',
              city: 'San Francisco',
              state: 'CA',
              country: 'USA',
              postalCode: '94105',
              taxId: 'TAX123456',
              paymentTerms: 'Net 30',
              creditLimit: 50000,
              rating: 4.5,
              isActive: true,
              isPreferred: true,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z'
            },
            items: [
              {
                id: 1,
                purchaseOrderId: 1,
                productId: 1,
                product: {
                  id: 1,
                  sku: 'PROD001',
                  name: 'Wireless Headphones',
                  description: 'High-quality wireless headphones',
                  category: { id: 1, name: 'Electronics', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
                  quantity: 100,
                  reorderPoint: 50,
                  price: 99.99,
                  cost: 65.00,
                  location: 'A-01-15',
                  warehouse: {
                    id: 1,
                    name: 'Warehouse A',
                    address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
                    type: 'main',
                    capacity: 10000,
                    isActive: true,
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-01T00:00:00Z'
                  },
                  status: 'in-stock',
                  unit: 'pcs',
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z'
                },
                quantity: 100,
                unitCost: 65.00,
                totalCost: 6500.00,
                receivedQuantity: 0,
                createdAt: '2025-01-01T00:00:00Z'
              }
            ],
            status: 'submitted',
            orderDate: '2025-01-15T10:00:00Z',
            expectedDelivery: '2025-01-22T10:00:00Z',
            subtotal: 6500.00,
            taxAmount: 390.00,
            shippingAmount: 150.00,
            discountAmount: 0.00,
            totalAmount: 7040.00,
            shippingAddress: '123 Main St, San Francisco, CA 94105',
            shippingMethod: 'Standard',
            notes: 'Standard electronics order',
            termsConditions: 'Net 30 payment terms',
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z'
          },
          {
            id: 2,
            poNumber: 'PO-2025-002',
            supplierId: 2,
            supplier: {
              id: 2,
              name: 'Electronics Wholesale',
              contactPerson: 'Sarah Johnson',
              email: 'sales@elecwholesale.com',
              phone: '+1-555-0456',
              address: '456 Commerce St',
              city: 'New York',
              state: 'NY',
              country: 'USA',
              postalCode: '10001',
              taxId: 'TAX789012',
              paymentTerms: 'Net 15',
              creditLimit: 30000,
              rating: 3.8,
              isActive: true,
              isPreferred: false,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z'
            },
            items: [
              {
                id: 2,
                purchaseOrderId: 2,
                productId: 2,
                product: {
                  id: 2,
                  sku: 'PROD002',
                  name: 'USB Cable',
                  description: 'USB-C to USB-A cable, 2 meters',
                  category: { id: 2, name: 'Accessories', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
                  quantity: 500,
                  reorderPoint: 100,
                  price: 12.99,
                  cost: 4.50,
                  location: 'B-02-08',
                  warehouse: {
                    id: 2,
                    name: 'Warehouse B',
                    address: { street: '456 Oak St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
                    type: 'distribution',
                    capacity: 5000,
                    isActive: true,
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-01T00:00:00Z'
                  },
                  status: 'low-stock',
                  unit: 'pcs',
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z'
                },
                quantity: 500,
                unitCost: 4.50,
                totalCost: 2250.00,
                receivedQuantity: 500,
                createdAt: '2025-01-01T00:00:00Z'
              }
            ],
            status: 'received',
            orderDate: '2025-01-10T14:30:00Z',
            expectedDelivery: '2025-01-20T14:30:00Z',
            subtotal: 2250.00,
            taxAmount: 135.00,
            shippingAmount: 75.00,
            discountAmount: 0.00,
            totalAmount: 2460.00,
            shippingAddress: '456 Oak St, New York, NY 10001',
            shippingMethod: 'Express',
            notes: 'Accessories restock order',
            termsConditions: 'Net 15 payment terms',
            createdAt: '2025-01-10T14:30:00Z',
            updatedAt: '2025-01-18T09:00:00Z'
          }
        ];

        setPurchaseOrders(testPurchaseOrders);
        setSuppliers([]);
        setProducts([]);
        setError('Using test data - API connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || po.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (poId: number, newStatus: string): Promise<void> => {
    try {
      if (newStatus === 'approved') {
        await purchaseOrderService.approve(poId);
      }
      // Update local state
      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === poId ? { ...po, status: newStatus as any } : po
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update purchase order status');
    }
  };

  const handleReceiveItems = async (poId: number): Promise<void> => {
    try {
      await purchaseOrderService.receive(poId);
      // Refresh the data
      const poResponse = await purchaseOrderService.getAll();
      setPurchaseOrders(poResponse.items);
    } catch (err) {
      console.error('Failed to receive items:', err);
      setError('Failed to receive items');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'warning';
      case 'approved': return 'info';
      case 'ordered': return 'primary';
      case 'partially_received': return 'secondary';
      case 'received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusStyle = (status: string) => {
    const color = getStatusColor(status);
    return { ...styles.status, ...styles[`status${color.charAt(0).toUpperCase() + color.slice(1)}` as keyof typeof styles] };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={styles.errorMessage}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ ...styles.btn, ...styles.btnPrimary, marginTop: '10px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Purchase Order Management</h2>
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search PO number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={styles.statusFilter}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="ordered">Ordered</option>
            <option value="partially_received">Partially Received</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={styles.purchaseOrdersList}>
        {filteredPurchaseOrders.map((po) => (
          <div key={po.id} style={styles.purchaseOrderCard}>
            <div style={styles.poHeader}>
              <div style={styles.poInfo}>
                <h3 style={styles.poNumber}>{po.poNumber}</h3>
                <span style={getStatusStyle(po.status)}>
                  {po.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div style={styles.poDates}>
                <p>Order Date: {formatDate(po.orderDate)}</p>
                {po.expectedDelivery && (
                  <p>Expected: {formatDate(po.expectedDelivery)}</p>
                )}
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Supplier</h4>
              <p>{po.supplier?.name || 'Unknown Supplier'}</p>
              {po.supplier?.contactPerson && (
                <p>Contact: {po.supplier.contactPerson}</p>
              )}
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Items</h4>
              <div style={styles.itemsList}>
                {po.items.map((item) => (
                  <div key={item.id} style={styles.item}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>
                        {item.product?.name || `Product ID: ${item.productId}`}
                      </span>
                      <span style={styles.itemQuantity}>
                        {item.quantity} units @ {formatCurrency(item.unitCost)}
                      </span>
                    </div>
                    <div style={styles.itemTotal}>
                      {formatCurrency(item.totalCost)}
                    </div>
                    {item.receivedQuantity > 0 && (
                      <div style={styles.receivedInfo}>
                        Received: {item.receivedQuantity}/{item.quantity}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.financialSummary}>
              <h4 style={styles.sectionTitle}>Financial Summary</h4>
              <div style={styles.amounts}>
                <p>Subtotal: {formatCurrency(po.subtotal)}</p>
                <p>Tax: {formatCurrency(po.taxAmount)}</p>
                <p>Shipping: {formatCurrency(po.shippingAmount)}</p>
                {po.discountAmount > 0 && (
                  <p>Discount: -{formatCurrency(po.discountAmount)}</p>
                )}
                <p style={styles.total}>Total: {formatCurrency(po.totalAmount)}</p>
              </div>
            </div>

            {po.notes && (
              <div style={styles.notes}>
                <h4 style={styles.sectionTitle}>Notes</h4>
                <p>{po.notes}</p>
              </div>
            )}

            <div style={styles.actions}>
              {po.status === 'submitted' && (
                <button
                  onClick={() => handleStatusChange(po.id, 'approved')}
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                >
                  Approve
                </button>
              )}
              {po.status === 'approved' && (
                <button
                  onClick={() => handleStatusChange(po.id, 'ordered')}
                  style={{ ...styles.btn, ...styles.btnSecondary }}
                >
                  Mark as Ordered
                </button>
              )}
              {(po.status === 'ordered' || po.status === 'approved') && (
                <button
                  onClick={() => handleReceiveItems(po.id)}
                  style={{ ...styles.btn, ...styles.btnSuccess }}
                >
                  Receive Items
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPurchaseOrders.length === 0 && (
        <div style={styles.noData}>
          <p>No purchase orders found.</p>
        </div>
      )}
    </div>
  );
};


// Inline styles for the component
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '200px',
  },
  statusFilter: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  purchaseOrdersList: {
    display: 'grid',
    gap: '20px',
  },
  purchaseOrderCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  poHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  poInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  poNumber: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  },
  statusDefault: { backgroundColor: '#f0f0f0', color: '#666' },
  statusWarning: { backgroundColor: '#fff3cd', color: '#856404' },
  statusInfo: { backgroundColor: '#d1ecf1', color: '#0c5460' },
  statusPrimary: { backgroundColor: '#cce5ff', color: '#004085' },
  statusSecondary: { backgroundColor: '#e2e3e5', color: '#383d41' },
  statusSuccess: { backgroundColor: '#d4edda', color: '#155724' },
  statusError: { backgroundColor: '#f8d7da', color: '#721c24' },
  poDates: {
    textAlign: 'right' as const,
    fontSize: '14px',
    color: '#666',
  },
  section: {
    marginBottom: '15px',
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  itemsList: {
    display: 'grid',
    gap: '10px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  itemQuantity: {
    fontSize: '12px',
    color: '#666',
  },
  itemTotal: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  receivedInfo: {
    fontSize: '12px',
    color: '#28a745',
    fontWeight: 'bold',
  },
  financialSummary: {
    borderTop: '1px solid #ddd',
    paddingTop: '15px',
    marginTop: '15px',
  },
  amounts: {
    display: 'grid',
    gap: '5px',
  },
  total: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333',
    borderTop: '1px solid #ddd',
    paddingTop: '5px',
    marginTop: '5px',
  },
  notes: {
    borderTop: '1px solid #ddd',
    paddingTop: '15px',
    marginTop: '15px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    flexWrap: 'wrap' as const,
  },
  btn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center' as const,
  },
  btnPrimary: { backgroundColor: '#007bff', color: 'white' },
  btnSecondary: { backgroundColor: '#6c757d', color: 'white' },
  btnSuccess: { backgroundColor: '#28a745', color: 'white' },
  errorMessage: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
  },
  noData: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
    fontSize: '16px',
  },
};


export default PurchaseOrderManagement; 