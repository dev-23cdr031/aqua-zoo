import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck,
  Truck, Droplets, CheckCircle2, ChevronRight
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import type { useCart } from "../hooks/useCart";

interface CartPageProps {
  cart: ReturnType<typeof useCart>;
  navigate: (path: string) => void;
  notify: (msg: string) => void;
}

export function CartPage({ cart, navigate, notify }: CartPageProps) {
  const { items, count, total, updateQuantity, removeItem, clearCart } = cart;

  const freeShippingThreshold = 500;
  const isFreeShipping = total >= freeShippingThreshold;
  const shippingFee = count === 0 ? 0 : isFreeShipping ? 0 : 40;
  const finalTotal = total + shippingFee;
  const remainingForFree = freeShippingThreshold - total;

  return (
    <div className="page-cart">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={14} fishCount={2} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <ShoppingBag size={14} /> Review Your Aquatic Order
            </span>
            <h1>
              Your Shopping <span className="grad">Cart</span>
            </h1>
            <p className="page-hero-lead">
              {count > 0
                ? `You have ${count} ${count === 1 ? "item" : "items"} ready for oxygen-packed delivery in Virudhunagar.`
                : "Your cart is currently empty. Explore our livestock, plants, and rimless aquariums."}
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><Truck size={14} /> Free Delivery Over ₹500</span>
              <span className="hero-badge-chip"><ShieldCheck size={14} /> Live Arrival Guarantee</span>
              <span className="hero-badge-chip"><Droplets size={14} /> Medical Oxygen Packaging</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-compact">
        <div className="container">
          {items.length === 0 ? (
            /* Empty State */
            <div className="cart-empty-container">
              <div className="empty-cart-circle">
                <ShoppingBag size={64} color="var(--primary)" />
              </div>
              <h2>Your Aqua Zoo Cart is Empty</h2>
              <p>
                Browse our quarantined ornamental fish, lush live plants, rimless tanks, and quality fish foods
                to begin your aquatic journey.
              </p>
              <div className="empty-cart-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/products")}
                >
                  <ShoppingBag size={18} /> Browse Full Catalog
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => navigate("/products")}
                >
                  Browse Full Catalog <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Cart Items Table + Summary */
            <div className="cart-layout-grid">
              {/* Left Column: Cart Table */}
              <div className="cart-items-col">
                <div className="cart-table-header">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                  <span></span>
                </div>

                <div className="cart-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      {/* Product Media & Name */}
                      <div className="cart-item-product">
                        <img src={item.image_url} alt={item.name} className="cart-item-thumb" />
                        <div>
                          <h4 className="cart-item-name">{item.name}</h4>
                          <span className="cart-item-unit">Unit: {item.unit}</span>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="cart-item-price">
                        ₹{item.price}
                      </div>

                      {/* Quantity Selector */}
                      <div className="cart-item-qty">
                        <div className="qty-pill">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Line Subtotal */}
                      <div className="cart-item-subtotal">
                        ₹{item.price * item.quantity}
                      </div>

                      {/* Remove Button */}
                      <div className="cart-item-remove">
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            notify(`Removed ${item.name} from cart`);
                          }}
                          className="remove-btn"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-actions-bar">
                  <button
                    className="btn-ghost"
                    onClick={() => navigate("/products")}
                  >
                    ← Continue Shopping
                  </button>
                  <button
                    className="btn-danger-ghost"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to empty your cart?")) {
                        clearCart();
                        notify("Cart cleared");
                      }
                    }}
                  >
                    <Trash2 size={15} /> Clear Entire Cart
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="cart-summary-col">
                <div className="order-summary-card">
                  <h3>Order Summary</h3>

                  {/* Free Delivery Bar */}
                  <div className="free-shipping-bar-wrap">
                    {isFreeShipping ? (
                      <div className="free-shipping-success">
                        <CheckCircle2 size={16} color="var(--success)" />
                        <span>You unlocked <strong>FREE Local Delivery</strong> in Virudhunagar!</span>
                      </div>
                    ) : (
                      <div>
                        <div className="free-shipping-hint">
                          Add <strong>₹{remainingForFree}</strong> more to get <strong>FREE Local Delivery</strong>!
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min(100, (total / freeShippingThreshold) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="summary-row">
                    <span>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
                    <span>₹{total}</span>
                  </div>

                  <div className="summary-row">
                    <span>Delivery (Virudhunagar)</span>
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
                    <span>Estimated Total</span>
                    <span className="total-val">₹{finalTotal}</span>
                  </div>

                  <button
                    className="btn-primary btn-block"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout <ChevronRight size={18} />
                  </button>

                  <div className="cart-trust-badges">
                    <div className="c-badge">
                      <ShieldCheck size={18} color="var(--primary)" />
                      <span>100% Live Arrival & Health Guarantee</span>
                    </div>
                    <div className="c-badge">
                      <Truck size={18} color="var(--accent)" />
                      <span>Oxygen-Packed Same-Day Delivery in {count > 0 ? "Virudhunagar" : "Tamil Nadu"}</span>
                    </div>
                    <div className="c-badge">
                      <Droplets size={18} color="var(--primary-3)" />
                      <span>Free Water Chemistry Check with Purchase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
