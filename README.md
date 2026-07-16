# Artisan Haven

A full-stack artisan marketplace built with a Fastify/MongoDB backend and Next.js frontend, featuring Stripe payments.

## Architecture

```
artisan_haven/
├── frontend/              # Next.js 16 (App Router) + React 19 + Tailwind v4
│   ├── app/               # Pages (shop, cart, checkout, dashboard, etc.)
│   ├── components/        # UI, auth, home, layout, product components
│   ├── hooks/             # use-cart, use-auth-store, use-wishlist
│   └── lib/               # API client, types, utils
├── backend/               # Fastify server + MongoDB
│   ├── server.ts          # Combined server (all routes inlined)
│   ├── packages/database/ # Shared MongoDB models & utilities
│   └── services/          # Original microservices (api-gateway, catalog, customer, order)
└── render.yaml            # Render deployment config
```

## Tech Stack

| Frontend | Backend |
|----------|---------|
| Next.js 16 (App Router) | Fastify 5.x |
| React 19 | MongoDB (Atlas) |
| Tailwind CSS v4 | Stripe Payments |
| shadcn/ui + Radix UI | Session Auth |
| Framer Motion / GSAP | TypeScript |
| Stripe SDK | tsx (runtime) |

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Stripe account

### 1. Environment Variables

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb://user:pass@host1:27017,host2:27017/db?ssl=true&replicaSet=rs&authSource=admin
MONGODB_DB_NAME=artisan_haven
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Start Backend
```bash
cd backend
npm install
npm run build    # Compile database package
npm run dev      # Start combined server on :4000
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev      # Start on :3000
```

### 4. Seed Data
```bash
cd backend
bash seed.sh
```

## Deployment

### Backend (Render)
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Set env vars in Render dashboard: `MONGODB_URI`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `CORS_ORIGIN`

### Frontend (Vercel)
- Import `frontend/` directory
- Set env vars: `NEXT_PUBLIC_API_URL` (Render URL), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Common Issues

| Issue | Fix |
|-------|-----|
| `querySrv EBADRESP` | Use `mongodb://` (non-SRV) URI format instead of `mongodb+srv://` |
| CORS errors | Ensure `NEXT_PUBLIC_API_URL` matches backend's `CORS_ORIGIN` |
| Stripe fails | Verify publishable/secret key pairs match |
| Backend starts on wrong port | Set `PORT` env var (Render sets this automatically) |

## API Endpoints

| Route | Description |
|-------|-------------|
| `GET /health` | Health check |
| `GET /catalog/products` | List products (filter, sort, paginate) |
| `GET /catalog/products/:slug` | Product detail |
| `POST /auth/register` | Create account |
| `POST /auth/login` | Login (returns token) |
| `GET /customers/cart` | Get cart |
| `POST /orders/orders` | Place order (COD) |
| `POST /payments/stripe/create-payment-intent` | Stripe payment |
| `POST /payments/stripe/confirm-order` | Confirm Stripe order |
