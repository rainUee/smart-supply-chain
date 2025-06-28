import { InventoryFilter, InventoryItem } from "@/types";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import InventoryRow from "./InventoryRow";

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<InventoryFilter>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockInventory: InventoryItem[] = [
          {
            id: 1,
            sku: 'PROD001',
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            category: { id: 1, name: 'Electronics', isActive: true, createdAt: '', updatedAt: '' },
            quantity: 150,
            reorderPoint: 50,
            maxStock: 300,
            price: 99.99,
            cost: 65.00,
            location: 'A-01-15',
            warehouse: {
              id: 1,
              name: 'Warehouse A',
              address: {
                street: '123 Main St',
                city: 'Boston',
                state: 'MA',
                zipCode: '02101',
                country: 'USA'
              },
              type: 'main',
              capacity: 10000,
              isActive: true,
              createdAt: '',
              updatedAt: ''
            },
            status: 'in-stock',
            unit: 'pcs',
            weight: 0.5,
            barcode: '1234567890123',
            tags: ['electronics', 'audio', 'wireless'],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z'
          },
          {
            id: 2,
            sku: 'PROD002',
            name: 'USB Cable',
            description: 'USB-C to USB-A cable, 2 meters',
            category: { id: 2, name: 'Accessories', isActive: true, createdAt: '', updatedAt: '' },
            quantity: 25,
            reorderPoint: 100,
            maxStock: 500,
            price: 12.99,
            cost: 4.50,
            location: 'B-02-08',
            warehouse: {
              id: 2,
              name: 'Warehouse B',
              address: {
                street: '456 Oak Ave',
                city: 'Cambridge',
                state: 'MA',
                zipCode: '02139',
                country: 'USA'
              },
              type: 'distribution',
              capacity: 5000,
              isActive: true,
              createdAt: '',
              updatedAt: ''
            },
            status: 'low-stock',
            unit: 'pcs',
            weight: 0.1,
            barcode: '1234567890124',
            tags: ['accessories', 'cable', 'usb'],
            createdAt: '2025-01-02T00:00:00Z',
            updatedAt: '2025-01-15T11:00:00Z'
          },
          {
            id: 3,
            sku: 'PROD003',
            name: 'Laptop Stand',
            description: 'Adjustable aluminum laptop stand',
            category: { id: 2, name: 'Accessories', isActive: true, createdAt: '', updatedAt: '' },
            quantity: 75,
            reorderPoint: 30,
            maxStock: 200,
            price: 45.00,
            cost: 22.00,
            location: 'A-03-12',
            warehouse: {
              id: 1,
              name: 'Warehouse A',
              address: {
                street: '123 Main St',
                city: 'Boston',
                state: 'MA',
                zipCode: '02101',
                country: 'USA'
              },
              type: 'main',
              capacity: 10000,
              isActive: true,
              createdAt: '',
              updatedAt: ''
            },
            status: 'in-stock',
            unit: 'pcs',
            weight: 1.2,
            barcode: '1234567890125',
            tags: ['accessories', 'laptop', 'stand'],
            createdAt: '2025-01-03T00:00:00Z',
            updatedAt: '2025-01-15T12:15:00Z'
          }
        ];

        setInventory(mockInventory);
      } catch (err) {
        setError('Failed to load inventory data');
        console.error('Inventory fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter.stockLevel === 'low') {
      return matchesSearch && item.quantity <= item.reorderPoint;
    }

    return matchesSearch;
  });

  const handleUpdateQuantity = (id: number, newQuantity: number): void => {
    setInventory(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleFilterChange = (newFilter: Partial<InventoryFilter>): void => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading inventory..." />;
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
    <div className="inventory-management">
      <div className="page-header">
        <h2>Inventory Management</h2>
        <button className="btn btn-primary">Add New Product</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filter.stockLevel || 'all'}
          onChange={(e) => handleFilterChange({ stockLevel: e.target.value === 'all' ? undefined : e.target.value as any })}
          className="filter-select"
        >
          <option value="all">All Items</option>
          <option value="low">Low Stock</option>
          <option value="normal">Normal Stock</option>
          <option value="high">High Stock</option>
        </select>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder Point</th>
              <th>Price</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <InventoryRow
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InventoryManagement;