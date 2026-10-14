import { useEffect, useState } from "react";
import { sellerApi } from "../../api/client";
import { toast } from "react-toastify";

const STATUS = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "OutForDelivery", "Delivered", "Completed"];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  const load = (status) => sellerApi.orders(status).then(setOrders);
  useEffect(() => { load(filter); }, [filter]);

  async function updateStatus(o, status, trackingNumber) {
    try {
      await sellerApi.updateOrderStatus(o.Id, { status: Number(STATUS.indexOf(status)), trackingNumber });
      toast.success("Updated to " + status);
      load(filter);
    } catch (e) { toast.error("Failed"); }
  }

  return (
    <div className="mn-page-pad">
      <h2>Seller Orders</h2>
      <div className="mn-filter-bar">
        <button className={!filter ? "active" : ""} onClick={() => setFilter("")}>All</button>
        {STATUS.map((s) => <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>{s}</button>)}
      </div>

      {!orders.length && <p className="mn-empty">No orders.</p>}
      {orders.map((o) => (
        <div key={o.Id} className="mn-sorder-card">
          <div className="mn-sorder-head">
            <strong>{o.SellerOrderNumber}</strong>
            <span> · {o.Order?.OrderNumber}</span>
            <span className="mn-status-pill">{o.Status}</span>
          </div>
          <table className="mn-cart-table">
            <tbody>
              {o.Items.map((it) => (
                <tr key={it.Id}>
                  <td>{it.ProductName}</td>
                  <td>Rs. {it.UnitPrice.toLocaleString()} × {it.Quantity}</td>
                  <td>Rs. {it.LineTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mn-sorder-totals">
            <span>Subtotal: Rs. {o.Subtotal.toLocaleString()}</span>
            <span>Commission: Rs. {o.CommissionAmount.toLocaleString()}</span>
            <span>Your Earning: Rs. {o.SellerEarning.toLocaleString()}</span>
            <span>Total: Rs. {o.Total.toLocaleString()}</span>
          </div>
          <div className="mn-status-update">
            <label>Update status
              <select value={o.Status} onChange={(e) => updateStatus(o, e.target.value, o.TrackingNumber)}>
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Tracking #
              <input defaultValue={o.TrackingNumber || ""} onBlur={(e) => updateStatus(o, o.Status, e.target.value)} />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}