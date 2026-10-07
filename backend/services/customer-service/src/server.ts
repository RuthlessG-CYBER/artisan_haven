import fastify from "fastify";
import fastifySensible from "@fastify/sensible";
import crypto from "node:crypto";
import {
  getCollection,
  normalizeEmail,
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashSessionToken,
  serializeAuthUser,
  serializeAddress,
} from "@artisan-haven/database";
import type { UserProfile, Address, CartItem, Product } from "@artisan-haven/database";

const app = fastify({ logger: true });
app.register(fastifySensible);

function now(): Date {
  return new Date();
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function getUserId(request: fastify.FastifyRequest): Promise<string> {
  const userId = request.headers["x-user-id"];
  if (typeof userId !== "string") {
    throw app.httpErrors.unauthorized("Authentication required");
  }
  return userId;
}

// ─── Auth Routes ────────────────────────────────────────────────────────────

app.post("/auth/register", async (request, reply) => {
  const { firstName, lastName, email, phone, password } = request.body as {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  };

  if (!firstName?.trim() || !lastName?.trim() || !email || !password) {
    throw app.httpErrors.badRequest("Missing required fields");
  }

  if (password.length < 8) {
    throw app.httpErrors.badRequest("Password must be at least 8 characters");
  }

  const normalizedEmail = normalizeEmail(email);

  const profiles = await getCollection<UserProfile>("user_profiles");
  const existing = await profiles.findOne({ email: normalizedEmail });
  if (existing) {
    throw app.httpErrors.conflict("Email already registered");
  }

  const profile: UserProfile = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone?.trim() || undefined,
    role: "CUSTOMER",
    createdAt: now(),
    updatedAt: now(),
  };

  await profiles.insertOne(profile);

  const users = await getCollection("users");
  await users.insertOne({
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: now(),
  });

  const token = createSessionToken();
  const sessions = await getCollection("user_sessions");
  await sessions.insertOne({
    id: crypto.randomUUID(),
    userId: profile.id,
    email: profile.email,
    role: profile.role,
    tokenHash: hashSessionToken(token),
    expiresAt: daysFromNow(7),
    createdAt: now(),
  });

  reply.code(201);
  return {
    data: {
      user: serializeAuthUser(profile),
      token,
    },
  };
});

app.post("/auth/login", async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };

  if (!email || !password) {
    throw app.httpErrors.badRequest("Email and password are required");
  }

  const normalizedEmail = normalizeEmail(email);

  const profiles = await getCollection<UserProfile>("user_profiles");
  const profile = await profiles.findOne({ email: normalizedEmail });
  if (!profile) {
    throw app.httpErrors.unauthorized("Invalid email or password");
  }

  const users = await getCollection("users");
  const user = await users.findOne({ email: normalizedEmail });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw app.httpErrors.unauthorized("Invalid email or password");
  }

  const token = createSessionToken();
  const sessions = await getCollection("user_sessions");
  await sessions.insertOne({
    id: crypto.randomUUID(),
    userId: profile.id,
    email: profile.email,
    role: profile.role,
    tokenHash: hashSessionToken(token),
    expiresAt: daysFromNow(7),
    createdAt: now(),
  });

  return {
    data: {
      user: serializeAuthUser(profile),
      token,
    },
  };
});

app.post("/auth/logout", async (request, reply) => {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "");
    const sessions = await getCollection("user_sessions");
    await sessions.updateOne(
      { tokenHash: hashSessionToken(token), revokedAt: null },
      { $set: { revokedAt: now() } }
    );
  }
  return { data: { message: "Logged out successfully" } };
});

// ─── Cart Routes ────────────────────────────────────────────────────────────

app.get("/customers/cart", async (request, reply) => {
  const userId = await getUserId(request);

  const cartItems = await getCollection<CartItem>("cart_items");
  const items = await cartItems
    .find({ userId, status: "ACTIVE" })
    .toArray();

  const productIds = [...new Set(items.map((i: CartItem) => i.productId))];
  const productsCol = await getCollection<Product>("products");
  const products = await productsCol
    .find({ id: { $in: productIds } })
    .toArray();
  const productMap = new Map(products.map((p: Product) => [p.id, p]));

  return {
    data: items.map((item: CartItem) => ({
      id: item.id,
      user_id: userId,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
      customization_data: (item.customizationData as Record<string, unknown> | null) ?? null,
      product: productMap.get(item.productId),
    })),
  };
});

app.post("/customers/cart/items", async (request, reply) => {
  const userId = await getUserId(request);
  const { productId, quantity, customizationData } = request.body as {
    productId: string;
    quantity: number;
    customizationData?: Record<string, unknown>;
  };

  if (!productId || !quantity) {
    throw app.httpErrors.badRequest("Product ID and quantity are required");
  }

  const products = await getCollection<Product>("products");
  const product = await products.findOne({ id: productId });
  if (!product) {
    throw app.httpErrors.notFound("Product not found");
  }

  const cartItems = await getCollection<CartItem>("cart_items");
  const existingItem = await cartItems.findOne({
    userId,
    productId,
    status: "ACTIVE",
  });

  if (existingItem) {
    await cartItems.updateOne(
      { _id: existingItem._id },
      { $set: { quantity: existingItem.quantity + quantity, updatedAt: now() } }
    );
  } else {
    await cartItems.insertOne({
      id: crypto.randomUUID(),
      userId,
      productId,
      variantId: undefined,
      quantity,
      customizationData: customizationData ?? undefined,
      unitPrice: product.price,
      status: "ACTIVE",
      createdAt: now(),
      updatedAt: now(),
    });
  }

  reply.code(201);
  return { data: { message: "Item added to cart" } };
});

app.patch("/customers/cart/items/:itemId", async (request, reply) => {
  const userId = await getUserId(request);
  const { itemId } = request.params as { itemId: string };
  const { quantity } = request.body as { quantity: number };

  if (quantity < 1) {
    throw app.httpErrors.badRequest("Quantity must be at least 1");
  }

  const cartItems = await getCollection<CartItem>("cart_items");
  const result = await cartItems.updateOne(
    { id: itemId, userId, status: "ACTIVE" },
    { $set: { quantity, updatedAt: now() } }
  );

  if (result.matchedCount === 0) {
    throw app.httpErrors.notFound("Cart item not found");
  }

  return { data: { message: "Cart item updated" } };
});

app.delete("/customers/cart/items/:itemId", async (request, reply) => {
  const userId = await getUserId(request);
  const { itemId } = request.params as { itemId: string };

  const cartItems = await getCollection<CartItem>("cart_items");
  const result = await cartItems.deleteOne({
    id: itemId,
    userId,
    status: "ACTIVE",
  });

  if (result.deletedCount === 0) {
    throw app.httpErrors.notFound("Cart item not found");
  }

  return { data: { message: "Item removed from cart" } };
});

// ─── Address Routes ─────────────────────────────────────────────────────────

app.get("/customers/addresses", async (request, reply) => {
  const userId = await getUserId(request);
  const addresses = await getCollection<Address>("addresses");
  const result = await addresses.find({ userId }).toArray();
  return { data: result.map(serializeAddress) };
});

app.post("/customers/addresses", async (request, reply) => {
  const userId = await getUserId(request);
  const body = request.body as Record<string, unknown>;

  const address: Address = {
    id: crypto.randomUUID(),
    userId,
    type: (body.type as Address["type"]) || "HOME",
    fullName: body.fullName as string,
    phone: body.phone as string,
    line1: body.address as string,
    line2: (body.apartment as string) || undefined,
    city: body.city as string,
    state: body.state as string,
    postalCode: body.zipCode as string,
    country: (body.country as string) || "United States",
    isDefault: Boolean(body.isDefault),
    createdAt: now(),
    updatedAt: now(),
  };

  const addresses = await getCollection<Address>("addresses");
  if (address.isDefault) {
    await addresses.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );
  }

  await addresses.insertOne(address);

  reply.code(201);
  return { data: serializeAddress(address) };
});

app.delete("/customers/addresses/:addressId", async (request, reply) => {
  const userId = await getUserId(request);
  const { addressId } = request.params as { addressId: string };

  const addresses = await getCollection<Address>("addresses");
  const result = await addresses.deleteOne({
    id: addressId,
    userId,
  });

  if (result.deletedCount === 0) {
    throw app.httpErrors.notFound("Address not found");
  }

  return { data: { message: "Address deleted" } };
});

// ─── Profile Route ──────────────────────────────────────────────────────────

app.get("/customers/profile", async (request, reply) => {
  const userId = await getUserId(request);
  const profiles = await getCollection<UserProfile>("user_profiles");
  const profile = await profiles.findOne({ id: userId });
  if (!profile) {
    throw app.httpErrors.notFound("Profile not found");
  }
  return { data: serializeAuthUser(profile) };
});

app.patch("/customers/profile", async (request, reply) => {
  const userId = await getUserId(request);
  const body = request.body as Partial<Record<string, string>>;

  const update: Record<string, unknown> = { updatedAt: now() };
  if (body.firstName) update.firstName = body.firstName;
  if (body.lastName) update.lastName = body.lastName;
  if (body.phone) update.phone = body.phone;

  const profiles = await getCollection<UserProfile>("user_profiles");
  await profiles.updateOne(
    { id: userId },
    { $set: update }
  );

  return { data: { message: "Profile updated" } };
});

async function requireSuperAdmin(request: fastify.FastifyRequest) {
  const role = request.headers["x-user-role"] as string;
  if (role !== "SUPER_ADMIN") {
    throw app.httpErrors.forbidden("Super Admin access required");
  }
}

app.get("/customers/staff", async (request, reply) => {
  await requireSuperAdmin(request);
  const profilesCol = await getCollection<UserProfile>("user_profiles");
  const staff = await profilesCol.find({ role: { $in: ["ADMIN", "MANAGER", "SUPER_ADMIN"] } }).toArray();
  return { data: staff.map(serializeAuthUser) };
});

app.post("/auth/invite", async (request, reply) => {
  await requireSuperAdmin(request);
  const { email, role } = request.body as { email: string, role: string };
  const invitationsCol = await getCollection<any>("user_invitations");
  
  const token = crypto.randomUUID();
  const invitation = {
    id: crypto.randomUUID(),
    email,
    role,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };
  
  await invitationsCol.insertOne(invitation);
  
  // Mock sending email
  app.log.info({ email, role, token }, "Sent invitation email");
  
  return { data: { message: "Invitation sent successfully", token } };
});

const port = Number(process.env.CUSTOMER_SERVICE_PORT ?? 4102);
await app.listen({ port, host: "0.0.0.0" });
