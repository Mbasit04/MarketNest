import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";
import { toast } from "react-toastify";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const load = () => adminApi.products().then(setProducts);
  useEffect(() => { load(); }, []);
  async function approve(id) { await adminApi.approveProduct(id); toast.success("Approved"); load(); }
  async function reject(id) { await adminApi.rejectProduct(id); toast.success("Rejected"); load(); }
  return (
    <div className="mn-page-pad">
      <h2>Products</h2>
      <table className="mn-table">
        <thead><tr><th>Product</th><th>Shop</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.Id}>
              <td><strong>{p.Name}</strong><div className="mn-muted small">{p.Category?.Name}</div></td>
              <td>{p.Shop?.ShopName}</td>
              <td>Rs. {p.Price.toLocaleString()}</td>
              <td>{p.StockQuantity}</td>
              <td><span className="mn-status-pill">{p.ApprovalStatus}</span></td>
              <td>
                {p.ApprovalStatus === "Pending" && <>
                  <button className="mn-btn mn-btn-primary" onClick={() => approve(p.Id)}>Approve</button>
                  <button className="mn-btn" onClick={() => reject(p.Id)}>Reject</button>
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}