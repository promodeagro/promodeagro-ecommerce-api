# 🚀 Quick Start: LocalStack Development Environment

Get your ProMode Agro eCommerce API running locally in **3 simple steps** using LocalStack and DynamoDB.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Start LocalStack

```bash
chmod +x scripts/*.sh
bash scripts/start-localstack.sh
```

**What this does:**
- Starts Docker containers for LocalStack, DynamoDB, and DynamoDB Admin
- Creates all required DynamoDB tables
- Provides access to DynamoDB Admin UI

**Expected output:**
```
✓ LocalStack is ready for use!

Access Points:
  LocalStack Gateway:  http://localhost:4566
  DynamoDB Admin:      http://localhost:8001
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
- Runs 6 tests against your API
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

# Or via curl
curl http://localhost:4566/_localstack/health
```

### List DynamoDB Tables

```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Query Products Table

```bash
aws dynamodb scan \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Stop LocalStack

```bash
bash scripts/stop-localstack.sh
```

### Stop Everything

```bash
# Stop LocalStack and remove all data
docker-compose -f docker-compose-localstack.yml down -v

# Kill the API server (Ctrl+C in the terminal)
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

### Create Order

```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "order-001",
    "userId": "user-001",
    "items": [{"productId": "prod-001", "quantity": 5}],
    "totalPrice": 250,
    "paymentMethod": "razorpay",
    "status": "pending",
    "address": "123 Main St"
  }'
```

### Get All Orders

```bash
curl http://localhost:4000/orders
```

### Sign In (User)

```bash
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password@123"
  }'
```

### Add Item to Cart

```bash
curl -X POST http://localhost:4000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "productId": "prod-001",
    "quantity": 2
  }'
```

---

## 📝 Environment Configuration

The API uses `.env.local` for configuration. Create it from the template:

```bash
cp .env.local.example .env.local
```

Key variables:
```env
# LocalStack
DYNAMODB_ENDPOINT=http://localhost:4566
PRODUCTS_TABLE=products-local
ORDER_TABLE_NAME=orders-local

# JWT
JWT_SECRET=promode-local-jwt-secret

# Payment Gateways (use test keys)
RAZORPAY_KEY_ID=test
RAZORPAY_KEY_SECRET=test
```

---

## 🐛 Troubleshooting

### "Port already in use"

```bash
# Find process using port
lsof -i :4566  # LocalStack
lsof -i :4000  # API Server
lsof -i :8001  # DynamoDB Admin

# Kill process
kill -9 <PID>
```

### "LocalStack not ready"

```bash
# Check health
curl http://localhost:4566/_localstack/health

# View logs
docker-compose -f docker-compose-localstack.yml logs -f localstack
```

### "Tables not found"

```bash
# Recreate tables
bash scripts/create-tables.sh

# Or manually
aws dynamodb create-table \
  --table-name products-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### "Cannot connect to API"

```bash
# Check if API server is running
curl http://localhost:4000/product

# Check if dependencies are installed
npm install

# Check for errors in API terminal
```

---

## 📚 File Structure

```
promodeagro-ecommerce-api/
├── docker-compose-localstack.yml   # LocalStack setup
├── localstack-init.sh              # Auto-create tables on startup
├── .env.local.example              # Environment template
├── scripts/
│   ├── start-localstack.sh         # 🟢 Start LocalStack (Step 1)
│   ├── create-tables.sh            # Create DynamoDB tables
│   ├── start-api.sh                # 🟢 Start API Server (Step 2)
│   ├── stop-localstack.sh          # Stop LocalStack
│   └── test-api.sh                 # 🟢 Test Endpoints (Step 3)
├── products/
├── order/
├── Users/
├── payment/
├── cart/
└── ... (other modules)
```

---

## 🔄 Development Workflow

### 1. Start Services (Once per session)

```bash
# Terminal 1
bash scripts/start-localstack.sh

# Terminal 2
bash scripts/start-api.sh
```

### 2. Make Code Changes

Edit any file in the `products/`, `order/`, `Users/`, etc. directories.

Serverless offline will automatically reload your changes.

### 3. Test Changes

```bash
# Terminal 3
curl http://localhost:4000/product

# Or run full test suite
bash scripts/test-api.sh
```

### 4. View Data in DynamoDB Admin

Open `http://localhost:8001` in your browser to see stored data.

### 5. Stop Services (End of session)

```bash
# Stop LocalStack
bash scripts/stop-localstack.sh

# Stop API (Ctrl+C in the terminal)
```

---

## 🎯 What's Next?

After running locally:

1. ✅ **Build Features** - Edit handler files in module directories
2. ✅ **Test Endpoints** - Use curl or Postman to test
3. ✅ **Debug Issues** - Check console logs and DynamoDB Admin
4. ✅ **Deploy to AWS** - `serverless deploy` (requires AWS credentials)

---

## 📖 Additional Resources

- [Full LocalStack Setup Guide](./LOCAL_SETUP_LOCALSTACK.md)
- [API Documentation](./api-documentation.md)
- [API Specifications](./api-specs.yaml)
- [Project README](./README.md)

---

## 💡 Pro Tips

1. **Keep terminals organized**
   - Terminal 1: LocalStack logs
   - Terminal 2: API server logs
   - Terminal 3: Testing/curl commands

2. **Monitor DynamoDB**
   - Keep DynamoDB Admin (http://localhost:8001) open while developing
   - Watch data being created/updated in real-time

3. **Use VS Code REST Client Extension**
   - Install REST Client extension
   - Create `test.http` file with requests
   - Click "Send Request" to test endpoints

4. **Inspect LocalStack Logs**
   ```bash
   docker-compose -f docker-compose-localstack.yml logs -f localstack
   ```

5. **Reset Everything**
   ```bash
   docker-compose -f docker-compose-localstack.yml down -v
   rm .env.local
   bash scripts/start-localstack.sh
   ```

---

## ❓ Need Help?

1. Check [LOCAL_SETUP_LOCALSTACK.md](./LOCAL_SETUP_LOCALSTACK.md) for detailed setup
2. Review API logs in the terminal running the API server
3. Check DynamoDB Admin UI for data validation
4. Read API documentation in [api-documentation.md](./api-documentation.md)

---

**Happy Coding! 🚀**

Questions? Issues? Check the troubleshooting section above or consult the detailed setup guide.

