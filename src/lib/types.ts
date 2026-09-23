export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  unit: string;
  description: string;
  tag: string | null;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  categories?: Category;
  scientific_name?: string;
  care_level?: "Easy" | "Intermediate" | "Expert";
  water_type?: "Freshwater" | "Marine" | "Brackish" | "Planted";
  temperament?: "Peaceful" | "Semi-Aggressive" | "Aggressive" | "Schooling";
  temp_range?: string;
  ph_range?: string;
  min_tank_size?: string;
  diet?: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  is_active: boolean;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  location: string;
  address: string;
  phone: string;
  email: string | null;
  hours: string;
  stat_species: number;
  stat_plants: number;
  stat_years: number;
  announcement?: string;
  whatsapp_number?: string;
}

export interface Enquiry {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  message: string | null;
  status: string;
  created_at: string;
  products?: Product;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id?: string | null;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: string;
  city: string;
  postal_code?: string | null;
  order_notes?: string | null;
  items: OrderItem[];
  subtotal_amount: number;
  shipping_fee: number;
  total_amount: number;
  delivery_method: "home_delivery" | "store_pickup";
  payment_method: "cod" | "upi_on_delivery" | "store_pickup";
  payment_status: "pending" | "paid" | "failed";
  order_status: "pending" | "confirmed" | "processing" | "ready" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
  sync_status?: "pending" | "synced";
}
