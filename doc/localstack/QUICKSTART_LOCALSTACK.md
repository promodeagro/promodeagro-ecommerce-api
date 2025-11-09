# Quick Start: LocalStack Development Environment

Get your ProMode Agro eCommerce API running locally in **3 simple steps** using LocalStack and DynamoDB.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Start LocalStack

```bash
bash scripts/start-localstack.sh
```

**What this does:**
- Starts Docker containers for LocalStack, DynamoDB, and DynamoDB Admin
- Creates all required DynamoDB tables
- Provides access to DynamoDB Admin UI

**Expected output:**
```
✓ LocalStack is ready for use!
✓ LocalStack Gateway:  http://localhost:4566
✓ DynamoDB Admin:      http://localhost:8001
```

### Step 2: Start the API Server

In a **new terminal window**:

```bash
bash scripts/start-api.sh
```

**What this does:**
- Installs npm dependencies (if not already installed)
- Creates .env.local from example (if needed)
- Starts Serverless offline server on port 4000
- Connects to LocalStack DynamoDB

**Expected output:**
```
Starting Serverless Offline...
API Server: http://localhost:4000
```

### Step 3: Test the API

In a **third terminal window**:

```bash
bash scripts/test-api.sh
```

**What this does:**
- Runs 6+ tests against your API
- Creates a product
- Creates an order
- Verifies data is stored in DynamoDB

**Expected output:**
```
✓ API is running
✓ All tests passed
```

---

## 📊 Now You Have:

```
LocalStack Gateway (AWS Services) ──► http://localhost:4566
    ↓
DynamoDB (Local Database)
    ↓
Serverless Offline (API Server) ──► http://localhost:4000
    ├─ GET  /product
    ├─ POST /product
    ├─ GET  /orders
    ├─ POST /auth/signin
    └─ ... all 50+ endpoints
    ↓
DynamoDB Admin (Visual Tool) ──► http://localhost:8001
```

---

## 🛠️ Common Commands

### View DynamoDB Admin

```bash
# Open in browser
http://localhost:8001
```

### List DynamoDB Tables

```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Stop LocalStack

```bash
bash scripts/stop-localstack.sh
```

---

## 🧪 Testing Endpoints

### Create Product

```bash
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-001",
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "availability": true
  }'
```

### Get All Products

```bash
curl http://localhost:4000/product
```

### Get Product by ID

```bash
curl http://localhost:4000/product/prod-001
```

---

## 📝 Environment Configuration

Create `.env.local` from template:

```bash
cp .env.local.example .env.local
```

Key variables:
```env
DYNAMODB_ENDPOINT=http://localhost:4566
PRODUCTS_TABLE=products-local
JWT_SECRET=promode-local-jwt-secret
```

---

## 🐛 Troubleshooting

### "Port already in use"

```bash
lsof -i :4000
kill -9 <PID>
```

### "LocalStack not ready"

```bash
curl http://localhost:4566/_localstack/health
```

### "Tables not created"

```bash
bash scripts/create-tables.sh
```

---

## 📚 Additional Resources

- [Full Setup Guide](./LOCAL_SETUP_LOCALSTACK.md)
- [Command Reference](./LOCALSTACK_REFERENCE.md)
- [API Documentation](../api-documentation.md)

---

**Happy Coding! 🚀**

