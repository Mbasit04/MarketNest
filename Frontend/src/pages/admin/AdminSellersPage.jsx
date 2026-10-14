import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";
import { toast } from "react-toastify";

const STATUS = ["PendingVerification", "Approved", "Rejected", "Suspended", "Expired"];

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [filter, setFilter] = useState("PendingVerification");
  const [reviewing, setReviewing] = useState(null);
  const [reason, setReason] = useState("");

  const load = (s) => adminApi.sellers(s).then(setSellers);
  useEffect(() => { load(filter); }, [filter]);

  async function approve(id) {
    await adminApi.reviewSeller(id, { approve: true });
    toast.success("Approved");
    load(filter);
  }
  async function reject(id) {
    if (!reason) { toast.error("Please enter a reason"); return; }
    await adminApi.reviewSeller(id, { approve: false, rejectionReason: reason });
    toast.success("Rejected");
    setReviewing(null);
    setReason("");
    load(filter);
  }
  async function suspend(id) {
    if (!confirm("Suspend this shop?")) return;
    await adminApi.suspend(id);
    toast.success("Suspended");
    load(filter);
  }
  async function reactivate(id) {
    await adminApi.reactivate(id);
    toast.success("Reactivated");
    load(filter);
  }

  return (
    <div className="mn-page-pad">
      <h2>Seller Verification</h2>
      <div className="mn-filter-bar">
        <button className={!filter ? "active" : ""} onClick={() => setFilter("")}>All</button>
        {STATUS.map((s) => <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>{s}</button>)}
      </div>
      <table className="mn-table">
        <thead>
          <tr><th>Shop</th><th>Owner</th><th>City</th><th>License</th><th>Expiry</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s.Id}>
              <td><strong>{s.ShopName}</strong><div className="mn-muted small">{s.ShopCategory}</div></td>
              <td>{s.OwnerName}<div className="mn-muted small">{s.OwnerEmail}</div></td>
              <td>{s.City}</td>
              <td>{s.LicenseNumber}</td>
              <td>{new Date(s.LicenseExpiryDate).toLocaleDateString()}</td>
              <td><span className="mn-status-pill">{s.Status}</span></td>
              <td className="mn-actions">
                {s.Status === "PendingVerification" && (
                  <>
                    <button className="mn-btn mn-btn-primary" onClick={() => approve(s.Id)}>Approve</button>
                    <button className="mn-btn" onClick={() => setReviewing(s.Id)}>Reject</button>
                  </>
                )}
                {s.Status === "Approved" && <button className="mn-btn" onClick={() => suspend(s.Id)}>Suspend</button>}
                {s.Status === "Suspended" && <button className="mn-btn mn-btn-primary" onClick={() => reactivate(s.Id)}>Reactivate</button>}
                {s.Status === "Rejected" && <span className="mn-muted small">{s.RejectionReason}</span>}
                {s.Status === "Expired" && <button className="mn-btn mn-btn-primary" onClick={() => reactivate(s.Id)}>Reactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reviewing && (
        <div className="mn-modal">
          <div className="mn-modal-card">
            <h3>Reject application</h3>
            <textarea rows={3} placeholder="Reason for rejection…" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="mn-modal-actions">
              <button className="mn-btn" onClick={() => { setReviewing(null); setReason(""); }}>Cancel</button>
              <button className="mn-btn mn-btn-danger" onClick={() => reject(reviewing)}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}