# E-Commerce Microservices Architecture

A production-ready microservices backend built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, **Kafka**, and **Redis** — all secured and orchestrated behind **Nginx** and an **API Gateway**.

---

## 🏗️ Architecture Overview

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
    
    Products --- Redis[(Redis)]
    Gateway --- Redis_Limit[(Redis Rate Limit)]
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (optional, for local linting/IDE support)

### 2. Setup & Run
1.  **Start Services**:
    ```bash
    docker compose up -d --build
    ```
2.  **Database Initiation**:
    The databases are automatically created. Migrations are applied on startup for most services.

---

## 💡 Typical Workflow (Step-by-Step)

To test the full system, follow these steps in order:

### Step 1: User Registration
Create a new account.
- **Endpoint**: `POST /api/users/auth/register`
- **Body**: `{ "name": "Dagem", "email": "dagem@example.com", "password": "password123" }`

### Step 2: Login
Retrieve your JWT tokens to authenticate future requests.
- **Endpoint**: `POST /api/users/auth/login`
- **Body**: `{ "email": "dagem@example.com", "password": "password123" }`
- **Action**: Copy the `accessToken` from the response.

### Step 3: Add a Product (ADMIN/SELLER only)
Add products to your catalog.
- **Endpoint**: `POST /api/products`
- **Header**: `Authorization: Bearer <your_token>`
- **Body**: `{ "name": "iPhone 15", "description": "Latest Apple phone", "price": 999, "category": "Electronics", "stock": 50 }`

### Step 4: List and Filter Products
Browse the catalog.
- **Endpoint**: `GET /api/products?category=Electronics`
- **Auth**: No auth required for browsing.

### Step 5: Place an Order
Buy the product. This triggers an asynchronous payment flow via Kafka.
- **Endpoint**: `POST /api/orders`
- **Header**: `Authorization: Bearer <your_token>`
- **Body**: `{ "productId": "<uuid-from-step-3>", "quantity": 1 }`

### Step 6: View Payment Status
Check if your payment was processed by the automated payment service.
- **Endpoint**: `GET /api/payments`
- **Header**: `Authorization: Bearer <your_token>`

---

## 📘 API Reference

### 👤 User Service
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/auth/register` | Body: `{ name, email, password }` |
| `POST` | `/api/users/auth/login` | Body: `{ email, password }`. Returns `{ user, accessToken, refreshToken }` |

### 📦 Product Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | No | Optional Query: `?category=...` |
| `GET` | `/api/products/:id` | No | Get details of a single product |
| `POST` | `/api/products` | Yes | Body: `{ name, description, price, category, stock }` |
| `PUT` | `/api/products/:id` | Yes | Update product fields |
| `DELETE` | `/api/products/:id` | Yes (ADMIN) | Remove product |

### 🛒 Order Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Yes | Body: `{ productId, quantity }` |
| `GET` | `/api/orders` | Yes | List all orders with optional `?category=...` |
| `PUT` | `/api/orders/:id` | No* | Internal: Updates order status (e.g. `PENDING`, `COMPLETED`) |

### 💰 Payment Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/payments` | Yes | List all payment events and transaction states |
| `GET` | `/api/payments/:id` | Yes | Get specific payment details |

---

## 🛡️ Security & Performance

- **Distributed Rate Limiting**: The API Gateway uses **Redis** to limit clients to **60 requests per minute** to protect against brute-force and DoS.
- **JWT Authorization**: Authenticated routes require a `Bearer` token. Roles (e.g., `ADMIN`) are checked at the Gateway layer.
- **Internal Security**: Services verify an `x-internal-secret` header to ensure requests only originate from the API Gateway.
- **Redis Caching**: The Product Service caches catalog data (valid for 60s) to ensure blazing-fast response times.

---

## 🛠️ Technical Operations

### Database Migrations (Prisma)
If you modify `schema.prisma` in any service:
```bash
# Example for Product Service
cd product-service
DATABASE_URL=postgresql://user:password@localhost:5433/product_db?schema=public npx prisma migrate dev --name your_migration_name
```

### Rebuilding After Dependency Changes
If you add new npm packages:
```bash
docker compose build <service-name>
docker compose up -d <service-name>
```
