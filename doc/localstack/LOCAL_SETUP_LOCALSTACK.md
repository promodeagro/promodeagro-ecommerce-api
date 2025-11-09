# Running ProMode Agro eCommerce API Locally with LocalStack & DynamoDB

This guide explains how to run the entire eCommerce API locally using **LocalStack** (AWS services emulation) and local **DynamoDB** without requiring an AWS account.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [What is LocalStack?](#what-is-localstack)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Creating Local DynamoDB Tables](#creating-local-dynamodb-tables)
6. [Running the API](#running-the-api)
7. [Testing the Setup](#testing-the-setup)
8. [Troubleshooting](#troubleshooting)
9. [Useful Commands](#useful-commands)

---

## Prerequisites

- **Docker & Docker Compose** installed
- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **AWS CLI** v2 (for local AWS commands)
- **curl** or **Postman** (for testing)

### Check Prerequisites

```bash
# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version
npm --version

# Check AWS CLI
aws --version
```

---

## What is LocalStack?

**LocalStack** is a fully functional local AWS cloud stack that allows you to:

- Emulate AWS services locally (Lambda, DynamoDB, S3, etc.)
- Develop without AWS credentials
- Test cloud infrastructure locally
- Speed up development cycle
- Reduce AWS costs during development

---

## Installation & Setup

### Step 1: Install LocalStack

```bash
# Install LocalStack CLI
pip install --upgrade localstack
```

Or using Homebrew (macOS):

```bash
brew install localstack
```

### Step 2: Install LocalStack Docker Image

```bash
# Pull the LocalStack Docker image
localstack start --help  # This will auto-download the image on first run
```

### Step 3: Create docker-compose.yml for LocalStack

Create a `docker-compose-localstack.yml` file in your project root:

```yaml
version: '3.8'

services:
  localstack:
    image: localstack/localstack:latest
    container_name: promode-localstack
    ports:
      - "4566:4566"         # LocalStack gateway endpoint
      - "4571:4571"         # DynamoDB local
      - "4572:4572"         # S3 local
      - "4592:4592"         # Secrets Manager local
    environment:
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
      - SERVICES=dynamodb,s3,secrets-manager,lambda,apigateway
      - AWS_DEFAULT_REGION=ap-south-1
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
    volumes:
      - "${TMPDIR}:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "./localstack-init.sh:/docker-entrypoint-initaws.d/init.sh"
    networks:
      - promode-network

  dynamodb-admin:
    image: aaronshaf/dynamodb-admin:latest
    container_name: promode-dynamodb-admin
    ports:
      - "8001:8001"
    environment:
      - DYNAMO_ENDPOINT=http://localstack:4566
      - AWS_REGION=ap-south-1
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
    depends_on:
      - localstack
    networks:
      - promode-network

networks:
  promode-network:
    driver: bridge
```

### Step 4: Create LocalStack Initialization Script

Create `localstack-init.sh` in your project root:

```bash
#!/bin/bash

echo "Initializing LocalStack..."

# Wait for LocalStack to be ready
awslocal dynamodb wait table-exists --table-name dummy 2>/dev/null || true

echo "LocalStack initialization complete"
```

### Step 5: Start LocalStack

```bash
# Start LocalStack and DynamoDB Admin
docker-compose -f docker-compose-localstack.yml up -d

# Verify LocalStack is running
docker-compose -f docker-compose-localstack.yml logs -f localstack
```

### Step 6: Verify LocalStack is Ready

```bash
# Check LocalStack health
curl http://localhost:4566/_localstack/health

# Expected output:
# {"services":{"dynamodb":"available","s3":"available",...}}
```

---

## Configuration

### Step 1: Update AWS CLI to Use LocalStack

Create `~/.aws/config`:

```ini
[default]
region = ap-south-1
output = json

[profile localstack]
region = ap-south-1
output = json
```

Create `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = test
aws_secret_access_key = test

[localstack]
aws_access_key_id = test
aws_secret_access_key = test
```

### Step 2: Create `.env.local` File

Create `.env.local` in your project root for local development:

```bash
# LocalStack Configuration
LOCALSTACK_ENDPOINT=http://localhost:4566
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
NODE_ENV=development

# DynamoDB Tables (LocalStack)
PRODUCTS_TABLE=products-local
ORDER_TABLE_NAME=orders-local
CUSTOMER_TABLE_NAME=customers-local
DYNAMODB_TABLE_NAME=dynamodb-local
Inventory_TABLE_NAME=inventory-local
Catalog_TABLE_NAME=catalog-local

# Auth & JWT
JWT_SECRET=your-local-jwt-secret-key

# AWS Cognito (LocalStack simulation)
COGNITO_USER_POOL_ID=local-user-pool-id

# External Services (use mocks/stubs for local)
FACEBOOK_GRAPH_API_URL=http://localhost:4566
FACEBOOK_ACCESS_TOKEN=test-token

# Payment Gateways (use test keys)
RAZORPAY_KEY_ID=test-key
RAZORPAY_KEY_SECRET=test-secret
CASHFREE_APP_ID=test-app-id
CASHFREE_SECRET_KEY=test-secret

# Algolia (optional - can use mock)
ALGOLIA_APP_ID=test-app-id
ALGOLIA_API_KEY=test-api-key

# Logging
DEBUG=true
```

### Step 3: Create Local Configuration for Serverless

Create `serverless-local.yml` (optional - for local-specific config):

```yaml
service: promodeAgro-ecommerce-api

frameworkVersion: "3"

provider:
  name: aws
  stage: local
  region: ap-south-1
  runtime: nodejs18.x
  environment:
    DYNAMODB_ENDPOINT: http://localhost:4566
    AWS_REGION: ap-south-1
    PRODUCTS_TABLE: products-local
    ORDER_TABLE_NAME: orders-local
    CUSTOMER_TABLE_NAME: customers-local
    Inventory_TABLE_NAME: inventory-local
  httpApi:
    cors:
      allowedOrigins:
        - "*"
      allowedHeaders:
        - "*"
      allowedMethods:
        - OPTIONS
        - GET
        - POST
        - PUT
        - DELETE

functions:
  - ${file(products/function.yml)}
  - ${file(order/function.yml)}
  - ${file(Users/function.yml)}
  - ${file(inventory/function.yml)}
  - ${file(cart/function.yml)}
  - ${file(payment/function.yml)}

plugins:
  - serverless-offline
  - serverless-plugin-warmup

custom:
  warmup:
    enabled: false  # Disable warmup for local development

  serverless-offline:
    httpPort: 4000
    dynamodbLocal:
      port: 8000
      inMemory: true
      migrate: true
      seed: true
    lambdaPort: 3001
    websocketPort: 3002
```

---

## Creating Local DynamoDB Tables

### Option 1: Manual Table Creation (AWS CLI)

```bash
# Create Products Table
aws dynamodb create-table \
  --table-name products-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Create Orders Table
aws dynamodb create-table \
  --table-name orders-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=userId,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Create Customers Table
aws dynamodb create-table \
  --table-name customers-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Create Inventory Table
aws dynamodb create-table \
  --table-name inventory-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Create Catalog Table
aws dynamodb create-table \
  --table-name catalog-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Option 2: Create Setup Script

Create `scripts/create-tables.sh`:

```bash
#!/bin/bash

set -e

echo "Creating DynamoDB tables in LocalStack..."

# Configuration
ENDPOINT=http://localhost:4566
REGION=ap-south-1

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create table
create_table() {
  local table_name=$1
  local attributes=$2
  local key_schema=$3
  
  echo -e "${YELLOW}Creating table: $table_name${NC}"
  
  aws dynamodb create-table \
    --table-name "$table_name" \
    --attribute-definitions $attributes \
    --key-schema $key_schema \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url "$ENDPOINT" \
    --region "$REGION" 2>&1 | grep -q "TableDescription" && \
    echo -e "${GREEN}✓ Created: $table_name${NC}" || \
    echo -e "${RED}✗ Failed or already exists: $table_name${NC}"
}

# Create Products Table
create_table "products-local" \
  "AttributeName=id,AttributeType=S" \
  "AttributeName=id,KeyType=HASH"

# Create Orders Table
create_table "orders-local" \
  "AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S" \
  "AttributeName=id,KeyType=HASH AttributeName=userId,KeyType=RANGE"

# Create Customers Table
create_table "customers-local" \
  "AttributeName=id,AttributeType=S" \
  "AttributeName=id,KeyType=HASH"

# Create Inventory Table
create_table "inventory-local" \
  "AttributeName=id,AttributeType=S" \
  "AttributeName=id,KeyType=HASH"

# Create Catalog Table
create_table "catalog-local" \
  "AttributeName=id,AttributeType=S" \
  "AttributeName=id,KeyType=HASH"

echo -e "${GREEN}All tables created successfully!${NC}"

# List tables
echo -e "\n${YELLOW}Tables in LocalStack:${NC}"
aws dynamodb list-tables \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --output table
```

Make it executable and run:

```bash
chmod +x scripts/create-tables.sh
./scripts/create-tables.sh
```

### Option 3: Using Python/Boto3 Script

Create `scripts/create-tables.py`:

```python
#!/usr/bin/env python3

import boto3
import sys

def create_tables():
    # Connect to local DynamoDB
    dynamodb = boto3.resource(
        'dynamodb',
        endpoint_url='http://localhost:4566',
        region_name='ap-south-1',
        aws_access_key_id='test',
        aws_secret_access_key='test'
    )

    tables_config = [
        {
            'name': 'products-local',
            'key_schema': [{'AttributeName': 'id', 'KeyType': 'HASH'}],
            'attr_defs': [{'AttributeName': 'id', 'AttributeType': 'S'}],
        },
        {
            'name': 'orders-local',
            'key_schema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'},
                {'AttributeName': 'userId', 'KeyType': 'RANGE'}
            ],
            'attr_defs': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'userId', 'AttributeType': 'S'}
            ],
        },
        {
            'name': 'customers-local',
            'key_schema': [{'AttributeName': 'id', 'KeyType': 'HASH'}],
            'attr_defs': [{'AttributeName': 'id', 'AttributeType': 'S'}],
        },
        {
            'name': 'inventory-local',
            'key_schema': [{'AttributeName': 'id', 'KeyType': 'HASH'}],
            'attr_defs': [{'AttributeName': 'id', 'AttributeType': 'S'}],
        },
        {
            'name': 'catalog-local',
            'key_schema': [{'AttributeName': 'id', 'KeyType': 'HASH'}],
            'attr_defs': [{'AttributeName': 'id', 'AttributeType': 'S'}],
        },
    ]

    for table_config in tables_config:
        table_name = table_config['name']
        try:
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=table_config['key_schema'],
                AttributeDefinitions=table_config['attr_defs'],
                BillingMode='PAY_PER_REQUEST'
            )
            print(f"✓ Created table: {table_name}")
            table.wait_until_exists()
        except dynamodb.meta.client.exceptions.ResourceInUseException:
            print(f"✓ Table already exists: {table_name}")
        except Exception as e:
            print(f"✗ Error creating {table_name}: {e}")
            return False

    print("\n✓ All tables ready!")
    return True

if __name__ == '__main__':
    success = create_tables()
    sys.exit(0 if success else 1)
```

Run it:

```bash
chmod +x scripts/create-tables.py
python3 scripts/create-tables.py
```

---

## Running the API

### Step 1: Start LocalStack (if not already running)

```bash
docker-compose -f docker-compose-localstack.yml up -d

# Wait a few seconds for services to be ready
sleep 10

# Verify LocalStack is ready
curl http://localhost:4566/_localstack/health
```

### Step 2: Create DynamoDB Tables

```bash
# Using the bash script
./scripts/create-tables.sh

# OR using Python script
python3 scripts/create-tables.py
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start Serverless Offline

```bash
# Option 1: Using standard serverless.yml
serverless offline start

# Option 2: Using local-specific config
serverless offline start --config serverless-local.yml

# The API will be available at http://localhost:4000
```

### Step 5: Monitor LocalStack & DynamoDB

In new terminal windows:

```bash
# View LocalStack logs
docker-compose -f docker-compose-localstack.yml logs -f localstack

# View DynamoDB Admin (open in browser)
# http://localhost:8001
```

---

## Testing the Setup

### Test 1: Check LocalStack Health

```bash
curl http://localhost:4566/_localstack/health
```

### Test 2: List DynamoDB Tables

```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Test 3: Create a Product via API

```bash
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-001",
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "availability": true,
    "description": "Fresh organic tomatoes"
  }'
```

### Test 4: Get All Products

```bash
curl http://localhost:4000/product
```

### Test 5: Create a Customer

```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "name": "Test User",
    "phone": "9876543210"
  }'
```

### Test 6: View Data in DynamoDB Admin

Open browser: `http://localhost:8001`

- Browse tables
- View items
- Execute queries

---

## Updating Lambda Functions to Use LocalStack

### Update DynamoDB Client Initialization

Modify any Lambda function that connects to DynamoDB to use LocalStack endpoint:

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

// For local development with LocalStack
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  // This will be automatically set when using LocalStack
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
});

module.exports = { dynamoDBClient };
```

In your handler files:

```javascript
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

module.exports.handler = async (event) => {
  const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION,
    // LocalStack endpoint for local development
    ...(process.env.DYNAMODB_ENDPOINT && {
      endpoint: process.env.DYNAMODB_ENDPOINT
    })
  });

  // Your handler code here
};
```

---

## Troubleshooting

### LocalStack Container Not Starting

```bash
# Check Docker is running
docker ps

# Check Docker logs
docker-compose -f docker-compose-localstack.yml logs localstack

# Restart services
docker-compose -f docker-compose-localstack.yml restart
```

### Port Already in Use

```bash
# Find process using port 4566
lsof -i :4566

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Tables Not Created

```bash
# Verify LocalStack is running
curl http://localhost:4566/_localstack/health

# Check AWS CLI configuration
aws configure list

# Test AWS CLI connection
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Serverless Offline Not Connecting to LocalStack

```bash
# Ensure .env.local has correct endpoint
cat .env.local | grep DYNAMODB_ENDPOINT

# Check if serverless offline is running on correct port
netstat -tlnp | grep 4000
```

### Lambda Functions Not Connecting to DynamoDB

```bash
# Check environment variables in serverless output
serverless offline start | grep -i env

# Add debug logging to see actual endpoint being used
# In your Lambda handler:
console.log('DynamoDB Endpoint:', process.env.DYNAMODB_ENDPOINT);
```

### DynamoDB Admin Not Showing Data

```bash
# Refresh the page at http://localhost:8001

# Check DynamoDB Admin logs
docker-compose -f docker-compose-localstack.yml logs dynamodb-admin

# Verify tables exist
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

---

## Useful Commands

### LocalStack Management

```bash
# Start services
docker-compose -f docker-compose-localstack.yml up -d

# Stop services
docker-compose -f docker-compose-localstack.yml down

# View logs
docker-compose -f docker-compose-localstack.yml logs -f

# Restart specific service
docker-compose -f docker-compose-localstack.yml restart localstack

# Remove volumes (clean slate)
docker-compose -f docker-compose-localstack.yml down -v
```

### DynamoDB Operations

```bash
# List all tables
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Describe a table
aws dynamodb describe-table \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Scan table items
aws dynamodb scan \
  --table-name products-local \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Delete all tables
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1 \
  --query 'TableNames[]' \
  --output text | \
  xargs -I {} aws dynamodb delete-table \
  --table-name {} \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Put item in table
aws dynamodb put-item \
  --table-name products-local \
  --item '{
    "id": {"S": "prod-001"},
    "name": {"S": "Test Product"},
    "price": {"N": "100"}
  }' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1

# Get item from table
aws dynamodb get-item \
  --table-name products-local \
  --key '{"id": {"S": "prod-001"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Serverless Offline

```bash
# Start with debug logging
DEBUG=* serverless offline start

# Start specific function
serverless offline start --function getAllProduct

# Start with custom config
serverless offline start --config serverless-local.yml

# Stop (Ctrl+C)
```

### Testing API Endpoints

```bash
# Create product
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{"id":"1","name":"Test","price":100}'

# Get all products
curl http://localhost:4000/product

# Get product by ID
curl http://localhost:4000/product/1

# Update product
curl -X PUT http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{"id":"1","name":"Updated","price":150}'

# Delete product
curl -X DELETE http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{"id":"1"}'
```

---

## Next Steps

1. ✅ LocalStack running with DynamoDB
2. ✅ Tables created locally
3. ✅ Serverless offline connected to LocalStack
4. ✅ API endpoints tested
5. 📝 Mock payment gateways for testing
6. 📝 Seed test data in DynamoDB
7. 📝 Set up integration tests
8. 📝 Document environment-specific deployments

---

## Additional Resources

- [LocalStack Documentation](https://docs.localstack.cloud/)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [Serverless Offline Documentation](https://www.serverless.com/plugins/serverless-offline)
- [AWS CLI DynamoDB Commands](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/)

---

**Last Updated:** November 2025  
**Version:** 1.0

