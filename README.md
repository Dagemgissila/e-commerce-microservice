# E-Commerce Microservices Architecture

A production-ready microservices backend built with Node.js, Express, TypeScript, Prisma, PostgreSQL, Kafka, and Redis.

## System Architecture

The project consists of five core components:
0. **API Gateway**: Entry point for all client requests, providing routing, security, and logging.
1. **User Service**: Handles user registration and authentication.
2. **Product Service**: Manages product catalog and inventory.
3. **Order Service**: Orchestrates order creation and management.
4. **Payment Service**: Processes payments asynchronously via Kafka events.

### Infrastructure
- **Message Broker**: Kafka for asynchronous communication between services.
- **Cache**: Redis for product catalog caching.
- **Database**: PostgreSQL (separate databases for each service).
- **Orchestration**: Docker Compose for unified local development.

---

## Getting Started

### Prerequisites
- Docker and Docker Compose installed.

### Installation & Setup
1. Clone the repository.
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. The services are orchestrated via the API Gateway on port `3000`:
   - **API Gateway**: `3000` (Main Entry Point)
   - User Service: `4000`
   - Product Service: `4001`
   - Order Service: `4002`
   - Payment Service: `4003`

### Usage
Clients should interact with the **API Gateway** (`:3000`) which routes requests to the appropriate microservice:
- `/api/users/*` -> User Service
- `/api/products/*` -> Product Service
- `/api/orders/*` -> Order Service
- `/api/payments/*` -> Payment Service

---

## API Documentation (Gateway - `:3000`)

### API Gateway Features
- **Security**: Request filtering and security headers via `helmet`.
- **Logging**: Request logging via `morgan`.
- **CORS**: Enabled for cross-origin requests.
- **Error Handling**: Graceful handling of downstream service failures.

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| GET | `/health` | Service health check |

### Product Service (`:4001`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Retrieve all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update product information |
| DELETE | `/api/products/:id` | Remove a product |
| GET | `/health` | Service health check |

### Order Service (`:4002`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create a new order |
| PUT | `/api/orders/:id` | Update order (internal/status) |
| GET | `/health` | Service health check |

### Payment Service (`:4003`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
*Note: Payment processing is handled internally via Kafka subscriptions.*

---

## Workflow Example: Order Creation
1. User calls `POST /api/orders` on the **Order Service**.
2. **Order Service** validates stock via **Product Service**.
3. **Order Service** persists the order and publishes an `order_created` event to Kafka.
4. **Payment Service** consumes the event, simulates a payment, and calls **Order Service** back to update the status to `PAID` or `FAILED`.
