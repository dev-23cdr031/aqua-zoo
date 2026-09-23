import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { StoreSettings } from "../lib/types";
import { Save } from "lucide-react";

interface SettingsForm {
  store_name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  stat_species: string;
  stat_plants: string;
  stat_years: string;
}

export function StoreSettingsManager() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    if (error) setError(error.message);
    else if (data) {
      setSettings(data);
      setForm({
        store_name: data.store_name,
        location: data.location,
        address: data.address,
        phone: data.phone,
        email: data.email || "",
        hours: data.hours,
        stat_species: String(data.stat_species),
        stat_plants: String(data.stat_plants),
        stat_years: String(data.stat_years),
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function showToast(msg: string, isError = false) {
    setToast(msg);
    setTimeout(() => setToast(""), isError ? 4000 : 2500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.store_name.trim() || !form.location.trim() || !form.address.trim() || !form.phone.trim() || !form.hours.trim()) {
      setError("Store name, location, address, phone, and hours are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      store_name: form.store_name.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      hours: form.hours.trim(),
      stat_species: parseInt(form.stat_species) || 0,
      stat_plants: parseInt(form.stat_plants) || 0,
      stat_years: parseInt(form.stat_years) || 0,
    };

    const { error } = await supabase.from("store_settings").update(payload).eq("id", 1);
    setSaving(false);

    if (error) { setError(error.message); return; }

    showToast("Store settings saved");
    loadData();
  }

  if (loading || !form) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading settings...</p></div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Store Settings</h2>
          <p>Edit your store information and hero statistics</p>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>
        {error && <p className="admin-form-error" style={{ marginBottom: 16 }}>{error}</p>}
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>Store Name *</span>
            <input type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} required />
          </label>
          <div className="form-row">
            <label>
              <span>Location *</span>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </label>
            <label>
              <span>Phone *</span>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </label>
          </div>
          <label>
            <span>Address *</span>
            <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </label>
          <div className="form-row">
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optional" />
            </label>
            <label>
              <span>Opening Hours *</span>
              <input type="text" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required />
            </label>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Hero Statistics</div>
          <div className="form-row">
            <label>
              <span>Fish Species Count</span>
              <input type="number" min="0" value={form.stat_species} onChange={(e) => setForm({ ...form, stat_species: e.target.value })} />
            </label>
            <label>
              <span>Plant Varieties Count</span>
              <input type="number" min="0" value={form.stat_plants} onChange={(e) => setForm({ ...form, stat_plants: e.target.value })} />
            </label>
          </div>
          <label>
            <span>Years of Service</span>
            <input type="number" min="0" value={form.stat_years} onChange={(e) => setForm({ ...form, stat_years: e.target.value })} />
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>

      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
