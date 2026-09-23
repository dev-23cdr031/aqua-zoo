import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AdminApp } from "./admin/AdminApp";
import "./index.css";
import "./admin/admin.css";

function getRoute() {
  return window.location.hash.replace(/^#/, "").toLowerCase();
}

function Root() {
  const [route, setRoute] = React.useState(getRoute());

  React.useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route.startsWith("/admin")) {
    return <AdminApp />;
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
