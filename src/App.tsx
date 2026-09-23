import { useEffect, useMemo, useRef, useState } from "react";
import {
  Fish, MapPin, ShoppingBag, Waves, Leaf, Anchor,
  ShieldCheck, Sparkles, Camera, Globe, MessageCircle, Menu, X, ShoppingCart,
  History, Flame, Droplets, Phone, Clock, LogOut, LogIn
} from "lucide-react";
import { useRouter } from "./router/useRouter";
import { useStoreData } from "./hooks/useStoreData";
import { useCart } from "./hooks/useCart";
import { AquaLogo } from "./components/AquaLogo";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { GalleryLightbox } from "./components/GalleryLightbox";
import { OrdersTrackerModal } from "./components/OrdersTrackerModal";
import { Bubbles } from "./components/Bubbles";

// Pages
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ProductsPage } from "./pages/ProductsPage";
import { TanksAccessoriesPage } from "./pages/TanksAccessoriesPage";
import { GalleryPage } from "./pages/GalleryPage";
import { ServicesPage } from "./pages/ServicesPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ContactPage } from "./pages/ContactPage";
import { AuthPage } from "./pages/AuthPage";

import type { Product, Order } from "./lib/types";
import { useAuth } from "./hooks/useAuth";
import { syncOfflineOrders } from "./lib/orderSync";

function isStoreCurrentlyOpen(): { isOpen: boolean; text: string } {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const hour = now.getHours() + now.getMinutes() / 60;
  if (day === 0) {
    if (hour >= 10 && hour < 18) {
      return { isOpen: true, text: "Open Now • Closes at 6:00 PM" };
    }
    return { isOpen: false, text: "Closed • Opens Sunday at 10:00 AM" };
  }
  if (hour >= 9.5 && hour < 20.5) {
    return { isOpen: true, text: "Open Now • Closes at 8:30 PM" };
  }
  return { isOpen: false, text: "Closed • Opens tomorrow at 9:30 AM" };
}

export default function App() {
  const { route, navigate } = useRouter();
  const { categories, products, gallery, settings, loading } = useStoreData();
  const cart = useCart();
  const { session, signOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  // Shared Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [ordersTrackerOpen, setOrdersTrackerOpen] = useState(false);

  const storeStatus = useMemo(() => isStoreCurrentlyOpen(), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (session) void syncOfflineOrders(session.user.id);
  }, [session]);

  // Show the background image only on the home page
  useEffect(() => {
    document.body.classList.toggle("home-bg", route === "/");
  }, [route]);

  function notify(msg: string) {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3200);
  }

  function handleAddToCart(prod: Product) {
    cart.addToCart(prod);
    notify(`Added ${prod.name} to cart`);
  }

  function handleQuickBuy(prod: Product) {
    cart.addToCart(prod);
    navigate("/checkout");
  }

  function handleOrderPlaced(order: Order) {
    notify(`Order #${order.order_number} confirmed!`);
  }

  const storeName = settings?.store_name ?? "Sakthi's Aqua Zoo";
  const loc = settings?.location ?? "Virudhunagar";

  // Navbar items (Account page removed — Log out lives in the nav actions)
  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Products", path: "/products" },
    { label: "Services", path: "/services" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
    { label: "Cart", path: "/cart", isCart: true },
    ...(session ? [] : [{ label: "Login / Sign Up", path: "/login" }]),
  ];

  function handleNavClick(path: string) {
    setMobileOpen(false);
    navigate(path);
  }

  async function handleSignOut() {
    setMobileOpen(false);
    notify("Signed out. See you soon!");
    await signOut();
    navigate("/");
  }

  // Render Page Content based on Route
  function renderCurrentPage() {
    switch (route) {
      case "/login":
        return <AuthPage />;
      case "/about":
        return <AboutPage settings={settings} navigate={navigate} />;

      case "/aquatic-life":
      case "/plants":
        // Merged into the Products page — old links land on the full catalog
        return (
          <ProductsPage
            products={products}
            categories={categories}
            onSelectProduct={setDetailProduct}
            onAddToCart={handleAddToCart}
            onQuickBuy={handleQuickBuy}
            navigate={navigate}
          />
        );

      case "/products":
        return (
          <ProductsPage
            products={products}
            categories={categories}
            onSelectProduct={setDetailProduct}
            onAddToCart={handleAddToCart}
            onQuickBuy={handleQuickBuy}
            navigate={navigate}
          />
        );

      case "/tanks-accessories":
        return (
          <TanksAccessoriesPage
            products={products}
            onSelectProduct={setDetailProduct}
            onAddToCart={handleAddToCart}
            onQuickBuy={handleQuickBuy}
            navigate={navigate}
          />
        );

      case "/services":
        return (
          <ServicesPage
            settings={settings}
            notify={notify}
            navigate={navigate}
          />
        );

      case "/gallery":
        return (
          <GalleryPage
            gallery={gallery}
            onOpenLightbox={setLightboxIndex}
            navigate={navigate}
          />
        );

      case "/cart":
        return (
          <CartPage
            cart={cart}
            navigate={navigate}
            notify={notify}
          />
        );

      case "/checkout":
        return (
          <CheckoutPage
            cart={cart}
            onOrderPlaced={handleOrderPlaced}
            onOpenOrderTracker={() => setOrdersTrackerOpen(true)}
            navigate={navigate}
            notify={notify}
          />
        );

      case "/contact":
        return (
          <ContactPage
            settings={settings}
            storeStatus={storeStatus}
            notify={notify}
          />
        );

      case "/":
      default:
        return (
          <HomePage
            products={products}
            categories={categories}
            gallery={gallery}
            settings={settings}
            storeStatus={storeStatus}
            onSelectProduct={setDetailProduct}
            onAddToCart={handleAddToCart}
            onQuickBuy={handleQuickBuy}
            onOpenLightbox={setLightboxIndex}
            navigate={navigate}
          />
        );
    }
  }

  return (
    <>
      {/* ===== Header ===== */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav">
          {/* Round Logo */}
          <a
            href="#/"
            className="brand brand-logo-only"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/");
            }}
            aria-label={`${storeName} - Home`}
            title={`${storeName} - ${loc}`}
          >
            <AquaLogo size={52} />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? route === "/"
                  : route.startsWith(item.path);

              // Cart & Sign-in live in .nav-actions below (keeps the link row clean)
              if (item.isCart || item.path === "/login") return null;

              return (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  className={isActive ? "active-route" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.path);
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="nav-right">
            {/* Action cluster: cart, orders, CTA */}
            <div className="nav-actions">
              {navItems
                .filter((item) => item.isCart)
                .map((item) => {
                  const isActive =
                    item.path === "/"
                      ? route === "/"
                      : route.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      className={`nav-cart ${isActive ? "active-route" : ""}`}
                      onClick={() => handleNavClick(item.path)}
                      aria-label="View shopping cart"
                    >
                      <ShoppingCart size={17} /> Cart
                      {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
                    </button>
                  );
                })}
              <button
                className="nav-orders-btn"
                onClick={() => setOrdersTrackerOpen(true)}
                title="View order history"
              >
                <History size={16} /> My Orders
              </button>
              {!session && (
                <button
                  className="nav-login-btn"
                  onClick={() => handleNavClick("/login")}
                  title="Sign in or create an account"
                >
                  <LogIn size={16} /> Sign In
                </button>
              )}
              {session && (
                <button
                  className="nav-logout-btn"
                  onClick={handleSignOut}
                  title="Sign out of your account"
                >
                  <LogOut size={16} /> Log out
                </button>
              )}
              <button className="nav-cta" onClick={() => handleNavClick("/products")}>
                Shop Collection
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? route === "/"
                : route.startsWith(item.path);

            if (item.isCart) {
              return (
                <button
                  key={item.path}
                  className={`mobile-cart-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleNavClick(item.path)}
                >
                  <ShoppingCart size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} /> Cart
                  {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
                </button>
              );
            }

            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                className={isActive ? "active-mobile-link" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.path);
                }}
              >
                {item.label}
              </a>
            );
          })}

          <button
            className="mobile-cart-btn"
            onClick={() => {
              setMobileOpen(false);
              setOrdersTrackerOpen(true);
            }}
          >
            <History size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} /> My Orders
          </button>

          {session && (
            <button className="mobile-logout-btn" onClick={handleSignOut}>
              <LogOut size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} /> Log out
            </button>
          )}

          <button
            className="mobile-cta"
            onClick={() => handleNavClick("/products")}
          >
            Shop Collection
          </button>
        </div>
      </header>

      {/* ===== Page Content Outlet ===== */}
      <main className="page-main-outlet">
        {renderCurrentPage()}
      </main>

      {/* ===== Global Unified Footer ===== */}
      <footer className="site-footer">
        <Bubbles count={6} fishCount={1} />
        <div className="container">
          <div className="footer-grid">
            {/* Brand blurb */}
            <div>
              <div
                className="footer-brand"
                onClick={() => handleNavClick("/")}
                style={{ cursor: "pointer" }}
              >
                <AquaLogo size={48} />
                <div>
                  <div className="name">{storeName}</div>
                  <div className="loc">{loc}, Tamil Nadu</div>
                </div>
              </div>
              <p className="about-blurb">
                {loc}'s premier sanctuary for 14-day quarantined ornamental fish, snail-free live aquatic plants,
                ultra-clear rimless aquariums, and biological water chemistry consultation.
              </p>
              <div className="socials">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
                <a
                  href="#/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick("/");
                  }}
                  aria-label="Website"
                >
                  <Globe size={18} />
                </a>
                <a
                  href="#/gallery"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick("/gallery");
                  }}
                  aria-label="Photo Gallery"
                >
                  <Camera size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="col">
              <h5>Explore Website</h5>
              <a href="#/" onClick={(e) => { e.preventDefault(); handleNavClick("/"); }}>Home</a>
              <a href="#/about" onClick={(e) => { e.preventDefault(); handleNavClick("/about"); }}>About Our Store</a>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Fish & Live Plants</a>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Aquascaping Essentials</a>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Product Catalog</a>
              <a href="#/tanks-accessories" onClick={(e) => { e.preventDefault(); handleNavClick("/tanks-accessories"); }}>Tanks & Equipment</a>
              <a href="#/services" onClick={(e) => { e.preventDefault(); handleNavClick("/services"); }}>Services & AMC</a>
              <a href="#/gallery" onClick={(e) => { e.preventDefault(); handleNavClick("/gallery"); }}>Display Gallery</a>
              <a href="#/contact" onClick={(e) => { e.preventDefault(); handleNavClick("/contact"); }}>Visit & Contact</a>
            </div>

            {/* Live Stock & Categories */}
            <div className="col">
              <h5>Categories</h5>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Freshwater Fish</a>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Marine & Saltwater</a>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Planted Aquascapes</a>
              <a href="#/tanks-accessories" onClick={(e) => { e.preventDefault(); handleNavClick("/tanks-accessories"); }}>Rimless Glass Tanks</a>
              <a href="#/tanks-accessories" onClick={(e) => { e.preventDefault(); handleNavClick("/tanks-accessories"); }}>Canister Filters</a>
              <a href="#/products" onClick={(e) => { e.preventDefault(); handleNavClick("/products"); }}>Specialized Fish Foods</a>
              <a href="#/services" onClick={(e) => { e.preventDefault(); handleNavClick("/services"); }}>Custom Aquarium Design</a>
            </div>

            {/* Customer Care & Admin */}
            <div className="col">
              <h5>Customer Support</h5>
              <a href="#/contact" onClick={(e) => { e.preventDefault(); handleNavClick("/contact"); }}>Store Hours & Map</a>
              <a href="#/contact" onClick={(e) => { e.preventDefault(); handleNavClick("/contact"); }}>Free Water Testing</a>
              <a href="#/cart" onClick={(e) => { e.preventDefault(); handleNavClick("/cart"); }}>View Shopping Cart</a>
              <button
                className="footer-link-btn"
                onClick={() => setOrdersTrackerOpen(true)}
              >
                Track Your Orders
              </button>
              <a href="#/admin" className="admin-link">
                Admin Portal
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {storeName}, {loc}. All rights reserved.
            </span>
            <span>Dedicated with passion to healthy aquatic life and ethical fishkeeping.</span>
          </div>
        </div>
      </footer>

      {/* ===== Shared Modals ===== */}
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(prod, qty) => {
          for (let i = 0; i < qty; i++) {
            cart.addToCart(prod);
          }
          notify(`Added ${qty} × ${prod.name} to cart`);
        }}
        onBuyNow={(prod, qty) => {
          for (let i = 0; i < qty; i++) {
            cart.addToCart(prod);
          }
          setDetailProduct(null);
          navigate("/checkout");
        }}
      />

      {/* Orders Tracker Modal */}
      <OrdersTrackerModal
        open={ordersTrackerOpen}
        onClose={() => setOrdersTrackerOpen(false)}
      />

      {/* Gallery Lightbox */}
      <GalleryLightbox
        items={gallery}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNext={() =>
          setLightboxIndex((curr) =>
            curr !== null ? (curr + 1) % gallery.length : null
          )
        }
        onPrev={() =>
          setLightboxIndex((curr) =>
            curr !== null ? (curr - 1 + gallery.length) % gallery.length : null
          )
        }
      />

      {/* Toast Notification */}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
