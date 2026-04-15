# E-Commerce Microservices Architecture

A production-ready microservices backend built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, **Kafka**, and **Redis** — all secured and orchestrated behind an **API Gateway**.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Security Design](#security-design)
- [Services](#services)
- [Infrastructure](#infrastructure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Workflows](#workflows)

---

## Architecture Overview

All client traffic enters the system exclusively through the **API Gateway** (port `3000`). Individual microservices are isolated in an internal Docker network and are **not directly accessible** from outside.

```
Client
  │
  ▼
[ API Gateway :3000 ]   ← Only public entry point
  │
  ├──► [ User Service :4000 ]       (internal only)
  ├──► [ Product Service :4001 ]    (internal only)
  ├──► [ Order Service :4002 ]      (internal only)
  └──► [ Payment Service :4003 ]    (internal only)
             │
             ▼
     [ Kafka Message Broker ]
             │
             ▼
     [ Payment Service ]   ← consumes events asynchronously
```

---

## Security Design

This architecture uses **two layers of security** to restrict direct microservice access:

### Layer 1: Network Isolation (Docker)
All microservices are attached to a private internal Docker network (`ecommerce-network`). No service exposes a public port except the API Gateway. **Direct access to any microservice port is blocked at the network level.**

### Layer 2: Shared Internal Secret (`x-internal-secret` Header)
Even if someone finds a way into the internal network, every microservice validates an `x-internal-secret` header on every incoming request:

- The **API Gateway** reads `INTERNAL_SECRET` from its `.env` and injects it as the `x-internal-secret` header on every proxied request.
- Each **microservice** validates this header against its own `INTERNAL_SECRET` env variable.
- If the header is missing or incorrect, the service responds with:

```json
{
  "error": "Access Forbidden: Direct access to microservices is strictly prohibited. Requests must originate from the API Gateway."
}
```

> **Important:** The `INTERNAL_SECRET` value **must match** across the API Gateway and all microservice `.env` files.

---

## Services

| Service | Internal Port | Responsibility |
|---|---|---|
| **API Gateway** | `3000` (public) | Routing, security headers, logging, CORS |
| **User Service** | `4000` (internal) | User registration |
| **Product Service** | `4001` (internal) | Product CRUD, Redis caching |
| **Order Service** | `4002` (internal) | Order creation and management |
| **Payment Service** | `4003` (internal) | Async payment via Kafka events |

---

## Infrastructure

| Component | Technology | Purpose |
|---|---|---|
| **Database** | PostgreSQL 15 | Separate DB per service (`user_db`, `product_db`, `order_db`, `payment_db`) |
| **ORM** | Prisma 7 | Type-safe database access and migrations |
| **Cache** | Redis 7 | Product catalog caching |
| **Message Broker** | Apache Kafka | Async inter-service events (`order_created`, `payment_processed`) |
| **Orchestration** | Docker Compose | Unified local development environment |

---

## Getting Started

### Prerequisites
- Docker and Docker Compose installed.

### Setup

1. Clone the repository.
2. Ensure `.env` files exist for every service (each must include `INTERNAL_SECRET` with the **same value**).

   **`api-gateway/.env`** example:
   ```env
   PORT=3000
   USER_SERVICE=http://user-service:4000
   PRODUCT_SERVICE=http://product-service:4001
   ORDER_SERVICE=http://order-service:4002
   PAYMENT_SERVICE=http://payment-service:4003
   INTERNAL_SECRET=your-strong-secret-here
   ```

   **`<service>/.env`** example (all microservices):
   ```env
   PORT=4000
   DATABASE_URL=postgresql://user:password@postgres:5432/user_db?schema=public
   KAFKA_BROKER=kafka:9092
   REDIS_URL=redis://redis:6379
   INTERNAL_SECRET=your-strong-secret-here
   ```

3. Build and start all services:
   ```bash
   docker compose up --build
   ```

   > **Note:** Use `docker compose` (v2, space) rather than `docker-compose` (v1, hyphen) to avoid known compatibility issues with BuildKit images.

4. Prisma migrations run automatically on container startup via:
   ```dockerfile
   CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
   ```

### Verify Services Are Running
```bash
# API Gateway health check (should return 200)
curl http://localhost:3000/health

# Gateway proxies orders route
curl http://localhost:3000/api/orders

# Direct service access (blocked - returns 403)
# (only possible if port is temporarily exposed for testing)
curl http://localhost:4001/api/products
```

---

## API Reference

All endpoints are accessed via the **API Gateway** at `http://localhost:3000`.

### User Service → `/api/users`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `POST` | `/api/users/register` | Register a new user | `{ name, email, password }` |
| `GET` | `/health` | Health check | — |

### Product Service → `/api/products`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/products` | List all products | — |
| `GET` | `/api/products/:id` | Get a product by ID | — |
| `POST` | `/api/products` | Create a new product | `{ name, price, stock }` |
| `PUT` | `/api/products/:id` | Update a product | `{ name?, price?, stock? }` |
| `DELETE` | `/api/products/:id` | Delete a product | — |

### Order Service → `/api/orders`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/orders` | List all orders | — |
| `POST` | `/api/orders` | Place a new order | `{ userId, productId, quantity }` |
| `PUT` | `/api/orders/:id` | Update order status | `{ status }` |

### Payment Service

Payment processing is handled **internally** via Kafka. There are no public endpoints for payment initiation; the Payment Service consumes `order_created` events automatically.

---

## Workflows

### Order Creation Flow

```
1. Client  →  POST /api/orders  →  API Gateway
2. API Gateway  →  adds x-internal-secret header  →  Order Service
3. Order Service validates secret
4. Order Service fetches product info  →  Product Service
5. Order Service creates order in DB
6. Order Service publishes `order_created` event  →  Kafka
7. Payment Service consumes event
8. Payment Service processes payment
9. Payment Service calls Order Service to update status (PAID / FAILED)
```

### Security Header Flow (per request)

```
Client Request
  → API Gateway (reads INTERNAL_SECRET from env)
  → Injects header: x-internal-secret: <secret>
  → Microservice validates header
  ✓ Match → request proceeds
  ✗ No match / missing → 403 Forbidden
```

---

## Environment Variables Reference

| Variable | Used In | Description |
|---|---|---|
| `PORT` | All | Port the service listens on |
| `DATABASE_URL` | All microservices | PostgreSQL connection string |
| `KAFKA_BROKER` | Order, Payment | Kafka broker address |
| `REDIS_URL` | Product | Redis cache address |
| `INTERNAL_SECRET` | All | Shared secret for internal auth |
| `USER_SERVICE` | API Gateway | Internal URL to user service |
| `PRODUCT_SERVICE` | API Gateway | Internal URL to product service |
| `ORDER_SERVICE` | API Gateway | Internal URL to order service |
| `PAYMENT_SERVICE` | API Gateway | Internal URL to payment service |
| `PRODUCT_SERVICE_URL` | Order | Internal URL for stock validation |
| `ORDER_SERVICE_URL` | Payment | Internal URL for status update |
