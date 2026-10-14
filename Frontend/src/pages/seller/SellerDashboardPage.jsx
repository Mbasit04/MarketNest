import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sellerApi } from "../../api/client";

export default function SellerDashboardPage() {
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);

  useEffect(() => {
    sellerApi.me().then(setMe);
    sellerApi.dashboard().then(setDash).catch(() => setDash(null));
  }, []);

  if (!me) return <div className="mn-page-pad">Loading…</div>;

  if (!me.Shop || me.Shop.Status === "PendingVerification") {
    return (
      <div className="mn-page-pad">
        <h2>Seller Application — Pending Verification</h2>
        <div className="mn-info-card">
          <p>Your shop <strong>{me.Shop?.ShopName || "(not yet created)"}</strong> is awaiting admin approval.</p>
          <p>Status: <span className="mn-status-pill">PendingVerification</span></p>
          <p>Admin will verify your license and ID documents before you can start selling.</p>
        </div>
      </div>
    );
  }

  if (me.Shop.Status === "Rejected") {
    return (
      <div className="mn-page-pad">
        <h2>Application Rejected</h2>
        <div className="mn-error-card">
          <p>Reason: {me.Shop.RejectionReason}</p>
          <Link to="/seller/apply" className="mn-btn mn-btn-primary">Re-apply</Link>
        </div>
      </div>
    );
  }

  if (me.Shop.Status === "Expired") {
    return (
      <div className="mn-page-pad">
        <h2>Shop Expired</h2>
        <p className="mn-error-card">Your license is expired. Please upload renewed license to continue selling.</p>
      </div>
    );
  }

  return (
    <div className="mn-page-pad">
      <h2>Seller Dashboard</h2>
      <p className="mn-muted">Welcome, {me.FullName} · <strong>{me.Shop?.ShopName}</strong></p>

      {dash && dash.hasShop && (
        <div className="mn-stats-grid">
          <div className="mn-stat-card"><div>Total Sales</div><strong>Rs. {Math.round(dash.totalSales).toLocaleString()}</strong></div>
          <div className="mn-stat-card"><div>MarketNest Fee</div><strong>Rs. {Math.round(dash.commission).toLocaleString()}</strong></div>
          <div className="mn-stat-card"><div>Net Earnings</div><strong>Rs. {Math.round(dash.earnings).toLocaleString()}</strong></div>
          <div className="mn-stat-card"><div>Orders</div><strong>{dash.orderCount}</strong></div>
          <div className="mn-stat-card"><div>Products</div><strong>{dash.productCount}</strong></div>
          <div className="mn-stat-card"><div>Pending Orders</div><strong>{dash.pendingOrders}</strong></div>
        </div>
      )}

      <div className="mn-quick-actions">
        <Link to="/seller/products" className="mn-btn mn-btn-primary">My products</Link>
        <Link to="/seller/products/new" className="mn-btn">Add product</Link>
        <Link to="/seller/orders" className="mn-btn">Orders</Link>
      </div>
    </div>
  );
}