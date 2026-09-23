import { supabase, isSupabaseConfigured } from "./supabase";
import type { Order } from "./types";

const OFFLINE_ORDERS_KEY = "sakthi_aqua_offline_orders";

export function getOfflineOrders(): Order[] {
  try {
    const stored = localStorage.getItem(OFFLINE_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveOfflineOrders(orders: Order[]) {
  try {
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Keep the order in memory if browser storage is unavailable.
  }
}

export function queueOfflineOrder(order: Order) {
  const current = getOfflineOrders().filter((item) => item.order_number !== order.order_number);
  saveOfflineOrders([order, ...current]);
}

export function orderPayload(order: Order) {
  return {
    user_id: order.user_id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email,
    shipping_address: order.shipping_address,
    city: order.city,
    postal_code: order.postal_code,
    order_notes: order.order_notes,
    items: order.items,
    subtotal_amount: order.subtotal_amount,
    shipping_fee: order.shipping_fee,
    total_amount: order.total_amount,
    delivery_method: order.delivery_method,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    order_status: order.order_status,
  };
}

export async function syncOfflineOrders(userId: string) {
  if (!isSupabaseConfigured || !navigator.onLine) return;

  const queued = getOfflineOrders().filter((order) => order.user_id === userId);
  if (queued.length === 0) return;

  const remaining: Order[] = [...getOfflineOrders()];
  for (const order of queued) {
    const { error } = await supabase.from("orders").insert(orderPayload(order));
    if (!error || error.code === "23505") {
      const index = remaining.findIndex((item) => item.order_number === order.order_number);
      if (index >= 0) remaining.splice(index, 1);
    }
  }
  saveOfflineOrders(remaining);
}