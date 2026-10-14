import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(e) {
    e.preventDefault();
    try {
      const u = await login(form.email, form.password);
      toast.success("Welcome back, " + u.FullName);
      nav(`/${u.Role.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.Error || "Login failed");
    }
  }

  function fill(role) {
    if (role === "admin") setForm({ email: "admin@marketnest.com", password: "Admin@123" });
    if (role === "seller") setForm({ email: "ali@shop.com", password: "Ali@12345" });
    if (role === "customer") setForm({ email: "sara@buyer.com", password: "Sara@123" });
  }

  return (
    <div className="mn-auth-page">
      <div className="mn-auth-card">
        <h2>Sign in to MarketNest</h2>
        <form onSubmit={submit}>
          <label>Email
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>Password
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button type="submit" className="mn-btn mn-btn-primary mn-btn-block">Sign in</button>
        </form>
        <div className="mn-divider">Or quick login</div>
        <div className="mn-quick">
          <button onClick={() => fill("admin")}>Admin</button>
          <button onClick={() => fill("seller")}>Seller</button>
          <button onClick={() => fill("customer")}>Customer</button>
        </div>
        <p className="mn-switch">No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}