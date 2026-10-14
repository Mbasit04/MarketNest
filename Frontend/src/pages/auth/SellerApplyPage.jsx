import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/client";
import { toast } from "react-toastify";

export default function SellerApplyPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    shopName: "",
    description: "",
    address: "",
    city: "",
    shopPhone: "",
    shopCategory: "Electronics",
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    issuingAuthority: "",
    bankName: "",
    bankAccountTitle: "",
    bankAccountNumber: "",
  });
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="mn-auth-page">
        <div className="mn-auth-card">
          <h2>Sign in first</h2>
          <p>You need a MarketNest account before applying to become a seller.</p>
        </div>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        licenseIssueDate: new Date(form.licenseIssueDate).toISOString(),
        licenseExpiryDate: new Date(form.licenseExpiryDate).toISOString(),
      };
      const r = await authApi.applySeller(payload);
      toast.success("Application submitted! Admin verification in progress.");
      await refresh();
      nav("/seller");
    } catch (err) {
      toast.error(err.response?.data?.Error || "Application failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="mn-auth-page">
      <div className="mn-auth-card mn-wide">
        <h2>Become a Seller</h2>
        <p className="mn-muted">Submit your shop details + license for admin verification.</p>
        <form onSubmit={submit} className="mn-grid-form">
          <fieldset>
            <legend>Account Information</legend>
            <label>Full Name<input value={user.FullName} disabled /></label>
            <label>Email<input value={user.Email} disabled /></label>
            <label>Phone<input value={user.Phone || ""} disabled /></label>
          </fieldset>
          <fieldset>
            <legend>Shop Information</legend>
            <label>Shop Name<input required value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Address<input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <label>City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label>Shop Phone<input required value={form.shopPhone} onChange={(e) => setForm({ ...form, shopPhone: e.target.value })} /></label>
            <label>Shop Category
              <select value={form.shopCategory} onChange={(e) => setForm({ ...form, shopCategory: e.target.value })}>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Watches</option>
                <option>Home & Kitchen</option>
                <option>Books</option>
                <option>Other</option>
              </select>
            </label>
          </fieldset>
          <fieldset>
            <legend>License Information</legend>
            <label>License Number<input required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></label>
            <label>Issue Date<input required type="date" value={form.licenseIssueDate} onChange={(e) => setForm({ ...form, licenseIssueDate: e.target.value })} /></label>
            <label>Expiry Date<input required type="date" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} /></label>
            <label>Issuing Authority<input required value={form.issuingAuthority} onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })} /></label>
          </fieldset>
          <fieldset>
            <legend>Bank Information (optional)</legend>
            <label>Bank Name<input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></label>
            <label>Account Title<input value={form.bankAccountTitle} onChange={(e) => setForm({ ...form, bankAccountTitle: e.target.value })} /></label>
            <label>Account Number<input value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} /></label>
          </fieldset>
          <button type="submit" className="mn-btn mn-btn-primary mn-btn-block" disabled={busy}>{busy ? "Submitting…" : "Submit application"}</button>
        </form>
      </div>
    </div>
  );
}