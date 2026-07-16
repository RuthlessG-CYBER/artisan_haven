# Artisan Haven

<div align="center">
  <img src="docs/images/home.png" alt="Artisan Haven Banner" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); margin-bottom: 24px;" />
  <h3>Sustainably Handcrafted • Wholesome Foods • Custom Celebrations</h3>
  <p>A state-of-the-art full-stack marketplace featuring a high-performance <b>Fastify + PostgreSQL (Prisma ORM)</b> backend, a reactive <b>Next.js 16 (App Router) + React 19</b> frontend, and integrated <b>Stripe</b> checkout.</p>
</div>

---

## 📖 Table of Contents
1. [Project Overview](#project-overview)
2. [Visual Showcase & User Flows](#visual-showcase--user-flows)
3. [Key Features](#key-features)
4. [System Architecture & Docker Containerization](#system-architecture--docker-containerization)
5. [Database Schema & Data Model](#database-schema--data-model)
6. [Tech Stack](#tech-stack)
7. [Quick Start & Installation](#quick-start--installation)
8. [Comprehensive API Reference](#comprehensive-api-reference)
9. [Deployment & Production Guide](#deployment--production-guide)

---

## 🌟 Project Overview

**Artisan Haven** bridges the gap between independent sustainable creators and conscientious consumers. Designed with rich modern aesthetics (vibrant dark glassmorphism, responsive micro-animations, and curated color palettes), the platform serves three distinct product verticals within a single unified shopping experience:

1. **🎨 Handcrafted Art & Eco-Decor**: Unique reclaimed glass vases, eco-cotton wall art, and reclaimed wood frames featuring sustainability scores and artisanal storytelling.
2. **🥗 Wholesome Healthy Foods**: Organic snacks, vegan protein cookies, and fresh energy bars backed by detailed nutritional labeling (calories, protein, carbs, fat, fiber, and sugar breakdown).
3. **🎂 Custom Birthday Cakes**: An interactive multi-step customization engine where customers design their perfect celebratory cake by choosing exact flavors, tiers/sizes, dietary options, and personalized inscriptions.

---

## 🖥️ Visual Showcase & User Flows

### 1. Landing Experience & Hero Section
The landing page greets visitors with stunning dark glassmorphic cards, emerald accent typography, and dynamic metrics (`500+ Products`, `100% Handmade`, `10K+ Happy Customers`). It immediately conveys premium quality and artisanal trust.

<div align="center">
  <img src="docs/images/home.png" alt="Home Page Hero" width="90%" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
</div>

### 2. Shop All Products & Advanced Multi-Faceted Filtering
The marketplace catalog allows users to filter products across multiple dimensions: **Product Type** (`All`, `Art & Crafts`, `Healthy Foods`, `Custom Cakes`), **Price Ranges**, **Stock Availability**, and **Special Badges** (`Featured`, `Best Seller`). Users can instantly search by keywords or toggle between grid and detailed list layouts.

<div align="center">
  <img src="docs/images/shop.png" alt="Shop Catalog and Filters" width="90%" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
</div>

### 3. Interactive Custom Birthday Cake Builder (`/cakes`)
For custom cake orders, the frontend provides a 4-step interactive configuration wizard (`1. Flavor & Size` ➔ `2. Design` ➔ `3. Details` ➔ `4. Review`). Customers can mix and match vanilla, chocolate, red velvet, strawberry, carrot, or lemon flavors with sizes ranging from 6-inch (Serves 8-10) to 12-inch (Serves 28-32), dynamically updating base pricing and customization payloads.

<div align="center">
  <img src="docs/images/cakes.png" alt="Custom Cake Builder" width="90%" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
</div>

### 4. Healthy Selection & Nutritional Labeling (`/healthy-foods`)
Every food product includes dedicated nutritional breakdowns. The specialized `Our Healthy Selection` portal highlights caloric intake, macronutrient profiles, and organic ingredient transparency directly on the product cards and detail pages.

<div align="center">
  <img src="docs/images/healthy-foods.png" alt="Healthy Foods and Nutrition" width="90%" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
</div>

### 5. Customer Portal & Order Tracking (`/dashboard`)
Authenticated users gain access to a dedicated dashboard providing quick metrics (`Total Orders`, `Delivered`, `Wishlist Items`), recent order histories (`ORD-35142476-B7372A`), address management, account profile settings, and live multi-stage order tracking (`Payment Pending` ➔ `Processing` ➔ `Ready for Dispatch` ➔ `Shipped` ➔ `Delivered`).

<div align="center">
  <img src="docs/images/dashboard.png" alt="Customer Dashboard" width="90%" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
</div>

---

## ⚡ Key Features

- **🛍️ Unified Shopping Cart & Checkout**: Add standard items, customized cakes, and healthy snacks into a single cart. Supports dynamic quantity updates, unit price lock-ins, and flexible fulfillment methods (**Standard Shipping**, **Express Delivery**, **Local Delivery**, and **Store Pickup**).
- **💳 Dual Payment Options**: Seamless integration with **Stripe Payment Intents** (automatic payment methods, secure confirmation hooks) alongside traditional **Cash on Delivery (COD)** processing.
- **🔐 Secure Session Authentication**: Custom token-based authentication using SHA-256 token hashing (`user_sessions`), automatic token expiration cleaning, and role-based access headers (`x-user-id`, `x-user-role`).
- **🛡️ Built-in Rate Limiting & Security**: Fastify request hooks enforce IP-based rate limiting (`100 requests / minute`) with standardized rate-limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`).
- **🐳 Full Docker Containerization**: Orchestrated full-stack setup (`docker-compose.yml`) running PostgreSQL, Fastify API, and Next.js standalone servers in isolated, production-ready containers.
- **📦 Seamless Data Import & Seeding**: Includes a dedicated TypeScript seed utility (`seed_products.ts`) that reads directly from raw JSON catalogs (`artisan_haven.products.json`) and populates relational PostgreSQL tables automatically on startup.

---

## 🏗️ System Architecture & Docker Containerization

### Repository & Workspace Structure
```
artisan_haven/
├── frontend/                       # Next.js 16 App Router + React 19 + Tailwind v4
│   ├── app/                        # Route pages (/shop, /cakes, /healthy-foods, /dashboard, etc.)
│   ├── components/                 # Reusable UI elements & layout navigation
│   ├── hooks/                      # Global state (use-cart, use-auth-store, use-wishlist)
│   ├── lib/                        # API client wrappers & TypeScript definitions
│   └── Dockerfile                  # Multi-stage standalone production build
│
├── backend/                        # Fastify 5.x REST API Server
│   ├── server.ts                   # Monolithic production server (Prisma + Stripe)
│   ├── seed_products.ts            # Automated JSON ➔ SQL importer
│   ├── Dockerfile                  # API Container build + migration entrypoint
│   └── packages/database/          # Shared Database Abstraction Layer
│       ├── prisma/schema.prisma    # Complete relational PostgreSQL schema
│       └── src/index.ts            # Singleton PrismaClient export & auth helpers
│
├── docs/images/                    # Embedded README screenshots
├── docker-compose.yml              # Master full-stack container orchestration
└── render.yaml                     # Infrastructure configuration for cloud deployment
```

### Docker Container Architecture
When running via `docker compose up --build`, the system deploys three interconnected services within the `artisan_haven_default` network:

```
[ Browser Client ] 
       │
       ├─► (Port 3000) ──► [ artisan-frontend (Next.js Standalone Container) ]
       │                                  │
       │                              HTTP REST
       │                                  ▼
       └─► (Port 4000) ──► [ artisan-backend (Fastify 5.x API Container) ]
                                          │
                                   Prisma / TCP 5432
                                          ▼
                           [ artisan-postgres (PostgreSQL 16 Alpine Container) ]
                                          │
                                 Volume: postgres_data
```

---

## 🗄️ Database Schema & Data Model

The database layer utilizes **PostgreSQL** managed by **Prisma ORM**. Below is an overview of the primary relational models defined in `backend/packages/database/prisma/schema.prisma`:

| Model | Table Name | Purpose & Key Fields |
| :--- | :--- | :--- |
| **Category** | `categories` | Product categorization (`id`, `name`, `slug`). |
| **Product** | `products` | Core catalog entities (`slug`, `price`, `compareAtPrice`, `productType`, `stockQuantity`, `sustainabilityScore`, `images`, `ingredients`). |
| **ProductNutrition** | `product_nutrition` | Nutritional metadata (`calories`, `proteinGram`, `carbsGram`, `fatGram`, `fiberGram`, `sugarGram`) linked 1-to-1 with `Product`. |
| **User** | `users` | Secure credentials storage (`email`, `passwordHash`). |
| **UserProfile** | `user_profiles` | Customer demographic data (`firstName`, `lastName`, `phone`, `role: CUSTOMER`). |
| **UserSession** | `user_sessions` | Active auth sessions (`tokenHash`, `expiresAt`, `revokedAt`). |
| **CartItem** | `cart_items` | Active cart state (`userId`, `productId`, `quantity`, `customizationData`, `status: ACTIVE/CONVERTED`). |
| **Address** | `addresses` | Saved customer shipping/billing addresses (`type`, `fullName`, `line1`, `city`, `state`, `postalCode`, `isDefault`). |
| **Order** | `orders` | Placed orders (`orderNumber`, `status`, `fulfillmentMethod`, `subtotal`, `shippingFee`, `taxAmount`, `totalAmount`, `shippingAddressJson`). |
| **OrderItem** | `order_items` | Snapshot of purchased products (`productId`, `productName`, `unitPrice`, `quantity`, `customizationData`). |
| **PaymentOrder** | `payment_orders` | Payment transaction logs (`provider: STRIPE`, `providerReference`, `amount`, `status: CREATED/CAPTURED`). |

---

## 💻 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components, Standalone Docker Output)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS design variables
- **Component Primitives**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & CSS micro-animations
- **Payments**: [Stripe Elements / `@stripe/stripe-js`](https://stripe.com/docs/js)

### Backend & DevOps
- **Engine**: [Fastify 5.x](https://fastify.dev/) (`@fastify/sensible`, `@fastify/cors`)
- **Language & Runtime**: TypeScript / [Node.js 20+](https://nodejs.org/) (`tsx`)
- **Database ORM**: [Prisma Client (`@prisma/client`)](https://www.prisma.io/)
- **Database Engine**: PostgreSQL 16 Alpine
- **Containerization**: [Docker & Docker Compose](https://www.docker.com/) (Multi-stage builds)
- **Payment Processing**: [Stripe Node SDK](https://github.com/stripe/stripe-node)

---

## 🚀 Quick Start & Installation

### Option A: One-Command Docker Setup (Recommended)
You can run the entire full-stack application (`PostgreSQL` + `Fastify Backend` + `Next.js Frontend`) inside isolated containers with zero manual configuration:

```bash
# Start all services with automated Prisma schema push and JSON catalog seeding
docker compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **PostgreSQL Database**: Port `5432` (`postgres:soumya / artisan`)

---

### Option B: Manual Local Setup

#### Prerequisites
- **Node.js** v20.0.0 or higher
- **PostgreSQL** running locally on port `5432` (or an external cloud database URI)
- **Stripe Account** (for testing payment workflows)

#### Step 1: Clone & Configure Environment Variables
Create the required `.env` files across your backend and frontend environments:

**1. `backend/.env` and `backend/packages/database/.env`**:
```env
# PostgreSQL Database URL (adjust credentials to match your setup)
DATABASE_URL="postgresql://postgres:soumya@localhost:5432/artisan"

# Stripe Secret Key
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."

# CORS Configuration
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

**2. `frontend/.env`**:
```env
# Point frontend API client to local Fastify server
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
```

#### Step 2: Database Setup & Catalog Seeding
Navigate into the `backend` workspace, build the shared database package, synchronize your PostgreSQL tables, and import the sample product catalog:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Compile the database package & generate Prisma Client
npm run build

# 3. Push the schema to your local PostgreSQL database
cd packages/database
npx prisma db push

# 4. Run the seed script to import products from root JSON file into SQL
cd ../..
npx tsx seed_products.ts
```

*Output expectation:*
```text
Reading products from /home/.../artisan_haven.products.json...
Found 8 products. Inserting into PostgreSQL...
Successfully imported all products into SQL!
```

#### Step 3: Launch the Backend Server
```bash
cd backend
npm run dev
```
*The Fastify server will start listening at `http://localhost:4000`.*

#### Step 4: Launch the Frontend Application
Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
*The Next.js web application will be live at `http://localhost:3000`.*

---

## 🔌 Comprehensive API Reference

The Fastify server exposes the following endpoints under `http://localhost:4000`:

### System & Health
- `GET /` ➔ Returns system uptime (`service: "artisan-haven", status: "ok"`).
- `GET /health` ➔ Simple health check payload.

### Catalog (`/catalog`)
- `GET /catalog/products` ➔ Retrieve products with support for query filters:
  - `?product_type=art_crafts|healthy_food|cakes`
  - `?is_featured=true` & `?is_best_seller=true`
  - `?in_stock=true`
  - `?search=keyword`
  - `?min_price=10&max_price=100`
  - `?sort=price_asc|price_desc|popular|newest`
  - `?limit=50&offset=0`
- `GET /catalog/products/:slug` ➔ Retrieve full details for a specific product (`nutrition` & `category` included).
- `POST /catalog/products` ➔ Admin endpoint to bulk upsert products and nutritional profiles into PostgreSQL.

### Authentication (`/auth`)
- `POST /auth/register` ➔ Register a new customer (`firstName`, `lastName`, `email`, `password`, `phone`). Returns user profile + `token`.
- `POST /auth/login` ➔ Authenticate via `email` and `password`. Returns session `token`.
- `POST /auth/logout` ➔ Revoke active bearer token session (`Authorization: Bearer <token>`).

### Customer Management (`/customers` - Requires Bearer Token)
- `GET /customers/profile` ➔ Get current authenticated user's profile.
- `PATCH /customers/profile` ➔ Update first name, last name, or phone number.
- `GET /customers/cart` ➔ Retrieve active cart items for current user.
- `POST /customers/cart/items` ➔ Add item to cart (`productId`, `quantity`, `customizationData`).
- `PATCH /customers/cart/items/:itemId` ➔ Update item quantity.
- `DELETE /customers/cart/items/:itemId` ➔ Remove item from cart.
- `GET /customers/addresses` ➔ List saved addresses.
- `POST /customers/addresses` ➔ Add new shipping/billing address (`isDefault` support).
- `DELETE /customers/addresses/:addressId` ➔ Delete address.

### Orders & Tracking (`/orders`)
- `GET /orders/orders` ➔ List current user's past orders (requires auth).
- `GET /orders/orders/:orderNumber` ➔ Get detailed receipt for a specific order (requires auth).
- `POST /orders/orders` ➔ Place a new order via Cash on Delivery (`shippingInfo`, `deliveryMethod`, `paymentMethod: cash_on_delivery`).
- `GET /orders/track/:orderNumber` ➔ Public endpoint to track shipment status and view timeline milestones.

### Payments (`/payments/stripe`)
- `GET /payments/stripe/config` ➔ Returns public Stripe publishable key.
- `POST /payments/stripe/create-payment-intent` ➔ Creates a Stripe `PaymentIntent` matching the user's active cart + calculated shipping fee (requires auth).
- `POST /payments/stripe/confirm-order` ➔ Converts cart items into a paid order after successful Stripe payment confirmation (`paymentIntentId`).
- `POST /payments/stripe/webhook` ➔ Stripe webhook listener for asynchronous event notifications (`payment_intent.succeeded`).

---

## 🌐 Deployment & Production Guide

### Option 1: Self-Hosted Docker Deployment (VPS / DigitalOcean / AWS EC2)
For self-hosted Linux servers, clone the repository and launch via Docker Compose:
```bash
git clone https://github.com/your-username/artisan_haven.git
cd artisan_haven
docker compose up -d --build
```
*Your production database, backend API, and Next.js frontend will run automatically in background containers.*

### Option 2: Cloud Deployment (Render + Vercel)
#### Deploying the Backend on Render (`render.yaml`)
1. Connect your GitHub repository on [Render](https://render.com/).
2. Select **Blueprint** and point to `render.yaml`.
3. Configure your production environment variables in the Render dashboard:
   - `DATABASE_URL`: Your cloud PostgreSQL instance URL (e.g., Supabase, Neon, or Render Postgres).
   - `STRIPE_SECRET_KEY`: Your live Stripe secret key.
   - `CORS_ORIGIN`: Your production frontend URL (e.g., `https://artisan-haven.vercel.app`).
4. The build command will automatically run:
   ```bash
   npm --workspace @artisan-haven/database run build && npx prisma migrate deploy --schema packages/database/prisma/schema.prisma
   ```

#### Deploying the Frontend on Vercel
1. Import the `frontend/` directory into [Vercel](https://vercel.com/).
2. Set the build environment variables:
   - `NEXT_PUBLIC_API_URL`: Your live Render backend API URL (e.g., `https://artisan-haven-api.onrender.com`).
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your live Stripe publishable key.
3. Deploy! Next.js 16 App Router optimizations will automatically bundle static pages and dynamic server components.

---

<div align="center">
  <p>Crafted with ❤️ and environmental mindfulness by the Artisan Haven Team.</p>
</div>
