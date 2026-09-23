import { useEffect, useState } from "react";
import { Eye, Pencil, RefreshCw, Search, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Order } from "../lib/types";

interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
  order_count: number;
  total_spend: number;
}

export function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", role: "user" as Customer["role"] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    const [customersResult, ordersResult] = await Promise.all([
      supabase.rpc("admin_list_customers"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (customersResult.error || ordersResult.error) {
      setError((customersResult.error || ordersResult.error)?.message || "Could not load customers.");
    } else {
      setCustomers((customersResult.data || []) as Customer[]);
      setOrders((ordersResult.data || []) as Order[]);
    }
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  function openEdit(customer: Customer) {
    setEditing(customer);
    setForm({ full_name: customer.full_name || "", phone: customer.phone || "", role: customer.role });
  }

  async function saveCustomer(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name.trim() || null, phone: form.phone.trim() || null, role: form.role })
      .eq("id", editing.id);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setEditing(null);
    setToast("Customer profile updated");
    window.setTimeout(() => setToast(""), 2500);
    void loadData();
  }

  const filtered = customers.filter((customer) => {
    const query = search.trim().toLowerCase();
    return !query || [customer.full_name, customer.email, customer.phone, customer.role].some((value) => value?.toLowerCase().includes(query));
  });
  const customerOrders = selected ? orders.filter((order) => order.user_id === selected.id) : [];

  if (loading) return <div className="admin-loading"><div className="spinner" /><p>Loading customers...</p></div>;

  return (
    <div className="customers-manager-page">
      <div className="page-head">
        <div><h2>Customers</h2><p>View customer profiles and their order history. Passwords and auth secrets are never exposed.</p></div>
        <button className="admin-btn" onClick={() => void loadData()}><RefreshCw size={16} /> Refresh</button>
      </div>
      {error && <p className="admin-form-error">{error}</p>}
      <div className="admin-filter-row">
        <div className="admin-search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, or role..." />{search && <button className="search-clear" onClick={() => setSearch("")}><X size={14} /></button>}</div>
        <span className="admin-list-count">{filtered.length} of {customers.length} customers</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Customer</th><th>Phone</th><th>Role</th><th>Joined</th><th>Orders</th><th>Total Spend</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td><div className="name-cell">{customer.full_name || "Unnamed customer"}</div><small>{customer.email}</small></td>
                <td>{customer.phone || "-"}</td>
                <td><span className={`role-badge role-${customer.role}`}>{customer.role}</span></td>
                <td>{new Date(customer.created_at).toLocaleDateString("en-IN")}</td>
                <td>{customer.order_count}</td>
                <td>₹{Number(customer.total_spend || 0).toLocaleString("en-IN")}</td>
                <td><div className="admin-action-row"><button className="admin-btn admin-btn-sm" title="View order history" onClick={() => setSelected(customer)}><Eye size={14} /></button><button className="admin-btn admin-btn-sm" title="Edit profile" onClick={() => openEdit(customer)}><Pencil size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <div className="admin-modal-overlay" onClick={() => setSelected(null)}><div className="admin-modal-card" onClick={(event) => event.stopPropagation()}><button className="admin-modal-close" onClick={() => setSelected(null)}><X size={18} /></button><h3>{selected.full_name || selected.email}</h3><p className="modal-subtitle">{selected.email} · {selected.phone || "No phone"}</p><h4>Order History</h4>{customerOrders.length === 0 ? <div className="admin-empty">No orders linked to this account.</div> : <div className="customer-order-history">{customerOrders.map((order) => <div key={order.id} className="customer-order-row"><strong>#{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString("en-IN")}</span><span className={`status-badge status-${order.order_status}`}>{order.order_status}</span><strong>₹{order.total_amount}</strong></div>)}</div>}</div></div>}

      {editing && <div className="admin-modal-overlay" onClick={() => setEditing(null)}><div className="admin-modal-card" onClick={(event) => event.stopPropagation()}><button className="admin-modal-close" onClick={() => setEditing(null)}><X size={18} /></button><h3>Edit Customer Profile</h3><form className="admin-form" onSubmit={saveCustomer}><label><span>Email (read-only)</span><input value={editing.email} readOnly /></label><label><span>Name</span><input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label><label><span>Phone</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label><span>Role</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Customer["role"] })}><option value="user">User</option><option value="admin">Admin</option></select></label><div className="admin-form-actions"><button type="button" className="admin-btn" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button></div></form></div></div>}
      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
