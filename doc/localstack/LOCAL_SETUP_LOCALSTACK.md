# Complete LocalStack Setup Guide

Comprehensive guide for running ProMode Agro eCommerce API locally using LocalStack and DynamoDB.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [What is LocalStack](#what-is-localstack)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running LocalStack](#running-localstack)
6. [Creating DynamoDB Tables](#creating-dynamodb-tables)
7. [Running the API](#running-the-api)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Useful Commands](#useful-commands)

---

## Prerequisites

- **Docker & Docker Compose** installed
- **Node.js** 18+ installed
- **npm** 8+ installed
- **AWS CLI** v2 installed (optional but recommended)
- **curl** or **Postman** (for testing)

### Check Prerequisites

```bash
docker --version
docker-compose --version
node --version
npm --version
aws --version
```

---

## What is LocalStack

**LocalStack** is a fully functional local AWS cloud stack that allows you to:

- Emulate AWS services locally (Lambda, DynamoDB, S3, etc.)
- Develop without AWS credentials
- Test cloud infrastructure locally
- Speed up development cycle
- Reduce AWS costs during development

---

## Installation

### Step 1: Install LocalStack

```bash
pip install --upgrade localstack
```

Or using Homebrew (macOS):

```bash
brew install localstack
```

### Step 2: Check Docker

LocalStack requires Docker and Docker Compose:

```bash
docker ps  # Should return running containers
```

---

## Configuration

### Environment Setup

The docker-compose file is already configured at:
```
doc/localstack/docker-compose-localstack.yml
```

Key configuration:
- **LocalStack Port:** 4566
- **DynamoDB Admin Port:** 8001
- **Services:** DynamoDB, S3, Secrets Manager
- **Region:** ap-south-1
- **Network:** promode-network

### Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit with your settings:

```env
DYNAMODB_ENDPOINT=http://localhost:4566
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
PRODUCTS_TABLE=products-local
ORDER_TABLE_NAME=orders-local
JWT_SECRET=your-secret-key
```

---

## Running LocalStack

### Start LocalStack

```bash
bash scripts/start-localstack.sh
```

This will:
1. Check if Docker is running
2. Start LocalStack container
3. Start DynamoDB Admin container
4. Create DynamoDB tables automatically
5. Display access URLs

### Verify LocalStack is Running

```bash
curl http://localhost:4566/_localstack/health
```

Expected response:
```json
{
  "services": {
    "dynamodb": "running",
    "s3": "available"
  }
}
```

---

## Creating DynamoDB Tables

### Automatic Creation

Tables are created automatically by `localstack-init.sh` when LocalStack starts.

Tables created:
- `products-local`
- `orders-local`
- `customers-local`
- `inventory-local`
- `catalog-local`
- `users-local`

### Manual Creation

If tables weren't created automatically:

```bash
bash scripts/create-tables.sh
```

Or using AWS CLI:

```bash
aws dynamodb create-table \
  --table-name products-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

---

## Running the API

### Install Dependencies

```bash
npm install
```

### Start Serverless Offline

```bash
bash scripts/start-api.sh
```

The API will be available at:
```
http://localhost:4000
```

### Available Endpoints

```
GET  /product               - Get all products
POST /product               - Create product
PUT  /product               - Update product
DELETE /product             - Delete product
GET  /product/{id}          - Get by ID
GET  /orders                - Get all orders
POST /orders                - Create order
GET  /auth/signin           - Login endpoint
... and 45+ more endpoints
```

---

## Testing

### Manual Testing with curl

#### Test 1: Get All Products
```bash
curl http://localhost:4000/product
```

#### Test 2: Create Product
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

#### Test 3: Create Order
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

### Automated Testing

```bash
bash scripts/test-api.sh
```

This runs 6+ automated tests and verifies everything works.

### Testing from Network

```bash
bash scripts/test-localstack-network.sh 10.0.0.3
```

---

## Troubleshooting

### LocalStack Container Won't Start

```bash
# Check Docker
docker ps

# View logs
docker logs promode-localstack

# Clean and restart
docker-compose -f doc/localstack/docker-compose-localstack.yml down -v
docker-compose -f doc/localstack/docker-compose-localstack.yml up -d
```

### Port Already in Use

```bash
lsof -i :4566
kill -9 <PID>
```

### Tables Not Found

```bash
# Check if tables exist
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Recreate tables
bash scripts/create-tables.sh
```

### API Not Connecting

```bash
# Check if LocalStack is healthy
curl http://localhost:4566/_localstack/health

# Check environment variables
cat .env.local | grep DYNAMODB
```

---

## Useful Commands

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

# Scan table
aws dynamodb scan \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Docker Management

```bash
# View logs
docker logs promode-localstack

# Stop containers
bash scripts/stop-localstack.sh

# Clean up (remove data)
docker-compose -f doc/localstack/docker-compose-localstack.yml down -v
```

### API Testing

```bash
# Test health
curl http://localhost:4000/product

# Test with jq for pretty JSON
curl http://localhost:4000/product | jq .
```

---

## Development Workflow

1. **Start Services:**
   ```bash
   bash scripts/start-localstack.sh  # Terminal 1
   bash scripts/start-api.sh         # Terminal 2
   ```

2. **Make Code Changes:**
   - Edit files in `products/`, `order/`, `Users/`, etc.
   - Changes auto-reload in Serverless offline

3. **Test Changes:**
   ```bash
   curl http://localhost:4000/endpoint
   ```

4. **View Data:**
   - Open http://localhost:8001 in browser (DynamoDB Admin)

5. **Stop Services:**
   ```bash
   bash scripts/stop-localstack.sh
   ```

---

## Next Steps

After local development:

1. **Deploy to AWS:**
   ```bash
   serverless deploy --stage prod
   ```

2. **Use AWS DynamoDB:**
   - Set AWS credentials
   - Update endpoints in `.env`
   - Redeploy with `serverless deploy`

---

## Additional Resources

- [LocalStack Documentation](https://docs.localstack.cloud/)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)

---

**Last Updated:** November 2025  
**Version:** 1.0

