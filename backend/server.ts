import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env") });
import fastify from "fastify";
import fastifySensible from "@fastify/sensible";
import fastifyCors from "@fastify/cors";
import crypto from "node:crypto";
import Stripe from "stripe";
import {
  prisma,
  normalizeEmail,
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashSessionToken,
  serializeAuthUser,
  serializeAddress,
  serializeProduct,
  serializeOrderSummary,
  mapOrderStatus,
  mapFrontendProductType,
} from "@artisan-haven/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-03-31.basil" as any });
const app = fastify({ logger: true, trustProxy: true });

app.register(fastifySensible);
app.register(fastifyCors, {
  origin: [process.env.CORS_ORIGIN || "http://localhost:3000"],
  credentials: true,
});

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 60_000;

app.addHook("onRequest", async (request, reply) => {
  const key = request.ip;
  const now = Date.now();
  let entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(key, entry);
  }
  entry.count++;
  reply.header("X-RateLimit-Limit", RATE_LIMIT_MAX);
  reply.header("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX - entry.count));
  reply.header("X-RateLimit-Reset", Math.ceil((entry.resetAt - now) / 1000));
  if (entry.count > RATE_LIMIT_MAX) {
    reply.header("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    throw app.httpErrors.tooManyRequests("Rate limit exceeded");
  }
});

const publicPrefixes = ["/", "/health", "/catalog", "/auth", "/orders/track", "/payments/stripe/config", "/payments/stripe/webhook"];

app.addHook("onRequest", async (request, reply) => {
  const pathname = request.url.split("?")[0] ?? "/";
  if (publicPrefixes.some((p) => pathname.startsWith(p))) return;
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) throw app.httpErrors.unauthorized("Missing bearer token.");
  
  const session = await prisma.userSession.findFirst({
    where: { 
      tokenHash: hashSessionToken(auth.replace("Bearer ", "")), 
      revokedAt: null, 
      expiresAt: { gt: new Date() } 
    },
    include: { user: true }
  });
  if (!session) throw app.httpErrors.unauthorized("Session invalid or expired.");
  request.headers["x-user-id"] = session.userId;
  request.headers["x-user-email"] = session.user.email;
  request.headers["x-user-role"] = session.user.role || "CUSTOMER";
});

app.get("/", async () => ({ service: "artisan-haven", status: "ok", uptime: process.uptime() }));
app.get("/health", async () => ({ service: "artisan-haven", status: "ok" }));

function now() { return new Date(); }
function daysFromNow(d: number) { return new Date(Date.now() + d * 864e5); }
function getUserId(r: fastify.FastifyRequest) {
  const uid = r.headers["x-user-id"];
  if (typeof uid !== "string") throw app.httpErrors.unauthorized("Auth required");
  return uid;
}

app.get("/catalog/products", async (request) => {
  const q = request.query as Record<string, string>;
  const filter: any = {};
  if (q.product_type) { const m = mapFrontendProductType(q.product_type); if (m) filter.productType = m; }
  if (q.is_featured === "true") filter.isFeatured = true;
  if (q.is_best_seller === "true") filter.isBestSeller = true;
  if (q.in_stock === "true") filter.stockQuantity = { gt: 0 };
  if (q.search) filter.OR = [{ name: { contains: q.search, mode: "insensitive" } }, { description: { contains: q.search, mode: "insensitive" } }];
  if (q.min_price || q.max_price) { filter.price = {}; if (q.min_price) filter.price.gte = Number(q.min_price); if (q.max_price) filter.price.lte = Number(q.max_price); }
  const sort: any = {};
  switch (q.sort) { case "price_asc": sort.price = "asc"; break; case "price_desc": sort.price = "desc"; break; case "popular": sort.isBestSeller = "desc"; break; default: sort.createdAt = "desc"; }
  const limit = Math.min(Number(q.limit) || 50, 100);
  const skip = Math.max(Number(q.offset) || 0, 0);
  
  const products = await prisma.product.findMany({
    where: filter,
    orderBy: sort,
    skip,
    take: limit,
    include: { category: true, nutrition: true }
  });
  const total = await prisma.product.count({ where: filter });
  return { data: products.map(serializeProduct as any), total, limit, offset: skip };
});

app.get("/catalog/products/:slug", async (request) => {
  const { slug } = request.params as { slug: string };
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, nutrition: true }
  });
  if (!product) throw app.httpErrors.notFound("Product not found");
  return { data: serializeProduct(product as any) };
});

app.post("/catalog/products", async (request, reply) => {
  const body = request.body as Record<string, unknown>;
  const products = Array.isArray(body) ? body : [body];
  const inserted: any[] = [];
  for (const item of products) {
    const rawType = item.productType || item.product_type;
    const productType = rawType === "ART_CRAFTS" || rawType === "art_crafts" ? "ART_CRAFTS" : rawType === "HEALTHY_FOOD" || rawType === "healthy_food" ? "HEALTHY_FOOD" : rawType === "CAKES" || rawType === "cakes" ? "CAKES" : "ART_CRAFTS";
    const id = (item.id as string) || crypto.randomUUID();
    const slug = (item.slug as string) || id;
    const c = item.category as Record<string, unknown> | undefined;
    let categoryId = undefined;
    if (c) {
      const catId = (c.id as string) || crypto.randomUUID();
      await prisma.category.upsert({
        where: { id: catId },
        update: { name: (c.name as string) || "", slug: (c.slug as string) || "" },
        create: { id: catId, name: (c.name as string) || "", slug: (c.slug as string) || "" }
      });
      categoryId = catId;
    }
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: (item.name || item.product_name || "") as string,
        description: (item.description as string) || undefined,
        shortDescription: (item.short_description || item.shortDescription) as string | undefined,
        price: Number(item.price) || 0,
        compareAtPrice: item.compare_at_price || item.compareAtPrice ? Number(item.compare_at_price || item.compareAtPrice) : null,
        productType,
        featuredImage: (item.featured_image || item.featuredImage || item.image || "") as string,
        images: (item.images as string[]) || [],
        categoryId,
        stockQuantity: Number(item.stock_quantity ?? item.stockQuantity ?? 0),
        isFeatured: Boolean(item.is_featured ?? item.isFeatured),
        isBestSeller: Boolean(item.is_best_seller ?? item.isBestSeller),
        sustainabilityScore: item.sustainability_score || item.sustainabilityScore ? Number(item.sustainability_score || item.sustainabilityScore) : null,
        ingredients: (item.ingredients as string[]) || [],
      },
      create: {
        id,
        slug,
        name: (item.name || item.product_name || "") as string,
        description: (item.description as string) || undefined,
        shortDescription: (item.short_description || item.shortDescription) as string | undefined,
        price: Number(item.price) || 0,
        compareAtPrice: item.compare_at_price || item.compareAtPrice ? Number(item.compare_at_price || item.compareAtPrice) : null,
        productType,
        featuredImage: (item.featured_image || item.featuredImage || item.image || "") as string,
        images: (item.images as string[]) || [],
        categoryId,
        stockQuantity: Number(item.stock_quantity ?? item.stockQuantity ?? 0),
        isFeatured: Boolean(item.is_featured ?? item.isFeatured),
        isBestSeller: Boolean(item.is_best_seller ?? item.isBestSeller),
        sustainabilityScore: item.sustainability_score || item.sustainabilityScore ? Number(item.sustainability_score || item.sustainabilityScore) : null,
        ingredients: (item.ingredients as string[]) || [],
      },
      include: { category: true, nutrition: true }
    });
    const n = (item.nutritional_info || item.nutrition || item.nutritionInfo) as Record<string, unknown> | undefined;
    if (n) {
      await prisma.productNutrition.upsert({
        where: { productId: product.id },
        update: { calories: Number(n.calories) || null, proteinGram: parseGram(n.protein), carbsGram: parseGram(n.carbs), fatGram: parseGram(n.fat), fiberGram: parseGram(n.fiber), sugarGram: parseGram(n.sugar) },
        create: { productId: product.id, calories: Number(n.calories) || null, proteinGram: parseGram(n.protein), carbsGram: parseGram(n.carbs), fatGram: parseGram(n.fat), fiberGram: parseGram(n.fiber), sugarGram: parseGram(n.sugar) }
      });
    }
    inserted.push(serializeProduct(product as any));
  }
  reply.code(201);
  return { data: inserted.length === 1 ? inserted[0] : inserted };
});

function parseGram(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[^0-9.]/g, "");
  return s ? Number(s) : null;
}

app.post("/auth/register", async (request, reply) => {
  const { firstName, lastName, email, phone, password } = request.body as any;
  if (!firstName?.trim() || !lastName?.trim() || !email || !password) throw app.httpErrors.badRequest("Missing required fields");
  if (password.length < 8) throw app.httpErrors.badRequest("Password must be at least 8 characters");
  const normalizedEmail = normalizeEmail(email);
  if (await prisma.userProfile.findUnique({ where: { email: normalizedEmail } })) throw app.httpErrors.conflict("Email already registered");
  
  const profile = await prisma.userProfile.create({
    data: {
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || undefined,
      role: "CUSTOMER",
    }
  });
  await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
    }
  });
  
  const token = createSessionToken();
  await prisma.userSession.create({
    data: {
      userId: profile.id,
      tokenHash: hashSessionToken(token),
      expiresAt: daysFromNow(7),
    }
  });
  
  reply.code(201);
  return { data: { user: serializeAuthUser(profile as any), token } };
});

app.post("/auth/login", async (request) => {
  const { email, password } = request.body as any;
  if (!email || !password) throw app.httpErrors.badRequest("Email and password are required");
  const normalizedEmail = normalizeEmail(email);
  const profile = await prisma.userProfile.findUnique({ where: { email: normalizedEmail } });
  if (!profile) throw app.httpErrors.unauthorized("Invalid email or password");
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !verifyPassword(password, user.passwordHash)) throw app.httpErrors.unauthorized("Invalid email or password");
  
  const token = createSessionToken();
  await prisma.userSession.create({
    data: {
      userId: profile.id,
      tokenHash: hashSessionToken(token),
      expiresAt: daysFromNow(7),
    }
  });
  return { data: { user: serializeAuthUser(profile as any), token } };
});

app.post("/auth/logout", async (request) => {
  const auth = request.headers.authorization;
  if (auth?.startsWith("Bearer ")) { 
    await prisma.userSession.updateMany({
      where: { tokenHash: hashSessionToken(auth.replace("Bearer ", "")), revokedAt: null },
      data: { revokedAt: now() }
    });
  }
  return { data: { message: "Logged out successfully" } };
});

app.get("/customers/cart", async (request) => {
  const userId = getUserId(request);
  const items = await prisma.cartItem.findMany({
    where: { userId, status: "ACTIVE" },
    include: { product: { include: { category: true, nutrition: true } } }
  });
  return { 
    data: items.map(item => ({ 
      id: item.id, 
      user_id: userId, 
      product_id: item.productId, 
      variant_id: item.variantId ?? null, 
      quantity: item.quantity, 
      customization_data: item.customizationData ?? null, 
      product: serializeProduct(item.product as any) 
    })) 
  };
});

app.post("/customers/cart/items", async (request, reply) => {
  const userId = getUserId(request);
  const { productId, quantity, customizationData } = request.body as any;
  if (!productId || !quantity) throw app.httpErrors.badRequest("Product ID and quantity are required");
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw app.httpErrors.notFound("Product not found");
  
  const existing = await prisma.cartItem.findFirst({ where: { userId, productId, status: "ACTIVE" } });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        productId,
        variantId: null,
        quantity,
        customizationData: customizationData ?? null,
        unitPrice: product.price,
        status: "ACTIVE"
      }
    });
  }
  reply.code(201);
  return { data: { message: "Item added to cart" } };
});

app.patch("/customers/cart/items/:itemId", async (request) => {
  const userId = getUserId(request);
  const { itemId } = request.params as { itemId: string };
  const { quantity } = request.body as { quantity: number };
  if (quantity < 1) throw app.httpErrors.badRequest("Quantity must be at least 1");
  const r = await prisma.cartItem.updateMany({
    where: { id: itemId, userId, status: "ACTIVE" },
    data: { quantity }
  });
  if (r.count === 0) throw app.httpErrors.notFound("Cart item not found");
  return { data: { message: "Cart item updated" } };
});

app.delete("/customers/cart/items/:itemId", async (request) => {
  const userId = getUserId(request);
  const { itemId } = request.params as { itemId: string };
  const r = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId, status: "ACTIVE" }
  });
  if (r.count === 0) throw app.httpErrors.notFound("Cart item not found");
  return { data: { message: "Item removed from cart" } };
});

app.get("/customers/addresses", async (request) => {
  const userId = getUserId(request);
  const addresses = await prisma.address.findMany({ where: { userId } });
  return { data: addresses.map(serializeAddress as any) };
});

app.post("/customers/addresses", async (request, reply) => {
  const userId = getUserId(request);
  const body = request.body as Record<string, unknown>;
  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({
    data: {
      userId,
      type: (body.type as string) || "HOME",
      fullName: body.fullName as string,
      phone: body.phone as string,
      line1: body.address as string,
      line2: (body.apartment as string) || null,
      city: body.city as string,
      state: body.state as string,
      postalCode: body.zipCode as string,
      country: (body.country as string) || "United States",
      isDefault: Boolean(body.isDefault)
    }
  });
  reply.code(201);
  return { data: serializeAddress(address as any) };
});

app.delete("/customers/addresses/:addressId", async (request) => {
  const userId = getUserId(request);
  const { addressId } = request.params as { addressId: string };
  const r = await prisma.address.deleteMany({ where: { id: addressId, userId } });
  if (r.count === 0) throw app.httpErrors.notFound("Address not found");
  return { data: { message: "Address deleted" } };
});

app.get("/customers/profile", async (request) => {
  const userId = getUserId(request);
  const profile = await prisma.userProfile.findUnique({ where: { id: userId } });
  if (!profile) throw app.httpErrors.notFound("Profile not found");
  return { data: serializeAuthUser(profile as any) };
});

app.patch("/customers/profile", async (request) => {
  const userId = getUserId(request);
  const body = request.body as Partial<Record<string, string>>;
  const update: any = {};
  if (body.firstName) update.firstName = body.firstName;
  if (body.lastName) update.lastName = body.lastName;
  if (body.phone) update.phone = body.phone;
  await prisma.userProfile.update({ where: { id: userId }, data: update });
  return { data: { message: "Profile updated" } };
});

function generateOrderNumber() { const ts = Date.now().toString().slice(-8); const rand = crypto.randomBytes(3).toString("hex").toUpperCase(); return `ORD-${ts}-${rand}`; }
function calcShipping(subtotal: number, method: string) { return method === "express" ? 9.99 : subtotal >= 50 ? 0 : 5.99; }
function calcTax(subtotal: number) { return Math.round(subtotal * 0.08 * 100) / 100; }
function calcTotal(subtotal: number, shipping: number, tax: number) { return Math.round((subtotal + shipping + tax) * 100) / 100; }

app.get("/orders/orders", async (request) => {
  const userId = getUserId(request);
  const q = request.query as Record<string, string>;
  const filter: any = { userId };
  if (q.status) filter.status = q.status.toUpperCase();
  const limit = Math.min(Number(q.limit) || 20, 100);
  const skip = Math.max(Number(q.offset) || 0, 0);
  
  const orders = await prisma.order.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: { items: true }
  });
  const total = await prisma.order.count({ where: filter });
  return { data: orders.map((o) => serializeOrderSummary(o as any)), total, limit, offset: skip };
});

app.get("/orders/orders/:orderNumber", async (request) => {
  const userId = getUserId(request);
  const { orderNumber } = request.params as { orderNumber: string };
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payments: true, fulfillments: true }
  });
  if (!order || order.userId !== userId) throw app.httpErrors.notFound("Order not found");
  
  return { 
    data: { 
      ...serializeOrderSummary(order as any), 
      payments: order.payments.map((p) => ({ id: p.id, provider: p.provider, status: p.status, amount: p.amount, currency: p.currency, capturedAt: p.capturedAt?.toISOString() })), 
      shippingAddress: order.shippingAddressJson, 
      billingAddress: order.billingAddressJson, 
      fulfillmentMethod: order.fulfillmentMethod, 
      notes: order.notes 
    } 
  };
});

app.post("/orders/orders", async (request, reply) => {
  const userId = getUserId(request);
  const body = request.body as Record<string, unknown>;
  const shippingInfo = body.shippingInfo as Record<string, string> | undefined;
  const deliveryMethod = (body.deliveryMethod as string) || "standard";
  const paymentMethod = (body.paymentMethod as string) || "cash_on_delivery";
  const saveInfo = Boolean(body.saveInfo);
  
  const cartItems = await prisma.cartItem.findMany({ where: { userId, status: "ACTIVE" } });
  if (cartItems.length === 0) throw app.httpErrors.badRequest("Cart is empty");
  
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const n = now();
  const items = cartItems.map((ci) => ({ 
    id: crypto.randomUUID(), 
    productId: ci.productId, 
    productName: ci.productId, 
    unitPrice: ci.unitPrice, 
    quantity: ci.quantity, 
    customizationData: ci.customizationData ?? undefined 
  }));
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = calcTotal(subtotal, shippingFee, taxAmount);
  const fulfillmentMethod = deliveryMethod === "pickup" ? "PICKUP" : deliveryMethod === "local" ? "LOCAL_DELIVERY" : "SHIPPING";
  
  await prisma.order.create({
    data: {
      id: orderId,
      orderNumber,
      userId,
      status: paymentMethod === "cash_on_delivery" ? "PROCESSING" : "PENDING",
      paymentStatus: "PENDING",
      fulfillmentMethod,
      currency: "USD",
      subtotal,
      shippingFee,
      taxAmount,
      totalAmount,
      shippingAddressJson: shippingInfo as any,
      placedAt: n,
      items: { createMany: { data: items } }
    }
  });
  
  await prisma.cartItem.updateMany({ where: { userId, status: "ACTIVE" }, data: { status: "CONVERTED" } });
  
  if (saveInfo && shippingInfo) {
    const existing = await prisma.address.findFirst({ where: { userId, line1: shippingInfo.address, city: shippingInfo.city } });
    if (!existing) {
      await prisma.address.create({
        data: {
          userId, type: "HOME", fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`, phone: shippingInfo.phone, line1: shippingInfo.address, line2: shippingInfo.apartment || null, city: shippingInfo.city, state: shippingInfo.state, postalCode: shippingInfo.zipCode, country: shippingInfo.country || "United States", isDefault: false
        }
      });
    }
  }
  reply.code(201);
  return { data: { orderNumber, totalAmount, status: "pending" } };
});

app.get("/orders/track/:orderNumber", async (request) => {
  const { orderNumber } = request.params as { orderNumber: string };
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, fulfillments: true }
  });
  if (!order) throw app.httpErrors.notFound("Order not found");
  
  const orderedStatuses = ["PAYMENT_PENDING", "PAID", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  return { 
    data: { 
      orderNumber: order.orderNumber, 
      status: mapOrderStatus(order.status as any), 
      currentStep: orderedStatuses.indexOf(order.status) + 1, 
      estimatedDelivery: order.placedAt ? new Date(order.placedAt.getTime() + 5 * 864e5).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : undefined, 
      trackingNumber: order.fulfillments?.[0]?.trackingNumber, 
      carrier: order.fulfillments?.[0]?.carrier, 
      items: order.items.map((i) => ({ name: i.productName, qty: i.quantity, price: i.unitPrice * i.quantity })), 
      total: order.totalAmount, 
      timeline: [{ date: order.placedAt?.toISOString() ?? now().toISOString(), event: "Order placed", location: "" }] 
    } 
  };
});

app.get("/payments/stripe/config", async () => ({ data: { publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "" } }));

app.post("/payments/stripe/create-payment-intent", async (request) => {
  const userId = getUserId(request);
  const { deliveryMethod } = request.body as { deliveryMethod: string };
  const cartItems = await prisma.cartItem.findMany({ where: { userId, status: "ACTIVE" } });
  if (cartItems.length === 0) throw app.httpErrors.badRequest("Cart is empty");
  
  const subtotal = cartItems.reduce((s, ci) => s + ci.unitPrice * ci.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = Math.round((subtotal + shippingFee + taxAmount) * 100);
  const pi = await stripe.paymentIntents.create({ amount: totalAmount, currency: "usd", metadata: { userId }, automatic_payment_methods: { enabled: true } });
  
  await prisma.paymentOrder.create({
    data: { id: pi.id, userId, amount: totalAmount, currency: "usd", status: "CREATED" }
  });
  return { data: { clientSecret: pi.client_secret, amount: totalAmount } };
});

app.post("/payments/stripe/confirm-order", async (request, reply) => {
  const userId = getUserId(request);
  const { paymentIntentId, shippingInfo, deliveryMethod, saveInfo } = request.body as any;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") throw app.httpErrors.badRequest("Payment not completed");
  
  const cartItems = await prisma.cartItem.findMany({ where: { userId, status: "ACTIVE" } });
  if (cartItems.length === 0) throw app.httpErrors.badRequest("Cart is empty");
  
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const n = now();
  const items = cartItems.map((ci) => ({ 
    id: crypto.randomUUID(), 
    productId: ci.productId, 
    productName: ci.productId, 
    unitPrice: ci.unitPrice, 
    quantity: ci.quantity, 
    customizationData: ci.customizationData ?? undefined 
  }));
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = calcTotal(subtotal, shippingFee, taxAmount);
  const fulfillmentMethod = deliveryMethod === "pickup" ? "PICKUP" : deliveryMethod === "local" ? "LOCAL_DELIVERY" : "SHIPPING";
  
  await prisma.order.create({
    data: {
      id: orderId,
      orderNumber,
      userId,
      status: "PAID",
      paymentStatus: "CAPTURED",
      fulfillmentMethod,
      currency: "usd",
      subtotal,
      shippingFee,
      taxAmount,
      totalAmount,
      shippingAddressJson: shippingInfo as any,
      placedAt: n,
      items: { createMany: { data: items } },
      payments: {
        create: {
          id: crypto.randomUUID(),
          provider: "STRIPE",
          providerReference: paymentIntentId,
          amount: totalAmount,
          currency: "usd",
          status: "CAPTURED",
          metadata: { stripe_payment_intent_id: paymentIntentId },
          capturedAt: n
        }
      }
    }
  });
  
  await prisma.cartItem.updateMany({ where: { userId, status: "ACTIVE" }, data: { status: "CONVERTED" } });
  await prisma.paymentOrder.update({ where: { id: paymentIntentId }, data: { status: "CAPTURED", orderId } });
  
  if (saveInfo && shippingInfo) {
    const existing = await prisma.address.findFirst({ where: { userId, line1: shippingInfo.address, city: shippingInfo.city } });
    if (!existing) {
      await prisma.address.create({
        data: {
          userId, type: "HOME", fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`, phone: shippingInfo.phone, line1: shippingInfo.address, line2: shippingInfo.apartment || null, city: shippingInfo.city, state: shippingInfo.state, postalCode: shippingInfo.zipCode, country: shippingInfo.country || "United States", isDefault: false
        }
      });
    }
  }
  reply.code(201);
  return { data: { orderNumber, totalAmount, status: "paid" } };
});

app.post("/payments/stripe/webhook", async (request) => {
  app.log.info({ payload: request.body }, "Stripe webhook received");
  return { data: { received: true } };
});

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
