import fastify from "fastify";
import fastifySensible from "@fastify/sensible";
import fastifyCors from "@fastify/cors";
import { hashSessionToken, getCollection } from "@artisan-haven/database";

import { registerCatalogRoutes } from "./services/catalog-service/src/routes";
import { registerCustomerRoutes } from "./services/customer-service/src/routes";
import { registerOrderRoutes } from "./services/order-service/src/routes";

const app = fastify({ logger: true, trustProxy: true });

const publicPrefixes = ["/health", "/catalog", "/auth", "/orders/track", "/payments/stripe/config", "/payments/stripe/webhook"];

app.register(fastifySensible);
app.register(fastifyCors, {
  origin: [process.env.CORS_ORIGIN || "http://localhost:3000"],
  credentials: true,
});

app.addHook("onRequest", async (request, reply) => {
  const pathname = request.url.split("?")[0] ?? "/";
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) return;

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

app.get("/health", async () => ({ service: "artisan-haven", status: "ok" }));

registerCatalogRoutes(app);
registerCustomerRoutes(app);
registerOrderRoutes(app);

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
