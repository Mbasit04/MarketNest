import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerApi } from "../../api/client";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [], cartTotal: 0 });
  const [form, setForm] = useState({ shippingAddress: "", shippingCity: "", shippingPhone: "", paymentMethod: "COD" });
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => { customerApi.getCart().then(setCart); }, []);

  if (!cart.items?.length) {
    return <div className="mn-page-pad">Cart is empty.</div>;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await customerApi.checkout({ ...form, paymentMethod: form.paymentMethod === "Stripe" ? 1 : 0 });
      toast.success("Order " + r.OrderNumber + " placed!");
      nav(`/orders/${r.Id}`);
    } catch (err) {
      toast.error(err.response?.data?.Error || "Checkout failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="mn-page-pad mn-checkout">
      <h2>Checkout</h2>
      <form onSubmit={submit} className="mn-checkout-form">
        <fieldset>
          <legend>Shipping</legend>
          <label>Address<input required value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} /></label>
          <label>City<input required value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} /></label>
          <label>Phone<input required value={form.shippingPhone} onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })} /></label>
        </fieldset>
        <fieldset>
          <legend>Payment</legend>
          <label><input type="radio" name="pm" value="COD" checked={form.paymentMethod === "COD"} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /> Cash on Delivery</label>
          <label><input type="radio" name="pm" value="Stripe" checked={form.paymentMethod === "Stripe"} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /> Stripe (mock)</label>
          <p className="mn-muted small">Stripe will integrate via backend webhook on production.</p>
        </fieldset>
        <div className="mn-checkout-summary">
          <div>Cart total: <strong>Rs. {Math.round(cart.cartTotal).toLocaleString()}</strong></div>
          <div>Multi-seller orders: <strong>{cart.byShop?.length || 0}</strong></div>
          <div>Each sub-order has its own commission calculation.</div>
        </div>
        <button type="submit" className="mn-btn mn-btn-primary" disabled={busy}>{busy ? "Placing…" : "Place order"}</button>
      </form>
    </div>
  );
}