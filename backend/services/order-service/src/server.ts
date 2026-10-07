import fastify from "fastify";
import fastifySensible from "@fastify/sensible";
import { getCollection, serializeOrderSummary, mapOrderStatus } from "@artisan-haven/database";
import type { Order, OrderItem, Payment, OrderStatus, Address } from "@artisan-haven/database";
import crypto from "node:crypto";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-06-24.dahlia" });

const app = fastify({ logger: true });

app.register(fastifySensible);

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${ts}-${rand}`;
}

async function getUserId(request: fastify.FastifyRequest): Promise<string> {
  const userId = request.headers["x-user-id"];
  if (typeof userId !== "string") {
    throw app.httpErrors.unauthorized("Authentication required");
  }
  return userId;
}

function now(): Date {
  return new Date();
}

function calcShipping(subtotal: number, deliveryMethod: string): number {
  if (deliveryMethod === "express") return 9.99;
  return subtotal >= 50 ? 0 : 5.99;
}

function calcTax(subtotal: number): number {
  return Math.round(subtotal * 0.08 * 100) / 100;
}

function calcTotal(subtotal: number, shipping: number, tax: number): number {
  return Math.round((subtotal + shipping + tax) * 100) / 100;
}

// ─── Order Routes ───────────────────────────────────────────────────────────

app.get("/orders/orders", async (request, reply) => {
  const userId = await getUserId(request);
  const query = request.query as Record<string, string>;
  const filter: Record<string, unknown> = { userId };

  if (query.status) filter.status = query.status.toUpperCase();

  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = Math.max(Number(query.offset) || 0, 0);

  const ordersCol = await getCollection<Order>("orders");
  const orders = await ordersCol
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const orderIds = orders.map((o) => o.id);
  const itemsCol = await getCollection<OrderItem>("order_items");
  const items = await itemsCol.find({ orderId: { $in: orderIds } }).toArray();

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of items) {
    const arr = itemsByOrder.get(item.orderId) ?? [];
    arr.push(item);
    itemsByOrder.set(item.orderId, arr);
  }

  const total = await ordersCol.countDocuments(filter);

  return {
    data: orders.map((order) =>
      serializeOrderSummary({
        ...order,
        items: itemsByOrder.get(order.id) ?? [],
      })
    ),
    total,
    limit,
    offset: skip,
  };
});

app.get("/orders/orders/:orderNumber", async (request, reply) => {
  const userId = await getUserId(request);
  const { orderNumber } = request.params as { orderNumber: string };

  const ordersCol = await getCollection<Order>("orders");
  const order = await ordersCol.findOne({ orderNumber, userId });
  if (!order) {
    throw app.httpErrors.notFound("Order not found");
  }

  const itemsCol = await getCollection<OrderItem>("order_items");
  const items = await itemsCol.find({ orderId: order.id }).toArray();

  const paymentsCol = await getCollection<Payment>("payments");
  const payments = await paymentsCol.find({ orderId: order.id }).toArray();

  return {
    data: {
      ...serializeOrderSummary({ ...order, items }),
      payments: payments.map((p: Payment) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        capturedAt: p.capturedAt?.toISOString(),
      })),
      shippingAddress: order.shippingAddressJson,
      billingAddress: order.billingAddressJson,
      fulfillmentMethod: order.fulfillmentMethod,
      notes: order.notes,
    },
  };
});

app.post("/orders/orders", async (request, reply) => {
  const userId = await getUserId(request);
  const body = request.body as Record<string, unknown>;
  const shippingInfo = body.shippingInfo as Record<string, string> | undefined;
  const deliveryMethod = (body.deliveryMethod as string) || "standard";
  const paymentMethod = (body.paymentMethod as string) || "cash_on_delivery";
  const saveInfo = Boolean(body.saveInfo);

  const cartItemsCol = await getCollection("cart_items");
  const cartItems = await cartItemsCol
    .find({ userId, status: "ACTIVE" })
    .toArray();

  if (cartItems.length === 0) {
    throw app.httpErrors.badRequest("Cart is empty");
  }

  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const now_ = now();

  const items: OrderItem[] = cartItems.map((ci: Record<string, unknown>) => ({
    id: crypto.randomUUID(),
    orderId,
    productId: ci.productId as string,
    productName: (ci.productName as string) || (ci.productId as string),
    unitPrice: ci.unitPrice as number,
    quantity: ci.quantity as number,
    customizationData: (ci.customizationData as Record<string, unknown>) ?? undefined,
    createdAt: now_,
  }));

  const subtotal = items.reduce((sum: number, i: OrderItem) => sum + i.unitPrice * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = calcTotal(subtotal, shippingFee, taxAmount);

  const fulfillmentMethod = deliveryMethod === "pickup" ? "PICKUP" as const
    : deliveryMethod === "local" ? "LOCAL_DELIVERY" as const
    : "SHIPPING" as const;

  const order: Order = {
    id: orderId,
    orderNumber,
    userId,
    status: "PENDING",
    paymentStatus: "PENDING",
    fulfillmentMethod,
    currency: "USD",
    subtotal,
    shippingFee,
    taxAmount,
    totalAmount,
    shippingAddressJson: shippingInfo as unknown as Record<string, unknown> | undefined,
    placedAt: now_,
    createdAt: now_,
    updatedAt: now_,
  };

  const ordersCol = await getCollection<Order>("orders");
  await ordersCol.insertOne(order);

  const orderItemsCol = await getCollection<OrderItem>("order_items");
  await orderItemsCol.insertMany(items);

  if (paymentMethod === "cash_on_delivery") {
    await ordersCol.updateOne(
      { id: orderId },
      { $set: { status: "PROCESSING", paymentStatus: "PENDING" } }
    );
  }

  await cartItemsCol.updateMany(
    { userId, status: "ACTIVE" },
    { $set: { status: "CONVERTED", updatedAt: now_ } }
  );

  if (saveInfo && shippingInfo) {
    const addressesCol = await getCollection<Address>("addresses");
    const existingAddress = await addressesCol.findOne({
      userId,
      line1: shippingInfo.address,
      city: shippingInfo.city,
    });

    if (!existingAddress) {
      await addressesCol.insertOne({
        id: crypto.randomUUID(),
        userId,
        type: "HOME",
        fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        phone: shippingInfo.phone,
        line1: shippingInfo.address,
        line2: shippingInfo.apartment || undefined,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.zipCode,
        country: shippingInfo.country || "United States",
        isDefault: false,
        createdAt: now_,
        updatedAt: now_,
      });
    }
  }

  reply.code(201);
  return {
    data: {
      orderNumber,
      totalAmount,
      status: "pending",
    },
  };
});

// ─── Tracking Routes ────────────────────────────────────────────────────────

app.get("/orders/track/:orderNumber", async (request, reply) => {
  const { orderNumber } = request.params as { orderNumber: string };

  const ordersCol = await getCollection<Order>("orders");
  const order = await ordersCol.findOne({ orderNumber });
  if (!order) {
    throw app.httpErrors.notFound("Order not found");
  }

  const itemsCol = await getCollection<OrderItem>("order_items");
  const items = await itemsCol.find({ orderId: order.id }).toArray();

  const orderedStatuses: OrderStatus[] = [
    "PAYMENT_PENDING", "PAID", "PROCESSING", "READY_FOR_DISPATCH",
    "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED",
  ];

  const timeline = [
    { date: order.placedAt?.toISOString() ?? now().toISOString(), event: "Order placed", location: "" },
  ];

  return {
    data: {
      orderNumber: order.orderNumber,
      status: mapOrderStatus(order.status),
      currentStep: orderedStatuses.indexOf(order.status) + 1,
      estimatedDelivery: order.placedAt
        ? new Date(order.placedAt.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : undefined,
      trackingNumber: order.fulfillments?.[0]?.trackingNumber,
      carrier: order.fulfillments?.[0]?.carrier,
      items: items.map((i: OrderItem) => ({
        name: i.productName,
        qty: i.quantity,
        price: i.unitPrice * i.quantity,
      })),
      total: order.totalAmount,
      timeline,
    },
  };
});

// ─── Stripe Payment Routes ──────────────────────────────────────────────────

app.get("/payments/stripe/config", async () => {
  return {
    data: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
  };
});

app.post("/payments/stripe/create-payment-intent", async (request, reply) => {
  const userId = await getUserId(request);
  const { deliveryMethod } = request.body as { deliveryMethod: string };

  const cartItemsCol = await getCollection("cart_items");
  const cartItems = await cartItemsCol
    .find({ userId, status: "ACTIVE" })
    .toArray();

  if (cartItems.length === 0) {
    throw app.httpErrors.badRequest("Cart is empty");
  }

  const subtotal = (cartItems as unknown as Array<{ unitPrice: number; quantity: number }>)
    .reduce((sum, ci) => sum + ci.unitPrice * ci.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = Math.round((subtotal + shippingFee + taxAmount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    metadata: { userId },
    automatic_payment_methods: { enabled: true },
  });

  const paymentOrdersCol = await getCollection("payment_orders");
  await paymentOrdersCol.insertOne({
    id: paymentIntent.id,
    userId,
    amount: totalAmount,
    currency: "usd",
    status: "CREATED",
    createdAt: now(),
  });

  return {
    data: {
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    },
  };
});

app.post("/payments/stripe/confirm-order", async (request, reply) => {
  const userId = await getUserId(request);
  const {
    paymentIntentId,
    shippingInfo,
    deliveryMethod,
    saveInfo,
  } = request.body as {
    paymentIntentId: string;
    shippingInfo: Record<string, string>;
    deliveryMethod: string;
    saveInfo?: boolean;
  };

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw app.httpErrors.badRequest("Payment has not been completed");
  }

  const cartItemsCol = await getCollection("cart_items");
  const cartItems = await cartItemsCol
    .find({ userId, status: "ACTIVE" })
    .toArray();

  if (cartItems.length === 0) {
    throw app.httpErrors.badRequest("Cart is empty");
  }

  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const now_ = now();

  const items: OrderItem[] = (cartItems as Array<Record<string, unknown>>).map((ci) => ({
    id: crypto.randomUUID(),
    orderId,
    productId: ci.productId as string,
    productName: (ci.productName as string) || (ci.productId as string),
    unitPrice: ci.unitPrice as number,
    quantity: ci.quantity as number,
    customizationData: (ci.customizationData as Record<string, unknown>) ?? undefined,
    createdAt: now_,
  }));

  const subtotal = items.reduce((sum: number, i: OrderItem) => sum + i.unitPrice * i.quantity, 0);
  const shippingFee = calcShipping(subtotal, deliveryMethod);
  const taxAmount = calcTax(subtotal);
  const totalAmount = calcTotal(subtotal, shippingFee, taxAmount);

  const fulfillmentMethod = deliveryMethod === "pickup" ? "PICKUP" as const
    : deliveryMethod === "local" ? "LOCAL_DELIVERY" as const
    : "SHIPPING" as const;

  const order: Order = {
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
    shippingAddressJson: shippingInfo as unknown as Record<string, unknown> | undefined,
    placedAt: now_,
    createdAt: now_,
    updatedAt: now_,
  };

  const payment: Payment = {
    id: crypto.randomUUID(),
    orderId,
    provider: "STRIPE",
    providerReference: paymentIntentId,
    amount: totalAmount,
    currency: "usd",
    status: "CAPTURED",
    metadata: {
      stripe_payment_intent_id: paymentIntentId,
    },
    capturedAt: now_,
    createdAt: now_,
  };

  const ordersCol = await getCollection<Order>("orders");
  await ordersCol.insertOne(order);

  const orderItemsCol = await getCollection<OrderItem>("order_items");
  await orderItemsCol.insertMany(items);

  const paymentsCol = await getCollection<Payment>("payments");
  await paymentsCol.insertOne(payment);

  await cartItemsCol.updateMany(
    { userId, status: "ACTIVE" },
    { $set: { status: "CONVERTED", updatedAt: now_ } }
  );

  const paymentOrdersCol = await getCollection("payment_orders");
  await paymentOrdersCol.updateOne(
    { id: paymentIntentId },
    { $set: { status: "CAPTURED", orderId } }
  );

  if (saveInfo && shippingInfo) {
    const addressesCol = await getCollection<Address>("addresses");
    const existingAddress = await addressesCol.findOne({
      userId,
      line1: shippingInfo.address,
      city: shippingInfo.city,
    });

    if (!existingAddress) {
      await addressesCol.insertOne({
        id: crypto.randomUUID(),
        userId,
        type: "HOME",
        fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        phone: shippingInfo.phone,
        line1: shippingInfo.address,
        line2: shippingInfo.apartment || undefined,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.zipCode,
        country: shippingInfo.country || "United States",
        isDefault: false,
        createdAt: now_,
        updatedAt: now_,
      });
    }
  }

  reply.code(201);
  return {
    data: {
      orderNumber,
      totalAmount,
      status: "paid",
    },
  };
});

async function requireAdmin(request: fastify.FastifyRequest) {
  const role = request.headers["x-user-role"] as string;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MANAGER") {
    throw app.httpErrors.forbidden("Admin access required");
  }
}

// ─── Admin Analytics Routes ─────────────────────────────────────────────────

app.get("/orders/analytics/summary", async (request, reply) => {
  await requireAdmin(request);
  const ordersCol = await getCollection<Order>("orders");
  
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const getStats = async (fromDate: Date) => {
    const stats = await ordersCol.aggregate([
      { $match: { placedAt: { $gte: fromDate }, status: { $in: ["PAID", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]).toArray();
    return stats[0] || { revenue: 0, count: 0 };
  };

  const daily = await getStats(oneDayAgo);
  const yearly = await getStats(oneYearAgo);

  return {
    data: {
      dailyRevenue: daily.revenue,
      dailySales: daily.count,
      dailyProfit: daily.revenue * 0.2,
      yearlyRevenue: yearly.revenue,
      yearlySales: yearly.count,
      yearlyProfit: yearly.revenue * 0.2,
    }
  };
});

app.get("/orders/analytics/top-products", async (request, reply) => {
  await requireAdmin(request);
  const itemsCol = await getCollection<OrderItem>("order_items");
  const topProducts = await itemsCol.aggregate([
    { $group: { _id: "$productId", name: { $first: "$productName" }, totalQuantity: { $sum: "$quantity" }, totalRevenue: { $sum: { $multiply: ["$unitPrice", "$quantity"] } } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]).toArray();
  return { data: topProducts };
});

app.patch("/orders/orders/:orderNumber/status", async (request, reply) => {
  await requireAdmin(request);
  const { orderNumber } = request.params as { orderNumber: string };
  const { status } = request.body as { status: OrderStatus };
  
  const ordersCol = await getCollection<Order>("orders");
  const order = await ordersCol.findOneAndUpdate(
    { orderNumber },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  
  if (!order) throw app.httpErrors.notFound("Order not found");
  
  return { data: { orderNumber: order.orderNumber, status: mapOrderStatus(order.status) } };
});

// ─── Coupons Routes ─────────────────────────────────────────────────────────

app.post("/orders/coupons", async (request, reply) => {
  const role = request.headers["x-user-role"] as string;
  if (role !== "SUPER_ADMIN") throw app.httpErrors.forbidden("Super Admin access required");
  
  const body = request.body as any;
  const couponsCol = await getCollection<any>("coupons");
  
  const coupon = {
    id: crypto.randomUUID(),
    code: body.code,
    discountType: body.discountType,
    discountValue: body.discountValue,
    isActive: true,
    createdAt: new Date(),
  };
  
  await couponsCol.insertOne(coupon);
  return { data: coupon };
});

app.get("/orders/coupons", async (request, reply) => {
  await requireAdmin(request);
  const couponsCol = await getCollection<any>("coupons");
  const coupons = await couponsCol.find({}).toArray();
  return { data: coupons };
});

app.post("/payments/stripe/webhook", async (request, reply) => {
  const payload = request.body as Record<string, unknown>;
  app.log.info({ payload }, "Stripe webhook received");
  return { data: { received: true } };
});

const port = Number(process.env.ORDER_SERVICE_PORT ?? 4103);
await app.listen({ port, host: "0.0.0.0" });
