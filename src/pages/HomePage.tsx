import { useState } from "react";
import {
  Fish, MapPin, ShoppingBag, Waves, Leaf, Anchor,
  ShieldCheck, Sparkles, Camera, Star, ChevronRight, Award, Package,
  ThumbsUp, ArrowRight, Eye, Plus, Flame, HelpCircle, CheckCircle2, Droplets
} from "lucide-react";
import { LiquidEther } from "../LiquidEther";
import { Bubbles } from "../components/Bubbles";
import { ProductImage } from "../components/ProductImage";
import type { Product, Category, GalleryItem, StoreSettings } from "../lib/types";
import { allFAQs } from "../data";

interface HomePageProps {
  products: Product[];
  categories: Category[];
  gallery: GalleryItem[];
  settings: StoreSettings | null;
  storeStatus: { isOpen: boolean; text: string };
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  onOpenLightbox: (index: number) => void;
  navigate: (path: string) => void;
}

export function HomePage({
  products,
  gallery,
  settings,
  storeStatus,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  onOpenLightbox,
  navigate,
}: HomePageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const storeName = settings?.store_name ?? "Sakthi's Aqua Zoo";
  const loc = settings?.location ?? "Virudhunagar";

  // Featured products (top 6)
  const featuredProducts = products.slice(0, 6);

  // Signature mascots
  const mascots = products.filter(
    (p) => p.tag?.includes("Mascot") || p.tag?.includes("Logo")
  );

  return (
    <div className="page-home">
      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="hero-fluid">
          <LiquidEther
            colors={["#040a14", "#00f0ff", "#0ea5e9", "#fbbf24"]}
            mouseForce={22}
            cursorSize={130}
            autoDemo={true}
            autoSpeed={0.35}
            autoIntensity={2.1}
            resolution={0.5}
            BFECC={true}
          />
        </div>
        <Bubbles count={24} fishCount={4} />

        <div className="container hero-content">
          <div className="hero-eyebrow-row">
            <span className="eyebrow">
              <Sparkles size={14} /> {loc}'s Premier Aquatic Sanctuary
            </span>
            <span className={`store-status-pill ${storeStatus.isOpen ? "open" : "closed"}`}>
              <span className="pulse-dot" /> {storeStatus.text}
            </span>
          </div>

          <h1>
            Dive into <span className="grad">{storeName}</span>
          </h1>
          <p className="lead">
            Exotic ornamental fish, live aquatic plants, rimless designer aquariums, and pure-grade nutrition —
            hand-picked, quarantined for 14 days, and acclimated for hobbyists across {loc}.
          </p>

          <div className="hero-actions">
            <button
              onClick={() => navigate("/products")}
              className="btn-primary"
            >
              <ShoppingBag size={18} /> Explore Catalog
            </button>
            <button
              onClick={() => navigate("/products")}
              className="btn-secondary-aquatic"
            >
              <Fish size={18} /> Browse Fish & Plants
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="btn-ghost"
            >
              <MapPin size={18} /> Visit Store in {loc}
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat" onClick={() => navigate("/products")} style={{ cursor: "pointer" }}>
              <div className="num">{settings?.stat_species ?? 140}+</div>
              <div className="lbl">Exotic Species</div>
            </div>
            <div className="stat" onClick={() => navigate("/products")} style={{ cursor: "pointer" }}>
              <div className="num">{settings?.stat_plants ?? 55}+</div>
              <div className="lbl">Live Plant Varieties</div>
            </div>
            <div className="stat" onClick={() => navigate("/about")} style={{ cursor: "pointer" }}>
              <div className="num">{settings?.stat_years ?? 8}+ yrs</div>
              <div className="lbl">Trusted Service</div>
            </div>
          </div>
        </div>

        <div className="hero-right-column">
          {/* Mascot Featured Banner on Side */}
          <div className="hero-side-cards">
            <div
              className="hero-side-card mascot-card reveal in"
              onClick={() => {
                const bichir = products.find((p) => p.name.includes("Bichir")) || products[0];
                if (bichir) onSelectProduct(bichir);
              }}
              title="Click to view our signature mascot"
              style={{ cursor: "pointer" }}
            >
              <div className="mascot-avatar">
                <img src="/1000052044.jpg" alt="Mascot" />
              </div>
              <div>
                <div className="mascot-tag"><Flame size={12} color="var(--accent)" /> Signature Mascot</div>
                <span className="mascot-name">Albino Bichir & Red Oscar</span>
              </div>
            </div>
            <div className="hero-side-card reveal in" onClick={() => navigate("/about")}>
              <ShieldCheck size={20} />
              <span>100% 14-Day Quarantined Stock</span>
            </div>
            <div className="hero-side-card reveal in" onClick={() => navigate("/products")}>
              <Leaf size={20} />
              <span>Pest-Treated Aquatic Plants</span>
            </div>
            <div className="hero-side-card reveal in" onClick={() => navigate("/services")}>
              <Waves size={20} />
              <span>Free Water Chemistry Testing</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true" />
      </section>

      {/* ===== Trust strip ===== */}
      <div className="trust-strip">
        <div className="container trust-strip-inner">
          <div className="trust-item">
            <Award size={20} />
            <span>8+ Years of Aquarist Expertise</span>
          </div>
          <div className="trust-item">
            <Package size={20} />
            <span>Same-Day Local Delivery in {loc}</span>
          </div>
          <div className="trust-item">
            <ThumbsUp size={20} />
            <span>Genuine Brands & Healthy Livestock</span>
          </div>
          <div className="trust-item">
            <Droplets size={20} />
            <span>Free Lifetime Hobbyist Guidance</span>
          </div>
        </div>
      </div>

      <div className="aquatic-divider" />

      {/* ===== Section: Mascot & Signature Species Spotlight ===== */}
      <section className="section-padding bg-alt">
        <Bubbles count={12} fishCount={2} />
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">Emblem Species</span>
            <h2>The Living Legends Behind Our Logo</h2>
            <p>
              Sakthi's Aqua Zoo emblem is crafted from our three most celebrated freshwater species:
              the ancient Albino Bichir, the spirited Red Oscar, and the serene Golden Severum.
            </p>
          </div>

          <div className="mascot-grid">
            {mascots.map((m) => (
              <div key={m.id} className="mascot-spotlight-card reveal in">
                <div className="mascot-img-wrap" onClick={() => onSelectProduct(m)}>
                  <ProductImage src={m.image_url} alt={m.name} />
                  <span className="mascot-badge-pill">
                    <Flame size={14} /> {m.tag}
                  </span>
                </div>
                <div className="mascot-body">
                  <div className="mascot-head-row">
                    <h3>{m.name}</h3>
                    <span className="price-tag">₹{m.price}</span>
                  </div>
                  <p className="mascot-sci-name"><em>{m.scientific_name}</em></p>
                  <p className="mascot-desc">{m.description}</p>
                  
                  <div className="species-quick-specs">
                    <div><strong>Care:</strong> {m.care_level}</div>
                    <div><strong>Temp:</strong> {m.temp_range}</div>
                    <div><strong>Min Tank:</strong> {m.min_tank_size}</div>
                  </div>

                  <div className="mascot-btn-row">
                    <button className="btn-primary" onClick={() => onAddToCart(m)}>
                      <Plus size={16} /> Add to Cart
                    </button>
                    <button className="btn-ghost" onClick={() => onSelectProduct(m)}>
                      <Eye size={16} /> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: Featured Products ===== */}
      <section className="section-padding">
        <Bubbles count={8} fishCount={2} />
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">Catalog Spotlight</span>
            <h2>Trending Livestock & Equipment</h2>
            <p>Popular choices handpicked by our {loc} community of aquarists.</p>
          </div>

          <div className="product-grid">
            {featuredProducts.map((p) => {
              const isMascot = p.tag?.includes("Mascot") || p.tag?.includes("Logo");
              return (
                <article key={p.id} className="card reveal in">
                  <div
                    className="media"
                    onClick={() => onSelectProduct(p)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.tag && (
                      <span className={`tag ${isMascot ? "mascot-tag-badge" : ""}`}>
                        {isMascot && <Flame size={12} style={{ marginRight: 4 }} />}
                        {p.tag}
                      </span>
                    )}
                    <ProductImage src={p.image_url} alt={p.name} />
                    <div className="quick-view-btn">
                      <Eye size={16} /> View Details
                    </div>
                  </div>

                  <div className="body">
                    <div className="card-top-row">
                      <span className="cat">{p.categories?.name ?? "Aquatic"}</span>
                      {p.care_level && (
                        <span className="care-pill">{p.care_level}</span>
                      )}
                    </div>

                    <h4 onClick={() => onSelectProduct(p)} style={{ cursor: "pointer" }}>
                      {p.name}
                    </h4>

                    {p.scientific_name && (
                      <span className="card-sci-name">
                        <em>{p.scientific_name}</em>
                      </span>
                    )}

                    <p className="desc">{p.description}</p>

                    <div className="row">
                      <span className="price">
                        ₹{p.price} <span className="unit">/{p.unit}</span>
                      </span>

                      <div className="card-actions">
                        <button
                          className="add"
                          onClick={() => onAddToCart(p)}
                          title="Add to shopping cart"
                        >
                          <Plus size={15} /> Add
                        </button>

                        <button
                          className="order-btn"
                          onClick={() => onQuickBuy(p)}
                          title="Direct checkout"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="center-action-row">
            <button className="btn-primary" onClick={() => navigate("/products")}>
              View All {products.length}+ Products & Supplies <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: Highlights / Why Aqua Zoo ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">The Aqua Zoo Standard</span>
            <h2>Why Dedicated Hobbyists Choose Us</h2>
            <p>From ethical livestock sourcing to water quality assurance, our standard is uncompromising.</p>
          </div>

          <div className="highlights-grid">
            <div className="highlight-card reveal in">
              <div className="highlight-icon-wrap"><ShieldCheck size={28} /></div>
              <h4>14-Day Strict Quarantine</h4>
              <p>Every specimen is housed in isolated vats, observed for behavior, and prophylactic-treated so your display tank stays clean.</p>
            </div>
            <div className="highlight-card reveal in">
              <div className="highlight-icon-wrap"><Waves size={28} /></div>
              <h4>Complimentary Water Testing</h4>
              <p>Bring a sample from your aquarium anytime. We test pH, ammonia, nitrite, nitrate, and KH to ensure zero tank crashes.</p>
            </div>
            <div className="highlight-card reveal in">
              <div className="highlight-icon-wrap"><Leaf size={28} /></div>
              <h4>Pest-Free Plant Propagation</h4>
              <p>Our plants are grown in dedicated submerged tissue nurseries, rigorously cleansed of nuisance pest snails and hydra.</p>
            </div>
            <div className="highlight-card reveal in">
              <div className="highlight-icon-wrap"><Anchor size={28} /></div>
              <h4>Custom Hardscape Scaping</h4>
              <p>From natural Dragon Stone and Seiryu rock arrangements to ADA-style low-iron rimless glass installations.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: Services Teaser ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">Expert Services</span>
            <h2>Comprehensive Aquarium Solutions</h2>
            <p>Everything you need to create and maintain a flourishing aquatic ecosystem.</p>
          </div>

          <div className="services-teaser-grid">
            <div className="service-teaser-card" onClick={() => navigate("/services")}>
              <div className="service-teaser-img">
                <img src="https://images.pexels.com/photos/12829679/pexels-photo-12829679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Aquarium Setup" />
              </div>
              <div className="service-teaser-body">
                <h3>Custom Aquarium Setup</h3>
                <p>Turnkey luxury aquarium installations for homes, clinics, and corporate spaces in {loc}.</p>
                <span className="service-link">Learn More <ChevronRight size={16} /></span>
              </div>
            </div>

            <div className="service-teaser-card" onClick={() => navigate("/services")}>
              <div className="service-teaser-img">
                <img src="https://images.pexels.com/photos/7254512/pexels-photo-7254512.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Maintenance AMC" />
              </div>
              <div className="service-teaser-body">
                <h3>Routine Maintenance & AMC</h3>
                <p>Bi-weekly and monthly professional water changes, bio-filter servicing, and plant pruning.</p>
                <span className="service-link">View Packages <ChevronRight size={16} /></span>
              </div>
            </div>

            <div className="service-teaser-card" onClick={() => navigate("/services")}>
              <div className="service-teaser-img">
                <img src="https://images.pexels.com/photos/31047030/pexels-photo-31047030.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Water Testing" />
              </div>
              <div className="service-teaser-body">
                <h3>Water Care & Disease Clinic</h3>
                <p>Free parameter evaluation, fish hospitalization, and customized water remineralisation protocols.</p>
                <span className="service-link">Book Consultation <ChevronRight size={16} /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: Gallery Preview ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">Visual Showcase</span>
            <h2>Inside Our Living Displays</h2>
            <p>Glances of our pristine aquascapes, breeding bays, and marine collections in {loc}.</p>
          </div>

          <div className="gallery-preview-grid">
            {gallery.slice(0, 6).map((g, idx) => (
              <div
                key={g.id}
                className="g reveal in"
                onClick={() => onOpenLightbox(idx)}
                title="Click to zoom photograph"
              >
                <ProductImage src={g.image_url} alt={g.caption} />
                <div className="g-overlay">
                  <div className="cap">{g.caption}</div>
                  <div className="g-zoom-ic">
                    <Camera size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="center-action-row">
            <button className="btn-secondary-aquatic" onClick={() => navigate("/gallery")}>
              View Complete Aqua Zoo Gallery ({gallery.length}+ Displays) <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: Testimonials ===== */}
      <section className="testimonials section-padding">
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">Hobbyist Reviews</span>
            <h2>Loved by Fish Keepers Across {loc}</h2>
            <p>Real experiences from planted tank hobbyists, cichlid keepers, and nano aquarists.</p>
          </div>

          <div className="testimonial-grid">
            {[
              {
                name: "Karthik Rajan",
                role: "Planted Tank Enthusiast, Virudhunagar",
                text: "Bought my first Albino Bichir and 60cm rimless tank here. Six months later, the fish is thriving and the tank balance is spotless. Sakthi's team genuinely knows water chemistry.",
                stars: 5,
              },
              {
                name: "Priya Senthil",
                role: "Community Aquarist, Sivakasi",
                text: "Best aquarium store in South Tamil Nadu by far. Every guppy and tetra was active from day one, not a single sick fish. Plus, the free water testing saved my tank during cycling!",
                stars: 5,
              },
              {
                name: "Murugan V.",
                role: "Cichlid Keeper, Virudhunagar",
                text: "Their Red Oscar stock is healthy and spirited. Great prices on Hikari feed and filters too. Delivery to my home near the Old Bus Stand was fast and packed with pure oxygen.",
                stars: 5,
              },
            ].map((t, i) => (
              <div key={t.name} className="testimonial-card reveal in">
                <div className="testimonial-stars">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <span className="author-name">{t.name}</span>
                    <span className="author-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: FAQ Accordion ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="section-head reveal in">
            <span className="kicker">Frequently Asked Questions</span>
            <h2>Everything You Need to Know</h2>
            <p>Quick answers on fish keeping, tank setup, quarantine, and local delivery.</p>
          </div>

          <div className="faq-container">
            {allFAQs.slice(0, 5).map((faq, idx) => {
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

          <div className="center-action-row">
            <button className="btn-ghost" onClick={() => navigate("/contact")}>
              Have more questions? Ask our team directly <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section: Final Call to Action ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="cta-banner reveal in">
            <Bubbles count={8} fishCount={1} />
            <h2>Ready to Build Your Dream Aquarium?</h2>
            <p>
              Whether you're looking for a peaceful desk companion, a vibrant planted biotope, or a monster fish tank,
              Sakthi's Aqua Zoo provides the healthiest stock and trustworthy guidance.
            </p>
            <div className="cta-btn-group">
              <button className="btn-primary" onClick={() => navigate("/products")}>
                Browse Live Stock <ChevronRight size={18} />
              </button>
              <button className="btn-ghost" onClick={() => navigate("/contact")}>
                <MapPin size={18} /> Visit Us in {loc}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
