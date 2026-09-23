import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Enquiry } from "../lib/types";
import { RefreshCw } from "lucide-react";

const STATUSES = ["new", "contacted", "closed"] as const;
type Status = (typeof STATUSES)[number];

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*, products(*)")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setEnquiries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function showToast(msg: string, isError = false) {
    setToast(msg);
    setTimeout(() => setToast(""), isError ? 4000 : 2500);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) { showToast("Failed to update status", true); return; }
    showToast(`Status changed to "${status}"`);
    loadData();
  }

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  const counts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    closed: enquiries.filter((e) => e.status === "closed").length,
  };

  if (loading) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading enquiries...</p></div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Enquiries</h2>
          <p>{enquiries.length} total enquiries</p>
        </div>
        <button className="admin-btn" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p className="admin-form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            className={`admin-btn admin-btn-sm ${filter === s ? "admin-btn-primary" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">No enquiries {filter !== "all" ? `with status "${filter}"` : "yet"}.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Product</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="name-cell">{e.customer_name}</td>
                  <td>
                    <div>{e.customer_phone}</div>
                    {e.customer_email && <div style={{ color: "var(--muted)", fontSize: 12 }}>{e.customer_email}</div>}
                  </td>
                  <td>{e.products?.name || "—"}</td>
                  <td style={{ maxWidth: 200, color: "var(--muted)" }}>{e.message || "—"}</td>
                  <td style={{ whiteSpace: "nowrap", color: "var(--muted)", fontSize: 13 }}>
                    {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <select
                      value={e.status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value)}
                      disabled={updatingId === e.id}
                      className={`status-badge status-${e.status}`}
                      style={{ cursor: "pointer", border: "none", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
