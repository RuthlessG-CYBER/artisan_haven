import fastify from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import fastifySensible from "@fastify/sensible";
import fastifyCors from "@fastify/cors";

import { hashSessionToken, getCollection } from "@artisan-haven/database";

const app = fastify({
  logger: true,
  trustProxy: true,
});

const publicPrefixes = ["/health", "/catalog", "/auth", "/orders/track", "/payments/stripe/config", "/payments/stripe/webhook"];

app.register(fastifySensible);
app.register(fastifyCors, {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
  credentials: true,
});

app.addHook("onRequest", async (request, reply) => {
  const pathname = request.url.split("?")[0] ?? "/";

  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw app.httpErrors.unauthorized("Missing bearer token.");
  }

  const token = authorization.replace("Bearer ", "");

  const sessionsCollection = await getCollection<any>("user_sessions");
  const session = await sessionsCollection.findOne({
    tokenHash: hashSessionToken(token),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw app.httpErrors.unauthorized("Session is invalid or expired.");
  }

  request.headers["x-user-id"] = session.userId;
  request.headers["x-user-email"] = session.email;
  request.headers["x-user-role"] = session.role || "CUSTOMER";
});

app.get("/health", async () => ({
  service: "api-gateway",
  status: "ok",
}));

app.register(fastifyHttpProxy, {
  prefix: "/catalog",
  upstream: process.env.CATALOG_SERVICE_URL ?? "http://localhost:4101",
  rewritePrefix: "/catalog",
});

app.register(fastifyHttpProxy, {
  prefix: "/customers",
  upstream: process.env.CUSTOMER_SERVICE_URL ?? "http://localhost:4102",
  rewritePrefix: "/customers",
});

app.register(fastifyHttpProxy, {
  prefix: "/auth",
  upstream: process.env.CUSTOMER_SERVICE_URL ?? "http://localhost:4102",
  rewritePrefix: "/auth",
});

app.register(fastifyHttpProxy, {
  prefix: "/orders",
  upstream: process.env.ORDER_SERVICE_URL ?? "http://localhost:4103",
  rewritePrefix: "/orders",
});

app.register(fastifyHttpProxy, {
  prefix: "/payments",
  upstream: process.env.ORDER_SERVICE_URL ?? "http://localhost:4103",
  rewritePrefix: "/payments",
});

const port = Number(process.env.GATEWAY_PORT ?? 4000);
await app.listen({
  port,
  host: "0.0.0.0",
});
