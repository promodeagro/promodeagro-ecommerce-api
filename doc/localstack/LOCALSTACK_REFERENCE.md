# LocalStack Quick Reference Guide

## 🚀 Three Commands to Get Started

```bash
# Terminal 1
bash scripts/start-localstack.sh

# Terminal 2
bash scripts/start-api.sh

# Terminal 3
bash scripts/test-api.sh
```

---

## 📍 Access Points

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| **API Server** | http://localhost:4000 | 4000 | REST API endpoints |
| **LocalStack Gateway** | http://localhost:4566 | 4566 | AWS services |
| **DynamoDB Admin** | http://localhost:8001 | 8001 | Database browser |

---

## 🗂️ DynamoDB Tables

| Table Name | Partition Key | Sort Key | Purpose |
|------------|---|---|---|
| `products-local` | id | - | Product catalog |
| `orders-local` | id | userId | Order management |
| `customers-local` | id | - | Customer data |
| `inventory-local` | id | - | Stock management |
| `catalog-local` | id | - | Catalog data |
| `users-local` | id | - | User accounts |

---

## 🔌 API Endpoints Overview

### Products
```
POST   /product               # Create product
GET    /product               # Get all products
GET    /product/{id}          # Get product by ID
PUT    /product               # Update product
DELETE /product               # Delete product
```

### Orders
```
POST   /orders                # Create order
GET    /orders                # Get all orders
GET    /orders/{id}           # Get order by ID
PUT    /orders/{id}           # Update order
DELETE /orders/{id}           # Delete order
```

### Users & Auth
```
POST   /auth/signup           # Register user
POST   /auth/signin           # Login user
GET    /users                 # Get all users
GET    /users/{id}            # Get user by ID
```

### Cart
```
POST   /cart/items            # Add to cart
GET    /cart/items/{userId}   # Get cart
PUT    /cart/items/{itemId}   # Update item
DELETE /cart/items/{itemId}   # Remove from cart
```

### Inventory
```
POST   /inventory             # Create inventory
GET    /inventory             # Get all
GET    /inventory/{id}        # Get by ID
PUT    /inventory/{id}        # Update
DELETE /inventory/{id}        # Delete
```

---

## 🧪 Quick Test Commands

### Test 1: Get All Products
```bash
curl http://localhost:4000/product
```

### Test 2: Create Product
```bash
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-1",
    "name": "Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "availability": true
  }'
```

### Test 3: Get Product by ID
```bash
curl http://localhost:4000/product/prod-1
```

### Test 4: Create Order
```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "order-1",
    "userId": "user-1",
    "items": [{"productId": "prod-1", "quantity": 5}],
    "totalPrice": 250,
    "status": "pending"
  }'
```

### Test 5: Get Orders
```bash
curl http://localhost:4000/orders
```

### Test 6: User Signup
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Pass@123",
    "name": "John Doe"
  }'
```

### Test 7: User Login
```bash
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Pass@123"
  }'
```

### Test 8: Add to Cart
```bash
curl -X POST http://localhost:4000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "productId": "prod-1",
    "quantity": 2
  }'
```

### Test 9: Get Cart
```bash
curl http://localhost:4000/cart/items/user-1
```

### Test 10: List DynamoDB Tables
```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

---

## 🛠️ Useful AWS CLI Commands

### DynamoDB Operations

```bash
# List tables
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Describe table
aws dynamodb describe-table \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Scan table (get all items)
aws dynamodb scan \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Get item
aws dynamodb get-item \
  --table-name products-local \
  --key '{"id": {"S": "prod-1"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Put item
aws dynamodb put-item \
  --table-name products-local \
  --item '{"id": {"S": "prod-1"}, "name": {"S": "Test"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Delete item
aws dynamodb delete-item \
  --table-name products-local \
  --key '{"id": {"S": "prod-1"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

---

## 🐳 Docker Commands

```bash
# Check running containers
docker ps

# View logs
docker logs promode-localstack

# Follow logs
docker logs -f promode-localstack

# Stop containers
bash scripts/stop-localstack.sh

# Clean up (remove volumes)
docker-compose -f doc/localstack/docker-compose-localstack.yml down -v

# Restart services
docker-compose -f doc/localstack/docker-compose-localstack.yml restart
```

---

## 🆘 Troubleshooting Commands

### Check if LocalStack is Running
```bash
curl http://localhost:4566/_localstack/health
```

### Check if API is Running
```bash
curl http://localhost:4000/product
```

### Check if DynamoDB Admin is Running
```bash
curl http://localhost:8001
```

### Find Process Using Port
```bash
lsof -i :4000   # API
lsof -i :4566   # LocalStack
lsof -i :8001   # DynamoDB Admin
```

### Kill Process
```bash
kill -9 <PID>
```

### Reset Everything
```bash
docker-compose -f doc/localstack/docker-compose-localstack.yml down -v
rm .env.local
bash scripts/start-localstack.sh
```

---

## 📊 Development Workflow

```
Start Services:
  bash scripts/start-localstack.sh  (Terminal 1)
  bash scripts/start-api.sh         (Terminal 2)
  
Make Code Changes:
  Edit files in products/, order/, Users/, etc.
  
Test Changes:
  curl http://localhost:4000/endpoint
  bash scripts/test-api.sh
  
View Data:
  http://localhost:8001 (DynamoDB Admin)
  
Stop Services:
  bash scripts/stop-localstack.sh
  Ctrl+C in Terminal 2
```

---

## 🔄 Environment Variables

Key variables in `.env.local`:

```bash
# LocalStack
LOCALSTACK_ENDPOINT=http://localhost:4566
DYNAMODB_ENDPOINT=http://localhost:4566

# Tables
PRODUCTS_TABLE=products-local
ORDER_TABLE_NAME=orders-local
CUSTOMER_TABLE_NAME=customers-local
Inventory_TABLE_NAME=inventory-local

# Auth
JWT_SECRET=promode-local-jwt-secret

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

---

**Quick Reference Version 1.0** | Updated November 2025

