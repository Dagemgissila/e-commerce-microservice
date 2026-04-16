# E-Commerce Microservices Architecture

A production-ready microservices backend built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, **Kafka**, and **Redis** — all secured and orchestrated behind **Nginx** and an **API Gateway**.

---

## Architecture Overview

All client traffic enters the system through **Nginx** (port `80`), which proxies requests to the **API Gateway**. Individual microservices are isolated in an internal Docker network and are **not directly accessible** from the outside.

```mermaid
graph TD
    Client[Client] -->|Port 80| Nginx[Nginx]
    Nginx -->|Proxy| Gateway[API Gateway :3000]
    
    Gateway -->|Auth & Route| Users[User Service :4000]
    Gateway -->|Auth & Route| Products[Product Service :4001]
    Gateway -->|Auth & Route| Orders[Order Service :4002]
    Gateway -->|Auth & Route| Payments[Payment Service :4003]
    
    Orders -- Kafka --> Payments
    Payments -- Kafka --> Orders
    Orders -- HTTP --> Products
```

---

## Implementation Highlights

This system is built using a **decoupled, event-driven microservices architecture** focused on scalability and security.

### 1. Asynchronous Event-Driven Flow
Instead of hard-linking services with synchronous HTTP calls for every action, we use **Apache Kafka** for core business flows (like order fulfillment):
- **Order Created**: The Order Service emits an `order_created` event.
- **Payment Processing**: The Payment Service listens for `order_created`, simulates a payment, and emits `payment_processed`.
- **Inventory Sync**: The Order and Product services listen for `payment_processed` to either confirm the order or adjust stock.

### 2. Secure Gateway Pattern
We implement a **Reverse Proxy / API Gateway** pattern using Express and `http-proxy-middleware`:
- **Centralized Auth**: JWT validation happens at the entry point only.
- **Header Injection**: The gateway "trusts" the user and injects identity headers (`x-user-id`) before passing the request downstream.
- **Internal Security**: Downstream services verify an `INTERNAL_SECRET` to ensure the request came from the gateway, not an internal intruder.
- **Distributed Rate Limiting**: Protects against DoS attacks by limiting each IP to 60 requests per minute using Redis.

### 3. Synchronous Inter-Service Calls
For actions requiring immediate data (like checking product availability or retrieving categories during order creation), we use **Synchronous HTTP (Axios)**. These calls are secured similarly via internal secrets to maintain a consistent security posture.

### 4. High-Performance Caching
To reduce database load and minimize latency, the **Product Service** leverages **Redis**:
- **Read-Aside Caching**: API requests for product lists and details are first checked against Redis.
- **Categorization Cache**: Filtered product lists (by category) are cached independently.
- **Proactive Invalidation**: Caches are automatically cleared when products are updated or deleted to ensure data freshness.

---


This architecture uses **three layers of security**:

1.  **Network Isolation (Docker)**: Microservices are attached to a private internal network (`ecommerce-network`). No service exposes a public port except Nginx.
2.  **API Gateway Authentication (JWT)**: The Gateway enforces JWT validation for protected routes.
    *   **Verification**: Verifies `Authorization: Bearer <token>` using `JWT_SECRET`.
    *   **Identity Forwarding**: Injects `x-user-id` and `x-user-role` headers for downstream services.
3.  **Shared Internal Secret (`x-internal-secret`)**: Every microservice validates an `x-internal-secret` header injected by the API Gateway to prevent direct internal unauthorized access.

---

## API Reference

Base URL: `http://localhost`

### 1. Authentication (User Service)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/users/auth/register` | `POST` | No | Register a new user |
| `/api/users/auth/login` | `POST` | No | Login and receive JWT token |

**Register/Login Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### 2. Products (Product Service)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/products` | `GET` | No | Any | List all products (supports `?category=...`) |
| `/api/products/:id` | `GET` | No | Any | Get product details |
| `/api/products` | `POST` | Yes | ADMIN/SELLER | Create a product |

**Create Product Body:**
```json
{
  "name": "Luxury Watch",
  "description": "High-end stainless steel watch",
  "category": "Electronics",
  "price": 299.99,
  "stock": 50
}
```

### 3. Orders (Order Service)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/orders` | `POST` | Yes | Create a new order |
| `/api/orders` | `GET` | Yes | List user's orders |

**Create Order Body:**
```json
{
  "productId": "uuid-of-product",
  "quantity": 1,
  "userId": "uuid-of-user"
}
```

### 4. Payments (Payment Service)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/payments` | `GET` | Yes | List payment history |

---

## Getting Started

### Setup & Run
1.  **Environment**: Ensure `.env` files in each service directory have matching `INTERNAL_SECRET` and `JWT_SECRET`.
2.  **Start Services**:
    ```bash
    docker compose up -d --build
    ```

## Infrastructure Stack
*   **Entry**: Nginx
*   **Gateway**: Express Proxy
*   **Database**: PostgreSQL (Prisma ORM)
*   **Messaging**: Kafka (Event-driven updates)
*   **Caching & Rate Limiting**: Redis

---

## Technical Operations

### Database Migrations
This project uses **Prisma**. If you modify the `schema.prisma` file in any service:
1.  Navigate to the service directory (e.g., `cd product-service`).
2.  Run the migration (use host port `5433` for local DB access):
    ```bash
    DATABASE_URL=postgresql://user:password@localhost:5433/product_db?schema=public npx prisma migrate dev --name your_migration_name
    ```
3.  The client will automatically regenerate, updating your TypeScript types.
