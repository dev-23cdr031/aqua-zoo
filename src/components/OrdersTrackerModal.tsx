import { useEffect, useState } from "react";
import { X, Package, Clock, MapPin, CheckCircle, Truck, Store, ExternalLink } from "lucide-react";
import type { Order } from "../lib/types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { getOfflineOrders, syncOfflineOrders } from "../lib/orderSync";

interface OrdersTrackerModalProps {
  open: boolean;
  onClose: () => void;
}

export function OrdersTrackerModal({ open, onClose }: OrdersTrackerModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    async function loadOrders() {
      if (!open) return;
      if (session) await syncOfflineOrders(session.user.id);
      let remoteOrders: Order[] = [];
      if (session) {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        remoteOrders = (data || []) as Order[];
      }
      try {
        const stored = localStorage.getItem("sakthi_aqua_orders");
        const allLocalOrders: Order[] = stored ? JSON.parse(stored) : [];
        const localOrders = session
          ? allLocalOrders.filter((order) => order.user_id === session.user.id)
          : allLocalOrders;
        const queued = session ? getOfflineOrders().filter((order) => order.user_id === session.user.id) : [];
        const merged = [...remoteOrders, ...localOrders, ...queued];
        const unique = Array.from(new Map(merged.map((order) => [order.order_number, order])).values());
        unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(unique);
      } catch {
        setOrders([]);
      }
    }
    void loadOrders();
  }, [open, session]);

  if (!open) return null;

  function getStatusBadge(status: string) {
    switch (status) {
      case "completed":
        return <span className="order-badge badge-success"><CheckCircle size={12} /> Delivered</span>;
      case "ready":
        return <span className="order-badge badge-primary"><Truck size={12} /> Ready</span>;
      case "confirmed":
        return <span className="order-badge badge-info">Confirmed</span>;
      case "processing":
        return <span className="order-badge badge-warning">Preparing</span>;
      case "pending":
        return <span className="order-badge badge-new"><Clock size={12} /> Pending</span>;
      default:
        return <span className="order-badge badge-new"><Clock size={12} /> Order Received</span>;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card orders-tracker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title-with-icon">
            <Package size={22} className="title-icon" />
            <div>
              <h3>My Orders History</h3>
              <p className="subtitle">View and track your previous aquatic orders</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <Package size={52} />
            <h4>No Orders Found</h4>
            <p>You haven't placed any orders yet. Browse our fish and gear collection to get started!</p>
          </div>
        ) : (
          <div className="orders-history-list">
            {orders.map((ord) => (
              <div key={ord.id || ord.order_number} className="order-history-card">
                <div className="order-card-top">
                  <div>
                    <span className="order-code">#{ord.order_number}</span>
                    <span className="order-date">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(ord.order_status)}</div>
                </div>

                <div className="order-items-compact">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="item-pill">
                      <img src={it.image_url} alt={it.name} />
                      <span>{it.name} ×{it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-bottom">
                  <div className="order-meta-info">
                    <span>
                      {ord.delivery_method === "store_pickup" ? (
                        <><Store size={14} /> Store Pickup</>
                      ) : (
                        <><Truck size={14} /> Home Delivery</>
                      )}
                    </span>
                    <span className="dot">•</span>
                    <span>{ord.payment_method === "cod" ? "COD" : ord.payment_method === "upi_on_delivery" ? "UPI" : "Counter"}</span>
                  </div>
                  <div className="order-total-amount">
                    <span>Total:</span> <strong>₹{ord.total_amount}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
