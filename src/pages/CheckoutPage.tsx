import { useState } from "react";
import {
  CheckCircle2, Truck, Store, ShieldCheck,
  Phone, User, Mail, MapPin, FileText, ArrowRight, MessageCircle,
  Copy, Check, ShoppingBag, ChevronRight, Banknote, Smartphone
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import { ProductImage } from "../components/ProductImage";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { useCart } from "../hooks/useCart";
import type { Order, OrderItem } from "../lib/types";
import { useAuth } from "../hooks/useAuth";
import { orderPayload, queueOfflineOrder, syncOfflineOrders } from "../lib/orderSync";

interface CheckoutPageProps {
  cart: ReturnType<typeof useCart>;
  onOrderPlaced: (order: Order) => void;
  onOpenOrderTracker: () => void;
  navigate: (path: string) => void;
  notify: (msg: string) => void;
}

export function CheckoutPage({
  cart,
  onOrderPlaced,
  onOpenOrderTracker,
  navigate,
  notify,
}: CheckoutPageProps) {
  const { items, total, count, clearCart } = cart;
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

  // Shipping calculation
  const shippingFee = deliveryMethod === "store_pickup" ? 0 : (total >= 500 ? 0 : 40);
  const finalTotal = total + shippingFee;

  // Checkout progress state
  const detailsDone = name.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;
  const addressDone = deliveryMethod === "store_pickup" || address.trim().length > 0;
  const progressPct = !detailsDone ? 30 : !addressDone ? 65 : 100;
  const progressText = !detailsDone
    ? "Almost there — start with your contact details"
    : !addressDone
      ? "One step left — enter your delivery address"
      : "Everything looks perfect — ready to confirm!";

  function generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AZ-${dateStr}-${rand}`;
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      setError("Please sign in before placing an order.");
      navigate("/login");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (deliveryMethod === "home_delivery" && !address.trim()) {
      setError("Please enter your delivery street address in Virudhunagar.");
      return;
    }

    setSubmitting(true);
    setError(null);

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
      user_id: session.user.id,
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
      sync_status: "pending",
    };

    let synced = false;
    if (isSupabaseConfigured && navigator.onLine) {
      try {
        const { error: dbError } = await supabase.from("orders").insert(orderPayload(newOrder));
        synced = !dbError;
      } catch (err) {
        console.warn("Supabase network error while saving order:", err);
      }
    }

    if (!synced) queueOfflineOrder(newOrder);
    else await syncOfflineOrders(session.user.id);

    // Persist in localStorage for user's order tracker
    try {
      const stored = localStorage.getItem("sakthi_aqua_orders");
      const list: Order[] = stored ? JSON.parse(stored) : [];
      list.unshift({ ...newOrder, sync_status: synced ? "synced" : "pending" });
      localStorage.setItem("sakthi_aqua_orders", JSON.stringify(list));
    } catch {
      /* ignore storage quota */
    }

    setSubmitting(false);
    setPlacedOrder(newOrder);
    clearCart();
    onOrderPlaced(newOrder);
    notify(
      synced
        ? `Order #${orderNumber} successfully placed!`
        : `Order #${orderNumber} saved offline and will sync when connected.`
    );
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
      `Hello Sakthi's Aqua Zoo! I have just placed Order #${order.order_number}.\n\n` +
      `Customer: ${order.customer_name} (${order.customer_phone})\n` +
      `Delivery Method: ${order.delivery_method === "home_delivery" ? "Home Delivery (Virudhunagar)" : "Store Pickup"}\n` +
      `Address: ${order.shipping_address}\n` +
      `Payment: ${order.payment_method.toUpperCase()}\n` +
      `Total: ₹${order.total_amount}\n\n` +
      `Items:\n${itemsSummary}\n\n` +
      `Please confirm dispatch time!`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
  }

  // If order was placed, show confirmation receipt
  if (placedOrder) {
    return (
      <div className="page-checkout">
        <section className="page-hero">
          <Bubbles count={16} fishCount={3} />
          <div className="container">
            <div className="page-hero-content">
              <span className="eyebrow">
                <CheckCircle2 size={16} color="var(--success)" /> Order Confirmed
              </span>
              <h1>
                Thank You for Your <span className="grad">Order!</span>
              </h1>
              <p className="page-hero-lead">
                Your order has been recorded. Our team is preparing your oxygenated package at Sakthi's Aqua Zoo.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding pt-compact">
          <div className="container">
            <div className="order-confirmed-card">
              <div className="confirmed-icon">
                <CheckCircle2 size={64} color="var(--success)" />
              </div>

              <div className="order-num-pill-wrap">
                <span className="order-label">Your Order Number</span>
                <div className="order-num-pill">
                  <strong>{placedOrder.order_number}</strong>
                  <button
                    onClick={() => handleCopyOrderNumber(placedOrder.order_number)}
                    className="copy-btn"
                    title="Copy Order ID"
                  >
                    {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="order-receipt-details">
                <div className="receipt-row">
                  <span>Customer Name:</span>
                  <strong>{placedOrder.customer_name}</strong>
                </div>
                <div className="receipt-row">
                  <span>Contact Phone:</span>
                  <strong>{placedOrder.customer_phone}</strong>
                </div>
                <div className="receipt-row">
                  <span>Delivery Method:</span>
                  <strong>{placedOrder.delivery_method === "home_delivery" ? "Home Delivery (Virudhunagar)" : "Store Pickup"}</strong>
                </div>
                <div className="receipt-row">
                  <span>Address:</span>
                  <span>{placedOrder.shipping_address}</span>
                </div>
                <div className="receipt-row">
                  <span>Payment Method:</span>
                  <strong>{placedOrder.payment_method.toUpperCase()}</strong>
                </div>
                <div className="receipt-row total-receipt-row">
                  <span>Total Amount Due:</span>
                  <span className="receipt-total">₹{placedOrder.total_amount}</span>
                </div>
              </div>

              <div className="order-items-preview">
                <h4>Items in Order:</h4>
                <div className="items-list-compact">
                  {placedOrder.items.map((i) => (
                    <div key={i.id} className="item-compact-row">
                      <span>{i.name} x {i.quantity}</span>
                      <span>₹{i.subtotal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirmed-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleWhatsAppConfirmation(placedOrder)}
                >
                  <MessageCircle size={18} /> Confirm on WhatsApp
                </button>
                <button
                  className="btn-ghost"
                  onClick={onOpenOrderTracker}
                >
                  Track Order Status
                </button>
                <button
                  className="btn-subtle"
                  onClick={() => navigate("/")}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If cart is empty and no placed order
  if (items.length === 0) {
    return (
      <div className="page-checkout">
        <section className="page-hero">
          <Bubbles count={12} fishCount={2} />
          <div className="container">
            <div className="page-hero-content">
              <span className="eyebrow"><ShoppingBag size={14} /> Checkout</span>
              <h1>Checkout</h1>
              <p className="page-hero-lead">Your cart is empty. Please add items before checking out.</p>
              <div style={{ marginTop: 24 }}>
                <button className="btn-primary" onClick={() => navigate("/products")}>
                  Browse Products <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-checkout">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={14} fishCount={2} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <ShieldCheck size={14} /> Safe & Verified Checkout
            </span>
            <h1>
              Complete Your <span className="grad">Aquatic Order</span>
            </h1>
            <p className="page-hero-lead">
              Enter your delivery details below. We pack live fish in medical oxygen and deliver fresh to your door.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><ShieldCheck size={14} /> 100% Secure Checkout</span>
              <span className="hero-badge-chip"><Truck size={14} /> Doorstep Delivery & Store Pickup</span>
              <span className="hero-badge-chip"><Store size={14} /> Cash & UPI on Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Checkout Form & Order Summary ===== */}
      <section className="section-padding pt-compact">
        <div className="container">
          <form onSubmit={handleOrderSubmit} className="checkout-layout-grid">
            {/* Left: Customer Form Details */}
            <div className="checkout-form-col">
              {error && (
                <div className="checkout-error-banner">
                  {error}
                </div>
              )}

              {/* Checkout progress */}
              <div className="checkout-progress-card">
                <div className="checkout-progress-head">
                  <span><span className="cp-pulse" /> Checkout progress</span>
                  <strong>{progressText}</strong>
                </div>
                <div className="checkout-progress-track">
                  <div className="checkout-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="checkout-progress-labels">
                  <span className={progressPct >= 30 ? "on" : ""}>1 · Delivery</span>
                  <span className={progressPct >= 65 ? "on" : ""}>2 · Details</span>
                  <span className={progressPct >= 100 ? "on" : ""}>3 · Payment</span>
                </div>
              </div>

              {/* Delivery Method Selector */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-chip">1</span>
                  <div>
                    <h3>Select Delivery Method</h3>
                    <p>Choose how you'd like to receive your aquatic order</p>
                  </div>
                </div>
                <div className="delivery-method-toggle">
                  <div
                    className={`method-option ${deliveryMethod === "home_delivery" ? "active" : ""}`}
                    onClick={() => setDeliveryMethod("home_delivery")}
                  >
                    <span className="method-ic"><Truck size={24} /></span>
                    <div>
                      <strong>Home Delivery (Virudhunagar)</strong>
                      <p>Packed with pure medical oxygen in insulated containers.</p>
                      <span className="fee-note">
                        {total >= 500 ? "FREE Delivery" : "₹40 delivery fee for orders under ₹500"}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`method-option ${deliveryMethod === "store_pickup" ? "active" : ""}`}
                    onClick={() => setDeliveryMethod("store_pickup")}
                  >
                    <span className="method-ic"><Store size={24} /></span>
                    <div>
                      <strong>In-Store Pickup (Free)</strong>
                      <p>Collect at Sakthi's Aqua Zoo, No. 42 KVS Street, Virudhunagar.</p>
                      <span className="fee-note">Ready within 2 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-chip">2</span>
                  <div>
                    <h3>Customer Contact Details</h3>
                    <p>We'll confirm every order on your mobile number</p>
                  </div>
                </div>
                <div className="form-row-2">
                  <label>
                    <span>Full Name *</span>
                    <div className="input-with-ic">
                      <User size={16} className="field-ic" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Karthik Rajan"
                      />
                    </div>
                  </label>

                  <label>
                    <span>Phone / WhatsApp *</span>
                    <div className="input-with-ic">
                      <Phone size={16} className="field-ic" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </label>
                </div>

                <label>
                  <span>Email Address (Optional)</span>
                  <div className="input-with-ic">
                    <Mail size={16} className="field-ic" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="For digital order invoice copy"
                    />
                  </div>
                </label>
              </div>

              {/* Delivery Address (only if home delivery) */}
              {deliveryMethod === "home_delivery" && (
                <div className="checkout-section-card">
                  <div className="checkout-section-head">
                    <span className="checkout-step-chip">3</span>
                    <div>
                      <h3>Delivery Address (Virudhunagar)</h3>
                      <p>Same-day doorstep delivery inside the city · Pincode 626001</p>
                    </div>
                  </div>
                  <label>
                    <span>Street Address / Door No. *</span>
                    <div className="input-with-ic">
                      <MapPin size={16} className="field-ic" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Door No, Street Name, Residential Area"
                      />
                    </div>
                  </label>

                  <div className="form-row-2">
                    <label>
                      <span>Nearby Landmark</span>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near Old Bus Stand / KVS School"
                      />
                    </label>

                    <label>
                      <span>City & Pincode</span>
                      <input
                        type="text"
                        disabled
                        value="Virudhunagar, 626001"
                        className="disabled-field"
                      />
                    </label>
                  </div>

                  <label>
                    <span>Delivery Instructions / Notes</span>
                    <div className="input-with-ic">
                      <FileText size={16} className="field-ic" />
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Deliver between 4-6 PM, call before arriving"
                      />
                    </div>
                  </label>
                </div>
              )}

              {/* Payment Method */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-chip">{deliveryMethod === "home_delivery" ? "4" : "3"}</span>
                  <div>
                    <h3>Payment Method</h3>
                    <p>Pay at your doorstep or at our Virudhunagar store</p>
                  </div>
                </div>
                <div className="payment-options-grid">
                  {deliveryMethod === "home_delivery" ? (
                    <>
                      <label className={`pay-choice ${paymentMethod === "cod" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        <span className="pay-choice-ic"><Banknote size={22} /></span>
                        <div>
                          <strong>Cash on Delivery (COD)</strong>
                          <p>Pay cash to the delivery agent upon receiving your order.</p>
                        </div>
                      </label>

                      <label className={`pay-choice ${paymentMethod === "upi_on_delivery" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "upi_on_delivery"}
                          onChange={() => setPaymentMethod("upi_on_delivery")}
                        />
                        <span className="pay-choice-ic"><Smartphone size={22} /></span>
                        <div>
                          <strong>UPI on Delivery (GPay / PhonePe)</strong>
                          <p>Scan the delivery agent's QR code upon arrival.</p>
                        </div>
                      </label>
                    </>
                  ) : (
                    <label className="pay-choice active">
                      <input type="radio" checked readOnly />
                      <span className="pay-choice-ic"><Store size={22} /></span>
                      <div>
                        <strong>Pay at Store Counter</strong>
                        <p>Pay by Cash, UPI, or Card when you pick up your order.</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="checkout-summary-col">
              <div className="order-summary-card">
                <div className="summary-head">
                  <span className="summary-head-ic"><ShoppingBag size={18} /></span>
                  <div>
                    <h3>Order Review</h3>
                    <p>{count} {count === 1 ? "item" : "items"} ready to go</p>
                  </div>
                </div>

                <div className="checkout-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="checkout-item-compact">
                      <ProductImage src={item.image_url} alt={item.name} />
                      <div className="cic-info">
                        <span className="cic-name">{item.name}</span>
                        <span className="cic-meta">
                          {item.quantity} × ₹{item.price} ({item.unit})
                        </span>
                      </div>
                      <span className="cic-total">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider" />

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong style={{ color: "var(--success)" }}>FREE</strong>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span className="total-val">₹{finalTotal}</span>
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-block"
                  disabled={submitting}
                >
                  {submitting ? "Placing Order..." : `Place Order (₹${finalTotal})`}
                </button>

                <div className="checkout-security-notice">
                  <ShieldCheck size={18} color="var(--primary)" />
                  <span>Your order includes 100% Live Arrival Guarantee and pure oxygen packaging.</span>
                </div>

                <div className="summary-trust-chips">
                  <span><ShieldCheck size={13} /> Live Arrival Guarantee</span>
                  <span><Truck size={13} /> Pure oxygen packaging</span>
                  <span><Store size={13} /> Pickup ready in 2 hrs</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
