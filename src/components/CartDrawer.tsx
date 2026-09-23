import { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, Sparkles } from "lucide-react";
import type { CartItem } from "../hooks/useCart";
import { ProductImage } from "./ProductImage";

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onClearCart?: () => void;
}

export function CartDrawer({
  open,
  items,
  total,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onClearCart,
}: CartDrawerProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleClose() {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  }

  if (!open && !closing) return null;

  const freeShippingThreshold = 500;
  const progressToFreeShipping = Math.min(100, (total / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);

  return (
    <div className={`cart-overlay ${closing ? "closing" : ""}`} onClick={handleClose}>
      <div
        className={`cart-drawer ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div className="cart-title-block">
            <h3><ShoppingBag size={20} /> Your Cart</h3>
            {items.length > 0 && (
              <span className="cart-count-pill">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
            )}
          </div>
          <div className="cart-header-actions">
            {items.length > 0 && onClearCart && (
              <button
                className="cart-clear-btn"
                onClick={onClearCart}
                title="Clear entire cart"
              >
                Clear
              </button>
            )}
            <button className="cart-close" onClick={handleClose} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="free-shipping-bar-container">
            <div className="shipping-bar-text">
              {remainingForFreeShipping === 0 ? (
                <span className="free-achieved">
                  <Sparkles size={14} /> Congratulations! You unlocked <strong>FREE Delivery</strong>
                </span>
              ) : (
                <span>
                  <Truck size={14} /> Add <strong>₹{remainingForFreeShipping}</strong> more for <strong>FREE Delivery</strong> in Virudhunagar
                </span>
              )}
            </div>
            <div className="shipping-progress-track">
              <div
                className="shipping-progress-fill"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-circle">
              <ShoppingBag size={44} />
            </div>
            <h4>Your cart is empty</h4>
            <p>Explore our exotic fish, vibrant aquatic plants, and quality aquariums to add to your collection.</p>
            <button className="btn-primary" onClick={handleClose} style={{ marginTop: 16 }}>
              Browse Collection
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <ProductImage src={item.image_url} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">
                      ₹{item.price} <span className="unit-label">{item.unit}</span>
                    </span>
                    <div className="cart-item-controls">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
                    <button
                      className="cart-remove"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-cost-summary">
                <div className="cost-row">
                  <span>Subtotal</span>
                  <span className="val">₹{total}</span>
                </div>
                <div className="cost-row">
                  <span>Estimated Delivery</span>
                  <span className="val">
                    {total >= freeShippingThreshold ? (
                      <strong style={{ color: "var(--success)" }}>FREE</strong>
                    ) : (
                      "₹40"
                    )}
                  </span>
                </div>
                <div className="cost-row total-row">
                  <span>Total</span>
                  <span className="cart-total">₹{total >= freeShippingThreshold ? total : total + 40}</span>
                </div>
              </div>

              <button className="cart-checkout" onClick={onCheckout}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <button className="cart-continue" onClick={handleClose}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
