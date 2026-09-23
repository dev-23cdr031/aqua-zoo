import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Order } from "../lib/types";
import {
  RefreshCw, Search, Package, CheckCircle, Clock, Truck,
  Store, AlertCircle, Phone, MapPin, Eye, X, MessageCircle, Trash2, Pencil
} from "lucide-react";
import { ProductImage } from "../components/ProductImage";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "completed",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortNewest, setSortNewest] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", shipping_address: "", city: "", postal_code: "", order_notes: "", subtotal_amount: "", shipping_fee: "", total_amount: "" });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    let loaded: Order[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error: dbError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (dbError) throw dbError;
        loaded = (data || []) as Order[];
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not query Supabase orders.");
      }
    }

    loaded.sort((a, b) => (sortNewest ? -1 : 1) * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

    setOrders(loaded);
    setLoading(false);
  }, [sortNewest]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function showToast(msg: string, isError = false) {
    setToast(msg);
    setTimeout(() => setToast(""), isError ? 4000 : 2500);
  }

  async function handleStatusChange(order: Order, newStatus: string) {
    setUpdatingId(order.id);

    // Update in Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ order_status: newStatus, updated_at: new Date().toISOString() })
          .eq("order_number", order.order_number);
        if (error) throw error;
      } catch (e) {
        setUpdatingId(null);
        showToast(e instanceof Error ? e.message : "Could not update order status", true);
        return;
      }
    }

    // Update locally
    const updated = orders.map((o) =>
      o.order_number === order.order_number ? { ...o, order_status: newStatus as Order["order_status"] } : o
    );
    setOrders(updated);
    try {
      localStorage.setItem("sakthi_aqua_orders", JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    if (selectedOrder && selectedOrder.order_number === order.order_number) {
      setSelectedOrder({ ...selectedOrder, order_status: newStatus as Order["order_status"] });
    }

    setUpdatingId(null);
    showToast(`Order #${order.order_number} status changed to "${newStatus}"`);
  }

  async function handleDeleteOrder(order: Order) {
    if (!window.confirm(`Delete order #${order.order_number}?`)) return;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("orders").delete().eq("order_number", order.order_number);
        if (error) throw error;
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Could not delete order", true);
        return;
      }
    }

    const remaining = orders.filter((o) => o.order_number !== order.order_number);
    setOrders(remaining);
    try {
      localStorage.setItem("sakthi_aqua_orders", JSON.stringify(remaining));
    } catch {
      /* ignore */
    }

    if (selectedOrder?.order_number === order.order_number) {
      setSelectedOrder(null);
    }
    showToast(`Order #${order.order_number} deleted`);
  }

  function openEditOrder(order: Order) {
    setEditingOrder(order);
    setEditForm({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email || "",
      shipping_address: order.shipping_address,
      city: order.city,
      postal_code: order.postal_code || "",
      order_notes: order.order_notes || "",
      subtotal_amount: String(order.subtotal_amount),
      shipping_fee: String(order.shipping_fee),
      total_amount: String(order.total_amount),
    });
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingOrder) return;
    setSavingEdit(true);
    const payload = {
      customer_name: editForm.customer_name.trim(),
      customer_phone: editForm.customer_phone.trim(),
      customer_email: editForm.customer_email.trim() || null,
      shipping_address: editForm.shipping_address.trim(),
      city: editForm.city.trim(),
      postal_code: editForm.postal_code.trim() || null,
      order_notes: editForm.order_notes.trim() || null,
      subtotal_amount: Number(editForm.subtotal_amount),
      shipping_fee: Number(editForm.shipping_fee),
      total_amount: Number(editForm.total_amount),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("orders").update(payload).eq("id", editingOrder.id);
    setSavingEdit(false);
    if (error) { showToast(error.message, true); return; }
    const updated = { ...editingOrder, ...payload } as Order;
    setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    setSelectedOrder(updated);
    setEditingOrder(null);
    showToast(`Order #${updated.order_number} updated`);
  }

  function handleSendWhatsApp(order: Order) {
    const text = encodeURIComponent(
      `Hello ${order.customer_name}! Updating you on your Sakthi's Aqua Zoo order #${order.order_number}. Current status: ${order.order_status.toUpperCase()}. Thank you for choosing us!`
    );
    const cleanPhone = order.customer_phone.replace(/\D/g, "");
    window.open(`https://wa.me/91${cleanPhone.slice(-10)}?text=${text}`, "_blank");
  }

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.order_status === filter;
    const matchesSearch =
      searchTerm === "" ||
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone.includes(searchTerm) ||
      o.shipping_address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.order_status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.order_status === "pending").length,
    confirmed: orders.filter((o) => o.order_status === "confirmed").length,
    processing: orders.filter((o) => o.order_status === "processing").length,
    ready: orders.filter((o) => o.order_status === "ready").length,
    completed: orders.filter((o) => o.order_status === "completed").length,
    cancelled: orders.filter((o) => o.order_status === "cancelled").length,
  };

  return (
    <div className="orders-manager-page">
      <div className="page-head">
        <div>
          <h2>Customer Orders</h2>
          <p>Manage incoming orders, delivery status, and customer communications</p>
        </div>
        <button className="admin-btn" onClick={loadOrders}>
          <RefreshCw size={16} /> Refresh Orders
        </button>
      </div>

      {/* Metrics Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(46, 230, 200, 0.15)", color: "var(--primary)" }}>
            <Package size={22} />
          </div>
          <div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(255, 138, 61, 0.15)", color: "var(--accent)" }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-label">Pending / Confirmed</div>
            <div className="stat-value">{counts.pending + counts.confirmed}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(61, 220, 132, 0.15)", color: "var(--success)" }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{counts.completed}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(25, 167, 214, 0.15)", color: "var(--primary-2)" }}>
            <Truck size={22} />
          </div>
          <div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-filter-row">
        <div className="admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search order #, customer, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="admin-status-filters">
          {(["all", ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              className={`admin-btn admin-btn-sm ${filter === s ? "admin-btn-primary" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ")} ({counts[s]})
            </button>
          ))}
        </div>
        <select className="admin-sort-select" value={sortNewest ? "newest" : "oldest"} onChange={(event) => setSortNewest(event.target.value === "newest")}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner" />
          <p>Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <Package size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>No orders found matching criteria.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order # & Date</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.order_number}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>#{order.order_number}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="name-cell">{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      <Phone size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />
                      {order.customer_phone}
                    </div>
                    {order.customer_email && (
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{order.customer_email}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      {order.delivery_method === "store_pickup" ? (
                        <>
                          <Store size={14} color="var(--accent)" />
                          <span>Store Pickup</span>
                        </>
                      ) : (
                        <>
                          <Truck size={14} color="var(--primary)" />
                          <span>Delivery</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.shipping_address}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", marginLeft: 4 }}>
                        {order.items.slice(0, 3).map((item, idx) => (
                          <ProductImage
                            key={idx}
                            src={item.image_url}
                            alt={item.name}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              border: "2px solid #071f36",
                              marginLeft: idx > 0 ? -10 : 0,
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)} items
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>₹{order.total_amount}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {order.payment_method.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`status-badge status-${order.order_status}`}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => setSelectedOrder(order)}
                        title="View Full Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => handleSendWhatsApp(order)}
                        title="Message Customer on WhatsApp"
                      >
                        <MessageCircle size={14} color="#25D366" />
                      </button>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => handleDeleteOrder(order)}
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card order-detail-admin-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <h3>Order #{selectedOrder.order_number}</h3>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="order-admin-info-grid">
              <div className="info-block">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p><strong>Email:</strong> {selectedOrder.customer_email}</p>}
                <p><strong>Fulfillment:</strong> {selectedOrder.delivery_method === "store_pickup" ? "Store Pickup" : "Home Delivery"}</p>
                <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                {selectedOrder.order_notes && (
                  <p><strong>Customer Notes:</strong> <em>{selectedOrder.order_notes}</em></p>
                )}
              </div>

              <div className="info-block">
                <h4>Payment & Status</h4>
                <p><strong>Payment Method:</strong> {selectedOrder.payment_method.toUpperCase()}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.payment_status.toUpperCase()}</p>
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Change Status:</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusChange(selectedOrder, e.target.value)}
                    className={`status-badge status-${selectedOrder.order_status}`}
                    style={{ padding: "6px 12px", borderRadius: 8 }}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>{st.replace(/_/g, " ").toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Ordered Items</h4>
            <div className="admin-order-items-list">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="admin-order-item-row">
                  <ProductImage src={it.image_url} alt={it.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {it.quantity} × ₹{it.price} ({it.unit})
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{it.subtotal}</div>
                </div>
              ))}
            </div>

            <div className="admin-order-totals">
              <div><span>Subtotal:</span> ₹{selectedOrder.subtotal_amount}</div>
              <div><span>Delivery Fee:</span> ₹{selectedOrder.shipping_fee}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginTop: 4 }}>
                <span>Total:</span> ₹{selectedOrder.total_amount}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button
                className="admin-btn"
                onClick={() => handleSendWhatsApp(selectedOrder)}
              >
                <MessageCircle size={16} color="#25D366" /> Contact on WhatsApp
              </button>
              <button className="admin-btn" onClick={() => openEditOrder(selectedOrder)}><Pencil size={16} /> Edit</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteOrder(selectedOrder)}><Trash2 size={16} /> Delete</button>
              <button className="admin-btn admin-btn-primary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="admin-modal-overlay" onClick={() => setEditingOrder(null)}>
          <div className="admin-modal-card order-edit-card" onClick={(event) => event.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setEditingOrder(null)}><X size={18} /></button>
            <h3>Edit Order #{editingOrder.order_number}</h3>
            <form className="admin-form" onSubmit={saveEdit}>
              <div className="form-row"><label><span>Customer name</span><input required value={editForm.customer_name} onChange={(event) => setEditForm({ ...editForm, customer_name: event.target.value })} /></label><label><span>Phone</span><input required value={editForm.customer_phone} onChange={(event) => setEditForm({ ...editForm, customer_phone: event.target.value })} /></label></div>
              <label><span>Email</span><input type="email" value={editForm.customer_email} onChange={(event) => setEditForm({ ...editForm, customer_email: event.target.value })} /></label>
              <label><span>Full delivery address</span><textarea rows={3} required value={editForm.shipping_address} onChange={(event) => setEditForm({ ...editForm, shipping_address: event.target.value })} /></label>
              <div className="form-row"><label><span>City</span><input required value={editForm.city} onChange={(event) => setEditForm({ ...editForm, city: event.target.value })} /></label><label><span>Postal code</span><input value={editForm.postal_code} onChange={(event) => setEditForm({ ...editForm, postal_code: event.target.value })} /></label></div>
              <label><span>Customer notes</span><textarea rows={2} value={editForm.order_notes} onChange={(event) => setEditForm({ ...editForm, order_notes: event.target.value })} /></label>
              <div className="form-row"><label><span>Subtotal</span><input type="number" min="0" step="0.01" value={editForm.subtotal_amount} onChange={(event) => setEditForm({ ...editForm, subtotal_amount: event.target.value })} /></label><label><span>Shipping fee</span><input type="number" min="0" step="0.01" value={editForm.shipping_fee} onChange={(event) => setEditForm({ ...editForm, shipping_fee: event.target.value })} /></label></div>
              <label><span>Total amount</span><input type="number" min="0" step="0.01" value={editForm.total_amount} onChange={(event) => setEditForm({ ...editForm, total_amount: event.target.value })} /></label>
              <div className="admin-form-actions"><button type="button" className="admin-btn" onClick={() => setEditingOrder(null)}>Cancel</button><button className="admin-btn admin-btn-primary" disabled={savingEdit}>{savingEdit ? "Saving..." : "Save Order"}</button></div>
            </form>
          </div>
        </div>
      )}

      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
