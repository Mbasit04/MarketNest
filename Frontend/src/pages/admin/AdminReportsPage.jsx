import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";

export default function AdminReportsPage() {
  const [r, setR] = useState(null);
  useEffect(() => { adminApi.reports().then(setR); }, []);
  if (!r) return <div className="mn-page-pad">Loading…</div>;
  return (
    <div className="mn-page-pad">
      <h2>Reports</h2>
      <div className="mn-reports-grid">
        <div>
          <h4>Sub-orders by status</h4>
          <table className="mn-table">
            <thead><tr><th>Status</th><th>Count</th><th>Total</th></tr></thead>
            <tbody>
              {r.byStatus.map((x) => (
                <tr key={x.Status}><td>{x.Status}</td><td>{x.Count}</td><td>Rs. {Math.round(x.Total).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Top shops</h4>
          <table className="mn-table">
            <thead><tr><th>Shop</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {r.topShops.map((x) => (
                <tr key={x.ShopId}><td>{x.ShopId}</td><td>{x.Orders}</td><td>Rs. {Math.round(x.Revenue).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Recent orders</h4>
          <table className="mn-table">
            <thead><tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {r.recentOrders.map((x) => (
                <tr key={x.Id}>
                  <td>{x.OrderNumber}</td>
                  <td>Rs. {x.Total.toLocaleString()}</td>
                  <td>{x.Status}</td>
                  <td>{new Date(x.CreatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}