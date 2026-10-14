import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { catalogApi } from "../../api/client";
import ProductCard from "../../components/ProductCard";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const categoryId = params.get("categoryId") ? parseInt(params.get("categoryId")) : null;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [localQ, setLocalQ] = useState(q);

  useEffect(() => {
    catalogApi.categories().then(setCats);
  }, []);

  useEffect(() => {
    catalogApi.products({
      q_search: q || undefined,
      categoryId: categoryId || undefined,
      pageSize: 48,
    }).then((d) => { setItems(d.items || []); setTotal(d.total || 0); });
  }, [q, categoryId]);

  function setCategory(id) {
    const next = new URLSearchParams(params);
    if (id) next.set("categoryId", id); else next.delete("categoryId");
    setParams(next);
  }

  function submitSearch(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (localQ) next.set("q", localQ); else next.delete("q");
    setParams(next);
  }

  return (
    <div className="mn-search-page">
      <aside className="mn-search-filters">
        <h4>Filters</h4>
        <form onSubmit={submitSearch}>
          <input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Search…" />
        </form>
        <div className="mn-filter-list">
          <button className={!categoryId ? "active" : ""} onClick={() => setCategory(null)}>All categories</button>
          {cats.map((c) => (
            <button key={c.Id} className={categoryId === c.Id ? "active" : ""} onClick={() => setCategory(c.Id)}>
              {c.Name}
            </button>
          ))}
        </div>
      </aside>
      <div className="mn-search-results">
        <h3>{total} products {q && <>for "{q}"</>}</h3>
        <div className="mn-product-grid">
          {items.map((p) => <ProductCard key={p.Id} product={p} />)}
        </div>
        {!items.length && <p className="mn-empty">No products found.</p>}
      </div>
    </div>
  );
}