# Artisan Haven Backend

Microservices backend for the Artisan Haven e-commerce platform.

**Tech Stack:** Node.js, TypeScript, MongoDB (Mongoose), Fastify, Nginx, Docker

## Quick Start

See the [root README](../README.md) for complete setup instructions.

### Local Development (Docker - Recommended)

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
docker compose up --build -d
```

### Local Development (Manual)

```bash
cd backend
npm install

# Terminal 1 - API Gateway (port 4000)
npm run dev:gateway

# Terminal 2 - Catalog Service
npm run dev:catalog

# Terminal 3 - Customer Service
npm run dev:customers

# Terminal 4 - Order Service
npm run dev:orders
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| api-gateway | 4000 | Auth verification, request routing, rate limiting |
| catalog-service | internal | Products, categories, search |
| customer-service | internal | Auth, profiles, cart, wishlist, addresses |
| order-service | internal | Orders, payments (Razorpay), fulfillment |

## Environment Variables

See `.env.example` for all required variables.

Key variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `MONGODB_DB_NAME` - Database name (e.g., `artisan_haven`)
- `AUTH_MODE` - `session` (JWT/session cookies)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Payment credentials

## Database

Uses MongoDB with Mongoose models in `packages/database/src/models/`.

```bash
# Seed database
npm --workspace @artisan-haven/database run seed
```

## API Contract

Gateway proxies `/api/*` to internal services:
- `GET /api/catalog/categories`
- `GET /api/catalog/products`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/customers/me`
- `POST /api/orders`
- `POST /api/payments/razorpay/order`

Full contract in [root README](../README.md#api-endpoints-via-gateway-ap).

## Docker

```bash
docker compose up --build -d   # Start all services
docker compose down            # Stop all
docker compose logs -f         # View logs
```

## Nginx

`nginx/nginx.conf` proxies `/api/*` to gateway on port 4000.