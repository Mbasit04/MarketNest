import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { adminApi.orders().then(setOrders); }, []);
  return (
    <div className="mn-page-pad">
      <h2>All Orders</h2>
      <table className="mn-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Sub-orders</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.Id}>
              <td><strong>{o.OrderNumber}</strong></td>
              <td>{o.Customer?.FullName}</td>
              <td>{o.SellerOrders?.length || 0}</td>
              <td>Rs. {o.Total.toLocaleString()}</td>
              <td><span className="mn-status-pill">{o.Status}</span></td>
              <td>{o.PaymentMethod} · {o.PaymentStatus}</td>
              <td>{new Date(o.CreatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}