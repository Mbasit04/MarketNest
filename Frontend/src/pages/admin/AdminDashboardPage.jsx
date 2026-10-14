import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";

export default function AdminDashboardPage() {
  const [d, setD] = useState(null);
  useEffect(() => { adminApi.dashboard().then(setD); }, []);
  if (!d) return <div className="mn-page-pad">Loading…</div>;
  return (
    <div className="mn-page-pad">
      <h2>MarketNest Admin Dashboard</h2>
      <div className="mn-stats-grid">
        <div className="mn-stat-card"><div>Total Customers</div><strong>{d.totalCustomers}</strong></div>
        <div className="mn-stat-card"><div>Total Sellers</div><strong>{d.totalSellers}</strong></div>
        <div className="mn-stat-card"><div>Pending Sellers</div><strong>{d.pendingSellers}</strong></div>
        <div className="mn-stat-card"><div>Active Shops</div><strong>{d.activeShops}</strong></div>
        <div className="mn-stat-card"><div>Total Products</div><strong>{d.totalProducts}</strong></div>
        <div className="mn-stat-card"><div>Pending Products</div><strong>{d.pendingProducts}</strong></div>
        <div className="mn-stat-card"><div>Total Orders</div><strong>{d.totalOrders}</strong></div>
        <div className="mn-stat-card"><div>Total Revenue</div><strong>Rs. {Math.round(d.totalRevenue).toLocaleString()}</strong></div>
        <div className="mn-stat-card"><div>MarketNest Commission</div><strong>Rs. {Math.round(d.commission).toLocaleString()}</strong></div>
      </div>
      <div className="mn-quick-actions">
        <Link to="/admin/sellers" className="mn-btn mn-btn-primary">Manage sellers</Link>
        <Link to="/admin/orders" className="mn-btn">All orders</Link>
        <Link to="/admin/products" className="mn-btn">Products</Link>
        <Link to="/admin/commission" className="mn-btn">Commission</Link>
        <Link to="/admin/categories" className="mn-btn">Categories</Link>
        <Link to="/admin/reports" className="mn-btn">Reports</Link>
      </div>
    </div>
  );
}