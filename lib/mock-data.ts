import type { Product, ProductType } from "@/lib/types";

const categories = {
  art: { id: "cat-art", name: "Art & Crafts", slug: "art-crafts" },
  decor: { id: "cat-decor", name: "Handcrafted Decor", slug: "handcrafted-decor" },
  recycled: { id: "cat-recycled", name: "Recycled Art", slug: "recycled-art" },
  food: { id: "cat-food", name: "Healthy Foods", slug: "healthy-foods" },
  snacks: { id: "cat-snacks", name: "Organic Snacks", slug: "organic-snacks" },
  baked: { id: "cat-baked", name: "Fresh Baked", slug: "fresh-baked" },
  cakes: { id: "cat-cakes", name: "Custom Cakes", slug: "custom-cakes" },
};

const products: Product[] = [
  {
    id: "p-recycled-glass-vase",
    name: "Recycled Glass Vase",
    slug: "recycled-glass-vase",
    description: "Handblown recycled glass vase with unique swirling patterns. Each piece is one-of-a-kind, crafted from reclaimed glass materials.",
    short_description: "Handblown recycled glass with unique patterns.",
    price: 45,
    compare_at_price: 59.99,
    product_type: "art_crafts",
    featured_image: "https://images.pexels.com/photos/37858501/pexels-photo-37858501.jpeg?w=800",
    images: [
      "https://images.pexels.com/photos/37858501/pexels-photo-37858501.jpeg?w=800",
      "https://images.pexels.com/photos/36646475/pexels-photo-36646475.jpeg?w=800",
      "https://images.pexels.com/photos/8361858/pexels-photo-8361858.jpeg?w=800",
    ],
    category: categories.decor,
    stock_quantity: 15,
    is_featured: true,
    is_best_seller: true,
    sustainability_score: 5,
    created_at: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "p-eco-cotton-wall-art",
    name: "Eco-Cotton Wall Art",
    slug: "eco-cotton-wall-art",
    description: "Beautiful wall art piece made from organic cotton with natural plant-based dyes. Features intricate geometric patterns.",
    short_description: "Organic cotton wall art with natural dyes.",
    price: 89,
    product_type: "art_crafts",
    featured_image: "https://images.pexels.com/photos/1125135/pexels-photo-1125135.jpeg?w=800",
    images: ["https://images.pexels.com/photos/1125135/pexels-photo-1125135.jpeg?w=800"],
    category: categories.recycled,
    stock_quantity: 8,
    is_featured: true,
    sustainability_score: 5,
    created_at: "2026-02-20T10:00:00.000Z",
  },
  {
    id: "p-reclaimed-wood-picture-frame",
    name: "Reclaimed Wood Picture Frame",
    slug: "reclaimed-wood-picture-frame",
    description: "Handcrafted picture frame made from reclaimed barn wood. Each frame has a unique rustic character and finish.",
    short_description: "Rustic frame crafted from reclaimed barn wood.",
    price: 35,
    compare_at_price: 45,
    product_type: "art_crafts",
    featured_image: "https://images.pexels.com/photos/1267347/pexels-photo-1267347.jpeg?w=800",
    images: ["https://images.pexels.com/photos/1267347/pexels-photo-1267347.jpeg?w=800"],
    category: categories.decor,
    stock_quantity: 12,
    is_best_seller: true,
    sustainability_score: 4,
    created_at: "2026-03-10T10:00:00.000Z",
  },
  {
    id: "p-organic-granola-mix",
    name: "Organic Granola Mix",
    slug: "organic-granola-mix",
    description: "Small-batch organic granola with oats, almonds, seeds, and honey. Perfect for breakfast or a healthy snack.",
    short_description: "Crunchy small-batch organic granola.",
    price: 12.99,
    product_type: "healthy_food",
    featured_image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=800",
    images: ["https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=800"],
    category: categories.snacks,
    stock_quantity: 35,
    is_featured: true,
    is_best_seller: true,
    sustainability_score: 4,
    nutritional_info: { calories: 210, protein: "6g", carbs: "28g", fat: "9g", fiber: "5g", sugar: "7g" },
    ingredients: ["Rolled oats", "Almonds", "Pumpkin seeds", "Honey", "Coconut oil"],
    created_at: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "p-fresh-energy-bars",
    name: "Fresh Energy Bars",
    slug: "fresh-energy-bars",
    description: "Naturally sweet energy bars made with dates, nuts, and superfoods. No added sugar, just pure wholesome energy.",
    short_description: "No-bake date and nut energy bars.",
    price: 18.99,
    product_type: "healthy_food",
    featured_image: "https://images.pexels.com/photos/6208140/pexels-photo-6208140.jpeg?w=800",
    images: ["https://images.pexels.com/photos/6208140/pexels-photo-6208140.jpeg?w=800"],
    category: categories.baked,
    stock_quantity: 28,
    is_featured: true,
    sustainability_score: 4,
    nutritional_info: { calories: 160, protein: "4g", carbs: "19g", fat: "8g", fiber: "4g", sugar: "12g" },
    ingredients: ["Dates", "Almonds", "Cacao", "Chia seeds", "Sea salt"],
    created_at: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "p-vegan-protein-cookies",
    name: "Vegan Protein Cookies",
    slug: "vegan-protein-cookies",
    description: "Delicious vegan protein cookies made with plant-based protein, oats, and dark chocolate chips.",
    short_description: "Plant-based protein cookies with chocolate.",
    price: 14.99,
    product_type: "healthy_food",
    featured_image: "https://images.pexels.com/photos/23948783/pexels-photo-23948783.jpeg?w=800",
    images: ["https://images.pexels.com/photos/23948783/pexels-photo-23948783.jpeg?w=800"],
    category: categories.baked,
    stock_quantity: 22,
    is_best_seller: true,
    sustainability_score: 3,
    nutritional_info: { calories: 180, protein: "12g", carbs: "22g", fat: "7g", fiber: "3g", sugar: "8g" },
    ingredients: ["Oat flour", "Pea protein", "Coconut sugar", "Dark chocolate", "Coconut oil"],
    created_at: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "p-vanilla-cake",
    name: "Garden Vanilla Celebration Cake",
    slug: "garden-vanilla-celebration-cake",
    description: "Vanilla layer cake with buttercream flowers and custom messaging.",
    short_description: "Custom vanilla celebration cake with floral buttercream.",
    price: 55,
    compare_at_price: 65,
    product_type: "cakes",
    featured_image: "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?w=800",
    images: ["https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?w=800"],
    category: categories.cakes,
    stock_quantity: 12,
    created_at: "2026-06-10T10:00:00.000Z",
  },
  {
    id: "p-chocolate-cake",
    name: "Chocolate Drip Birthday Cake",
    slug: "chocolate-drip-birthday-cake",
    description: "Rich chocolate sponge, ganache drip, and personalized decoration.",
    short_description: "Rich chocolate birthday cake with ganache drip.",
    price: 72,
    product_type: "cakes",
    featured_image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?w=800",
    images: ["https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?w=800"],
    category: categories.cakes,
    stock_quantity: 9,
    created_at: "2026-05-26T10:00:00.000Z",
  },
];

interface ProductFilters {
  product_type?: ProductType;
  is_featured?: boolean;
  is_best_seller?: boolean;
  limit?: number;
}

export function getProducts(filters: ProductFilters = {}) {
  let results = [...products];

  if (filters.product_type) {
    results = results.filter((product) => product.product_type === filters.product_type);
  }

  if (typeof filters.is_featured === "boolean") {
    results = results.filter((product) => Boolean(product.is_featured) === filters.is_featured);
  }

  if (typeof filters.is_best_seller === "boolean") {
    results = results.filter((product) => Boolean(product.is_best_seller) === filters.is_best_seller);
  }

  if (filters.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}
