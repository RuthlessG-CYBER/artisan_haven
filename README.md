# Artisan Haven

A full-stack artisan marketplace platform built with a microservices backend and a Next.js frontend.

## Architecture Overview

```
artisan_haven/
├── frontend/          # Next.js 15 (App Router) + React 19 + Tailwind CSS v4
└── backend/           # Microservices (Fastify) + MongoDB + Docker
    ├── packages/
    │   └── database/  # Shared MongoDB models & utilities
    └── services/
        ├── api-gateway   # Fastify proxy + auth (session-based)
        ├── catalog-service   # Products, categories
        ├── customer-service  # Auth, profiles, cart, wishlist
        ├── order-service     # Orders, Razorpay payments
        └── auth-sync-service # (optional) Clerk webhook sync
```

---

## Tech Stack & Rationale

### Frontend (`/frontend`)

| Technology | Version | Why We Use It |
|------------|---------|---------------|
| **Next.js** | 15.2.9 (App Router) | React framework with SSR, RSC, and file-based routing; optimal SEO and performance for e-commerce |
| **React** | 19.2.4 | Latest React with Server Components, Actions, and improved hydration |
| **Tailwind CSS** | v4 | Utility-first CSS with zero-config, smaller bundle, and modern features (OKLCH colors, container queries) |
| **shadcn/ui** | 4.11.0 | Accessible, customizable components built on Radix UI; copy-paste ownership |
| **Radix UI** | 1.6.0 | Unstyled, accessible primitives for complex components (dialog, dropdown, toast) |
| **Framer Motion / Motion** | 12.40.0 | Production-ready animations with React 19 support |
| **GSAP** | 3.15.0 | High-performance animations for complex sequences |
| **Razorpay** | 2.9.6 | Indian payment gateway integration for checkout |
| **TypeScript** | 5.x | Type safety across the stack |
| **ESLint** | 9.x | Linting with Next.js config |

### Backend (`/backend`)

| Technology | Version | Why We Use It |
|------------|---------|---------------|
| **Fastify** | 5.x | Fast, low-overhead HTTP framework with schema validation; better performance than Express |
| **MongoDB** | 7.x (driver) | Flexible document model for product catalog, carts, orders; horizontal scaling |
| **TypeScript** | 5.x | End-to-end type safety shared with frontend via `@artisan-haven/database` |
| **MongoDB Driver** | 7.4.0 | Native driver (no ORM overhead); direct control over queries |
| **Session Auth** | Native | Lightweight session-based authentication (no external auth provider needed) |
| **Razorpay** | Native SDK | Indian payment gateway for UPI, cards, wallets |
| **Nginx** | Latest | Reverse proxy, SSL termination, load balancing for microservices |
| **Docker / Docker Compose** | Latest | Containerized deployment; consistent dev/prod environments |
| **tsx** | 4.x | TypeScript execution for development (fast HMR) |

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node.js)
- **Docker** & **Docker Compose** (for containerized backend)
- **MongoDB Atlas** account (or local MongoDB)
- **Razorpay** account (for payments)

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

# Auth - using session-based auth (no Clerk/Supabase needed)
AUTH_MODE=session

# Payments
RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx
ORDER_CURRENCY=USD

# Gateway
GATEWAY_PORT=4000
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
```

Required frontend variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_xxx
```

### 3. Start Everything with Docker Compose

```bash
cd backend
docker compose up --build -d
```

This starts:
- **MongoDB** (port 27017) - or connects to your Atlas URI
- **api-gateway** (port 4000)
- **catalog-service** (internal)
- **customer-service** (internal)
- **order-service** (internal)
- **nginx** (port 80, proxies `/api/*` to gateway)

### 4. Initialize Database

```bash
# Generate MongoDB models
docker compose exec api-gateway npm --workspace @artisan-haven/database run build

# Seed database with sample products
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

# Generate DB types
npm --workspace @artisan-haven/database run build

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
│   ├── api/               # API routes (server actions)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shop/              # Shop-specific components
│   └── layout/            # Header, footer, navigation
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (supabase, utils, constants)
├── public/                # Static assets
└── styles/                # Global styles (if any)
```

### Backend (`/backend`)

```
backend/
├── packages/
│   └── database/          # Shared MongoDB models, indexes, seed
│       ├── src/
│       │   ├── models/    # Mongoose models
│       │   ├── indexes/   # Index definitions
│       │   └── seed.ts    # Seed script
│       └── package.json
├── services/
│   ├── api-gateway/       # Entry point, auth, proxy
│   ├── catalog-service/   # Products, categories
│   ├── customer-service/  # Auth, profile, cart, wishlist
│   ├── order-service/     # Orders, payments, fulfillment
│   └── auth-sync-service/ # Clerk webhook consumer
├── nginx/                 # Nginx reverse proxy config
├── supabase/              # SQL schemas (if using Supabase Postgres)
├── docker-compose.yml     # Local dev stack
├── Dockerfile.service     # Multi-service Dockerfile
└── package.json           # Workspace root
```

---

## Available Scripts

### Root (this directory)
```bash
# No root scripts - work in frontend/ or backend/
```

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
npm run prisma:generate        # Generate DB client (if Prisma)
npm run prisma:migrate         # Run migrations
npm run prisma:seed            # Seed database

# Individual services
npm run dev:gateway
npm run dev:catalog
npm run dev:customers
npm run dev:orders
npm run dev:auth-sync
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
| `RAZORPAY_KEY_ID` | Yes | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay key secret |
| `ORDER_CURRENCY` | No | Currency code (default `USD`) |
| `GATEWAY_PORT` | No | API gateway port (default 4000) |

### Frontend (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:4000`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay key ID for checkout |

---

## API Endpoints (via Gateway `/api`)

| Service | Base Path | Key Endpoints |
|---------|-----------|---------------|
| Catalog | `/api/catalog` | `GET /categories`, `GET /products`, `GET /products/:id` |
| Customers | `/api/auth`, `/api/customers` | `POST /register`, `POST /login`, `GET /me`, `GET /cart`, `POST /cart` |
| Orders | `/api/orders` | `POST /`, `GET /`, `GET /track/:number`, `POST /payments/razorpay/order` |
| Auth Sync | `/api/auth-sync` | `POST /clerk/webhook` |

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
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
# Or build/push images to registry and deploy via K8s
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `npm install` fails in backend | Delete `package-lock.json` and `node_modules`, re-run |
| MongoDB connection refused | Ensure MongoDB is running; check `MONGODB_URI` |
| CORS errors | Verify `NEXT_PUBLIC_API_URL` matches gateway origin |
| Razorpay checkout fails | Check key IDs match; verify webhook URL in Razorpay dashboard |
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
- **Architecture**: See `backend/README.md` and `frontend/README.md` for service-specific details