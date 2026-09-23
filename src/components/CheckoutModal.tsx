import { useState } from "react";
import {
  X, CheckCircle2, Truck, Store, CreditCard, ShieldCheck,
  Phone, User, Mail, MapPin, FileText, ArrowRight, MessageCircle,
  Copy, Check, Sparkles
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { CartItem } from "../hooks/useCart";
import type { Order, OrderItem } from "../lib/types";
import { useAuth } from "../hooks/useAuth";

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CheckoutModal({
  open,
  items,
  total,
  onClose,
  onOrderPlaced,
}: CheckoutModalProps) {
  const { session } = useAuth();
  const [deliveryMethod, setDeliveryMethod] = useState<"home_delivery" | "store_pickup">("home_delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi_on_delivery" | "store_pickup">("cod");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open && !placedOrder) return null;

  // Free delivery for orders >= ₹500 or store pickup
  const shippingFee = deliveryMethod === "store_pickup" ? 0 : (total >= 500 ? 0 : 40);
  const finalTotal = total + shippingFee;

  function generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AZ-${dateStr}-${rand}`;
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (deliveryMethod === "home_delivery" && !address.trim()) {
      setError("Please enter your delivery address in Virudhunagar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!session) {
      setSubmitting(false);
      setError("Please sign in before placing an order.");
      return;
    }

    const orderNumber = generateOrderNumber();
    const orderItems: OrderItem[] = items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      unit: i.unit,
      image_url: i.image_url,
      quantity: i.quantity,
      subtotal: i.price * i.quantity,
    }));

    const fullAddress = deliveryMethod === "home_delivery"
      ? (landmark.trim() ? `${address.trim()}, Landmark: ${landmark.trim()}` : address.trim())
      : "Store Pickup: Sakthi's Aqua Zoo, No. 42 KVS Street, Virudhunagar";

    const newOrder: Order = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      shipping_address: fullAddress,
      city: "Virudhunagar",
      postal_code: "626001",
      order_notes: notes.trim() || null,
      items: orderItems,
      subtotal_amount: total,
      shipping_fee: shippingFee,
      total_amount: finalTotal,
      delivery_method: deliveryMethod,
      payment_method: deliveryMethod === "store_pickup" ? "store_pickup" : paymentMethod,
      payment_status: "pending",
      order_status: "pending",
      created_at: new Date().toISOString(),
    };

    // Try saving to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { error: dbError } = await supabase.from("orders").insert({
          user_id: session.user.id,
          order_number: newOrder.order_number,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          shipping_address: newOrder.shipping_address,
          city: newOrder.city,
          postal_code: newOrder.postal_code,
          order_notes: newOrder.order_notes,
          items: newOrder.items,
          subtotal_amount: newOrder.subtotal_amount,
          shipping_fee: newOrder.shipping_fee,
          total_amount: newOrder.total_amount,
          delivery_method: newOrder.delivery_method,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status,
          order_status: newOrder.order_status,
        });
        if (dbError) {
          console.warn("Supabase order insert warning:", dbError.message);
        }
      } catch (err) {
        console.warn("Supabase network error while saving order:", err);
      }
    }

    // Always store order in localStorage history for persistence
    try {
      const stored = localStorage.getItem("sakthi_aqua_orders");
      const list: Order[] = stored ? JSON.parse(stored) : [];
      list.unshift(newOrder);
      localStorage.setItem("sakthi_aqua_orders", JSON.stringify(list));
    } catch {
      /* ignore quota */
    }

    setSubmitting(false);
    setPlacedOrder(newOrder);
    onOrderPlaced(newOrder);
  }

  function handleCopyOrderNumber(orderNum: string) {
    navigator.clipboard.writeText(orderNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsAppConfirmation(order: Order) {
    const itemsSummary = order.items
      .map((item) => `• ${item.name} x${item.quantity} (₹${item.subtotal})`)
      .join("\n");
    const text = encodeURIComponent(
      `🐟 *New Order #${order.order_number}*\n\n` +
      `*Customer:* ${order.customer_name}\n` +
      `*Phone:* ${order.customer_phone}\n` +
      `*Fulfillment:* ${order.delivery_method === "store_pickup" ? "🏬 Store Pickup" : "🚚 Home Delivery"}\n` +
      `*Address:* ${order.shipping_address}\n` +
      `*Payment:* ${order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method === "upi_on_delivery" ? "UPI on Delivery" : "Pay at Store"}\n\n` +
      `*Items:*\n${itemsSummary}\n\n` +
      `*Total Amount:* ₹${order.total_amount}\n\n` +
      `Please confirm my aquatic order. Thank you!`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {placedOrder ? (
          <div className="checkout-success-view">
            <div className="success-badge-glow">
              <CheckCircle2 size={64} className="success-icon" />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-lead">
              Thank you, <strong>{placedOrder.customer_name}</strong>! Your aquatic order has been registered and is being prepared with care.
            </p>

            <div className="order-confirmation-box">
              <div className="order-box-header">
                <div>
                  <span className="box-lbl">Order Number</span>
                  <div className="order-id-chip">
                    <strong>{placedOrder.order_number}</strong>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyOrderNumber(placedOrder.order_number)}
                      title="Copy order number"
                    >
                      {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="order-status-pill">Order Received</div>
              </div>

              <div className="order-summary-items">
                {placedOrder.items.map((it) => (
                  <div key={it.id} className="summary-item-row">
                    <img src={it.image_url} alt={it.name} />
                    <div className="summary-item-text">
                      <span className="item-name">{it.name}</span>
                      <span className="item-qty-price">Qty: {it.quantity} × ₹{it.price}</span>
                    </div>
                    <span className="item-subtotal">₹{it.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="order-cost-breakdown">
                <div className="cost-line">
                  <span>Subtotal</span>
                  <span>₹{placedOrder.subtotal_amount}</span>
                </div>
                <div className="cost-line">
                  <span>Fulfillment</span>
                  <span>{placedOrder.shipping_fee === 0 ? "FREE" : `₹${placedOrder.shipping_fee}`}</span>
                </div>
                <div className="cost-line total-line">
                  <span>Total Payable</span>
                  <span className="highlight-price">₹{placedOrder.total_amount}</span>
                </div>
              </div>

              <div className="delivery-details-summary">
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{placedOrder.shipping_address}</span>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <span>{placedOrder.customer_phone}</span>
                </div>
              </div>
            </div>

            <div className="checkout-success-actions">
              <button
                className="btn-whatsapp"
                onClick={() => handleWhatsAppConfirmation(placedOrder)}
              >
                <MessageCircle size={18} /> Send Order to Store WhatsApp
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setPlacedOrder(null);
                  onClose();
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="checkout-form-container">
            <div className="checkout-header">
              <div className="checkout-title-row">
                <h3>Checkout & Delivery</h3>
                <span className="secure-tag"><ShieldCheck size={14} /> 100% Acclimatised & Safe Delivery</span>
              </div>
              <p className="checkout-sub">Fresh ornamental fish and aquatic supplies direct from our Virudhunagar tanks.</p>
            </div>

            {error && <div className="checkout-error-banner">{error}</div>}

            <form onSubmit={handleOrderSubmit} className="checkout-form">
              {/* Delivery method toggle */}
              <div className="form-section">
                <label className="section-title">1. Select Fulfillment Method</label>
                <div className="method-selector">
                  <button
                    type="button"
                    className={`method-card ${deliveryMethod === "home_delivery" ? "selected" : ""}`}
                    onClick={() => setDeliveryMethod("home_delivery")}
                  >
                    <Truck size={20} />
                    <div>
                      <div className="method-name">Local Delivery</div>
                      <div className="method-desc">Delivered safely in oxygenated bags in Virudhunagar</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`method-card ${deliveryMethod === "store_pickup" ? "selected" : ""}`}
                    onClick={() => setDeliveryMethod("store_pickup")}
                  >
                    <Store size={20} />
                    <div>
                      <div className="method-name">Store Pickup (FREE)</div>
                      <div className="method-desc">Pick up at No. 42 KVS Street, Virudhunagar</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer information */}
              <div className="form-section">
                <label className="section-title">2. Contact Information</label>
                <div className="form-row-2">
                  <label className="field-group">
                    <span className="field-label"><User size={14} /> Full Name *</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Karthik Rajan"
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span className="field-label"><Phone size={14} /> Phone / WhatsApp *</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </label>
                </div>
                <label className="field-group" style={{ marginTop: 10 }}>
                  <span className="field-label"><Mail size={14} /> Email Address (Optional)</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For order tracking updates"
                  />
                </label>
              </div>

              {/* Shipping address if home delivery */}
              {deliveryMethod === "home_delivery" && (
                <div className="form-section">
                  <label className="section-title">3. Delivery Address (Virudhunagar)</label>
                  <label className="field-group">
                    <span className="field-label"><MapPin size={14} /> Street Address & House / Flat No. *</span>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 15/4 Railway Feeder Road, Near Railway Station"
                      required
                    />
                  </label>
                  <label className="field-group" style={{ marginTop: 10 }}>
                    <span className="field-label">Landmark / Area</span>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite State Bank, Near Clock Tower"
                    />
                  </label>
                </div>
              )}

              {/* Payment method */}
              <div className="form-section">
                <label className="section-title">4. Payment Method</label>
                <div className="payment-options">
                  {deliveryMethod === "home_delivery" ? (
                    <>
                      <label className={`payment-pill ${paymentMethod === "cod" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        <CreditCard size={16} />
                        <div>
                          <strong>Cash on Delivery (COD)</strong>
                          <span>Pay when you receive your live fish & gear</span>
                        </div>
                      </label>
                      <label className={`payment-pill ${paymentMethod === "upi_on_delivery" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="upi_on_delivery"
                          checked={paymentMethod === "upi_on_delivery"}
                          onChange={() => setPaymentMethod("upi_on_delivery")}
                        />
                        <Sparkles size={16} />
                        <div>
                          <strong>UPI on Delivery</strong>
                          <span>Pay via GPay / PhonePe / Paytm scanner on arrival</span>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div className="payment-pill active">
                      <Store size={16} />
                      <div>
                        <strong>Pay at Store Counter</strong>
                        <span>Cash, UPI, or Card upon collection</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="form-section">
                <label className="field-group">
                  <span className="field-label"><FileText size={14} /> Special Instructions / Tank Compatibility Notes</span>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Need extra oxygen bag, call before arriving"
                  />
                </label>
              </div>

              {/* Summary and submit */}
              <div className="checkout-total-card">
                <div className="total-summary-lines">
                  <div className="summary-line">
                    <span>Items Total ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="summary-line">
                    <span>Fulfillment Fee</span>
                    <span>
                      {shippingFee === 0 ? (
                        <strong style={{ color: "var(--success)" }}>FREE</strong>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                  {deliveryMethod === "home_delivery" && total < 500 && (
                    <p className="free-shipping-tip">
                      Add ₹{500 - total} more to your cart for <strong>FREE Delivery</strong>!
                    </p>
                  )}
                  <div className="summary-line final-total-line">
                    <span>Amount Payable</span>
                    <span className="final-price">₹{finalTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-checkout-submit"
                  disabled={submitting || items.length === 0}
                >
                  {submitting ? (
                    "Processing Your Order..."
                  ) : (
                    <>
                      Place Order • ₹{finalTotal} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
