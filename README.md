# Artisan Haven

A full-stack artisan marketplace platform built with a microservices backend (Fastify + MongoDB) and a Next.js frontend.

## Architecture Overview

```
artisan_haven/
├── frontend/          # Next.js 16 (App Router) + React 19 + Tailwind CSS v4
└── backend/           # Microservices (Fastify) + MongoDB + Docker
    ├── packages/
    │   └── database/  # Shared MongoDB models & utilities
    └── services/
        ├── api-gateway       # Fastify proxy + auth (session-based)
        ├── catalog-service   # Products, categories
        ├── customer-service  # Auth, profiles, cart, wishlist
        └── order-service     # Orders, Stripe payments
```

---

## Tech Stack & Rationale

### Frontend (`/frontend`)

| Technology | Version | Why We Use It |
|------------|---------|---------------|
| **Next.js** | 16.2.9 (App Router) | React framework with SSR, RSC, and file-based routing; optimal SEO and performance for e-commerce |
| **React** | 19.2.4 | Latest React with Server Components, Actions, and improved hydration |
| **Tailwind CSS** | v4 | Utility-first CSS with zero-config, smaller bundle, and modern features (OKLCH colors, container queries) |
| **shadcn/ui** | 4.11.0 | Accessible, customizable components built on Radix UI; copy-paste ownership |
| **Radix UI** | 1.6.0 | Unstyled, accessible primitives for complex components (dialog, dropdown, toast) |
| **Framer Motion / Motion** | 12.40.0 | Production-ready animations with React 19 support |
| **GSAP** | 3.15.0 | High-performance animations for complex sequences |
| **Stripe** | 6.7.0 (React) / 9.9.0 (JS) | Payment processing |
| **TypeScript** | 5.x | Type safety across the stack |
| **ESLint** | 9.x | Linting with Next.js config |

### Backend (`/backend`)

| Technology | Version | Why We Use It |
|------------|---------|---------------|
| **Fastify** | 5.6.0 | Fast, low-overhead HTTP framework with schema validation; better performance than Express |
| **MongoDB** | Native driver 7.4.0 | Flexible document model for product catalog, carts, orders; horizontal scaling |
| **TypeScript** | 5.9.2 | End-to-end type safety shared with frontend via `@artisan-haven/database` |
| **Session Auth** | Native | Lightweight session-based authentication (no external auth provider needed) |
| **Stripe** | 22.3.0 | Payment processing (PaymentIntents, webhooks) |
| **Nginx** | 1.27-alpine | Reverse proxy, SSL termination, load balancing for microservices |
| **Docker / Docker Compose** | Latest | Containerized deployment; consistent dev/prod environments |
| **tsx** | 4.19.2 | TypeScript execution for development (fast HMR) |

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node.js)
- **Docker** & **Docker Compose** (for containerized backend)
- **MongoDB Atlas** account (or local MongoDB)
- **Stripe** account (for payments)

---

## Quick Start (Docker - Recommended)

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd artisan_haven
```

### 2. Configure Environment Variables

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

Required backend variables:
```env
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?appName=Cluster0
MONGODB_DB_NAME=artisan_haven

# Auth - using session-based auth
AUTH_MODE=session

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ORDER_CURRENCY=usd

# Gateway
GATEWAY_PORT=4000
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

Required frontend variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Start Backend with Docker Compose

```bash
cd backend
docker compose up --build -d
```

This starts:
- **api-gateway** (port 4000)
- **catalog-service** (internal)
- **customer-service** (internal)
- **order-service** (internal)
- **nginx** (port 8080, proxies `/api/*` to gateway)

### 4. Seed Database

```bash
docker compose exec api-gateway npm --workspace @artisan-haven/database run seed
```

### 5. Start Frontend (Separate Terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Local Development (Without Docker)

### Backend Services

```bash
cd backend
npm install

# Start each service in separate terminals:
npm run dev:gateway       # http://localhost:4000
npm run dev:catalog       # internal
npm run dev:customers     # internal
npm run dev:orders        # internal
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

---

## Project Structure Details

### Frontend (`/frontend`)

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (shop)/            # Shop layout (catalog, product, cart)
│   ├── (dashboard)/       # User dashboard (orders, profile)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shop/              # Shop-specific components
│   └── layout/            # Header, footer, navigation
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (api client, constants, types)
└── public/                # Static assets
```

### Backend (`/backend`)

```
backend/
├── packages/
│   └── database/          # Shared MongoDB models, indexes, seed
│       └── src/
│           ├── index.ts       # Mongo client & collection helpers
│           ├── auth.ts        # Password hashing & session tokens
│           └── storefront.ts  # Type definitions & serializers
├── services/
│   ├── api-gateway/       # Entry point, auth, proxy to services
│   ├── catalog-service/   # Products, categories
│   ├── customer-service/  # Auth, profile, cart, wishlist
│   └── order-service/     # Orders, Stripe payments, tracking
├── nginx/                 # Nginx reverse proxy config
├── docker-compose.yml     # Local dev stack
├── Dockerfile.service     # Multi-service Dockerfile
└── package.json           # Workspace root
```

---

## Available Scripts

### Frontend
```bash
cd frontend
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Backend
```bash
cd backend
npm install                    # Install all workspace deps

# Individual services
npm run dev:gateway
npm run dev:catalog
npm run dev:customers
npm run dev:orders
```

### Docker
```bash
cd backend
docker compose up --build -d   # Start all services
docker compose down            # Stop all
docker compose logs -f         # View logs
docker compose exec api-gateway sh  # Shell into gateway
```

---

## Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Yes | Database name (e.g., `artisan_haven`) |
| `AUTH_MODE` | Yes | `session` (session-based auth) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `ORDER_CURRENCY` | No | Currency code (default `usd`) |
| `GATEWAY_PORT` | No | API gateway port (default 4000) |

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:4000`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key for checkout |

---

## API Endpoints (via Gateway on port 4000)

| Method | Endpoint | Service | Auth Required |
|--------|----------|---------|:---:|
| GET | `/health` | api-gateway | No |
| GET | `/catalog/products` | catalog-service | No |
| GET | `/catalog/products/:slug` | catalog-service | No |
| POST | `/catalog/products` | catalog-service | Yes (admin) |
| POST | `/auth/register` | customer-service | No |
| POST | `/auth/login` | customer-service | No |
| POST | `/auth/logout` | customer-service | Yes |
| GET | `/customers/cart` | customer-service | Yes |
| POST | `/customers/cart/items` | customer-service | Yes |
| PATCH | `/customers/cart/items/:itemId` | customer-service | Yes |
| DELETE | `/customers/cart/items/:itemId` | customer-service | Yes |
| GET | `/customers/addresses` | customer-service | Yes |
| POST | `/customers/addresses` | customer-service | Yes |
| DELETE | `/customers/addresses/:addressId` | customer-service | Yes |
| GET | `/customers/profile` | customer-service | Yes |
| PATCH | `/customers/profile` | customer-service | Yes |
| GET | `/orders/orders` | order-service | Yes |
| GET | `/orders/orders/:orderNumber` | order-service | Yes |
| POST | `/orders/orders` | order-service | Yes |
| GET | `/orders/track/:orderNumber` | order-service | No |
| GET | `/payments/stripe/config` | order-service | No |
| POST | `/payments/stripe/create-payment-intent` | order-service | Yes |
| POST | `/payments/stripe/confirm-order` | order-service | Yes |
| POST | `/payments/stripe/webhook` | order-service | No |

---

## Deployment

### Production Checklist

1. **Environment Variables** - Set all production secrets
2. **Database** - Use MongoDB Atlas
3. **SSL** - Configure Nginx with Let's Encrypt / cert-manager
4. **Domain** - Point DNS to load balancer / Nginx
5. **Secrets** - Use Docker secrets / Kubernetes secrets / Vercel env vars

### Frontend (Vercel - Recommended)

```bash
cd frontend
npm run build
# Deploy to Vercel, connect Git repo, add env vars
```

### Backend (Docker / Kubernetes / Cloud Run)

```bash
cd backend
docker compose up --build -d
# Or build/push images to registry and deploy via K8s
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `npm install` fails in backend | Delete `package-lock.json` and `node_modules`, re-run |
| MongoDB connection refused | Check `MONGODB_URI`; ensure network access allows your IP |
| CORS errors | Verify `NEXT_PUBLIC_API_URL` matches gateway origin |
| Stripe checkout fails | Check key IDs match; verify webhook URL in Stripe dashboard |
| Frontend build fails | Run `npm run lint` first; fix TypeScript errors |

---

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open Pull Request

---

## License

MIT License - see LICENSE file for details.

---

## Support

- **Issues**: GitHub Issues
- **Docs**: This README + inline code comments
