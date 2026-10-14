import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { catalogApi, sellerApi } from "../../api/client";
import { toast } from "react-toastify";

export function SellerProductsListPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { sellerApi.products().then(setProducts); }, []);
  async function del(id) {
    if (!confirm("Delete this product?")) return;
    await sellerApi.deleteProduct(id);
    toast.success("Deleted");
    setProducts(products.filter((p) => p.Id !== id));
  }
  return (
    <div className="mn-page-pad">
      <div className="mn-page-head">
        <h2>My Products</h2>
        <Link to="/seller/products/new" className="mn-btn mn-btn-primary">+ Add product</Link>
      </div>
      {!products.length && <p className="mn-empty">No products yet.</p>}
      <table className="mn-table">
        <thead>
          <tr>
            <th>Product</th><th>Price</th><th>Discount</th><th>Stock</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.Id}>
              <td>
                <strong>{p.Name}</strong>
                <div className="mn-muted small">{p.Brand} · {p.Category?.Name}</div>
              </td>
              <td>Rs. {p.Price.toLocaleString()}</td>
              <td>{p.Discount}%</td>
              <td>{p.StockQuantity}</td>
              <td>{p.IsActive ? <span className="mn-status-pill ok">Active</span> : <span className="mn-status-pill off">Inactive</span>}</td>
              <td><button className="mn-btn mn-btn-ghost" onClick={() => del(p.Id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SellerProductFormPage() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", price: 0, discount: 0, stockQuantity: 0,
    sku: "", brand: "", weight: 0, categoryId: 1,
  });
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => { catalogApi.categories().then(setCats); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await sellerApi.addProduct({ ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), discount: Number(form.discount), categoryId: Number(form.categoryId) });
      toast.success("Product added");
      nav("/seller/products");
    } catch (err) { toast.error(err.response?.data?.Error || "Failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mn-page-pad">
      <h2>Add Product</h2>
      <form onSubmit={submit} className="mn-form-grid">
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Brand<input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></label>
        <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
        <label>Category
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {cats.map((c) => <option key={c.Id} value={c.Id}>{c.Name}</option>)}
          </select>
        </label>
        <label>Price (Rs.)<input type="number" min={0} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        <label>Discount (%)<input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></label>
        <label>Stock<input type="number" min={0} required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></label>
        <label>Weight<input type="number" min={0} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></label>
        <label className="full">Description<textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <button type="submit" className="mn-btn mn-btn-primary" disabled={busy}>{busy ? "Saving…" : "Add product"}</button>
      </form>
    </div>
  );
}