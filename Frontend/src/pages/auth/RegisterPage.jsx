import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });

  async function submit(e) {
    e.preventDefault();
    try {
      const u = await register(form);
      toast.success("Welcome, " + u.FullName);
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.Error || "Registration failed");
    }
  }

  return (
    <div className="mn-auth-page">
      <div className="mn-auth-card">
        <h2>Create your account</h2>
        <form onSubmit={submit}>
          <label>Full name
            <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </label>
          <label>Email
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>Password (min 6 chars)
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button type="submit" className="mn-btn mn-btn-primary mn-btn-block">Create account</button>
        </form>
        <p className="mn-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="mn-switch">Want to sell? <Link to="/seller/apply">Apply as a seller</Link></p>
      </div>
    </div>
  );
}