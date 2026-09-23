import {
  ShieldCheck, Award, Heart, Sparkles, CheckCircle2, Clock, Users,
  Waves, Leaf, Microscope, Droplets, ArrowRight, MapPin, Phone
} from "lucide-react";
import { Bubbles } from "../components/Bubbles";
import type { StoreSettings } from "../lib/types";
import { storeTimeline, storeTeam } from "../data";

interface AboutPageProps {
  settings: StoreSettings | null;
  navigate: (path: string) => void;
}

export function AboutPage({ settings, navigate }: AboutPageProps) {
  const storeName = settings?.store_name ?? "Sakthi's Aqua Zoo";
  const loc = settings?.location ?? "Virudhunagar";

  return (
    <div className="page-about">
      {/* ===== Page Banner Header ===== */}
      <section className="page-hero">
        <Bubbles count={16} fishCount={3} />
        <div className="container">
          <div className="page-hero-content">
            <span className="eyebrow">
              <Sparkles size={14} /> Established 2017 • {loc}, Tamil Nadu
            </span>
            <h1>
              Our Story, Mission & <span className="grad">Aquatic Passion</span>
            </h1>
            <p className="page-hero-lead">
              From a dedicated enthusiast’s breeding sanctuary to {loc}’s premier destination for
              quarantined ornamental fish, thriving aquatic plants, and bespoke natural aquascapes.
            </p>
            <div className="hero-badge-strip">
              <span className="hero-badge-chip"><ShieldCheck size={14} /> 14-Day Quarantine Assured</span>
              <span className="hero-badge-chip"><Leaf size={14} /> 100% Snail-Free Plants</span>
              <span className="hero-badge-chip"><Award size={14} /> 1,200+ Scapes Installed</span>
              <span className="hero-badge-chip"><Droplets size={14} /> Free Parameter Testing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 1: The Aqua Zoo Story ===== */}
      <section className="section-padding pt-compact">
        <div className="container">
          <div className="about-split-grid">
            <div className="about-media-col">
              <div className="about-img-frame">
                <img
                  src="https://images.pexels.com/photos/12829679/pexels-photo-12829679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Aqua Zoo Display Tank"
                />
                <div className="about-floating-badge">
                  <strong>8+ Years</strong>
                  <span>Serving Hobbyists</span>
                </div>
              </div>
              <div className="sub-img-grid">
                <img
                  src="https://images.pexels.com/photos/31956913/pexels-photo-31956913.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Albino Bichir in Acclimatisation"
                />
                <img
                  src="https://images.pexels.com/photos/8970782/pexels-photo-8970782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Planted aquascape layout"
                />
              </div>
            </div>

            <div className="about-text-col">
              <span className="kicker">The Founding Story</span>
              <h2>Born from an Uncompromising Love for Aquatic Life</h2>
              <p>
                In 2017, {storeName} was founded with one clear conviction: fish keepers in {loc} deserved
                better than stressed, unquarantined livestock that perished days after arriving home.
              </p>
              <p>
                What began as a modest room with 10 acclimatisation tanks quickly grew into a revered sanctuary.
                We studied species compatibility, invested in computerized water parameter analyzers, and
                developed our signature 14-day prophylactic holding protocols.
              </p>
              <p>
                Our emblem proudly honors our three original cornerstone species: the prehistoric <strong>Albino Bichir</strong>,
                the intelligent <strong>Red Tiger Oscar</strong>, and the graceful <strong>Golden Severum</strong>.
                Today, we have expanded to over 140+ freshwater and marine varieties and 55+ cultivated aquatic plants.
              </p>

              <div className="story-highlights-list">
                <div className="story-highlight-item">
                  <CheckCircle2 size={20} color="var(--primary)" />
                  <span>Strict 14-day parasite and disease quarantine for all new arrivals</span>
                </div>
                <div className="story-highlight-item">
                  <CheckCircle2 size={20} color="var(--primary)" />
                  <span>Zero pest snails guarantee across all live aquatic plants</span>
                </div>
                <div className="story-highlight-item">
                  <CheckCircle2 size={20} color="var(--primary)" />
                  <span>Free life-of-tank water testing and hobbyist mentorship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section 2: Mission, Vision & Core Values ===== */}
      <section className="section-padding bg-alt">
        <Bubbles count={8} fishCount={1} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Core Principles</span>
            <h2>Mission, Vision & Values</h2>
            <p>The foundations guiding every tank we scape and every fish we nurture.</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="val-icon"><Heart size={30} color="var(--accent-red)" /></div>
              <h3>Our Mission</h3>
              <p>
                To enrich households and spaces in {loc} with peaceful, thriving aquatic ecosystems by providing
                scientifically quarantined livestock, pest-free flora, and genuine hobbyist education.
              </p>
            </div>

            <div className="value-card">
              <div className="val-icon"><Sparkles size={30} color="var(--primary)" /></div>
              <h3>Our Vision</h3>
              <p>
                To become South India’s most trusted center for ethical ornamental aquaculture, sustainable reef keeping,
                and innovative nature aquascaping design.
              </p>
            </div>

            <div className="value-card">
              <div className="val-icon"><ShieldCheck size={30} color="var(--accent)" /></div>
              <h3>Ethical Sourcing</h3>
              <p>
                We strictly partner with certified captive-breeders and sustainable fisheries, actively opposing
                destructive harvesting and cruel livestock transportation methods.
              </p>
            </div>

            <div className="value-card">
              <div className="val-icon"><Droplets size={30} color="var(--primary-3)" /></div>
              <h3>Water Chemistry First</h3>
              <p>
                We believe that clean water creates thriving life. We mentor hobbyists on the biological nitrogen
                cycle before selling fish, ensuring healthy, crash-free tanks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section 3: Facilities & Technical Infrastructure ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Behind the Glass</span>
            <h2>Our Facilities & Laboratory Standards</h2>
            <p>Take a look inside our quarantine and cultivation infrastructure in {loc}.</p>
          </div>

          <div className="facilities-grid">
            <div className="facility-card">
              <div className="facility-head">
                <Microscope size={24} className="fac-icon" />
                <h4>40+ Isolated Acclimatisation Vats</h4>
              </div>
              <p>
                Every incoming batch of fish is held in completely isolated filtration loops to eliminate any risk of cross-contamination.
                Specimens receive prophylactic antiparasitic salt dips and gut-health conditioning.
              </p>
            </div>

            <div className="facility-card">
              <div className="facility-head">
                <Waves size={24} className="fac-icon" />
                <h4>Computerized Water Testing Lab</h4>
              </div>
              <p>
                Our testing station features calibrated digital pH meters, dual-range TDS pens, and spectrophotometric reagents.
                We evaluate Ammonia, Nitrite, Nitrate, GH, KH, and dissolved oxygen with lab precision.
              </p>
            </div>

            <div className="facility-card">
              <div className="facility-head">
                <Leaf size={24} className="fac-icon" />
                <h4>Submerged Plant Nursery</h4>
              </div>
              <p>
                Live plants are held under specialized high-PAR LED arrays with pressurized CO2 and gentle potassium dosing.
                Each plant is inspected under magnification to guarantee 100% snail- and algae-free delivery.
              </p>
            </div>

            <div className="facility-card">
              <div className="facility-head">
                <ShieldCheck size={24} className="fac-icon" />
                <h4>Medical-Grade Oxygen Packaging</h4>
              </div>
              <p>
                When you purchase fish or order delivery in {loc}, livestock are sealed in heavy double-wall bags charged with pure
                medical-grade oxygen and insulated temperature packaging for stress-free transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section 4: Timeline ===== */}
      <section className="section-padding bg-alt">
        <Bubbles count={10} fishCount={2} />
        <div className="container">
          <div className="section-head">
            <span className="kicker">Our Journey</span>
            <h2>Milestones in Aqua Zoo History</h2>
            <p>From a passion project in 2017 to the leading aquatic sanctuary in {loc}.</p>
          </div>

          <div className="timeline-container">
            {storeTimeline.map((item, idx) => (
              <div key={item.year} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-year-pill">{item.year}</div>
                <div className="timeline-card">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <div className="timeline-milestone">
                    <Award size={14} /> <strong>Milestone:</strong> {item.milestone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section 5: Meet the Aquarists ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head">
            <span className="kicker">The Team</span>
            <h2>Meet Our Lead Aquarists</h2>
            <p>Experienced biologists and scaping masters devoted to your aquarium success.</p>
          </div>

          <div className="team-grid">
            {storeTeam.map((member) => (
              <div key={member.name} className="team-card">
                <div className="team-avatar-initial">{member.name.charAt(0)}</div>
                <h3>{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <span className="team-exp">{member.experience}</span>
                <div className="team-specialty">
                  <strong>Specialty:</strong> {member.specialty}
                </div>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== Section 6: Achievements & Guarantees ===== */}
      <section className="section-padding bg-alt">
        <div className="container">
          <div className="achievements-banner">
            <div className="achieve-stat">
              <span className="num">1,200+</span>
              <span className="label">Aquariums Installed</span>
            </div>
            <div className="achieve-stat">
              <span className="num">4,500+</span>
              <span className="label">Free Water Tests Done</span>
            </div>
            <div className="achieve-stat">
              <span className="num">140+</span>
              <span className="label">Species in Rotation</span>
            </div>
            <div className="achieve-stat">
              <span className="num">100%</span>
              <span className="label">Live Arrival Guarantee</span>
            </div>
          </div>

          <div className="guarantees-grid">
            <div className="guarantee-box">
              <Award size={28} className="guar-icon" />
              <h4>Regional Expo Recognition</h4>
              <p>Recognized at Tamil Nadu Aquatic Hobbyist Summits for outstanding livestock vitality and community service.</p>
            </div>
            <div className="guarantee-box">
              <Clock size={28} className="guar-icon" />
              <h4>7-Day Acclimation Support</h4>
              <p>If you encounter unexpected water issues within 7 days of introducing new fish, call us for immediate diagnostic support.</p>
            </div>
            <div className="guarantee-box">
              <Users size={28} className="guar-icon" />
              <h4>Community Workshops</h4>
              <p>We host monthly weekend workshops for budding junior aquarists on plant trimming, water cycling, and nano tanks.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="aquatic-divider" />

      {/* ===== CTA ===== */}
      <section className="section-padding">
        <div className="container">
          <div className="cta-banner">
            <h2>Experience Sakthi's Aqua Zoo in Person</h2>
            <p>
              Drop by our store on KVS Street, Virudhunagar to see our living displays, meet our team,
              or test your tank water.
            </p>
            <div className="cta-btn-group">
              <button className="btn-primary" onClick={() => navigate("/contact")}>
                <MapPin size={18} /> Store Location & Hours
              </button>
              <button className="btn-ghost" onClick={() => navigate("/products")}>
                Browse Our Catalog <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
