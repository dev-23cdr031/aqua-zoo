import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Product, Category } from "../lib/types";
import { Plus, Pencil, Trash2, Power, ImagePlus, UploadCloud, Link2 } from "lucide-react";
import { ProductImage } from "../components/ProductImage";

interface ProductFormData {
  name: string;
  category_id: string;
  price: string;
  unit: string;
  description: string;
  tag: string;
  image_url: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm: ProductFormData = {
  name: "", category_id: "", price: "", unit: "", description: "",
  tag: "", image_url: "", is_active: true, sort_order: "0",
};

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_EDGE = 1600; // px – big enough to stay razor sharp on cards
const IMAGE_BUCKET_SETUP_SQL = `insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "public_read_product_images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admin_upload_product_images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "admin_update_product_images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');
create policy "admin_delete_product_images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');`;

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*, categories(*)").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    if (prodRes.error) setError(prodRes.error.message);
    else setProducts(prodRes.data || []);
    if (catRes.error) setError(catRes.error.message);
    else setCategories(catRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function showToast(msg: string, isError = false) {
    setToast(msg);
    setTimeout(() => setToast(""), isError ? 4000 : 2500);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id || "" });
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      category_id: p.category_id,
      price: String(p.price),
      unit: p.unit,
      description: p.description,
      tag: p.tag || "",
      image_url: p.image_url,
      is_active: p.is_active,
      sort_order: String(p.sort_order),
    });
    setFormError(null);
    setShowForm(true);
  }

  /** Turn messy links into a directly-displayable https image URL. */
  function normalizeImageUrl(raw: string): string {
    let url = raw.trim();
    if (!url) return url;
    // Google Drive file link -> direct fetch image
    const drive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (drive) return `https://drive.google.com/uc?export=view&id=${drive[1]}`;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    return url;
  }

  /** Resize down (never up) so uploads stay sharp but load fast. */
  function resizeImage(file: File, maxEdge = MAX_IMAGE_EDGE): Promise<Blob | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve(null);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => resolve(null);
        img.onload = () => {
          const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          const isPng = file.type === "image/png";
          canvas.toBlob(
            (blob) => resolve(blob),
            isPng ? "image/png" : "image/jpeg",
            isPng ? undefined : 0.92
          );
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setFormError("That file is not an image. Please choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image is too large (max 10 MB). Please choose a smaller photo.");
      return;
    }
    setFormError(null);
    setUploading(true);
    try {
      const resized = await resizeImage(file);
      if (!resized) {
        setFormError("Could not read that image file. Please try another one.");
        return;
      }
      const ext = resized.type === "image/png" ? "png" : "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, resized, {
          contentType: resized.type,
          cacheControl: "31536000",
          upsert: false,
        });
      if (error) {
        setFormError(
          `Image upload failed: ${error.message}\n\n` +
            `The storage bucket "${IMAGE_BUCKET}" does not exist in Supabase yet. ` +
            `Open Supabase Dashboard → SQL Editor and run this:\n\n${IMAGE_BUCKET_SETUP_SQL}`
        );
        return;
      }
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      showToast("Image uploaded — ready to save");
    } catch (err) {
      setFormError(`Image upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setUploading(false);
    }
  }

  function handleFilePick(file: File | undefined | null) {
    if (file) uploadImageFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) {
      setFormError("Please wait — the image is still uploading.");
      return;
    }
    const imageUrl = normalizeImageUrl(form.image_url);
    if (!form.name.trim() || !form.category_id || !form.unit.trim() || !form.description.trim() || !imageUrl) {
      setFormError("Name, category, unit, description, and a product image are required. Upload a photo or paste an image URL.");
      return;
    }
    const priceVal = parseFloat(form.price);
    if (isNaN(priceVal) || priceVal < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }
    if (!imageUrl.startsWith("https://")) {
      setFormError("Image URL must start with https:// (or upload an image instead).");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      category_id: form.category_id,
      price: priceVal,
      unit: form.unit.trim(),
      description: form.description.trim(),
      tag: form.tag.trim() || null,
      image_url: imageUrl,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    };

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    showToast(editing ? "Product updated" : "Product added");
    setShowForm(false);
    loadData();
  }

  async function toggleActive(p: Product) {
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) { showToast("Failed to update status", true); return; }
    showToast(p.is_active ? "Product deactivated" : "Product activated");
    loadData();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
    if (error) { showToast("Failed to delete product", true); return; }
    showToast("Product deleted");
    setDeleteTarget(null);
    loadData();
  }

  if (loading) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading products...</p></div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Products</h2>
          <p>{products.length} products · {products.filter(p => p.is_active).length} active</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && <p className="admin-form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {products.length === 0 ? (
        <div className="admin-empty">No products yet. Click "Add Product" to create one.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Tag</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><ProductImage src={p.image_url} alt={p.name} className="prod-thumb" /></td>
                  <td className="name-cell">{p.name}</td>
                  <td>{p.categories?.name || "—"}</td>
                  <td>₹{p.price} <span style={{ color: "var(--muted)", fontSize: 12 }}>{p.unit}</span></td>
                  <td>{p.tag || "—"}</td>
                  <td>{p.sort_order}</td>
                  <td>
                    {p.is_active
                      ? <span className="active-badge">Active</span>
                      : <span className="inactive-badge">Inactive</span>}
                  </td>
                  <td>
                    <div className="admin-action-row">
                      <button className="admin-btn admin-btn-sm" onClick={() => openEdit(p)}><Pencil size={14} /> Edit</button>
                      <button className="admin-btn admin-btn-sm" onClick={() => toggleActive(p)}><Power size={14} /> {p.is_active ? "Hide" : "Show"}</button>
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => setDeleteTarget(p)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <h3>{editing ? "Edit Product" : "Add Product"}</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Name *</span>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <div className="form-row">
                <label>
                  <span>Category *</span>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Price (₹) *</span>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Unit *</span>
                  <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="per fish, per pair..." required />
                </label>
                <label>
                  <span>Tag (optional)</span>
                  <input type="text" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Bestseller, New..." />
                </label>
              </div>
              <label>
                <span>Description *</span>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </label>
              <div className="admin-form-block">
                <span className="admin-form-block-title">Product Photo *</span>
                {/* Drag & drop / click to upload */}
                <div
                  className={`image-upload-zone ${dragOver ? "drag" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFilePick(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={(e) => { handleFilePick(e.target.files?.[0]); e.target.value = ""; }}
                  />
                  {uploading ? (
                    <>
                      <span className="upload-spinner" />
                      <span>Uploading &amp; sharpening your photo…</span>
                    </>
                  ) : form.image_url ? (
                    <>
                      <ProductImage src={form.image_url} alt="Product image preview" className="image-upload-preview" />
                      <span className="image-upload-hint">
                        <UploadCloud size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                        Click or drop another photo to replace it
                      </span>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={30} />
                      <span>Click to choose a photo <br />or drag &amp; drop it here</span>
                      <span className="image-upload-hint">JPG · PNG · WebP — auto-sharpened to 1600px and saved to Supabase Storage</span>
                    </>
                  )}
                </div>

                {/* Alternative: paste an image URL */}
                <label style={{ marginTop: 12 }}>
                  <span><Link2 size={13} style={{ verticalAlign: -2, marginRight: 5 }} />…or paste an Image URL (https://)</span>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    onBlur={(e) => {
                      const fixed = normalizeImageUrl(e.target.value);
                      if (fixed !== e.target.value) setForm({ ...form, image_url: fixed });
                    }}
                    placeholder="https://example.com/fish.jpg or Google Drive link"
                  />
                </label>
                <p className="admin-field-hint">
                  Need a link? Photos from <strong>Google Drive / Pexels / your website</strong> work best.
                  Links from <strong>Facebook, Instagram, WhatsApp or Google Photos</strong> (share pages) usually do not — upload the photo instead.
                </p>
              </div>
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

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal-card confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete "{deleteTarget.name}"? Existing enquiries referencing this product will keep their data but the product link will be removed. This cannot be undone.</p>
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
