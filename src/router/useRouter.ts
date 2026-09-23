import { useState, useEffect, useCallback } from "react";

export type AppRoute =
  | "/"
  | "/login"
  | "/about"
  | "/aquatic-life"
  | "/plants"
  | "/products"
  | "/tanks-accessories"
  | "/services"
  | "/gallery"
  | "/contact"
  | "/cart"
  | "/checkout";

export function getNormalizedRoute(): AppRoute {
  let hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash || hash === "/" || hash === "/home" || hash === "home") {
    return "/";
  }
  if (!hash.startsWith("/")) {
    hash = `/${hash}`;
  }
  // Strip trailing slashes or queries
  const clean = hash.split("?")[0].replace(/\/+$/, "") as AppRoute;
  return clean || "/";
}

export function navigateTo(path: string) {
  const target = path.startsWith("#") ? path : `#${path.startsWith("/") ? path : `/${path}`}`;
  if (window.location.hash === target) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.location.hash = target;
  }
}

export function useRouter() {
  const [route, setRoute] = useState<AppRoute>(getNormalizedRoute);

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = getNormalizedRoute();
      setRoute(newRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    navigateTo(path);
  }, []);

  return { route, navigate };
}
