import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { GalleryItem } from "../lib/types";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import { ProductImage } from "../components/ProductImage";

interface GalleryFormData {
  image_url: string;
  caption: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm: GalleryFormData = { image_url: "", caption: "", sort_order: "0", is_active: true };

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GalleryFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("gallery").select("*").order("sort_order");
    if (error) setError(error.message);
    else setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function showToast(msg: string, isError = false) {
    setToast(msg);
    setTimeout(() => setToast(""), isError ? 4000 : 2500);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(g: GalleryItem) {
    setEditing(g);
    setForm({ image_url: g.image_url, caption: g.caption, sort_order: String(g.sort_order), is_active: g.is_active });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url.trim() || !form.caption.trim()) {
      setFormError("Image URL and caption are required.");
      return;
    }
    if (!form.image_url.startsWith("https://")) {
      setFormError("Image URL must start with https://");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      image_url: form.image_url.trim(),
      caption: form.caption.trim(),
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };

    const { error } = editing
      ? await supabase.from("gallery").update(payload).eq("id", editing.id)
      : await supabase.from("gallery").insert(payload);

    setSaving(false);

    if (error) { setFormError(error.message); return; }

    showToast(editing ? "Gallery item updated" : "Gallery item added");
    setShowForm(false);
    loadData();
  }

  async function toggleActive(g: GalleryItem) {
    const { error } = await supabase.from("gallery").update({ is_active: !g.is_active }).eq("id", g.id);
    if (error) { showToast("Failed to update status", true); return; }
    showToast(g.is_active ? "Item hidden" : "Item shown");
    loadData();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("gallery").delete().eq("id", deleteTarget.id);
    if (error) { showToast("Failed to delete", true); return; }
    showToast("Gallery item deleted");
    setDeleteTarget(null);
    loadData();
  }

  if (loading) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading gallery...</p></div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Gallery</h2>
          <p>{items.length} images · {items.filter(g => g.is_active).length} active</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Image
        </button>
      </div>

      {error && <p className="admin-form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {items.length === 0 ? (
        <div className="admin-empty">No gallery images yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Caption</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((g) => (
                <tr key={g.id}>
                  <td><ProductImage src={g.image_url} alt={g.caption} className="prod-thumb" /></td>
                  <td className="name-cell">{g.caption}</td>
                  <td>{g.sort_order}</td>
                  <td>
                    {g.is_active
                      ? <span className="active-badge">Active</span>
                      : <span className="inactive-badge">Inactive</span>}
                  </td>
                  <td>
                    <div className="admin-action-row">
                      <button className="admin-btn admin-btn-sm" onClick={() => openEdit(g)}><Pencil size={14} /> Edit</button>
                      <button className="admin-btn admin-btn-sm" onClick={() => toggleActive(g)}><Power size={14} /> {g.is_active ? "Hide" : "Show"}</button>
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => setDeleteTarget(g)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <h3>{editing ? "Edit Gallery Image" : "Add Gallery Image"}</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Image URL * (must start with https://)</span>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." required />
              </label>
              <label>
                <span>Caption *</span>
                <input type="text" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} required />
              </label>
              <div className="form-row">
                <label>
                  <span>Sort Order</span>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </label>
                <label className="checkbox-row" style={{ marginTop: 24 }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  <span>Active (visible on storefront)</span>
                </label>
              </div>
              {formError && <p className="admin-form-error">{formError}</p>}
              <div className="admin-form-actions">
                <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal-card confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Gallery Image?</h3>
            <p>Are you sure you want to delete "{deleteTarget.caption}"? This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="admin-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
