// MongoDB-compatible types
export type ProductType = "ART_CRAFTS" | "HEALTHY_FOOD" | "CAKES";
export type OrderStatus = "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "READY_FOR_DISPATCH" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type AddressType = "HOME" | "WORK" | "OTHER";
export type CartStatus = "ACTIVE" | "CONVERTED" | "ABANDONED";
export type PaymentProvider = "RAZORPAY" | "STRIPE" | "CASH_ON_DELIVERY" | "MANUAL";
export type PaymentStatus = "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED";
export type FulfillmentMethod = "SHIPPING" | "PICKUP" | "LOCAL_DELIVERY";
export type InventoryChangeReason = "ORDER_PLACED" | "STOCK_ADDED" | "STOCK_REMOVED" | "RETURN";

// Enum-like objects for runtime use
export const FulfillmentMethod = {
  SHIPPING: "SHIPPING" as const,
  PICKUP: "PICKUP" as const,
  LOCAL_DELIVERY: "LOCAL_DELIVERY" as const,
};

export const PaymentProvider = {
  RAZORPAY: "RAZORPAY" as const,
  STRIPE: "STRIPE" as const,
  CASH_ON_DELIVERY: "CASH_ON_DELIVERY" as const,
  MANUAL: "MANUAL" as const,
};

export const PaymentStatus = {
  PENDING: "PENDING" as const,
  CAPTURED: "CAPTURED" as const,
  FAILED: "FAILED" as const,
  REFUNDED: "REFUNDED" as const,
};

export const OrderStatus = {
  PENDING: "PENDING" as const,
  PAYMENT_PENDING: "PAYMENT_PENDING" as const,
  PAID: "PAID" as const,
  PROCESSING: "PROCESSING" as const,
  READY_FOR_DISPATCH: "READY_FOR_DISPATCH" as const,
  SHIPPED: "SHIPPED" as const,
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY" as const,
  DELIVERED: "DELIVERED" as const,
  CANCELLED: "CANCELLED" as const,
  REFUNDED: "REFUNDED" as const,
};

export const CartStatus = {
  ACTIVE: "ACTIVE" as const,
  CONVERTED: "CONVERTED" as const,
  ABANDONED: "ABANDONED" as const,
};

export const InventoryChangeReason = {
  ORDER_PLACED: "ORDER_PLACED" as const,
  STOCK_ADDED: "STOCK_ADDED" as const,
  STOCK_REMOVED: "STOCK_REMOVED" as const,
  RETURN: "RETURN" as const,
};

export interface Category {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  productType: ProductType;
  featuredImage: string;
  images?: string[];
  categoryId?: string;
  category?: Category;
  stockQuantity: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sustainabilityScore?: number;
  nutrition?: ProductNutrition;
  ingredients?: string[];
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductNutrition {
  calories?: number;
  proteinGram?: number;
  carbsGram?: number;
  fatGram?: number;
  fiberGram?: number;
  sugarGram?: number;
}

export interface UserProfile {
  _id?: string;
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  clerkUserId?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  _id?: string;
  id: string;
  userId: string;
  type: AddressType;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  _id?: string;
  id: string;
  userId?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  customizationData?: Record<string, unknown>;
  unitPrice: number;
  product?: Product;
  status?: CartStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id?: string;
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: FulfillmentMethod;
  currency: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  shippingAddressJson?: Record<string, unknown>;
  billingAddressJson?: Record<string, unknown>;
  items?: OrderItem[];
  payments?: Payment[];
  fulfillments?: Fulfillment[];
  statusHistory?: OrderStatusEvent[];
  placedAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  _id?: string;
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSlug?: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  customizationData?: Record<string, unknown>;
  createdAt?: Date;
}

export interface Payment {
  _id?: string;
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerReference?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  capturedAt?: Date;
  createdAt?: Date;
}

export interface Fulfillment {
  _id?: string;
  id: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryAt?: Date;
  actualDeliveryAt?: Date;
  createdAt?: Date;
}

export interface OrderStatusEvent {
  _id?: string;
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt?: Date;
}

export interface UserSession {
  _id?: string;
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt?: Date;
}

export interface InventoryMovement {
  _id?: string;
  id: string;
  productId: string;
  orderId?: string;
  delta: number;
  reason: InventoryChangeReason;
  createdAt?: Date;
}

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  _id?: string;
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  expiryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInvitation {
  _id?: string;
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

type ProductWithRelations = Product & {
  category?: Category | null;
  images?: string[];
  ingredients?: string[];
  nutrition?: ProductNutrition | null;
};

type CartItemWithProduct = CartItem & {
  product: ProductWithRelations;
};

type OrderWithItems = Order & {
  items: OrderItem[];
};

const PRODUCT_TYPE_TO_FRONTEND: Record<ProductType, "art_crafts" | "healthy_food" | "cakes"> = {
  ART_CRAFTS: "art_crafts",
  HEALTHY_FOOD: "healthy_food",
  CAKES: "cakes",
};

const ORDER_STATUS_TO_FRONTEND: Record<OrderStatus, "pending" | "processing" | "shipped" | "delivered" | "cancelled"> = {
  PENDING: "pending",
  PAYMENT_PENDING: "pending",
  PAID: "processing",
  PROCESSING: "processing",
  READY_FOR_DISPATCH: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
};

export function mapFrontendProductType(productType: string): ProductType | null {
  switch (productType) {
    case "art_crafts":
      return "ART_CRAFTS";
    case "healthy_food":
      return "HEALTHY_FOOD";
    case "cakes":
      return "CAKES";
    default:
      return null;
  }
}

export function serializeCategory(category?: Category | null) {
  if (!category) {
    return undefined;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}

function formatDecimalAsGram(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  return `${Number(value)}g`;
}

export function serializeProduct(product: ProductWithRelations) {
  const imageUrls = product.images?.length
    ? product.images
    : [product.featuredImage];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    short_description: product.shortDescription ?? undefined,
    price: Number(product.price),
    compare_at_price: product.compareAtPrice === null ? undefined : Number(product.compareAtPrice),
    product_type: PRODUCT_TYPE_TO_FRONTEND[product.productType],
    featured_image: product.featuredImage,
    images: imageUrls,
    category: serializeCategory(product.category),
    stock_quantity: product.stockQuantity,
    is_featured: product.isFeatured,
    is_best_seller: product.isBestSeller,
    sustainability_score: product.sustainabilityScore ?? undefined,
    nutritional_info: product.nutrition
      ? {
          calories: product.nutrition.calories ?? undefined,
          protein: formatDecimalAsGram(product.nutrition.proteinGram),
          carbs: formatDecimalAsGram(product.nutrition.carbsGram),
          fat: formatDecimalAsGram(product.nutrition.fatGram),
          fiber: formatDecimalAsGram(product.nutrition.fiberGram),
          sugar: formatDecimalAsGram(product.nutrition.sugarGram),
        }
      : undefined,
    ingredients: product.ingredients ?? undefined,
    created_at: product.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export function serializeAuthUser(profile: UserProfile) {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName ?? "",
    phone: profile.phone ?? undefined,
    role: profile.role ?? "CUSTOMER",
  };
}

function formatAddressType(type: AddressType) {
  switch (type) {
    case "HOME":
      return "Home";
    case "WORK":
      return "Work";
    default:
      return "Other";
  }
}

export function serializeAddress(address: Address) {
  return {
    id: address.id,
    type: formatAddressType(address.type),
    fullName: address.fullName,
    phone: address.phone,
    address: address.line1,
    apartment: address.line2 ?? "",
    city: address.city,
    state: address.state,
    zipCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  return `{${entries
    .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableStringify(nestedValue)}`)
    .join(",")}}`;
}

export function buildCustomizationKey(input: {
  variantId?: string | null;
  customizationData?: Record<string, unknown> | null;
}) {
  if (!input.variantId && !input.customizationData) {
    return "default";
  }

  return stableStringify({
    variant_id: input.variantId ?? null,
    customization_data: input.customizationData ?? null,
  });
}

export function serializeCartItem(item: CartItemWithProduct) {
  return {
    id: item.id,
    user_id: null,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    quantity: item.quantity,
    customization_data: (item.customizationData as Record<string, unknown> | null) ?? null,
    product: serializeProduct(item.product),
  };
}

export function mapOrderStatus(status: OrderStatus) {
  return ORDER_STATUS_TO_FRONTEND[status];
}

export function serializeOrderSummary(order: OrderWithItems) {
  return {
    id: order.orderNumber,
    date: order.placedAt?.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) ?? new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    status: mapOrderStatus(order.status),
    total: Number(order.totalAmount),
    items: order.items.map((item) => ({
      name: item.productName,
      qty: item.quantity,
      price: Number(item.unitPrice) * item.quantity,
    })),
  };
}
