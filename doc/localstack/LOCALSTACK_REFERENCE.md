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
| **LocalStack Gateway** | http://localhost:4566 | 4566 | AWS services emulation |
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
POST   /auth/send-otp         # Send OTP
POST   /auth/validate-otp     # Validate OTP
GET    /users                 # Get all users
GET    /users/{id}            # Get user by ID
```

### Cart
```
POST   /cart/items            # Add to cart
GET    /cart/items/{userId}   # Get cart
PUT    /cart/items/{itemId}   # Update cart item
DELETE /cart/items/{itemId}   # Remove from cart
```

### Inventory
```
POST   /inventory             # Create inventory
GET    /inventory             # Get all inventory
GET    /inventory/{id}        # Get by ID
PUT    /inventory/{id}        # Update inventory
DELETE /inventory/{id}        # Delete inventory
```

---

## 🧪 Quick Test Commands

### Test 1: Create Product
```bash
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-1",
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "availability": true
  }'
```

### Test 2: Get All Products
```bash
curl http://localhost:4000/product
```

### Test 3: Get Product by ID
```bash
curl http://localhost:4000/product/prod-1
```

### Test 4: Update Product
```bash
curl -X PUT http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-1",
    "name": "Premium Tomatoes",
    "price": 75
  }'
```

### Test 5: Create Order
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

### Test 6: Get Orders
```bash
curl http://localhost:4000/orders
```

### Test 7: User Signup
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass@123",
    "name": "John Doe"
  }'
```

### Test 8: User Login
```bash
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass@123"
  }'
```

### Test 9: Add to Cart
```bash
curl -X POST http://localhost:4000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "productId": "prod-1",
    "quantity": 2
  }'
```

### Test 10: Get Cart
```bash
curl http://localhost:4000/cart/items/user-1
```

---

## 🛠️ Useful AWS CLI Commands

### List All Tables
```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Describe Table
```bash
aws dynamodb describe-table \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Scan Table (Get All Items)
```bash
aws dynamodb scan \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Get Item
```bash
aws dynamodb get-item \
  --table-name products-local \
  --key '{"id": {"S": "prod-1"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Put Item
```bash
aws dynamodb put-item \
  --table-name products-local \
  --item '{
    "id": {"S": "prod-1"},
    "name": {"S": "Tomatoes"},
    "price": {"N": "50"}
  }' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Delete Item
```bash
aws dynamodb delete-item \
  --table-name products-local \
  --key '{"id": {"S": "prod-1"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Delete Table
```bash
aws dynamodb delete-table \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

---

## 🐳 Docker Commands

### Check Running Containers
```bash
docker ps
```

### View Logs
```bash
# LocalStack logs
docker-compose -f docker-compose-localstack.yml logs -f localstack

# DynamoDB Admin logs
docker-compose -f docker-compose-localstack.yml logs -f dynamodb-admin

# All logs
docker-compose -f docker-compose-localstack.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose-localstack.yml down
```

### Stop and Remove Data
```bash
docker-compose -f docker-compose-localstack.yml down -v
```

### Restart Services
```bash
docker-compose -f docker-compose-localstack.yml restart
```

### Remove All Containers
```bash
docker-compose -f docker-compose-localstack.yml down -v --remove-orphans
```

---

## 📊 LocalStack Health

### Check Health
```bash
curl http://localhost:4566/_localstack/health
```

### Expected Response
```json
{
  "services": {
    "dynamodb": "available",
    "s3": "available",
    "secrets-manager": "available",
    "lambda": "available",
    "apigateway": "available"
  },
  "version": "...",
  "edition": "..."
}
```

---

## 🔍 Troubleshooting Commands

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
lsof -i :4566   # LocalStack
lsof -i :4000   # API
lsof -i :8001   # DynamoDB Admin
```

### Kill Process
```bash
kill -9 <PID>
```

### Reset Everything
```bash
docker-compose -f docker-compose-localstack.yml down -v
rm .env.local 2>/dev/null || true
bash scripts/start-localstack.sh
```

---

## 📈 Development Workflow

```
┌─────────────────────────────────────────┐
│ Start LocalStack (Terminal 1)           │
│ bash scripts/start-localstack.sh        │
└──────────────────┬──────────────────────┘
                   │
                   ├─► http://localhost:4566 (LocalStack)
                   ├─► http://localhost:8001 (DynamoDB Admin)
                   │
┌──────────────────┴──────────────────────┐
│ Start API (Terminal 2)                  │
│ bash scripts/start-api.sh               │
└──────────────────┬──────────────────────┘
                   │
                   ├─► http://localhost:4000 (API Server)
                   │
┌──────────────────┴──────────────────────┐
│ Code Changes                            │
│ Edit files in products/, order/, etc.   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│ Test (Terminal 3)                       │
│ curl / Postman / DynamoDB Admin         │
└──────────────────┬──────────────────────┘
                   │
                   ├─► curl http://localhost:4000/product
                   ├─► http://localhost:8001 (browse data)
                   │
┌──────────────────┴──────────────────────┐
│ Stop Services                           │
│ bash scripts/stop-localstack.sh         │
│ Ctrl+C in Terminal 2                    │
└─────────────────────────────────────────┘
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

# Payment (test keys)
RAZORPAY_KEY_ID=test
RAZORPAY_KEY_SECRET=test
```

---

## 📝 File Locations

| File | Purpose |
|------|---------|
| `docker-compose-localstack.yml` | Docker setup |
| `localstack-init.sh` | Auto-create tables |
| `.env.local.example` | Env template |
| `scripts/start-localstack.sh` | Start LocalStack |
| `scripts/start-api.sh` | Start API |
| `scripts/test-api.sh` | Test endpoints |
| `scripts/stop-localstack.sh` | Stop all |
| `products/` | Product module |
| `order/` | Order module |
| `Users/` | User module |

---

## 🎯 One-Liner Quick Start

```bash
bash scripts/start-localstack.sh & sleep 5 && bash scripts/start-api.sh
```

Then test:
```bash
bash scripts/test-api.sh
```

---

## 💡 Pro Tips

1. **Keep Multiple Terminals Open**
   - T1: LocalStack logs
   - T2: API server logs
   - T3: Testing commands

2. **Monitor DynamoDB Admin**
   - Open http://localhost:8001 in browser
   - Watch data in real-time

3. **Use curl with jq for Pretty JSON**
   ```bash
   curl http://localhost:4000/product | jq .
   ```

4. **Use VS Code REST Client**
   - Install "REST Client" extension
   - Create `test.http` file
   - Send requests directly from editor

5. **Save Curl Commands**
   - Create `curl-tests.sh` with all your test commands
   - Source it: `source curl-tests.sh`

---

## ⏱️ Service Startup Times

| Service | Time | Notes |
|---------|------|-------|
| Docker | 2-5s | Instant if running |
| LocalStack | 5-10s | Wait for health check |
| Tables Creation | 2-3s | Automatic on init |
| API Server | 3-5s | Depends on deps |
| DynamoDB Admin | 2-3s | UI available |

**Total Time:** ~15-20 seconds from cold start

---

## 🆘 Emergency Commands

### Everything Broken? Reset:
```bash
docker-compose -f docker-compose-localstack.yml down -v
rm .env.local 2>/dev/null
bash scripts/start-localstack.sh
```

### Port Conflicts? Find and Kill:
```bash
lsof -i :4566 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
lsof -i :4000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
lsof -i :8001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### Out of Sync? Recreate Tables:
```bash
bash scripts/create-tables.sh
```

---

## 📚 Related Documentation

- [Quick Start Guide](./QUICKSTART_LOCALSTACK.md)
- [Full Setup Guide](./LOCAL_SETUP_LOCALSTACK.md)
- [Setup Summary](./LOCALSTACK_SETUP_SUMMARY.md)
- [API Documentation](./api-documentation.md)
- [Project README](./README.md)

---

**Quick Reference Version 1.0** | Updated November 2025

