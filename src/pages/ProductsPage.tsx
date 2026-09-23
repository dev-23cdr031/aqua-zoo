import { useState, useMemo } from "react";
import {
  Search, Filter, Plus, Eye, Flame, ShoppingBag, X,
  ShieldCheck, Truck, Droplets, ArrowRight, MessageCircle, HelpCircle,
  Fish, Leaf, Waves, Sparkles, Thermometer, Compass, Sun, Anchor, Layers, Timer
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import { ProductImage } from "../components/ProductImage";
import type { Product, Category } from "../lib/types";

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  navigate: (path: string) => void;
}

export function ProductsPage({
  products,
  categories,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  navigate,
}: ProductsPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [careFilter, setCareFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "name">("featured");

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const categoryNames = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat =
        activeCategory === "All" ||
        p.categories?.name.toLowerCase() === activeCategory.toLowerCase();

      const matchCare =
        careFilter === "All" ||
        (p.care_level && p.care_level.toLowerCase() === careFilter.toLowerCase());

      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.scientific_name && p.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchCare && matchSearch;
    });

    if (sortBy === "price-low") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = [...list].sort((a, b) => a.sort_order - b.sort_order);
    }

    return list;
  }, [products, activeCategory, careFilter, searchQuery, sortBy]);

  return (
    <div className="page-products">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={16} fishCount={3} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <Fish size={14} /> Freshwater & Marine Fish • Live Plants • Supplies
            </span>
            <h1>
              Fish, Plants & <span className="grad">Aquatic Supplies</span>
            </h1>
            <p className="page-hero-lead">
              Explore our complete aquatic catalog — freshwater dinosaur eels to vibrant reef gems,
              lush snail-free live plants, rimless aquariums, filtration, and premium nutrition.
              Every species profiled with water chemistry, tank requirements, and care guides.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><Fish size={14} /> 140+ Fish & Inverts In Stock</span>
              <span className="hero-badge-chip"><Leaf size={14} /> Snail-Free Live Plants</span>
              <span className="hero-badge-chip"><Truck size={14} /> Free Delivery Over ₹500</span>
              <span className="hero-badge-chip"><ShieldCheck size={14} /> 100% Live Arrival</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Catalog Controls & Filters ===== */}
      <section className="section-padding pt-compact">
        <div className="container">
          <div className="shop-controls-bar">
            {/* Search Input */}
            <div className="shop-search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fish species, plants, rimless tanks, filters..."
                className="shop-search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="shop-filters-row">
              {/* Care Level Filter */}
              <div className="filter-select-wrap">
                <Filter size={15} className="sort-icon" />
                <select
                  value={careFilter}
                  onChange={(e) => setCareFilter(e.target.value)}
                  className="shop-sort-select"
                >
                  <option value="All">All Care Levels</option>
                  <option value="Easy">Easy / Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert / Specialist</option>
                </select>
              </div>

              {/* Sort Select */}
              <div className="filter-select-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="shop-sort-select"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="filter-bar">
            {categoryNames.map((c) => (
              <button
                key={c}
                className={`chip ${activeCategory === c ? "active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Result Count and Reset */}
          <div className="catalog-meta-row">
            <span className="results-count">
              Showing <strong>{filteredProducts.length}</strong> of {products.length} products
            </span>
            {(activeCategory !== "All" || careFilter !== "All" || searchQuery) && (
              <button
                className="reset-filters-link"
                onClick={() => {
                  setActiveCategory("All");
                  setCareFilter("All");
                  setSearchQuery("");
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="shop-empty-state">
              <ShoppingBag size={52} />
              <h3>No products found</h3>
              <p>We couldn't find any items matching your selected criteria. Try adjusting your search term or category.</p>
              <button
                className="btn-ghost"
                onClick={() => {
                  setActiveCategory("All");
                  setCareFilter("All");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((p) => {
                const isMascot = p.tag?.includes("Mascot") || p.tag?.includes("Logo");
                return (
                  <article key={p.id} className="card">
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
          )}

          {/* Special Order Banner */}
          <div className="catalog-concierge-banner">
            <div className="concierge-content">
              <h3>Looking for a Rare Species or Custom Equipment?</h3>
              <p>
                We import and source hard-to-find plecos, cichlids, marine corals, and oversized custom tanks
                on demand. Speak directly with our head aquarist on WhatsApp.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                const text = encodeURIComponent(
                  "Hello Sakthi's Aqua Zoo! I am looking for a special aquatic product not in the catalog."
                );
                window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
              }}
            >
              <MessageCircle size={18} /> WhatsApp Sourcing Concierge
            </button>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Trust & Delivery Policy Strip ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="trust-cards-row">
            <div className="trust-feature-card">
              <ShieldCheck size={28} className="tf-icon" />
              <h4>100% Live Arrival Guaranteed</h4>
              <p>Livestock packed in medical oxygen with insulated thermal containers. Guaranteed healthy arrival.</p>
            </div>
            <div className="trust-feature-card">
              <Truck size={28} className="tf-icon" />
              <h4>Free Delivery Over ₹500</h4>
              <p>Free doorstep delivery across Virudhunagar. Same-day dispatch for orders placed before 3:00 PM.</p>
            </div>
            <div className="trust-feature-card">
              <Droplets size={28} className="tf-icon" />
              <h4>Quarantine Verified</h4>
              <p>No sick fish, no pest snails, no compromised genetics. Only vigorous, conditioned aquatic life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Quick-Jump Guide Navigation ===== */}
      <nav className="guide-jump-nav" aria-label="Jump to a care guide">
        <button className="guide-jump-link" onClick={() => scrollTo("fish-care")}>
          <Waves size={14} /> Fish Care
        </button>
        <button className="guide-jump-link" onClick={() => scrollTo("water-params")}>
          <Thermometer size={14} /> Water Parameters
        </button>
        <button className="guide-jump-link" onClick={() => scrollTo("live-plants")}>
          <Leaf size={14} /> Live Plants
        </button>
        <button className="guide-jump-link" onClick={() => scrollTo("aquascaping")}>
          <Compass size={14} /> Aquascaping
        </button>
        <button className="guide-jump-link" onClick={() => scrollTo("feeding-light")}>
          <Sun size={14} /> Feeding & Light
        </button>
      </nav>

      <div className="aquatic-divider" />

      {/* ===== Fish Care & Husbandry Masterclass (merged from Aquatic Life page) ===== */}
      <section id="fish-care" className="anchor-section section-padding bg-alt">
        <Bubbles count={12} fishCount={2} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Aquarist Guide</span>
            <h2>The Science of Successful Fishkeeping</h2>
            <p>Master the essentials of water biology and acclimation to keep your aquatic pets thriving.</p>
          </div>

          <div className="guide-columns-grid">
            {/* Guide 1: The Nitrogen Cycle */}
            <div className="guide-box">
              <div className="guide-box-header">
                <span className="guide-icon-chip"><Waves size={22} /></span>
                <h3>The Nitrogen Cycle Demystified</h3>
              </div>
              <p>
                In any closed aquarium, fish excrete toxic ammonia through their gills and waste.
                Without biological filtration, ammonia accumulates and becomes lethal.
              </p>
              <div className="nitrogen-steps">
                <div className="n-step">
                  <span className="step-num">1</span>
                  <div>
                    <strong>Fish Waste & Uneaten Food</strong>
                    <p>Organic debris breaks down into raw Ammonia (NH3/NH4+).</p>
                  </div>
                </div>
                <div className="n-step">
                  <span className="step-num">2</span>
                  <div>
                    <strong>Nitrosomonas Bacteria</strong>
                    <p>Converts harmful Ammonia into toxic Nitrite (NO2-).</p>
                  </div>
                </div>
                <div className="n-step">
                  <span className="step-num">3</span>
                  <div>
                    <strong>Nitrobacter Bacteria</strong>
                    <p>Converts Nitrite into far less harmful Nitrate (NO3-).</p>
                  </div>
                </div>
                <div className="n-step">
                  <span className="step-num">4</span>
                  <div>
                    <strong>Live Plants & Water Changes</strong>
                    <p>Absorb Nitrate, keeping water pure and crystalline.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guide 2: Drip Acclimation Procedure */}
            <div className="guide-box">
              <div className="guide-box-header">
                <span className="guide-icon-chip"><Droplets size={22} /></span>
                <h3>Safe Step-by-Step Acclimation</h3>
              </div>
              <p>
                Never dump transport water directly into your aquarium! Follow our proven acclimation protocol:
              </p>
              <div className="acclimation-list">
                <div className="acc-item">
                  <span className="acc-badge">Step 1</span>
                  <div>
                    <strong>Temperature Equalization (15-20 mins)</strong>
                    <p>Float the sealed bag in your aquarium to equalize water temperatures.</p>
                  </div>
                </div>
                <div className="acc-item">
                  <span className="acc-badge">Step 2</span>
                  <div>
                    <strong>Water Dilution (20 mins)</strong>
                    <p>Open the bag and slowly add 1 cup of tank water every 5 minutes to adapt pH and hardness.</p>
                  </div>
                </div>
                <div className="acc-item">
                  <span className="acc-badge">Step 3</span>
                  <div>
                    <strong>Net Transfer</strong>
                    <p>Gently net the fish out and release them into the tank. Discard the transport bag water.</p>
                  </div>
                </div>
                <div className="acc-item">
                  <span className="acc-badge">Step 4</span>
                  <div>
                    <strong>Lights Out (4-6 hours)</strong>
                    <p>Keep aquarium lights dim for the first few hours to reduce initial stress.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Water Parameter Cheat Cards (merged from Aquatic Life page) ===== */}
      <section id="water-params" className="anchor-section section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Reference Matrix</span>
            <h2>Optimal Water Parameters by Biotope</h2>
            <p>Target parameters for popular aquarium ecosystems to maintain peak health.</p>
          </div>

          <div className="biotope-card-grid">
            <article className="biotope-card amazon">
              <div className="biotope-head">
                <span className="biotope-icon"><Leaf size={20} /></span>
                <div>
                  <h3>South American Amazon</h3>
                  <p>Tetras & Angelfish</p>
                </div>
              </div>
              <div className="biotope-stats">
                <div className="biotope-stat"><span>pH Range</span><strong>6.0 – 6.8</strong></div>
                <div className="biotope-stat"><span>Temp</span><strong>24°C – 28°C</strong></div>
                <div className="biotope-stat"><span>TDS</span><strong>80 – 160 ppm</strong></div>
                <div className="biotope-stat"><span>GH / KH</span><strong>3 – 6 dGH</strong></div>
                <div className="biotope-stat wide"><span>Recommended Tank</span><strong>60L – 150L</strong></div>
              </div>
            </article>

            <article className="biotope-card malawi">
              <div className="biotope-head">
                <span className="biotope-icon"><Fish size={20} /></span>
                <div>
                  <h3>African Malawi & Victoria</h3>
                  <p>Cichlid Species</p>
                </div>
              </div>
              <div className="biotope-stats">
                <div className="biotope-stat"><span>pH Range</span><strong>7.8 – 8.6</strong></div>
                <div className="biotope-stat"><span>Temp</span><strong>25°C – 28°C</strong></div>
                <div className="biotope-stat"><span>TDS</span><strong>250 – 400 ppm</strong></div>
                <div className="biotope-stat"><span>GH / KH</span><strong>10 – 18 dGH</strong></div>
                <div className="biotope-stat wide"><span>Recommended Tank</span><strong>150L – 300L</strong></div>
              </div>
            </article>

            <article className="biotope-card ancient">
              <div className="biotope-head">
                <span className="biotope-icon"><Waves size={20} /></span>
                <div>
                  <h3>Ancient Monsters</h3>
                  <p>Bichirs & Oscars</p>
                </div>
              </div>
              <div className="biotope-stats">
                <div className="biotope-stat"><span>pH Range</span><strong>6.8 – 7.5</strong></div>
                <div className="biotope-stat"><span>Temp</span><strong>25°C – 29°C</strong></div>
                <div className="biotope-stat"><span>TDS</span><strong>120 – 220 ppm</strong></div>
                <div className="biotope-stat"><span>GH / KH</span><strong>6 – 10 dGH</strong></div>
                <div className="biotope-stat wide"><span>Recommended Tank</span><strong>120L – 350L</strong></div>
              </div>
            </article>

            <article className="biotope-card nano">
              <div className="biotope-head">
                <span className="biotope-icon"><Sparkles size={20} /></span>
                <div>
                  <h3>Nano Desktop</h3>
                  <p>Bettas & Shrimps</p>
                </div>
              </div>
              <div className="biotope-stats">
                <div className="biotope-stat"><span>pH Range</span><strong>6.5 – 7.2</strong></div>
                <div className="biotope-stat"><span>Temp</span><strong>24°C – 28°C</strong></div>
                <div className="biotope-stat"><span>TDS</span><strong>100 – 180 ppm</strong></div>
                <div className="biotope-stat"><span>GH / KH</span><strong>Soft to Moderate</strong></div>
                <div className="biotope-stat wide"><span>Recommended Tank</span><strong>15L – 35L</strong></div>
              </div>
            </article>

            <article className="biotope-card marine">
              <div className="biotope-head">
                <span className="biotope-icon"><Anchor size={20} /></span>
                <div>
                  <h3>Marine Reef</h3>
                  <p>Corals, Wrasses & Clowns</p>
                </div>
              </div>
              <div className="biotope-stats">
                <div className="biotope-stat"><span>pH Range</span><strong>8.1 – 8.4</strong></div>
                <div className="biotope-stat"><span>Temp</span><strong>24°C – 26°C</strong></div>
                <div className="biotope-stat"><span>Salinity</span><strong>1.024 SG</strong></div>
                <div className="biotope-stat"><span>Alkalinity</span><strong>8 – 11 dKH</strong></div>
                <div className="biotope-stat wide"><span>Recommended Tank</span><strong>100L – 250L</strong></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Why Real Plants (merged from Plants page) ===== */}
      <section id="live-plants" className="anchor-section section-padding bg-alt">
        <Bubbles count={10} fishCount={2} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Natural Ecosystems</span>
            <h2>Why Every Tank Needs Real Plants</h2>
            <p>Plastic plants collect detritus and algae. Real plants act as a living bio-filter.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-box"><Droplets size={28} color="var(--primary)" /></div>
              <h4>Natural Nitrate Absorption</h4>
              <p>
                As fish produce waste, live plants consume Ammonia and Nitrate as plant food,
                drastically cutting down water change frequency and preventing cloudy water.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box"><ShieldCheck size={28} color="var(--success)" /></div>
              <h4>Algae Competition</h4>
              <p>
                Rapidly growing plants like Rotala and Java Fern outcompete nuisance hair and green spot
                algae for excess nutrients, keeping your tank glass and hardscape pristine.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box"><Sparkles size={28} color="var(--accent)" /></div>
              <h4>Pure Water Pearling</h4>
              <p>
                Through photosynthesis, submerged foliage breathes in carbon dioxide and releases millions
                of micro-bubbles of pure oxygen directly into the water for active, colorful fish.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box"><Leaf size={28} color="var(--primary-3)" /></div>
              <h4>Natural Stress Reduction</h4>
              <p>
                Dense plant thickets provide security for shy schooling fish, protection for newborn
                shrimp, and natural grazing biofilm for bottom loaches and otocinclus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Aquascaping Styles (merged from Plants page) ===== */}
      <section id="aquascaping" className="anchor-section section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Design Inspirations</span>
            <h2>Aquascaping Layout Styles</h2>
            <p>Choose an aesthetic style that matches your lighting equipment and maintenance routine.</p>
          </div>

          <div className="styles-layout-grid">
            <div className="style-card">
              <div className="style-img">
                <img
                  src="https://images.pexels.com/photos/12829679/pexels-photo-12829679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Dutch Aquascape"
                />
              </div>
              <div className="style-body">
                <h3>The Dutch Aquarium Style</h3>
                <p>
                  Characterized by lush, dense terraces of contrasting foliage colors (reds, olive greens, chartreuse)
                  without using wood or stones. Requires good lighting and trimming patience.
                </p>
                <div className="style-tags">
                  <span>Rotala Red</span>
                  <span>Ludwigia</span>
                  <span>High Tech</span>
                </div>
              </div>
            </div>

            <div className="style-card">
              <div className="style-img">
                <img
                  src="https://images.pexels.com/photos/8970782/pexels-photo-8970782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Nature Aquarium"
                />
              </div>
              <div className="style-body">
                <h3>Nature Aquarium (Amano Style)</h3>
                <p>
                  Pioneered by Takashi Amano, mimicking wild riverbeds and rainforest roots. Features driftwood roots,
                  mosses, and Anubias tied to stone crevices for an ancient submerged look.
                </p>
                <div className="style-tags">
                  <span>Driftwood</span>
                  <span>Anubias Nana</span>
                  <span>Java Fern</span>
                </div>
              </div>
            </div>

            <div className="style-card">
              <div className="style-img">
                <img
                  src="https://images.pexels.com/photos/37796017/pexels-photo-37796017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Iwagumi Layout"
                />
              </div>
              <div className="style-body">
                <h3>Iwagumi Minimalist Scape</h3>
                <p>
                  A Zen Japanese rock garden under water. An odd number of textured Seiryu or Dragon stones surrounded
                  by a continuous, uninterrupted carpet of Monte Carlo or Dwarf Hairgrass.
                </p>
                <div className="style-tags">
                  <span>Monte Carlo</span>
                  <span>Dragon Stone</span>
                  <span>Minimalist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Fertilization & Lighting Guide (merged from Plants page) ===== */}
      <section id="feeding-light" className="anchor-section section-padding bg-alt">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Hobbyist Masterclass</span>
            <h2>Fertilization & Lighting Routine</h2>
            <p>How to prevent yellowing leaves and melt in new planted tanks.</p>
          </div>

          <div className="planting-tips-grid">
            <div className="pt-tip">
              <h4><Layers size={18} /> Substrate & Root Feeding</h4>
              <p>Heavy root feeders (Amazon Swords, Cryptocorynes) absorb minerals through the roots. Use nutrient-rich aquarium soil and insert slow-release root tabs every 3 months.</p>
            </div>
            <div className="pt-tip">
              <h4><Droplets size={18} /> Water Column Dosing</h4>
              <p>Epiphytes like Anubias and Java Fern feed directly from water. Dose comprehensive all-in-one liquid micro-nutrients (potassium, iron, magnesium) weekly after water changes.</p>
            </div>
            <div className="pt-tip">
              <h4><Timer size={18} /> Lighting Photoperiod (6 to 8 Hours)</h4>
              <p>Leaving aquarium lights on for 12+ hours causes explosive algae blooms. Keep your light on a digital timer set to exactly 7 hours daily for balanced photosynthesis.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Combined CTA ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="cta-banner">
            <h2>Building Your Dream Aquarium in Virudhunagar?</h2>
            <p>
              Tell us your tank dimensions and filtration setup. Our aquarists will calculate the exact
              bio-load and recommend companion fish and plants that won't fight or outgrow your aquarium —
              including custom aquascaping packages and planted-tank routines.
            </p>
            <div className="cta-btn-group">
              <button className="btn-primary" onClick={() => navigate("/contact")}>
                Get Free Consultation
              </button>
              <button className="btn-ghost" onClick={() => navigate("/tanks-accessories")}>
                View Rimless Tanks & Lights <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
