import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";
import { toast } from "react-toastify";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const load = () => adminApi.categories().then(setCats);
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault();
    await adminApi.addCategory(form);
    toast.success("Category added");
    setForm({ name: "", description: "" });
    load();
  }
  async function del(id) {
    if (!confirm("Delete?")) return;
    await adminApi.deleteCategory(id);
    toast.success("Deleted");
    load();
  }
  return (
    <div className="mn-page-pad">
      <h2>Categories</h2>
      <form onSubmit={add} className="mn-form-grid">
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="full">Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <button type="submit" className="mn-btn mn-btn-primary">+ Add</button>
      </form>
      <table className="mn-table">
        <thead><tr><th>Name</th><th>Slug</th><th></th></tr></thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.Id}>
              <td>{c.Name}</td>
              <td>{c.Slug}</td>
              <td><button className="mn-btn mn-btn-ghost" onClick={() => del(c.Id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}