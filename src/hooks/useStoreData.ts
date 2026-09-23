import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Product, Category, GalleryItem, StoreSettings } from "../lib/types";
import { defaultCategories, defaultProducts, defaultGallery, defaultSettings } from "../data";

export function useStoreData() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [gallery, setGallery] = useState<GalleryItem[]>(defaultGallery);
  const [settings, setSettings] = useState<StoreSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setCategories(defaultCategories);
        setProducts(defaultProducts);
        setGallery(defaultGallery);
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      try {
        const [catRes, prodRes, galRes, setRes] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase
            .from("products")
            .select("*, categories(*)")
            .eq("is_active", true)
            .order("sort_order"),
          supabase
            .from("gallery")
            .select("*")
            .eq("is_active", true)
            .order("sort_order"),
          supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(),
        ]);

        if (catRes.error) throw catRes.error;
        if (prodRes.error) throw prodRes.error;
        if (galRes.error) throw galRes.error;
        if (setRes.error) throw setRes.error;

        setCategories(catRes.data && catRes.data.length > 0 ? catRes.data : defaultCategories);
        setProducts(prodRes.data && prodRes.data.length > 0 ? prodRes.data : defaultProducts);
        setGallery(galRes.data && galRes.data.length > 0 ? galRes.data : defaultGallery);
        setSettings(setRes.data || defaultSettings);
      } catch (err) {
        console.warn("Could not load Supabase data, falling back to local dataset:", err);
        setCategories(defaultCategories);
        setProducts(defaultProducts);
        setGallery(defaultGallery);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { categories, products, gallery, settings, loading, error };
}
