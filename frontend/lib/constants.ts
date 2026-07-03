export const BUSINESS_NAME = "Artisan Haven";
export const BUSINESS_TAGLINE = "Handcrafted with Love, Sustainably Made";
export const BUSINESS_DESCRIPTION = "Handcrafted goods, wholesome food, and custom cakes.";

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Cakes", href: "/cakes" },
  { name: "Healthy Foods", href: "/healthy-foods" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export const PRICE_RANGES: Array<{ label: string; value: [number, number] }> = [
  { label: "Under $25", value: [0, 25] },
  { label: "$25 to $50", value: [25, 50] },
  { label: "$50 to $100", value: [50, 100] },
  { label: "$100 and above", value: [100, 500] },
];

export const NUTRITIONAL_CATEGORIES = [
  { key: "calories", label: "Calories", unit: "kcal per serving" },
  { key: "protein", label: "Protein", unit: "grams" },
  { key: "carbs", label: "Carbs", unit: "grams" },
  { key: "fat", label: "Fat", unit: "grams" },
  { key: "fiber", label: "Fiber", unit: "grams" },
  { key: "sugar", label: "Sugar", unit: "grams" },
];
