import { useState, useMemo } from "react";
import {
  Package, Calculator, ShieldCheck, Zap, Plus, Eye,
  Sparkles, CheckCircle2, Waves, ArrowRight, ShoppingCart
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import { ProductImage } from "../components/ProductImage";
import type { Product } from "../lib/types";

interface TanksAccessoriesPageProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  navigate: (path: string) => void;
}

export function TanksAccessoriesPage({
  products,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  navigate,
}: TanksAccessoriesPageProps) {
  // Calculator state (in centimeters)
  const [tankLength, setTankLength] = useState<number>(60);
  const [tankWidth, setTankWidth] = useState<number>(30);
  const [tankHeight, setTankHeight] = useState<number>(36);

  // Equipment calculation
  const calculations = useMemo(() => {
    const l = Math.max(10, tankLength);
    const w = Math.max(10, tankWidth);
    const h = Math.max(10, tankHeight);

    // Gross volume in Litres = (L * W * H) / 1000
    const litres = Math.round((l * w * h) / 1000);
    const gallons = (litres * 0.264172).toFixed(1);

    // Substrate calculation: (L * W * 5cm depth) / 1000 * 1.2 density kg/L
    const substrateKg = Math.round(((l * w * 5) / 1000) * 1.2);

    // Filter turnover: 5x the tank volume per hour
    const recommendedFlowRate = litres * 5;

    // Heater wattage: roughly 1 watt per litre (or 50W min)
    let heaterWattage = 50;
    if (litres > 150) heaterWattage = 250;
    else if (litres > 90) heaterWattage = 150;
    else if (litres > 40) heaterWattage = 100;

    return {
      litres,
      gallons,
      substrateKg,
      recommendedFlowRate,
      heaterWattage,
    };
  }, [tankLength, tankWidth, tankHeight]);

  const equipmentProducts = products.filter(
    (p) =>
      p.categories?.slug === "tanks-accessories" ||
      p.category_id === "cat-tanks" ||
      p.categories?.slug === "care-health" ||
      p.category_id === "cat-care" ||
      p.name.toLowerCase().includes("tank") ||
      p.name.toLowerCase().includes("filter") ||
      p.name.toLowerCase().includes("led") ||
      p.name.toLowerCase().includes("stone") ||
      p.name.toLowerCase().includes("kit")
  );

  return (
    <div className="page-tanks">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={16} fishCount={2} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <Package size={14} /> Low-Iron Glass & Premium Hardware
            </span>
            <h1>
              Tanks, Filtration & <span className="grad">Aquarium Hardware</span>
            </h1>
            <p className="page-hero-lead">
              Ultra-clear Opti-white glass tanks, whisper-quiet external canister filters, high-PAR LED lighting,
              and natural volcanic hardscape stone curated for long-lasting, crystal-clear aquariums.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><ShieldCheck size={14} /> Opti-White Ultra Clear Glass</span>
              <span className="hero-badge-chip"><Waves size={14} /> Whisper-Quiet Filtration</span>
              <span className="hero-badge-chip"><Calculator size={14} /> Live Setup Calculator</span>
              <span className="hero-badge-chip"><Zap size={14} /> Full Spectrum LED Lighting</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Interactive Tank & Filter Calculator ===== */}
      <section className="section-padding bg-alt pt-compact">
        <div className="container">
          <div className="calc-wrapper">
            <div className="calc-header">
              <div className="calc-title-box">
                <Calculator size={28} className="calc-ic" />
                <div>
                  <h2>Interactive Aquarium & Equipment Calculator</h2>
                  <p>Input your intended tank dimensions to instantly calculate volume, filter flow rate, and substrate weight.</p>
                </div>
              </div>
            </div>

            <div className="calc-body-grid">
              {/* Inputs */}
              <div className="calc-inputs-col">
                <div className="calc-input-group">
                  <label>
                    <span>Tank Length (cm)</span>
                    <input
                      type="number"
                      min={15}
                      max={300}
                      value={tankLength}
                      onChange={(e) => setTankLength(Number(e.target.value) || 0)}
                    />
                  </label>
                  <div className="dimension-presets">
                    <button onClick={() => { setTankLength(30); setTankWidth(30); setTankHeight(30); }}>30cm Cube</button>
                    <button onClick={() => { setTankLength(60); setTankWidth(30); setTankHeight(36); }}>60cm Standard</button>
                    <button onClick={() => { setTankLength(90); setTankWidth(45); setTankHeight(45); }}>90cm Centerpiece</button>
                    <button onClick={() => { setTankLength(120); setTankWidth(50); setTankHeight(50); }}>120cm Large</button>
                  </div>
                </div>

                <div className="calc-row-2">
                  <label>
                    <span>Tank Width / Depth (cm)</span>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={tankWidth}
                      onChange={(e) => setTankWidth(Number(e.target.value) || 0)}
                    />
                  </label>
                  <label>
                    <span>Tank Height (cm)</span>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={tankHeight}
                      onChange={(e) => setTankHeight(Number(e.target.value) || 0)}
                    />
                  </label>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="calc-outputs-col">
                <div className="calc-result-card primary-result">
                  <span className="res-lbl">Total Water Volume</span>
                  <div className="res-num">
                    {calculations.litres} <small>Litres</small>
                  </div>
                  <span className="res-sub">≈ {calculations.gallons} US Gallons</span>
                </div>

                <div className="calc-metrics-mini-grid">
                  <div className="calc-metric-mini">
                    <span className="m-lbl">Required Substrate</span>
                    <span className="m-val">{calculations.substrateKg} kg</span>
                    <span className="m-note">Based on 5cm bed</span>
                  </div>

                  <div className="calc-metric-mini">
                    <span className="m-lbl">Filter Flow Rate</span>
                    <span className="m-val">{calculations.recommendedFlowRate} L/h</span>
                    <span className="m-note">Minimum 5x turnover</span>
                  </div>

                  <div className="calc-metric-mini">
                    <span className="m-lbl">Heater Wattage</span>
                    <span className="m-val">{calculations.heaterWattage} Watts</span>
                    <span className="m-note">For stable 26°C</span>
                  </div>

                  <div className="calc-metric-mini">
                    <span className="m-lbl">Small Fish Capacity</span>
                    <span className="m-val">≈ {Math.round(calculations.litres / 3)} tetras</span>
                    <span className="m-note">Conservative bioload</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Equipment & Hardware Catalog ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Available Hardware</span>
            <h2>Rimless Tanks & Filtration Units</h2>
            <p>High-grade aquarium hardware tested for durability, silent operation, and aesthetic perfection.</p>
          </div>

          <div className="product-grid">
            {equipmentProducts.map((item) => (
              <article key={item.id} className="card">
                <div
                  className="media"
                  onClick={() => onSelectProduct(item)}
                  style={{ cursor: "pointer" }}
                >
                  {item.tag && <span className="tag">{item.tag}</span>}
                  <ProductImage src={item.image_url} alt={item.name} />
                  <div className="quick-view-btn">
                    <Eye size={16} /> View Details
                  </div>
                </div>

                <div className="body">
                  <div className="card-top-row">
                    <span className="cat">{item.categories?.name ?? "Hardware"}</span>
                  </div>

                  <h4 onClick={() => onSelectProduct(item)} style={{ cursor: "pointer" }}>
                    {item.name}
                  </h4>

                  <p className="desc">{item.description}</p>

                  <div className="row">
                    <span className="price">
                      ₹{item.price} <span className="unit">/{item.unit}</span>
                    </span>

                    <div className="card-actions">
                      <button
                        className="add"
                        onClick={() => onAddToCart(item)}
                        title="Add to shopping cart"
                      >
                        <Plus size={15} /> Add
                      </button>

                      <button
                        className="order-btn"
                        onClick={() => onQuickBuy(item)}
                        title="Direct checkout"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Technical Standards: The 4 Pillars of Hardware ===== */}
      <section className="section-padding bg-alt">
        <Bubbles count={10} fishCount={1} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Hardware Standards</span>
            <h2>Engineered for Long-Term Reliability</h2>
            <p>Why cheap plastic tanks and weak pump motors fail hobbyists within months.</p>
          </div>

          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon-wrap"><Sparkles size={28} /></div>
              <h4>Low-Iron Opti-White Glass</h4>
              <p>Standard green float glass distorts fish colors. Our 45-degree mitered rimless tanks have zero green tint with 91% pure optical light transmittance.</p>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon-wrap"><Waves size={28} /></div>
              <h4>Sintered Glass Bio-Media</h4>
              <p>Our canister filters use micro-porous sintered glass ceramic rings providing 1,200 m² of surface area per litre for billion-strong bacterial colonization.</p>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon-wrap"><Zap size={28} /></div>
              <h4>Full-Spectrum High PAR LEDs</h4>
              <p>Tailored 660nm deep red diodes stimulate chlorophyll synthesis without encouraging green hair algae. Comes with sunrise and moonlight presets.</p>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon-wrap"><ShieldCheck size={28} /></div>
              <h4>Whisper-Quiet Ceramic Shafts</h4>
              <p>High-precision ceramic impeller shafts ensure zero friction noise, running under 32dB — silent enough for your bedroom or living room.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Maintenance Checklist for Beginners ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Routine Checklist</span>
            <h2>Easy Aquarium Maintenance Schedule</h2>
            <p>Follow this simple schedule to keep your water crystal clear without hours of work.</p>
          </div>

          <div className="checklist-grid">
            <div className="check-col">
              <div className="check-col-header">
                <span className="freq-badge">Weekly (15 Mins)</span>
                <h4>Water Exchange & Glass Care</h4>
              </div>
              <ul className="check-items">
                <li><CheckCircle2 size={16} color="var(--primary)" /> 20% to 30% Dechlorinated water change</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Magnetic glass wiping to clean soft film</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Dose liquid micro-nutrients for plants</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Check filter intake for plant debris</li>
              </ul>
            </div>

            <div className="check-col">
              <div className="check-col-header">
                <span className="freq-badge">Monthly (30 Mins)</span>
                <h4>Filter Sponge & Parameter Check</h4>
              </div>
              <ul className="check-items">
                <li><CheckCircle2 size={16} color="var(--primary)" /> Gently rinse sponge in old siphoned tank water</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Never rinse bio-media in chlorinated tap water</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Test pH, Ammonia, and Nitrate levels</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Trim overgrown stem plants and prune dead leaves</li>
              </ul>
            </div>

            <div className="check-col">
              <div className="check-col-header">
                <span className="freq-badge">Every 6 Months</span>
                <h4>Deep Equipment Inspection</h4>
              </div>
              <ul className="check-items">
                <li><CheckCircle2 size={16} color="var(--primary)" /> Clean impeller well and lubricate O-rings</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Replace fine filter floss pad</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Clean heater glass with white vinegar to remove limescale</li>
                <li><CheckCircle2 size={16} color="var(--primary)" /> Calibrate digital thermometer and pH probe</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== CTA ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="cta-banner">
            <h2>Need a Custom Glass Tank Built to Your Measurements?</h2>
            <p>
              We craft custom low-iron rimless tanks, sump filtration, and iron-stand cabinetry for villas
              and commercial spaces across Virudhunagar district.
            </p>
            <div className="cta-btn-group">
              <button className="btn-primary" onClick={() => navigate("/services")}>
                Explore Custom Setup Services <ArrowRight size={18} />
              </button>
              <button className="btn-ghost" onClick={() => navigate("/contact")}>
                Request a Tank Quote
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
