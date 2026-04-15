# E-Commerce Microservices Architecture

A production-ready microservices backend built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, **Kafka**, and **Redis** — all secured and orchestrated behind **Nginx** and an **API Gateway**.

---

## Architecture Overview

All client traffic enters the system through **Nginx** (port `80`), which proxies requests to the **API Gateway**. Individual microservices are isolated in an internal Docker network and are **not directly accessible** from the outside.

```
Client
  │ (port 80)
  ▼
[ Nginx ]
  │
  ▼
[ API Gateway :3000 ]   ← Security & Routing Layer
  │
  ├──► [ User Service :4000 ]       (internal only)
  ├──► [ Product Service :4001 ]    (internal only)
  ├──► [ Order Service :4002 ]      (internal only)
  └──► [ Payment Service :4003 ]    (internal only)
```

---

## Security Design

This architecture uses **three layers of security**:

### Layer 1: Network Isolation (Docker)
Microservices are attached to a private internal network (`ecommerce-network`). No service exposes a public port except Nginx.

### Layer 2: API Gateway Authentication (JWT)
The Gateway enforces JWT validation for protected routes.
- **Verification**: Verifies `Authorization: Bearer <token>` using `JWT_SECRET`.
- **Authorization**: Restricts access based on roles (e.g., `ADMIN`, `SELLER`).
- **Identity Forwarding**: Injects `x-user-id` and `x-user-role` headers for downstream services.

### Layer 3: Shared Internal Secret (`x-internal-secret`)
Every microservice validates an `x-internal-secret` header injected by the API Gateway to prevent direct internal unauthorized access.

---

## Getting Started

### Prerequisites
- Docker and Docker Compose (v2).
- Node.js (for local IDE support).

### Setup

1. **Clone & Install**:
   ```bash
   # Install dependencies locally for IDE support
   npm install
   cd user-service && npm install
   cd ../product-service && npm install
   # repeat for all services
   ```

2. **Environment**: Ensure `.env` files exist with matching `INTERNAL_SECRET` and `JWT_SECRET`.

3. **Start Infrastructure**:
   ```bash
   docker compose up -d --build
   ```

---

## API Reference

Access via `http://localhost/api/...`

| Service | Prefix | Auth Required |
|---|---|---|
| **Users** | `/api/users/auth` | No (Register/Login) |
| **Products** | `/api/products` | GET (No), POST/PUT/DELETE (Yes) |
| **Orders** | `/api/orders` | Yes |
| **Payments** | `/api/payments` | Yes |

### Endpoint Details

- **Register**: `POST /api/users/auth/register`
- **Login**: `POST /api/users/auth/login`
- **Create Product**: `POST /api/products` (Requires `ADMIN` or `SELLER` role)

---

## Infrastructure

| Component | Technology |
|---|---|
| **Entry** | Nginx (Load Balancer / Reverse Proxy) |
| **Gateway** | Express Proxy with JWT Middleware |
| **DB** | PostgreSQL (Separate DB per service) |
| **ORM** | Prisma 7 |
| **Broker** | Apache Kafka |
| **Cache** | Redis |
