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
  getCollection,
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
import type {
  UserProfile, Address, CartItem, Product as DBProduct,
  Order, OrderItem, Payment, OrderStatus, ProductType,
  Category, ProductNutrition,
} from "@artisan-haven/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-03-31.basil" });
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
  const sessions = await getCollection<any>("user_sessions");
  const session = await sessions.findOne({ tokenHash: hashSessionToken(auth.replace("Bearer ", "")), revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) throw app.httpErrors.unauthorized("Session invalid or expired.");
  request.headers["x-user-id"] = session.userId;
  request.headers["x-user-email"] = session.email;
  request.headers["x-user-role"] = session.role || "CUSTOMER";
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
  const filter: Record<string, unknown> = {};
  if (q.product_type) { const m = mapFrontendProductType(q.product_type); if (m) filter.productType = m; }
  if (q.is_featured === "true") filter.isFeatured = true;
  if (q.is_best_seller === "true") filter.isBestSeller = true;
  if (q.in_stock === "true") filter.stockQuantity = { $gt: 0 };
  if (q.search) filter.$or = [{ name: { $regex: q.search, $options: "i" } }, { description: { $regex: q.search, $options: "i" } }];
  if (q.min_price || q.max_price) { filter.price = {}; if (q.min_price) (filter.price as any).$gte = Number(q.min_price); if (q.max_price) (filter.price as any).$lte = Number(q.max_price); }
  const sort: Record<string, 1 | -1> = {};
  switch (q.sort) { case "price_asc": sort.price = 1; break; case "price_desc": sort.price = -1; break; case "popular": sort.isBestSeller = -1; break; default: sort.createdAt = -1; }
  const limit = Math.min(Number(q.limit) || 50, 100);
  const skip = Math.max(Number(q.offset) || 0, 0);
  const col = await getCollection<DBProduct>("products");
  const products = await col.find(filter).sort(sort).skip(skip).limit(limit).toArray();
  const total = await col.countDocuments(filter);
  return { data: products.map(serializeProduct), total, limit, offset: skip };
});

app.get("/catalog/products/:slug", async (request) => {
  const { slug } = request.params as { slug: string };
  const col = await getCollection<DBProduct>("products");
  const product = await col.findOne({ slug });
  if (!product) throw app.httpErrors.notFound("Product not found");
  return { data: serializeProduct(product) };
});

app.post("/catalog/products", async (request, reply) => {
  const body = request.body as Record<string, unknown>;
  const products = Array.isArray(body) ? body : [body];
  const inserted: any[] = [];
  for (const item of products) {
    const rawType = item.productType || item.product_type;
    const productType: ProductType = rawType === "ART_CRAFTS" || rawType === "art_crafts" ? "ART_CRAFTS" : rawType === "HEALTHY_FOOD" || rawType === "healthy_food" ? "HEALTHY_FOOD" : rawType === "CAKES" || rawType === "cakes" ? "CAKES" : "ART_CRAFTS";
    const id = (item.id as string) || crypto.randomUUID();
    const slug = (item.slug as string) || id;
    const n = (item.nutritional_info || item.nutrition || item.nutritionInfo) as Record<string, unknown> | undefined;
    let nutrition: ProductNutrition | undefined;
    if (n) { nutrition = { calories: Number(n.calories) || undefined, proteinGram: parseGram(n.protein), carbsGram: parseGram(n.carbs), fatGram: parseGram(n.fat), fiberGram: parseGram(n.fiber), sugarGram: parseGram(n.sugar) }; }
    const c = item.category as Record<string, unknown> | undefined;
    let category: Category | undefined;
    if (c) { category = { id: (c.id as string) || crypto.randomUUID(), name: (c.name as string) || "", slug: (c.slug as string) || "" }; }
    const product: DBProduct = { id, slug, name: (item.name || item.product_name || "") as string, description: (item.description as string) || undefined, shortDescription: (item.short_description || item.shortDescription) as string | undefined, price: Number(item.price) || 0, compareAtPrice: item.compare_at_price || item.compareAtPrice ? Number(item.compare_at_price || item.compareAtPrice) : undefined, productType, featuredImage: (item.featured_image || item.featuredImage || item.image || "") as string, images: (item.images as string[]) || [], categoryId: category?.id, category, stockQuantity: Number(item.stock_quantity ?? item.stockQuantity ?? 0), isFeatured: Boolean(item.is_featured ?? item.isFeatured), isBestSeller: Boolean(item.is_best_seller ?? item.isBestSeller), sustainabilityScore: item.sustainability_score || item.sustainabilityScore ? Number(item.sustainability_score || item.sustainabilityScore) : undefined, nutrition, ingredients: (item.ingredients as string[]) || undefined, createdAt: now(), updatedAt: now() };
    const col = await getCollection<DBProduct>("products");
    await col.updateOne({ id: product.id }, { $set: product }, { upsert: true });
    if (category) { const catCol = await getCollection<Category>("categories"); await catCol.updateOne({ id: category.id }, { $set: category }, { upsert: true }); }
    inserted.push(serializeProduct(product));
  }
  reply.code(201);
  return { data: inserted.length === 1 ? inserted[0] : inserted };
});

function parseGram(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[^0-9.]/g, "");
  return s ? Number(s) : undefined;
}

app.post("/auth/register", async (request, reply) => {
  const { firstName, lastName, email, phone, password } = request.body as any;
  if (!firstName?.trim() || !lastName?.trim() || !email || !password) throw app.httpErrors.badRequest("Missing required fields");
  if (password.length < 8) throw app.httpErrors.badRequest("Password must be at least 8 characters");
  const normalizedEmail = normalizeEmail(email);
  const profiles = await getCollection<UserProfile>("user_profiles");
  if (await profiles.findOne({ email: normalizedEmail })) throw app.httpErrors.conflict("Email already registered");
  const profile: UserProfile = { id: crypto.randomUUID(), email: normalizedEmail, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone?.trim() || undefined, role: "CUSTOMER", createdAt: now(), updatedAt: now() };
  await profiles.insertOne(profile);
  const users = await getCollection("users");
  await users.insertOne({ id: crypto.randomUUID(), email: normalizedEmail, passwordHash: hashPassword(password), createdAt: now() });
  const token = createSessionToken();
  const sessions = await getCollection("user_sessions");
  await sessions.insertOne({ id: crypto.randomUUID(), userId: profile.id, email: profile.email, role: profile.role, tokenHash: hashSessionToken(token), expiresAt: daysFromNow(7), createdAt: now() });
  reply.code(201);
  return { data: { user: serializeAuthUser(profile), token } };
});

app.post("/auth/login", async (request) => {
  const { email, password } = request.body as any;
  if (!email || !password) throw app.httpErrors.badRequest("Email and password are required");
  const normalizedEmail = normalizeEmail(email);
  const profiles = await getCollection<UserProfile>("user_profiles");
  const profile = await profiles.findOne({ email: normalizedEmail });
  if (!profile) throw app.httpErrors.unauthorized("Invalid email or password");
  const users = await getCollection("users");
  const user = await users.findOne({ email: normalizedEmail });
  if (!user || !verifyPassword(password, user.passwordHash)) throw app.httpErrors.unauthorized("Invalid email or password");
  const token = createSessionToken();
  const sessions = await getCollection("user_sessions");
  await sessions.insertOne({ id: crypto.randomUUID(), userId: profile.id, email: profile.email, role: profile.role, tokenHash: hashSessionToken(token), expiresAt: daysFromNow(7), createdAt: now() });
  return { data: { user: serializeAuthUser(profile), token } };
});

app.post("/auth/logout", async (request) => {
  const auth = request.headers.authorization;
  if (auth?.startsWith("Bearer ")) { const sessions = await getCollection("user_sessions"); await sessions.updateOne({ tokenHash: hashSessionToken(auth.replace("Bearer ", "")), revokedAt: null }, { $set: { revokedAt: now() } }); }
  return { data: { message: "Logged out successfully" } };
});

app.get("/customers/cart", async (request) => {
  const userId = getUserId(request);
  const cartItems = await getCollection<CartItem>("cart_items");
  const items = await cartItems.find({ userId, status: "ACTIVE" }).toArray();
  const productIds = [...new Set(items.map((i: CartItem) => i.productId))];
  const productsCol = await getCollection<DBProduct>("products");
  const products = await productsCol.find({ id: { $in: productIds } }).toArray();
  const productMap = new Map(products.map((p: DBProduct) => [p.id, p]));
  return { data: items.map((item: CartItem) => ({ id: item.id, user_id: userId, product_id: item.productId, variant_id: item.variantId ?? null, quantity: item.quantity, customization_data: (item.customizationData as any) ?? null, product: productMap.get(item.productId) })) };
});

app.post("/customers/cart/items", async (request, reply) => {
  const userId = getUserId(request);
  const { productId, quantity, customizationData } = request.body as any;
  if (!productId || !quantity) throw app.httpErrors.badRequest("Product ID and quantity are required");
  const products = await getCollection<DBProduct>("products");
  const product = await products.findOne({ id: productId });
  if (!product) throw app.httpErrors.notFound("Product not found");
  const cartItems = await getCollection<CartItem>("cart_items");
  const existing = await cartItems.findOne({ userId, productId, status: "ACTIVE" });
  if (existing) { await cartItems.updateOne({ _id: existing._id }, { $set: { quantity: existing.quantity + quantity, updatedAt: now() } }); }
  else { await cartItems.insertOne({ id: crypto.randomUUID(), userId, productId, variantId: undefined, quantity, customizationData: customizationData ?? undefined, unitPrice: product.price, status: "ACTIVE", createdAt: now(), updatedAt: now() }); }
  reply.code(201);
  return { data: { message: "Item added to cart" } };
});

app.patch("/customers/cart/items/:itemId", async (request) => {
  const userId = getUserId(request);
  const { itemId } = request.params as { itemId: string };
  const { quantity } = request.body as { quantity: number };
  if (quantity < 1) throw app.httpErrors.badRequest("Quantity must be at least 1");
  const cartItems = await getCollection<CartItem>("cart_items");
  const r = await cartItems.updateOne({ id: itemId, userId, status: "ACTIVE" }, { $set: { quantity, updatedAt: now() } });
  if (r.matchedCount === 0) throw app.httpErrors.notFound("Cart item not found");
  return { data: { message: "Cart item updated" } };
});

app.delete("/customers/cart/items/:itemId", async (request) => {
  const userId = getUserId(request);
  const { itemId } = request.params as { itemId: string };
  const cartItems = await getCollection<CartItem>("cart_items");
  const r = await cartItems.deleteOne({ id: itemId, userId, status: "ACTIVE" });
  if (r.deletedCount === 0) throw app.httpErrors.notFound("Cart item not found");
  return { data: { message: "Item removed from cart" } };
});

app.get("/customers/addresses", async (request) => {
  const userId = getUserId(request);
  const addresses = await getCollection<Address>("addresses");
  return { data: (await addresses.find({ userId }).toArray()).map(serializeAddress) };
});

app.post("/customers/addresses", async (request, reply) => {
  const userId = getUserId(request);
  const body = request.body as Record<string, unknown>;
  const address: Address = { id: crypto.randomUUID(), userId, type: (body.type as Address["type"]) || "HOME", fullName: body.fullName as string, phone: body.phone as string, line1: body.address as string, line2: (body.apartment as string) || undefined, city: body.city as string, state: body.state as string, postalCode: body.zipCode as string, country: (body.country as string) || "United States", isDefault: Boolean(body.isDefault), createdAt: now(), updatedAt: now() };
  const addresses = await getCollection<Address>("addresses");
  if (address.isDefault) await addresses.updateMany({ userId }, { $set: { isDefault: false } });
  await addresses.insertOne(address);
  reply.code(201);
  return { data: serializeAddress(address) };
});

app.delete("/customers/addresses/:addressId", async (request) => {
  const userId = getUserId(request);
  const { addressId } = request.params as { addressId: string };
  const addresses = await getCollection<Address>("addresses");
  const r = await addresses.deleteOne({ id: addressId, userId });
  if (r.deletedCount === 0) throw app.httpErrors.notFound("Address not found");
  return { data: { message: "Address deleted" } };
});

app.get("/customers/profile", async (request) => {
  const userId = getUserId(request);
  const profile = await (await getCollection<UserProfile>("user_profiles")).findOne({ id: userId });
  if (!profile) throw app.httpErrors.notFound("Profile not found");
  return { data: serializeAuthUser(profile) };
});

app.patch("/customers/profile", async (request) => {
  const userId = getUserId(request);
  const body = request.body as Partial<Record<string, string>>;
  const update: Record<string, unknown> = { updatedAt: now() };
  if (body.firstName) update.firstName = body.firstName;
  if (body.lastName) update.lastName = body.lastName;
  if (body.phone) update.phone = body.phone;
  await (await getCollection<UserProfile>("user_profiles")).updateOne({ id: userId }, { $set: update });
  return { data: { message: "Profile updated" } };
});

function generateOrderNumber() { const ts = Date.now().toString().slice(-8); const rand = crypto.randomBytes(3).toString("hex").toUpperCase(); return `ORD-${ts}-${rand}`; }
function calcShipping(subtotal: number, method: string) { return method === "express" ? 9.99 : subtotal >= 50 ? 0 : 5.99; }
function calcTax(subtotal: number) { return Math.round(subtotal * 0.08 * 100) / 100; }
function calcTotal(subtotal: number, shipping: number, tax: number) { return Math.round((subtotal + shipping + tax) * 100) / 100; }

app.get("/orders/orders", async (request) => {
  const userId = getUserId(request);
  const q = request.query as Record<string, string>;
  const filter: Record<string, unknown> = { userId };
  if (q.status) filter.status = q.status.toUpperCase();
  const limit = Math.min(Number(q.limit) || 20, 100);
  const skip = Math.max(Number(q.offset) || 0, 0);
  const ordersCol = await getCollection<Order>("orders");
  const orders = await ordersCol.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
  const itemsCol = await getCollection<OrderItem>("order_items");
  const items = await itemsCol.find({ orderId: { $in: orders.map((o) => o.id) } }).toArray();
  const byOrder = new Map<string, OrderItem[]>();
  for (const item of items) { const arr = byOrder.get(item.orderId) ?? []; arr.push(item); byOrder.set(item.orderId, arr); }
  const total = await ordersCol.countDocuments(filter);
  return { data: orders.map((o) => serializeOrderSummary({ ...o, items: byOrder.get(o.id) ?? [] })), total, limit, offset: skip };
});

app.get("/orders/orders/:orderNumber", async (request) => {
  const userId = getUserId(request);
  const { orderNumber } = request.params as { orderNumber: string };
  const ordersCol = await getCollection<Order>("orders");
  const order = await ordersCol.findOne({ orderNumber, userId });
  if (!order) throw app.httpErrors.notFound("Order not found");
  const items = await (await getCollection<OrderItem>("order_items")).find({ orderId: order.id }).toArray();
  const payments = await (await getCollection<Payment>("payments")).find({ orderId: order.id }).toArray();
  return { data: { ...serializeOrderSummary({ ...order, items }), payments: payments.map((p) => ({ id: p.id, provider: p.provider, status: p.status, amount: p.amount, currency: p.currency, capturedAt: p.capturedAt?.toISOString() })), shippingAddress: order.shippingAddressJson, billingAddress: order.billingAddressJson, fulfillmentMethod: order.fulfillmentMethod, notes: order.notes } };
});

app.post("/orders/orders", async (request, reply) => {
  const userId = getUserId(request);
  const body = request.body as Record<string, unknown>;
  const shippingInfo = body.shippingInfo as Record<string, string> | undefined;
  const deliveryMethod = (body.deliveryMethod as string) || "standard";
  const paymentMethod = (body.paymentMethod as string) || "cash_on_delivery";
  const saveInfo = Boolean(body.saveInfo);
  const cartItemsCol = await getCollection("cart_items");
  const cartItems = await cartItemsCol.find({ userId, status: "ACTIVE" }).toArray();
  if (cartItems.length === 0) throw app.httpErrors.badRequest("Cart is empty");
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const n = now();
  const items: OrderItem[] = cartItems.map((ci: any) => ({ id: crypto.randomUUID(), orderId, productId: ci.productId, productName: ci.productName || ci.productId, unitPrice: ci.unitPrice, quantity: ci.quantity, customizationData: ci.customizationData ?? undefined, createdAt: n }));
  const subtotal = items.reduce((s: number, i: OrderItem) => s + i.unitPrice * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = calcTotal(subtotal, shippingFee, taxAmount);
  const fulfillmentMethod = deliveryMethod === "pickup" ? "PICKUP" as const : deliveryMethod === "local" ? "LOCAL_DELIVERY" as const : "SHIPPING" as const;
  const order: Order = { id: orderId, orderNumber, userId, status: "PENDING", paymentStatus: "PENDING", fulfillmentMethod, currency: "USD", subtotal, shippingFee, taxAmount, totalAmount, shippingAddressJson: shippingInfo as any, placedAt: n, createdAt: n, updatedAt: n };
  const ordersCol = await getCollection<Order>("orders");
  await ordersCol.insertOne(order);
  await (await getCollection<OrderItem>("order_items")).insertMany(items);
  if (paymentMethod === "cash_on_delivery") await ordersCol.updateOne({ id: orderId }, { $set: { status: "PROCESSING", paymentStatus: "PENDING" } });
  await cartItemsCol.updateMany({ userId, status: "ACTIVE" }, { $set: { status: "CONVERTED", updatedAt: n } });
  if (saveInfo && shippingInfo) {
    const addrCol = await getCollection<Address>("addresses");
    const existing = await addrCol.findOne({ userId, line1: shippingInfo.address, city: shippingInfo.city });
    if (!existing) await addrCol.insertOne({ id: crypto.randomUUID(), userId, type: "HOME", fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`, phone: shippingInfo.phone, line1: shippingInfo.address, line2: shippingInfo.apartment || undefined, city: shippingInfo.city, state: shippingInfo.state, postalCode: shippingInfo.zipCode, country: shippingInfo.country || "United States", isDefault: false, createdAt: n, updatedAt: n });
  }
  reply.code(201);
  return { data: { orderNumber, totalAmount, status: "pending" } };
});

app.get("/orders/track/:orderNumber", async (request) => {
  const { orderNumber } = request.params as { orderNumber: string };
  const ordersCol = await getCollection<Order>("orders");
  const order = await ordersCol.findOne({ orderNumber });
  if (!order) throw app.httpErrors.notFound("Order not found");
  const items = await (await getCollection<OrderItem>("order_items")).find({ orderId: order.id }).toArray();
  const orderedStatuses: OrderStatus[] = ["PAYMENT_PENDING", "PAID", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  return { data: { orderNumber: order.orderNumber, status: mapOrderStatus(order.status), currentStep: orderedStatuses.indexOf(order.status) + 1, estimatedDelivery: order.placedAt ? new Date(order.placedAt.getTime() + 5 * 864e5).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : undefined, trackingNumber: order.fulfillments?.[0]?.trackingNumber, carrier: order.fulfillments?.[0]?.carrier, items: items.map((i) => ({ name: i.productName, qty: i.quantity, price: i.unitPrice * i.quantity })), total: order.totalAmount, timeline: [{ date: order.placedAt?.toISOString() ?? now().toISOString(), event: "Order placed", location: "" }] } };
});

app.get("/payments/stripe/config", async () => ({ data: { publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "" } }));

app.post("/payments/stripe/create-payment-intent", async (request) => {
  const userId = getUserId(request);
  const { deliveryMethod } = request.body as { deliveryMethod: string };
  const cartItems = await (await getCollection("cart_items")).find({ userId, status: "ACTIVE" }).toArray();
  if (cartItems.length === 0) throw app.httpErrors.badRequest("Cart is empty");
  const subtotal = (cartItems as any[]).reduce((s, ci) => s + ci.unitPrice * ci.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = Math.round((subtotal + shippingFee + taxAmount) * 100);
  const pi = await stripe.paymentIntents.create({ amount: totalAmount, currency: "usd", metadata: { userId }, automatic_payment_methods: { enabled: true } });
  await (await getCollection("payment_orders")).insertOne({ id: pi.id, userId, amount: totalAmount, currency: "usd", status: "CREATED", createdAt: now() });
  return { data: { clientSecret: pi.client_secret, amount: totalAmount } };
});

app.post("/payments/stripe/confirm-order", async (request, reply) => {
  const userId = getUserId(request);
  const { paymentIntentId, shippingInfo, deliveryMethod, saveInfo } = request.body as any;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") throw app.httpErrors.badRequest("Payment not completed");
  const cartItemsCol = await getCollection("cart_items");
  const cartItems = await cartItemsCol.find({ userId, status: "ACTIVE" }).toArray();
  if (cartItems.length === 0) throw app.httpErrors.badRequest("Cart is empty");
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const n = now();
  const items: OrderItem[] = cartItems.map((ci: any) => ({ id: crypto.randomUUID(), orderId, productId: ci.productId, productName: ci.productName || ci.productId, unitPrice: ci.unitPrice, quantity: ci.quantity, customizationData: ci.customizationData ?? undefined, createdAt: n }));
  const subtotal = items.reduce((s: number, i: OrderItem) => s + i.unitPrice * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = calcTotal(subtotal, shippingFee, taxAmount);
  const fulfillmentMethod = deliveryMethod === "pickup" ? "PICKUP" : deliveryMethod === "local" ? "LOCAL_DELIVERY" : "SHIPPING" as const;
  const order: Order = { id: orderId, orderNumber, userId, status: "PAID", paymentStatus: "CAPTURED", fulfillmentMethod, currency: "usd", subtotal, shippingFee, taxAmount, totalAmount, shippingAddressJson: shippingInfo, placedAt: n, createdAt: n, updatedAt: n };
  const payment: Payment = { id: crypto.randomUUID(), orderId, provider: "STRIPE", providerReference: paymentIntentId, amount: totalAmount, currency: "usd", status: "CAPTURED", metadata: { stripe_payment_intent_id: paymentIntentId }, capturedAt: n, createdAt: n };
  await (await getCollection<Order>("orders")).insertOne(order);
  await (await getCollection<OrderItem>("order_items")).insertMany(items);
  await (await getCollection<Payment>("payments")).insertOne(payment);
  await cartItemsCol.updateMany({ userId, status: "ACTIVE" }, { $set: { status: "CONVERTED", updatedAt: n } });
  await (await getCollection("payment_orders")).updateOne({ id: paymentIntentId }, { $set: { status: "CAPTURED", orderId } });
  if (saveInfo && shippingInfo) {
    const addrCol = await getCollection<Address>("addresses");
    const existing = await addrCol.findOne({ userId, line1: shippingInfo.address, city: shippingInfo.city });
    if (!existing) await addrCol.insertOne({ id: crypto.randomUUID(), userId, type: "HOME", fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`, phone: shippingInfo.phone, line1: shippingInfo.address, line2: shippingInfo.apartment || undefined, city: shippingInfo.city, state: shippingInfo.state, postalCode: shippingInfo.zipCode, country: shippingInfo.country || "United States", isDefault: false, createdAt: n, updatedAt: n });
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
