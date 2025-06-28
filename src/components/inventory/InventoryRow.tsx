import { InventoryItem } from "@/types";
import { JSX, useState } from "react";
import { formatCurrency } from "@/untils";

interface InventoryRowProps {
  item: InventoryItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const InventoryRow: React.FC<InventoryRowProps> = ({ item, onUpdateQuantity }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(item.quantity);

  const handleSave = (): void => {
    onUpdateQuantity(item.id, quantity);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setQuantity(item.quantity);
    setIsEditing(false);
  };

  const getStatusBadge = (): JSX.Element => {
    if (item.quantity <= item.reorderPoint) {
      return <span className="status-badge low-stock">Low Stock</span>;
    } else if (item.quantity <= item.reorderPoint * 2) {
      return <span className="status-badge medium-stock">Medium</span>;
    }
    return <span className="status-badge in-stock">In Stock</span>;
  };

  return (
    <tr>
      <td>{item.sku}</td>
      <td>{item.name}</td>
      <td>{item.category.name}</td>
      <td>
        {isEditing ? (
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="quantity-input"
            min="0"
          />
        ) : (
          item.quantity
        )}
      </td>
      <td>{item.reorderPoint}</td>
      <td>{formatCurrency(item.price)}</td>
      <td>{item.location}</td>
      <td>{getStatusBadge()}</td>
      <td>
        {isEditing ? (
          <div className="action-buttons">
            <button onClick={handleSave} className="btn btn-small btn-success">
              Save
            </button>
            <button onClick={handleCancel} className="btn btn-small btn-secondary">
              Cancel
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-small btn-primary"
            >
              Edit
            </button>
            <button className="btn btn-small btn-secondary">
              View
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};
export default InventoryRow;