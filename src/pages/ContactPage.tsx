import { useState } from "react";
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle,
  HelpCircle, ChevronRight, Navigation, Sparkles, Droplets, ShieldCheck
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import type { StoreSettings } from "../lib/types";
import { allFAQs } from "../data";
import { getSupabaseErrorMessage, supabase, isSupabaseConfigured, supabaseConfigError } from "../lib/supabase";

interface ContactPageProps {
  settings: StoreSettings | null;
  storeStatus: { isOpen: boolean; text: string };
  notify: (msg: string) => void;
}

export function ContactPage({ settings, storeStatus, notify }: ContactPageProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Fish Stock Inquiry");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const storeName = settings?.store_name ?? "Sakthi's Aqua Zoo";
  const loc = settings?.location ?? "Virudhunagar";
  const address = settings?.address ?? "No. 42, KVS Street, Near Old Bus Stand, Virudhunagar, Tamil Nadu 626001";
  const phoneNum = settings?.phone ?? "+91 98765 43210";
  const email = settings?.email ?? "hello@sakthisaquazoo.in";
  const hours = settings?.hours ?? "Mon–Sat: 9:30 AM – 8:30 PM · Sun: 10:00 AM – 6:00 PM";

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSubmitting(true);

    if (!isSupabaseConfigured) {
      setSubmitting(false);
      notify(supabaseConfigError || "Supabase is not configured.");
      return;
    }

    try {
      const { error } = await supabase.from("enquiries").insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        message: `[${subject}] ${msg.trim() || "General store inquiry"}`,
      });
      if (error) {
        setSubmitting(false);
        notify(getSupabaseErrorMessage(error));
        return;
      }
    } catch (error) {
      setSubmitting(false);
      notify(getSupabaseErrorMessage(error));
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    notify("Thank you! Your message has been sent to our store team.");
    setTimeout(() => {
      setName("");
      setPhone("");
      setMsg("");
      setSuccess(false);
    }, 5000);
  }

  return (
    <div className="page-contact">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={16} fishCount={2} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <MapPin size={14} /> Located Near Old Bus Stand, {loc}
            </span>
            <h1>
              Visit & Contact <span className="grad">{storeName}</span>
            </h1>
            <p className="page-hero-lead">
              Drop into our living showroom to view exotic display tanks, pick up quarantined fish and plants,
              or speak with our aquarists. We are open 7 days a week.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><MapPin size={14} /> No. 42 KVS Street</span>
              <span className="hero-badge-chip"><Clock size={14} /> Open 7 Days a Week</span>
              <span className="hero-badge-chip"><Droplets size={14} /> Free Water Testing in Store</span>
              <span className="hero-badge-chip"><MessageCircle size={14} /> Instant WhatsApp Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Contact Info & Interactive Form ===== */}
      <section className="section-padding pt-compact">
        <div className="container">
          <div className="visit-grid">
            {/* Store Information Card */}
            <div className="visit-card">
              <div className="visit-card-header">
                <h3>Store Information</h3>
                <span className={`live-status-badge ${storeStatus.isOpen ? "open" : "closed"}`}>
                  <span className="pulse-dot" /> {storeStatus.text}
                </span>
              </div>

              <div className="info-row">
                <MapPin className="ic" />
                <div>
                  <div className="lbl">Store Address</div>
                  <div className="val">{address}</div>
                  <span className="sub-note">2 minutes walk from Old Bus Stand, opposite KVS School</span>
                </div>
              </div>

              <div className="info-row">
                <Phone className="ic" />
                <div>
                  <div className="lbl">Phone & WhatsApp Direct</div>
                  <div className="val">
                    <a href={`tel:${phoneNum}`} style={{ color: "var(--primary)" }}>
                      {phoneNum}
                    </a>
                  </div>
                  <span className="sub-note">Call or WhatsApp for immediate stock availability</span>
                </div>
              </div>

              <div className="info-row">
                <Mail className="ic" />
                <div>
                  <div className="lbl">Email Inquiries</div>
                  <div className="val">
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </div>
              </div>

              <div className="info-row">
                <Clock className="ic" />
                <div>
                  <div className="lbl">Store Timings</div>
                  <div className="val">{hours}</div>
                  <span className="sub-note">Sundays open from 10:00 AM to 6:00 PM</span>
                </div>
              </div>

              <div className="info-row">
                <Droplets className="ic" />
                <div>
                  <div className="lbl">Complimentary In-Store Services</div>
                  <div className="val">
                    Free liquid parameter water testing • Snail-free plant inspection • Fish acclimation guidance
                  </div>
                </div>
              </div>

              <div className="visit-actions">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${address}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <Navigation size={16} /> Get Driving Directions
                </a>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    window.open(
                      "https://wa.me/919876543210?text=Hello Sakthi's Aqua Zoo! I am planning to visit your store today.",
                      "_blank"
                    );
                  }}
                >
                  <MessageCircle size={16} /> Chat on WhatsApp
                </button>
              </div>
            </div>

            {/* Interactive Message / Query Form */}
            <div className="contact-form-card">
              <h3>Send an Inquiry / Message</h3>
              <p className="contact-sub">
                Have a question about fish compatibility, tank pricing, or plant fertilizers? Send us a message!
              </p>

              {success ? (
                <div className="contact-success-box">
                  <CheckCircle2 size={48} color="var(--success)" />
                  <h4>Message Sent Successfully!</h4>
                  <p>Our store team will contact you on WhatsApp shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-inline-form">
                  <div className="form-row-2">
                    <label>
                      <span>Your Name *</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Karthik"
                        required
                      />
                    </label>
                    <label>
                      <span>Phone / WhatsApp *</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </label>
                  </div>

                  <label>
                    <span>Inquiry Topic</span>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option value="Fish Stock Inquiry">Fish Stock Availability (Bichir, Oscar, Marine)</option>
                      <option value="Aquatic Plants">Live Plants & Fertilizers</option>
                      <option value="Tanks & Filters">Rimless Tanks & Canister Filters</option>
                      <option value="Aquarium Setup Quote">New Aquarium Custom Setup Quote</option>
                      <option value="Free Water Testing">Free Water Testing Assistance</option>
                      <option value="Other">General Question / Other</option>
                    </select>
                  </label>

                  <label>
                    <span>Your Message / Desired Species</span>
                    <textarea
                      rows={4}
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      placeholder="e.g. Do you have Albino Bichirs in stock? Can you quote for a 3ft tank?"
                    />
                  </label>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send size={16} /> Submit Message
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Map Embed Preview */}
              <div className="map-preview-embed">
                <iframe
                  title="Sakthi's Aqua Zoo Virudhunagar Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${loc},Tamil+Nadu`
                  )}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Visitor FAQ Accordion ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Store FAQ</span>
            <h2>Frequently Asked Store Visit Questions</h2>
            <p>Helpful tips before you visit Sakthi's Aqua Zoo in Virudhunagar.</p>
          </div>

          <div className="faq-container">
            {allFAQs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.question}
                  className={`faq-item ${isOpen ? "open" : ""}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question">
                    <span>
                      <HelpCircle size={18} className="faq-ic" /> {faq.question}
                    </span>
                    <ChevronRight size={18} className="faq-arrow" />
                  </div>
                  {isOpen && <div className="faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Direct WhatsApp Action Strip ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="cta-banner">
            <h2>Need Instant Directions or Live Stock Photos?</h2>
            <p>
              Message our staff directly on WhatsApp. We can send current photos of fish in the display tanks
              and guide you right to our store doorstep.
            </p>
            <div className="cta-btn-group">
              <button
                className="btn-primary"
                onClick={() => {
                  window.open("https://wa.me/919876543210?text=Hello! I want to visit Sakthi's Aqua Zoo today. Can you share current stock photos?", "_blank");
                }}
              >
                <MessageCircle size={18} /> WhatsApp Our Store Team
              </button>
              <a
                href={`tel:${phoneNum}`}
                className="btn-ghost"
              >
                <Phone size={18} /> Call {phoneNum}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
