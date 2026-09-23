import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Category } from "../lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface CategoryFormData {
  name: string;
  slug: string;
  sort_order: string;
}

const emptyForm: CategoryFormData = { name: "", slug: "", sort_order: "0" };

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteProductCount, setDeleteProductCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) setError(error.message);
    else setCategories(data || []);
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

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, sort_order: String(c.sort_order) });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      setFormError("Name and slug are required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug),
      sort_order: parseInt(form.sort_order) || 0,
    };

    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);

    setSaving(false);

    if (error) {
      setFormError(error.code === "23505" ? "A category with this slug already exists." : error.message);
      return;
    }

    showToast(editing ? "Category updated" : "Category added");
    setShowForm(false);
    loadData();
  }

  async function checkDelete(c: Category) {
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", c.id);
    setDeleteProductCount(count || 0);
    setDeleteTarget(c);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteProductCount > 0) {
      showToast(`Cannot delete: ${deleteProductCount} products use this category. Reassign them first.`, true);
      setDeleteTarget(null);
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
    if (error) { showToast("Failed to delete category", true); return; }
    showToast("Category deleted");
    setDeleteTarget(null);
    loadData();
  }

  if (loading) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading categories...</p></div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Categories</h2>
          <p>{categories.length} categories</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && <p className="admin-form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {categories.length === 0 ? (
        <div className="admin-empty">No categories yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="name-cell">{c.name}</td>
                  <td style={{ color: "var(--muted)" }}>{c.slug}</td>
                  <td>{c.sort_order}</td>
                  <td>
                    <div className="admin-action-row">
                      <button className="admin-btn admin-btn-sm" onClick={() => openEdit(c)}><Pencil size={14} /> Edit</button>
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => checkDelete(c)}><Trash2 size={14} /></button>
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
            <h3>{editing ? "Edit Category" : "Add Category"}</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Name *</span>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} required />
              </label>
              <label>
                <span>Slug * (URL identifier)</span>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </label>
              <label>
                <span>Sort Order</span>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </label>
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
            <h3>Delete Category?</h3>
            {deleteProductCount > 0 ? (
              <p>Cannot delete "{deleteTarget.name}" because {deleteProductCount} product(s) are assigned to it. Please reassign those products to another category first.</p>
            ) : (
              <p>Are you sure you want to delete "{deleteTarget.name}"? This cannot be undone.</p>
            )}
            <div className="confirm-actions">
              <button className="admin-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              {deleteProductCount === 0 && (
                <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>Delete</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
