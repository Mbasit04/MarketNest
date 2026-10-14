import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { catalogApi, customerApi } from "../api/client";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    catalogApi.categories().then(setCats).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.Role === "Customer") {
      customerApi.getCart()
        .then((c) => {
          setCartCount(c.items?.length || 0);
          setCartTotal(c.cartTotal || 0);
        })
        .catch(() => { setCartCount(0); setCartTotal(0); });
    } else { setCartCount(0); setCartTotal(0); }
  }, [user]);

  function search(e) {
    e.preventDefault();
    nav(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="mn-shell">
      {/* Top utility bar */}
      <div className="mn-topbar">
        <div className="mn-topbar-inner">
          <div className="mn-topbar-links">
            <Link to="/">Help</Link>
            <Link to="/">Support</Link>
            <Link to="/">Contact</Link>
          </div>
          <div className="mn-topbar-right">
            <span>Call Us: (+0123) 456 7890</span>
            <button className="mn-topbar-dd">USD ▾</button>
            <button className="mn-topbar-dd">English ▾</button>
            {user ? (
              <button className="mn-topbar-dd" onClick={() => nav(`/${user.Role.toLowerCase()}`)}>
                My Dashboard ▾
              </button>
            ) : (
              <button className="mn-topbar-dd" onClick={() => nav("/login")}>
                Sign in / Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="mn-header-main">
        <div className="mn-header-main-inner">
          <Link to="/" className="mn-brand">
            <span className="mn-brand-mark">🛍</span>
            <span className="mn-brand-name">MarketNest</span>
          </Link>

          <form className="mn-search" onSubmit={search}>
            <select defaultValue="">
              <option value="">All Categories</option>
              {cats.map((c) => <option key={c.Id} value={c.Id}>{c.Name}</option>)}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands, categories…" />
            <button type="submit" aria-label="Search">🔍</button>
          </form>

          <div className="mn-header-actions">
            {user?.Role === "Customer" && (
              <Link to="/cart" className="mn-header-icon" title="Cart">
                <span>🛒</span>
                <span className="mn-header-total">Rs. {Math.round(cartTotal).toLocaleString()}</span>
                {cartCount > 0 && <span className="mn-badge-count">{cartCount}</span>}
              </Link>
            )}
            <Link to={user?.Role === "Customer" ? "/orders" : "/login"} className="mn-header-icon">
              <span>♥</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Orange nav bar */}
      <nav className="mn-navbar">
        <div className="mn-navbar-inner">
          <div className="mn-navbar-categories">
            <span>☰</span><span>All Categories</span>
          </div>
          <div className="mn-navbar-menu">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/search">Shop</NavLink>
            {!user && <NavLink to="/seller/apply">Become a Seller</NavLink>}
            {user?.Role === "Customer" && <NavLink to="/orders">My Orders</NavLink>}
            {user && <NavLink to={`/${user.Role.toLowerCase()}`}>Dashboard</NavLink>}
            <NavLink to="/">Contact</NavLink>
            {user && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mn-navbar-user">
                  <span>👤</span><span className="mn-user-name">{user.FullName}</span>
                </span>
                <button className="mn-logout" onClick={logout}>Logout</button>
              </div>
            )}
          </div>
          <div className="mn-navbar-phone">
            <span>📱</span><span>+0123 456 7890</span>
          </div>
        </div>
      </nav>

      <main className="mn-main">{children}</main>

      {/* Footer (Amazon-style) */}
      <footer className="mn-footer">
        <button className="mn-back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
        </button>

        <div className="mn-footer-inner">
          <div className="mn-footer-cols mn-footer-cols-4">
            <div className="mn-footer-col">
              <h5>Get to Know Us</h5>
              <Link to="/">Careers</Link>
              <Link to="/">Blog</Link>
              <Link to="/">About MarketNest</Link>
              <Link to="/">Investor Relations</Link>
              <Link to="/">MarketNest Devices</Link>
              <Link to="/">MarketNest Science</Link>
            </div>
            <div className="mn-footer-col">
              <h5>Make Money with Us</h5>
              <Link to="/seller/apply">Sell products on MarketNest</Link>
              <Link to="/seller/apply">Sell on MarketNest Business</Link>
              <Link to="/seller/apply">Become an Affiliate</Link>
              <Link to="/">Advertise Your Products</Link>
              <Link to="/">Self-Publish with Us</Link>
              <Link to="/">Host a MarketNest Hub</Link>
            </div>
            <div className="mn-footer-col">
              <h5>MarketNest Payment Products</h5>
              <Link to="/">MarketNest Business Card</Link>
              <Link to="/">Shop with Points</Link>
              <Link to="/">Reload Your Balance</Link>
              <Link to="/">Currency Converter</Link>
            </div>
            <div className="mn-footer-col">
              <h5>Let Us Help You</h5>
              <Link to="/">Your Account</Link>
              <Link to="/orders">Your Orders</Link>
              <Link to="/">Shipping Rates &amp; Policies</Link>
              <Link to="/orders">Returns &amp; Replacements</Link>
              <Link to="/admin">Manage Your Content</Link>
              <Link to="/">Help</Link>
            </div>
          </div>

          <div className="mn-footer-divider">
            <div className="mn-footer-brand">
              <span className="mn-footer-brand-mark">M</span>
              <span className="mn-footer-brand-name">marketnest</span>
            </div>
          </div>

          <div className="mn-footer-locale">
            <div className="mn-locale-pill">🌐 &nbsp;English</div>
            <div className="mn-locale-pill">$&nbsp;USD – U.S. Dollar</div>
            <div className="mn-locale-pill">🇵🇰 &nbsp;Pakistan</div>
          </div>

          <div className="mn-footer-bottom">
            © 2026 MarketNest — Multi-vendor marketplace · Verified shops · Fair commission
          </div>
        </div>
      </footer>
    </div>
  );
}