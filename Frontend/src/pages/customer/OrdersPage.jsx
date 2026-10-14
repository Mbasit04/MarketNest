import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { customerApi } from "../../api/client";

const STATUS_ORDER = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "OutForDelivery", "Delivered", "Completed"];

function StatusTimeline({ status }) {
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <ol className="mn-status-timeline">
      {STATUS_ORDER.map((s, i) => (
        <li key={s} className={i <= idx ? "done" : ""}>
          <span className="dot" /> {s}
        </li>
      ))}
    </ol>
  );
}

export function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { customerApi.orders().then(setOrders); }, []);

  return (
    <div className="mn-page-pad">
      <h2>My orders</h2>
      {!orders.length && <p className="mn-empty">No orders yet.</p>}
      {orders.map((o) => (
        <Link key={o.Id} to={`/orders/${o.Id}`} className="mn-order-row">
          <div>
            <strong>{o.OrderNumber}</strong>
            <span className="mn-muted small"> · {new Date(o.CreatedAt).toLocaleString()}</span>
          </div>
          <div>Rs. {o.Total.toLocaleString()}</div>
          <div className="mn-status-pill">{o.Status}</div>
        </Link>
      ))}
    </div>
  );
}

export function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const id = window.location.pathname.split("/").pop();

  useEffect(() => { customerApi.order(id).then(setOrder); }, [id]);

  if (!order) return <div className="mn-page-pad">Loading…</div>;

  return (
    <div className="mn-page-pad">
      <h2>Order {order.OrderNumber}</h2>
      <div className="mn-order-meta">
        <div><strong>Status:</strong> {order.Status}</div>
        <div><strong>Payment:</strong> {order.PaymentMethod} · {order.PaymentStatus}</div>
        <div><strong>Total:</strong> Rs. {order.Total.toLocaleString()}</div>
        <div><strong>Shipping:</strong> {order.ShippingAddress}, {order.ShippingCity} · {order.ShippingPhone}</div>
          <div><strong>Placed:</strong> {new Date(order.CreatedAt).toLocaleString()}</div>
      </div>

      <h3>Tracking</h3>
      <StatusTimeline status={order.Status} />

      <h3>Sub-orders</h3>
      {order.SellerOrders?.map((so) => (
        <div key={so.Id} className="mn-sorder-card">
          <div className="mn-sorder-head">
            <strong>{so.SellerOrderNumber}</strong>
            <span> · {so.Shop?.ShopName}</span>
            <span className="mn-status-pill">{so.Status}</span>
          </div>
          <table className="mn-cart-table">
            <tbody>
              {so.Items.map((it) => (
                <tr key={it.Id}>
                  <td>{it.ProductName}</td>
                  <td>Rs. {it.UnitPrice.toLocaleString()} × {it.Quantity}</td>
                  <td>Rs. {it.LineTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mn-sorder-totals">
            <span>Subtotal: Rs. {so.Subtotal.toLocaleString()}</span>
            <span>Shipping: Rs. {so.ShippingFee.toLocaleString()}</span>
            <span>Total: Rs. {so.Total.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}