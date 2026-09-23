import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AquaLogo } from "../components/AquaLogo";
import { AuthPage } from "../pages/AuthPage";
import { useAuth } from "../hooks/useAuth";
import { navigateTo } from "../router/useRouter";
import { OrdersManager } from "./OrdersManager";
import { ProductsManager } from "./ProductsManager";
import { CategoriesManager } from "./CategoriesManager";
import { GalleryManager } from "./GalleryManager";
import { EnquiriesManager } from "./EnquiriesManager";
import { StoreSettingsManager } from "./StoreSettingsManager";
import { DashboardManager } from "./DashboardManager";
import { CustomersManager } from "./CustomersManager";
import { Fish, LayoutGrid, Images, Inbox, Settings, LogOut, Package, Users, BarChart3 } from "lucide-react";

type Tab = "dashboard" | "orders" | "products" | "categories" | "gallery" | "enquiries" | "settings" | "customers";

export function AdminApp() {
  const { session, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    if (!loading && session && !isAdmin) navigateTo("/");
  }, [isAdmin, loading, session]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  if (!isAdmin) {
    return <div className="admin-loading"><div className="spinner" /><p>Checking account access...</p></div>;
  }

  const navItems: { key: Tab; label: string; icon: typeof Fish }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "orders", label: "Orders", icon: Package },
    { key: "products", label: "Products", icon: Fish },
    { key: "categories", label: "Categories", icon: LayoutGrid },
    { key: "gallery", label: "Gallery", icon: Images },
    { key: "enquiries", label: "Enquiries", icon: Inbox },
    { key: "settings", label: "Store Settings", icon: Settings },
    { key: "customers", label: "Customers", icon: Users },
  ];

  return (
    <div className="admin-app">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="brand">
            <AquaLogo size={42} />
            <div>
              <div className="name">Sakthi's Aqua Zoo</div>
              <div className="loc">Admin Portal</div>
            </div>
          </div>
          <nav className="admin-nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={tab === item.key ? "active" : ""}
                onClick={() => setTab(item.key)}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="admin-logout-btn" onClick={() => supabase.auth.signOut()}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>
        <main className="admin-main">
          <div className="admin-content">
            {tab === "dashboard" && <DashboardManager />}
            {tab === "orders" && <OrdersManager />}
            {tab === "products" && <ProductsManager />}
            {tab === "categories" && <CategoriesManager />}
            {tab === "gallery" && <GalleryManager />}
            {tab === "enquiries" && <EnquiriesManager />}
            {tab === "settings" && <StoreSettingsManager />}
            {tab === "customers" && <CustomersManager />}
          </div>
        </main>
      </div>
    </div>
  );
}
