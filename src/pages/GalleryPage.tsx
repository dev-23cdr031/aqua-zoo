import { useState } from "react";
import { Camera, Eye, Sparkles, Filter, MapPin, ArrowRight } from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import { ProductImage } from "../components/ProductImage";
import type { GalleryItem } from "../lib/types";

interface GalleryPageProps {
  gallery: GalleryItem[];
  onOpenLightbox: (index: number) => void;
  navigate: (path: string) => void;
}

export function GalleryPage({ gallery, onOpenLightbox, navigate }: GalleryPageProps) {
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Planted Scapes", "Marine & Coral", "Monster & Mascots", "Display Tanks"];

  const filteredGallery = gallery.filter((item) => {
    if (filter === "All") return true;
    const text = item.caption.toLowerCase();
    if (filter === "Planted Scapes") return text.includes("planted") || text.includes("scape") || text.includes("plant");
    if (filter === "Marine & Coral") return text.includes("marine") || text.includes("coral") || text.includes("reef");
    if (filter === "Monster & Mascots") return text.includes("bichir") || text.includes("oscar") || text.includes("severum");
    if (filter === "Display Tanks") return text.includes("tank") || text.includes("display") || text.includes("showcase");
    return true;
  });

  return (
    <div className="page-gallery">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={16} fishCount={3} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <Camera size={14} /> Living Art & Underwater Biotopes
            </span>
            <h1>
              Aqua Zoo Photographic <span className="grad">Showcase</span>
            </h1>
            <p className="page-hero-lead">
              Immerse yourself in our display aquascapes, vibrant marine coral setups, and healthy livestock
              quarantine bays photographed on site at our Virudhunagar sanctuary.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><Sparkles size={14} /> Living Biotopes</span>
              <span className="hero-badge-chip"><Eye size={14} /> High-Clarity Displays</span>
              <span className="hero-badge-chip"><Camera size={14} /> 4K Lightbox Zoom</span>
              <span className="hero-badge-chip"><MapPin size={14} /> Live at Virudhunagar</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Gallery Grid & Filters ===== */}
      <section className="section-padding pt-compact">
        <div className="container">
          <div className="tab-switch-bar">
            {categories.map((c) => (
              <button
                key={c}
                className={`tab-btn ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="gallery-meta-row">
            <span className="results-count">
              Showing <strong>{filteredGallery.length}</strong> living displays (Click any photo to view in high resolution)
            </span>
          </div>

          <div className="gallery-grid">
            {filteredGallery.map((g, idx) => {
              // Find index in main gallery array for lightbox
              const originalIndex = gallery.findIndex((item) => item.id === g.id);
              const targetIndex = originalIndex !== -1 ? originalIndex : idx;

              return (
                <div
                  key={g.id}
                  className="g"
                  onClick={() => onOpenLightbox(targetIndex)}
                  title="Click to view full photo"
                >
                  <ProductImage src={g.image_url} alt={g.caption} />
                  <div className="g-overlay">
                    <div className="cap">{g.caption}</div>
                    <div className="g-zoom-ic">
                      <Camera size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Aquascape Transformation Stories (Before & After) ===== */}
      <section className="section-padding bg-alt">
        <Bubbles count={8} fishCount={1} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Aquascaping Evolution</span>
            <h2>From Bare Glass to Living Forest</h2>
            <p>See how our hardscaping balance and submerged plants transform an empty glass box into a thriving ecosystem.</p>
          </div>

          <div className="transformation-grid">
            <div className="trans-card">
              <div className="trans-imgs">
                <div className="trans-frame">
                  <img
                    src="https://images.pexels.com/photos/8970782/pexels-photo-8970782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Hardscape Phase"
                  />
                  <span className="trans-tag">Day 1: Hardscaping</span>
                </div>
                <div className="trans-frame">
                  <img
                    src="https://images.pexels.com/photos/12829679/pexels-photo-12829679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Mature Scape Phase"
                  />
                  <span className="trans-tag">Day 60: Mature Scape</span>
                </div>
              </div>
              <div className="trans-details">
                <h3>60cm Nature Scape: Ancient Riverbank</h3>
                <p>
                  Built with aged Malaysian Driftwood, volcanic Dragon Stone, and a carpet of Monte Carlo.
                  Home to a school of 18 Cardinal Tetras and Amano crystal shrimp.
                </p>
                <div className="trans-specs">
                  <span>Tank: 60x30x36cm Rimless</span>
                  <span>Light: 30W High-PAR LED</span>
                  <span>Filter: 1000 L/h Canister</span>
                </div>
              </div>
            </div>

            <div className="trans-card">
              <div className="trans-imgs">
                <div className="trans-frame">
                  <img
                    src="https://images.pexels.com/photos/37796017/pexels-photo-37796017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Iwagumi Layout"
                  />
                  <span className="trans-tag">Day 1: Golden Ratio</span>
                </div>
                <div className="trans-frame">
                  <img
                    src="https://images.pexels.com/photos/31047030/pexels-photo-31047030.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Established Iwagumi"
                  />
                  <span className="trans-tag">Day 90: Complete Carpet</span>
                </div>
              </div>
              <div className="trans-details">
                <h3>90cm Iwagumi Layout: Zen Mountain Range</h3>
                <p>
                  Features 7 textured Seiryu stones positioned along the golden ratio with an uninterrupted
                  underwater lawn. Flawlessly balanced without a single trace of nuisance algae.
                </p>
                <div className="trans-specs">
                  <span>Tank: 90x45x45cm Opti-White</span>
                  <span>CO2: Pressurized 2 bps</span>
                  <span>Livestock: Harlequin Rasboras</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Community Showcase ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Hobbyist Community</span>
            <h2>Client Aquariums Across South Tamil Nadu</h2>
            <p>Photographs sent by happy fish keepers whose tanks were planned, scaped, or stocked by Sakthi's Aqua Zoo.</p>
          </div>

          <div className="community-showcase-grid">
            <div className="community-card">
              <img
                src="https://images.pexels.com/photos/18435511/pexels-photo-18435511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Client Cichlid Setup"
              />
              <div className="community-info">
                <h4>Red Oscar Specimen Tank (300L)</h4>
                <p>Dr. Sundararajan, Virudhunagar</p>
                <small>"Healthy fish, peaceful demeanor, and crystal-clear water after following Sakthi's filtration advice."</small>
              </div>
            </div>

            <div className="community-card">
              <img
                src="https://images.pexels.com/photos/31807563/pexels-photo-31807563.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Golden Severum Community"
              />
              <div className="community-info">
                <h4>Golden Severum & Discus Biotope</h4>
                <p>Rajesh Kannan, Sivakasi</p>
                <small>"The Golden Severum purchased 8 months ago has doubled in size with radiant gold colors."</small>
              </div>
            </div>

            <div className="community-card">
              <img
                src="https://images.pexels.com/photos/14867656/pexels-photo-14867656.png?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Villa Koi Pond"
              />
              <div className="community-info">
                <h4>Outdoor Japanese Koi Pond</h4>
                <p>Meenakshi Sundaram, Madurai</p>
                <small>"Aqua Zoo designed the bio-sponge and vortex filtration. Zero green water even under full sunlight."</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== CTA ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="cta-banner">
            <h2>Want a Show-Stopping Aquarium in Your Living Room?</h2>
            <p>
              Visit our store to see these aquascapes in real life, or speak with our scaping team
              to build a custom display for your home or office.
            </p>
            <div className="cta-btn-group">
              <button className="btn-primary" onClick={() => navigate("/services")}>
                View Custom Services <ArrowRight size={18} />
              </button>
              <button className="btn-ghost" onClick={() => navigate("/contact")}>
                <MapPin size={18} /> Visit Our Showroom
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
