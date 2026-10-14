import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { customerApi } from "../../api/client";
import { toast } from "react-toastify";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], byShop: [], cartTotal: 0 });
  const nav = useNavigate();

  const load = () => customerApi.getCart().then(setCart);
  useEffect(() => { load(); }, []);

  async function update(item, qty) {
    await customerApi.updateItem(item.Id, { productId: item.ProductId, quantity: qty });
    load();
  }
  async function remove(item) {
    await customerApi.removeItem(item.Id);
    load();
  }

  if (!cart.items?.length) {
    return (
      <div className="mn-page-pad">
        <h2>Your cart is empty</h2>
        <Link to="/search" className="mn-btn mn-btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mn-page-pad">
      <h2>Cart</h2>
      {cart.byShop.map((g) => (
        <section key={g.ShopId} className="mn-cart-shop">
          <h4>Sold by: {g.ShopName}</h4>
          <table className="mn-cart-table">
            <tbody>
              {g.Items.map((it) => (
                <tr key={it.Id}>
                  <td>
                    <Link to={`/product/${it.ProductId}`}>{it.ProductName}</Link>
                  </td>
                  <td>Rs. {Math.round(it.UnitPrice).toLocaleString()}</td>
                  <td>
                    <div className="mn-qty">
                      <button onClick={() => update(it, Math.max(0, it.Quantity - 1))}>−</button>
                      <span>{it.Quantity}</span>
                      <button onClick={() => update(it, it.Quantity + 1)}>+</button>
                    </div>
                  </td>
                  <td>Rs. {Math.round(it.LineTotal).toLocaleString()}</td>
                  <td><button className="mn-btn mn-btn-ghost" onClick={() => remove(it)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mn-cart-shop-sub">Subtotal: Rs. {Math.round(g.Subtotal).toLocaleString()}</div>
        </section>
      ))}

      <div className="mn-cart-total">
        <strong>Total: Rs. {Math.round(cart.cartTotal).toLocaleString()}</strong>
        <button className="mn-btn mn-btn-primary" onClick={() => nav("/checkout")}>Proceed to checkout</button>
      </div>
    </div>
  );
}