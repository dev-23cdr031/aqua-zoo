import { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import {
  getSupabaseErrorMessage,
  isSupabaseConfigured,
  supabase,
  supabaseConfigError,
} from "../lib/supabase";
import type { Product } from "../lib/types";

interface EnquiryModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function EnquiryModal({ product, onClose, onSuccess }: EnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setSubmitting(false);
      setError(supabaseConfigError);
      return;
    }

    try {
      const { error: insertError } = await supabase.from("enquiries").insert({
        product_id: product.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        message: message.trim() || null,
      });

      setSubmitting(false);

      if (insertError) {
        setError(getSupabaseErrorMessage(insertError));
        return;
      }

      onSuccess(`Order placed for ${product.name}! We'll contact you soon.`);
      setDone(true);
      window.setTimeout(onClose, 2200);
    } catch (error) {
      setSubmitting(false);
      setError(getSupabaseErrorMessage(error));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {done ? (
          <div className="modal-success">
            <div className="modal-success-icon">
              <CheckCircle2 size={56} />
            </div>
            <h3>Order Received!</h3>
            <p>
              Your order for <strong>{product.name}</strong> (₹{product.price} {product.unit}) has been placed.
              We'll contact you on {phone || "your number"} shortly.
            </p>
            <button className="modal-submit" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <img src={product.image_url} alt={product.name} className="modal-product-img" />
              <div>
                <h3>{product.name}</h3>
                <span className="modal-price">₹{product.price} {product.unit}</span>
              </div>
            </div>
            <p className="modal-subtitle">Place your order — fill in your details and we'll reach out to confirm.</p>
            <form className="modal-form" onSubmit={handleSubmit}>
              <label>
                <span>Name *</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </label>
              <label>
                <span>Phone / WhatsApp *</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 ..."
                  required
                />
              </label>
              <label>
                <span>Email (optional)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                <span>Message (optional)</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any questions about this fish or product?"
                  rows={3}
                />
              </label>
              {error && <p className="modal-error">{error}</p>}
              <button type="submit" className="modal-submit" disabled={submitting}>
                <Send size={16} /> {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
