import { useEffect, useState, type ReactNode } from "react";
import { Activity, CheckCircle, Clock3, Package, RefreshCw, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Order } from "../lib/types";

interface DashboardData {
  orders: Order[];
  totalProducts: number;
  activeProducts: number;
  customers: number;
}

const initialData: DashboardData = {
  orders: [],
  totalProducts: 0,
  activeProducts: 0,
  customers: 0,
};

export function DashboardManager() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    const [ordersResult, productsResult, customersResult] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id, is_active", { count: "exact" }),
      supabase.rpc("admin_list_customers"),
    ]);

    const firstError = ordersResult.error || productsResult.error || customersResult.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const products = productsResult.data || [];
    setData({
      orders: (ordersResult.data || []) as Order[],
      totalProducts: products.length,
      activeProducts: products.filter((product) => product.is_active).length,
      customers: customersResult.data?.length || 0,
    });
    setLoading(false);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const pendingOrders = data.orders.filter((order) => ["pending", "confirmed", "processing", "ready"].includes(order.order_status));
  const completedOrders = data.orders.filter((order) => order.order_status === "completed");
  const totalRevenue = data.orders
    .filter((order) => order.order_status !== "cancelled")
    .reduce((total, order) => total + Number(order.total_amount || 0), 0);

  if (loading) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="page-head">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Monitor the store, customer activity, and incoming orders.</p>
        </div>
        <button className="admin-btn" onClick={() => void loadDashboard()}><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-stats-grid">
        <StatCard icon={<Package size={22} />} label="Total Orders" value={data.orders.length} tone="cyan" />
        <StatCard icon={<Clock3 size={22} />} label="Pending Orders" value={pendingOrders.length} tone="amber" />
        <StatCard icon={<CheckCircle size={22} />} label="Completed Orders" value={completedOrders.length} tone="green" />
        <StatCard icon={<Package size={22} />} label="Total Products" value={data.totalProducts} tone="blue" />
        <StatCard icon={<Activity size={22} />} label="Active Products" value={data.activeProducts} tone="teal" />
        <StatCard icon={<Users size={22} />} label="Customers" value={data.customers} tone="purple" />
        <StatCard icon={<Activity size={22} />} label="Order Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} tone="orange" />
      </div>

      <section className="admin-section-block">
        <div className="section-heading-row"><h3>Recent Orders</h3><span>{data.orders.length} total</span></div>
        {data.orders.length === 0 ? (
          <div className="admin-empty">No orders have been placed yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {data.orders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.order_number}</strong></td>
                    <td><div className="name-cell">{order.customer_name}</div><small>{order.customer_phone}</small></td>
                    <td>₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                    <td><span className={`status-badge status-${order.order_status}`}>{order.order_status}</span></td>
                    <td>{new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone: string }) {
  return (
    <div className="admin-stat-card">
      <div className={`stat-icon-wrap stat-tone-${tone}`}>{icon}</div>
      <div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
    </div>
  );
}
