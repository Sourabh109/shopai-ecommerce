# 🛒 ShopAI — E-Commerce Platform

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test keys)

---

## Setup

### 1. Backend Setup
```bash
cd ecommerce-platform/server
# Edit .env with your MongoDB URI and Stripe keys
npm install
npm run seed    # Seeds 14 sample products + admin user
npm run dev     # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ecommerce-platform/client
# Edit .env with your Stripe publishable key
npm install
npm run dev     # Starts on http://localhost:5173
```

---

## Admin Credentials (after seeding)
- **Email:** `admin@ecommerce.com`
- **Password:** `Admin@123456`

## Stripe Test Card
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/26`)
- **CVC:** Any 3 digits

---

## Features

| Feature | Details |
|---|---|
| 🔐 JWT Auth | Access + refresh tokens, secure HTTP-only cookies |
| 🛍️ Product Catalog | Search, filter by category/price/rating, pagination |
| 🛒 Shopping Cart | Persistent cart with stock validation |
| 💳 Stripe Checkout | 2-step checkout with PaymentIntent API |
| 🤖 AI Recommendations | Hybrid collaborative + content-based filtering |
| 📊 Admin Dashboard | Revenue charts, order management, product CRUD |

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | List products (search, filter, paginate) |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/cart/add` | Add to cart |
| POST | `/api/orders/payment-intent` | Create Stripe payment intent |
| POST | `/api/orders` | Create order after payment |
| GET | `/api/recommendations` | AI personalized recommendations |
| GET | `/api/recommendations/trending` | Trending products |
| GET | `/api/recommendations/similar/:id` | Similar products |
| GET | `/api/admin/stats` | Admin dashboard stats |
