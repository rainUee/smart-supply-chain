import { Order } from "@/types";
import { formatDate, formatCurrency } from "@/untils";

interface OrderRowProps {
  order: Order;
}

const OrderRow: React.FC<OrderRowProps> = ({ order }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'processing': return 'blue';
      case 'shipped': return 'green';
      case 'pending': return 'orange';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'refunded': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <tr>
      <td>{order.orderNumber}</td>
      <td>{order.customer.name}</td>
      <td>{formatDate(order.orderDate)}</td>
      <td>
        <span className={`status-badge ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </td>
      <td>{formatCurrency(order.total)}</td>
      <td>
        <span className={`status-badge ${getPaymentStatusColor(order.paymentStatus)}`}>
          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button className="btn btn-small btn-primary">View</button>
          <button className="btn btn-small btn-secondary">Edit</button>
          {order.status === 'processing' && (
            <button className="btn btn-small btn-success">Ship</button>
          )}
        </div>
      </td>
    </tr>
  );
};
export default OrderRow;