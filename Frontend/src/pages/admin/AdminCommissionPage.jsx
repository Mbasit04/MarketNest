import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";
import { toast } from "react-toastify";

export default function AdminCommissionPage() {
  const [current, setCurrent] = useState(null);
  const [percent, setPercent] = useState(10);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    adminApi.getCommission().then((c) => {
      setCurrent(c);
      if (c) setPercent(c.Percentage);
    });
  }, []);

  async function save() {
    if (!confirm(`Set platform commission to ${percent}%?`)) return;
    await adminApi.setCommission({ percentage: Number(percent), notes });
    toast.success("Commission updated");
    const c = await adminApi.getCommission();
    setCurrent(c);
  }

  return (
    <div className="mn-page-pad">
      <h2>Platform Commission</h2>
      <div className="mn-info-card">
        <p>Current commission: <strong>{current?.Percentage ?? 10}%</strong></p>
        <p className="mn-muted">Effective from: {current ? new Date(current.EffectiveFrom).toLocaleString() : "—"}</p>
        <p className="mn-muted small">
          This percentage is read from the database at order placement.
          Changing it does not require recompiling the application.
        </p>
      </div>

      <div className="mn-form-grid">
        <label>Percentage<input type="number" min={0} max={100} step="0.1" value={percent} onChange={(e) => setPercent(e.target.value)} /></label>
        <label className="full">Notes<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <button className="mn-btn mn-btn-primary" onClick={save}>Update</button>
      </div>
    </div>
  );
}