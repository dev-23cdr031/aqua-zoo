import { useState } from "react";
import {
  Wrench, CheckCircle2, ShieldCheck, Waves, Calendar, Send,
  Phone, Sparkles, MessageCircle, Clock, Droplets, ArrowRight
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import type { StoreSettings } from "../lib/types";
import { servicePackages } from "../data";
import { getSupabaseErrorMessage, supabase, isSupabaseConfigured, supabaseConfigError } from "../lib/supabase";

interface ServicesPageProps {
  settings: StoreSettings | null;
  notify: (msg: string) => void;
  navigate: (path: string) => void;
}

export function ServicesPage({ settings, notify, navigate }: ServicesPageProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("Custom Aquarium Setup");
  const [tankSize, setTankSize] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSubmitting(true);

    const messageContent = `Service Request: ${serviceType} | Tank Size: ${tankSize || "Not specified"} | Preferred Date: ${date || "Flexible"} | Notes: ${notes || "None"}`;

    if (!isSupabaseConfigured) {
      setSubmitting(false);
      notify(supabaseConfigError || "Supabase is not configured.");
      return;
    }

    try {
      const { error } = await supabase.from("enquiries").insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        message: messageContent,
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
    setSubmitted(true);
    notify("Service request submitted! Our team will call you to confirm your booking.");
    setTimeout(() => {
      setName("");
      setPhone("");
      setTankSize("");
      setDate("");
      setNotes("");
      setSubmitted(false);
    }, 5000);
  }

  const storePhone = settings?.phone ?? "+91 98765 43210";

  return (
    <div className="page-services">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={16} fishCount={3} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <Wrench size={14} /> Certified Aquarists & Maintenance AMC
            </span>
            <h1>
              Professional Aquarium <span className="grad">Services</span>
            </h1>
            <p className="page-hero-lead">
              From bespoke living-room rimless displays and commercial lobby centerpieces to bi-weekly maintenance
              and free water chemistry evaluations across Virudhunagar district.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><Sparkles size={14} /> Turnkey Custom Setup</span>
              <span className="hero-badge-chip"><Calendar size={14} /> Bi-Weekly Maintenance AMC</span>
              <span className="hero-badge-chip"><Droplets size={14} /> Free Water Parameter Testing</span>
              <span className="hero-badge-chip"><ShieldCheck size={14} /> Leak-Proof Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6 Key Service Offerings ===== */}
      <section className="section-padding pt-compact">
        <div className="container">
          <div className="section-head">
            <span className="kicker">What We Do</span>
            <h2>Complete Aquatic Solutions</h2>
            <p>Every service executed with scientific precision and deep respect for living animals.</p>
          </div>

          <div className="services-detail-grid">
            <div className="service-detail-card">
              <div className="sd-icon"><Sparkles size={28} color="var(--primary)" /></div>
              <h3>1. Turnkey Custom Aquarium Setup</h3>
              <p>
                We design, plumb, and install custom low-iron glass aquariums from 2 feet to 8 feet centerpieces.
                Includes custom aluminum/iron stands, multi-stage sump or canister plumbing, automated lighting,
                and biological cycling so your tank is 100% fish-ready.
              </p>
              <ul className="sd-features">
                <li><CheckCircle2 size={16} /> Precision leak-proof silicone joins</li>
                <li><CheckCircle2 size={16} /> Pre-cycled bio-media for instant stability</li>
                <li><CheckCircle2 size={16} /> Architectural cabinetry design to match your interior</li>
              </ul>
            </div>

            <div className="service-detail-card">
              <div className="sd-icon"><Wrench size={28} color="var(--accent)" /></div>
              <h3>2. Routine Aquarium Maintenance & AMC</h3>
              <p>
                Enjoy a stunning aquarium without lifting a bucket! Our team visits your home or office on a bi-weekly
                or monthly schedule to handle complete water changes, gravel vacuuming, filter servicing, and plant pruning.
              </p>
              <ul className="sd-features">
                <li><CheckCircle2 size={16} /> Dechlorinated water exchange & detritus siphoning</li>
                <li><CheckCircle2 size={16} /> Magnetic glass cleaning & algae elimination</li>
                <li><CheckCircle2 size={16} /> Filter impeller maintenance and media revitalization</li>
              </ul>
            </div>

            <div className="service-detail-card">
              <div className="sd-icon"><Waves size={28} color="var(--primary-3)" /></div>
              <h3>3. Complimentary Water Analysis Lab</h3>
              <p>
                Having cloudy water, unexplained fish lethargy, or stubborn algae? Bring 100ml of your tank water to our store.
                We test 6 parameters (pH, Ammonia, Nitrite, Nitrate, GH/KH, TDS) and provide immediate corrective steps.
              </p>
              <ul className="sd-features">
                <li><CheckCircle2 size={16} /> Always 100% free for all hobbyists</li>
                <li><CheckCircle2 size={16} /> Accurate liquid reagent photometer testing</li>
                <li><CheckCircle2 size={16} /> Tailored water remineralisation guidance</li>
              </ul>
            </div>

            <div className="service-detail-card">
              <div className="sd-icon"><Droplets size={28} color="var(--primary)" /></div>
              <h3>4. Aquascaping & Hardscape Styling</h3>
              <p>
                Looking for an Instagram-worthy planted display? Our certified aquascaper will visit your home with
                raw Dragon Stone, Seiryu rocks, and driftwoods to craft a balanced Iwagumi or Nature Aquarium layout on site.
              </p>
              <ul className="sd-features">
                <li><CheckCircle2 size={16} /> Golden ratio rock balancing</li>
                <li><CheckCircle2 size={16} /> Plant placement mapping (foreground to background)</li>
                <li><CheckCircle2 size={16} /> Snail-free tissue plants installed directly</li>
              </ul>
            </div>

            <div className="service-detail-card">
              <div className="sd-icon"><ShieldCheck size={28} color="var(--success)" /></div>
              <h3>5. Fish Hospital & Quarantine Consultation</h3>
              <p>
                If your prize fish contract White Spot (Ich), Velvet, or fin rot, our biology team will diagnose the pathogen
                and provide prescription-grade salt dips, copper treatments, or antibacterial medication.
              </p>
              <ul className="sd-features">
                <li><CheckCircle2 size={16} /> Precise diagnosis under magnification</li>
                <li><CheckCircle2 size={16} /> Safe medication dosing without killing beneficial bio-filters</li>
                <li><CheckCircle2 size={16} /> Emergency hospital vat holding options</li>
              </ul>
            </div>

            <div className="service-detail-card">
              <div className="sd-icon"><Clock size={28} color="var(--accent)" /></div>
              <h3>6. Safe Aquarium Moving & Relocation</h3>
              <p>
                Moving homes or offices? Transporting an established aquarium without crashing the bio-filter requires expertise.
                We drain, carefully crate glass, pack fish with pure oxygen, and reassemble your ecosystem seamlessly.
              </p>
              <ul className="sd-features">
                <li><CheckCircle2 size={16} /> Oxygenated holding tanks for live fish during transit</li>
                <li><CheckCircle2 size={16} /> Preservation of live nitrifying filter bacteria</li>
                <li><CheckCircle2 size={16} /> Same-day teardown and reinstallation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Maintenance AMC Plans Table ===== */}
      <section className="section-padding bg-alt">
        <Bubbles count={10} fishCount={2} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Service Plans</span>
            <h2>Aquarium Maintenance Packages</h2>
            <p>Predictable, affordable care plans for worry-free fish keeping in Virudhunagar.</p>
          </div>

          <div className="pricing-grid">
            {servicePackages.map((pkg) => (
              <div key={pkg.id} className={`pricing-card ${pkg.popular ? "popular" : ""}`}>
                {pkg.popular && <span className="pricing-badge">Most Popular</span>}
                <h3>{pkg.name}</h3>
                <span className="ideal-for">{pkg.idealFor}</span>
                <div className="price-tag">{pkg.price}</div>

                <ul className="pkg-features">
                  {pkg.features.map((f, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} color="var(--primary)" /> {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={pkg.popular ? "btn-primary" : "btn-ghost"}
                  onClick={() => {
                    setServiceType(pkg.name);
                    const el = document.getElementById("booking-form");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Book {pkg.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Service Booking Form ===== */}
      <section id="booking-form" className="section-padding">
        <div className="container">
          <div className="booking-split-grid">
            <div className="booking-info-col">
              <span className="kicker">Schedule a Visit</span>
              <h2>Book an Aquarist or Maintenance Service</h2>
              <p>
                Fill out your details below and our service supervisor will call you within 2 hours to confirm
                technician arrival time and provide an upfront quote.
              </p>

              <div className="booking-perks">
                <div className="b-perk">
                  <ShieldCheck size={22} color="var(--primary)" />
                  <div>
                    <strong>Punctual & Professional</strong>
                    <p>Clean footwear covers, sterile siphons, and no spilled water in your home.</p>
                  </div>
                </div>
                <div className="b-perk">
                  <Waves size={22} color="var(--primary)" />
                  <div>
                    <strong>Lab-Tested Quality</strong>
                    <p>Every visit concludes with a verified water parameter reading.</p>
                  </div>
                </div>
                <div className="b-perk">
                  <Phone size={22} color="var(--primary)" />
                  <div>
                    <strong>Direct Contact</strong>
                    <p>Call or WhatsApp us at <a href={`tel:${storePhone}`}>{storePhone}</a> anytime.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="booking-form-col">
              <div className="service-form-card">
                <h3>Service Booking Request</h3>
                <p className="form-sub">For homes, clinics, and offices in Virudhunagar.</p>

                {submitted ? (
                  <div className="contact-success-box">
                    <CheckCircle2 size={48} color="var(--success)" />
                    <h4>Booking Received!</h4>
                    <p>Thank you, {name}! Our aquarist will call you on {phone} shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleServiceSubmit} className="service-form">
                    <div className="form-row-2">
                      <label>
                        <span>Your Full Name *</span>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Karthik Rajan"
                        />
                      </label>
                      <label>
                        <span>Phone / WhatsApp *</span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                        />
                      </label>
                    </div>

                    <div className="form-row-2">
                      <label>
                        <span>Service Required *</span>
                        <select
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                        >
                          <option value="Custom Aquarium Setup">Custom Aquarium Setup & Installation</option>
                          <option value="Basic Care Visit">Basic Care Visit (₹499)</option>
                          <option value="Planted Scape Master Care">Planted Scape Master Care (₹899)</option>
                          <option value="Corporate & Villa AMC">Corporate & Villa AMC (₹1,799/mo)</option>
                          <option value="Aquarium Relocation">Aquarium Teardown & Moving</option>
                          <option value="Free Water Testing Visit">Free Water Testing Consultation</option>
                        </select>
                      </label>
                      <label>
                        <span>Tank Dimensions / Volume</span>
                        <input
                          type="text"
                          value={tankSize}
                          onChange={(e) => setTankSize(e.target.value)}
                          placeholder="e.g. 3ft x 1.5ft or 150 Litres"
                        />
                      </label>
                    </div>

                    <label>
                      <span>Preferred Visit Date</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </label>

                    <label>
                      <span>Additional Details / Current Issues</span>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Tank has brown algae; need plants pruned; or new setup quotation."
                      />
                    </label>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : (
                        <>
                          <Send size={16} /> Submit Booking Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Quick WhatsApp Action ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="cta-banner">
            <h2>Need Urgent Emergency Aquarium Help?</h2>
            <p>
              Filter stopped running? Sudden fish gasping at the surface? Reach our emergency helpline immediately.
            </p>
            <div className="cta-btn-group">
              <button
                className="btn-primary"
                onClick={() => {
                  window.open("https://wa.me/919876543210?text=EMERGENCY! My aquarium filter stopped working. Need urgent advice.", "_blank");
                }}
              >
                <MessageCircle size={18} /> WhatsApp Emergency Helpline
              </button>
              <a href={`tel:${storePhone}`} className="btn-ghost">
                <Phone size={18} /> Call {storePhone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
