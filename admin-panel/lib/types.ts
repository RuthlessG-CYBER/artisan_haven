export type ProductType = "art_crafts" | "healthy_food" | "cakes";

export interface Category {
  id: string;
  name: string;
  slug: string;
  [key: string]: any;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  product_type: ProductType;
  featured_image: string;
  images: string[];
  category?: Category;
  stock_quantity: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  sustainability_score?: number;
  nutritional_info?: NutritionalInfo;
  ingredients?: string[];
  created_at?: string;
  [key: string]: any;
}

export interface CakeCustomization {
  flavor?: string;
  size?: string;
  design?: string;
  message?: string;
  delivery_date?: string;
  delivery_time?: string;
  special_instructions?: string;
  [key: string]: any;
}

export interface CartItem {
  id: string;
  user_id: string | null;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  customization_data: CakeCustomization | null;
  product: Product;
  name?: string;
  [key: string]: any;
}

export interface Address {
  id: string;
  fullName?: string;
  type?: string;
  isDefault?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  [key: string]: any;
}

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  items: CartItem[];
  shippingAddress?: Address;
  [key: string]: any;
}
