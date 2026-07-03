export type ProductType = "art_crafts" | "healthy_food" | "cakes";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
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
}

export interface CakeCustomization {
  flavor?: string;
  size?: string;
  design?: string;
  message?: string;
  delivery_date?: string;
  delivery_time?: string;
  special_instructions?: string;
}

export interface CartItem {
  id: string;
  user_id: string | null;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  customization_data: CakeCustomization | null;
  product: Product;
}
