import { useState } from "react";
import {
  X, Plus, Minus, ShoppingCart, ArrowRight, ShieldCheck,
  Thermometer, Droplets, Compass, Award, MessageCircle, Waves, Check
} from "lucide-react";
import type { Product } from "../lib/types";
import { ProductImage } from "./ProductImage";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  function handleAdd() {
    if (!product) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuy() {
    if (!product) return;
    onBuyNow(product, quantity);
  }

  function handleWhatsAppAsk() {
    if (!product) return;
    const msg = encodeURIComponent(
      `Hello Sakthi's Aqua Zoo! I am interested in ${product.name} (₹${product.price} ${product.unit}). Can you share live photos/video or care details?`
    );
    window.open(`https://wa.me/919876543210?text=${msg}`, "_blank");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card product-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="product-detail-layout">
          {/* Left: Product Image */}
          <div className="detail-media">
            <ProductImage src={product.image_url} alt={product.name} className="detail-img" />
            {product.tag && <span className="detail-tag">{product.tag}</span>}
            <div className="media-guarantee">
              <ShieldCheck size={16} />
              <span>100% Acclimatised & Quarantined</span>
            </div>
          </div>

          {/* Right: Info & Controls */}
          <div className="detail-info">
            <div className="detail-cat-badge">{product.categories?.name || "Aquatic"}</div>
            <h2>{product.name}</h2>
            {product.scientific_name && (
              <div className="scientific-name">
                <em>{product.scientific_name}</em>
              </div>
            )}

            <div className="detail-price-row">
              <div className="price-tag">
                <span className="symbol">₹</span>
                <span className="amount">{product.price}</span>
                <span className="unit">/{product.unit}</span>
              </div>
              <span className="stock-badge">In Stock • Virudhunagar</span>
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Care Specs Table */}
            <div className="care-specs-grid">
              {product.care_level && (
                <div className="care-spec-item">
                  <Award size={16} className="spec-icon" />
                  <div>
                    <span className="spec-lbl">Care Level</span>
                    <span className="spec-val">{product.care_level}</span>
                  </div>
                </div>
              )}
              {product.water_type && (
                <div className="care-spec-item">
                  <Waves size={16} className="spec-icon" />
                  <div>
                    <span className="spec-lbl">Water Type</span>
                    <span className="spec-val">{product.water_type}</span>
                  </div>
                </div>
              )}
              {product.temp_range && (
                <div className="care-spec-item">
                  <Thermometer size={16} className="spec-icon" />
                  <div>
                    <span className="spec-lbl">Temperature</span>
                    <span className="spec-val">{product.temp_range}</span>
                  </div>
                </div>
              )}
              {product.ph_range && (
                <div className="care-spec-item">
                  <Droplets size={16} className="spec-icon" />
                  <div>
                    <span className="spec-lbl">pH Level</span>
                    <span className="spec-val">{product.ph_range}</span>
                  </div>
                </div>
              )}
              {product.min_tank_size && (
                <div className="care-spec-item">
                  <Compass size={16} className="spec-icon" />
                  <div>
                    <span className="spec-lbl">Min Tank Size</span>
                    <span className="spec-val">{product.min_tank_size}</span>
                  </div>
                </div>
              )}
              {product.temperament && (
                <div className="care-spec-item">
                  <Award size={16} className="spec-icon" />
                  <div>
                    <span className="spec-lbl">Temperament</span>
                    <span className="spec-val">{product.temperament}</span>
                  </div>
                </div>
              )}
            </div>

            {product.diet && (
              <div className="diet-box">
                <strong>Recommended Diet:</strong> {product.diet}
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions-area">
              <div className="qty-picker">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                className={`btn-add-detail ${added ? "added" : ""}`}
                onClick={handleAdd}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added ({quantity})
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart (₹{product.price * quantity})
                  </>
                )}
              </button>

              <button className="btn-buy-detail" onClick={handleBuy}>
                Buy Now <ArrowRight size={18} />
              </button>
            </div>

            <button
              className="btn-whatsapp-ask"
              onClick={handleWhatsAppAsk}
            >
              <MessageCircle size={16} /> Request Live Video / Inquire on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
