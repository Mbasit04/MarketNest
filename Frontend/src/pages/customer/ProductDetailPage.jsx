import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { catalogApi, customerApi } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => { catalogApi.product(id).then(setProduct); }, [id]);
  if (!product) return <div className="mn-page-pad">Loading…</div>;

  const price = product.Price * (1 - (product.Discount || 0) / 100);
  const primary = product.Images?.find((i) => i.IsPrimary) || product.Images?.[0];

  async function add() {
    if (!user) { nav("/login"); return; }
    try {
      await customerApi.addToCart({ productId: product.Id, quantity: qty });
      toast.success("Added to cart");
    } catch (e) { toast.error("Failed to add"); }
  }

  return (
    <div className="mn-page-pad mn-product-detail">
      <div className="mn-pd-images">
        {primary ? <img src={primary.FilePath} alt={product.Name} /> : <div className="mn-product-placeholder big">{product.Name[0]}</div>}
      </div>
      <div className="mn-pd-info">
        <h2>{product.Name}</h2>
        <p className="mn-muted">{product.Brand} · Sold by <strong>{product.Shop?.ShopName}</strong> ({product.Shop?.City})</p>
        <div className="mn-pd-price">
          <span className="mn-price-new big">Rs. {Math.round(price).toLocaleString()}</span>
          {product.Discount > 0 && <span className="mn-price-old big">Rs. {product.Price.toLocaleString()}</span>}
          {product.Discount > 0 && <span className="mn-discount-tag big">-{product.Discount}%</span>}
        </div>
        <p>{product.Description}</p>
        <ul className="mn-pd-meta">
          <li>SKU: {product.SKU}</li>
          <li>Category: {product.Category?.Name}</li>
          <li>Stock: {product.StockQuantity > 0 ? `${product.StockQuantity} available` : "Out of stock"}</li>
        </ul>
        <div className="mn-pd-actions">
          <div className="mn-qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button className="mn-btn mn-btn-primary" disabled={product.StockQuantity === 0} onClick={add}>Add to cart</button>
        </div>

        <section className="mn-reviews">
          <h4>Reviews</h4>
          {product.Reviews?.length ? product.Reviews.map((r) => (
            <div key={r.Id} className="mn-review">
              <div className="mn-review-head">
                <strong>{r.Customer?.FullName || "Customer"}</strong>
                <span className="mn-stars">{"★".repeat(r.Rating)}</span>
              </div>
              <div>{r.Title}</div>
              <p>{r.Comment}</p>
            </div>
          )) : <p className="mn-muted">No reviews yet.</p>}
        </section>
      </div>
    </div>
  );
}