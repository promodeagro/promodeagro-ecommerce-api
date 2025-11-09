#!/bin/bash

echo "=== LocalStack Initialization Script ==="
echo "Waiting for LocalStack to be ready..."

# Wait for LocalStack to be ready
for i in {1..30}; do
  if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo "✓ LocalStack is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

echo "=== Creating DynamoDB Tables ==="

# Create Products Table
echo "Creating products-local table..."
awslocal dynamodb create-table \
  --table-name products-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -q "TableDescription" && echo "✓ products-local created" || echo "✓ products-local ready"

# Create Orders Table
echo "Creating orders-local table..."
awslocal dynamodb create-table \
  --table-name orders-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=userId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -q "TableDescription" && echo "✓ orders-local created" || echo "✓ orders-local ready"

# Create Customers Table
echo "Creating customers-local table..."
awslocal dynamodb create-table \
  --table-name customers-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -q "TableDescription" && echo "✓ customers-local created" || echo "✓ customers-local ready"

# Create Inventory Table
echo "Creating inventory-local table..."
awslocal dynamodb create-table \
  --table-name inventory-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -q "TableDescription" && echo "✓ inventory-local created" || echo "✓ inventory-local ready"

# Create Catalog Table
echo "Creating catalog-local table..."
awslocal dynamodb create-table \
  --table-name catalog-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -q "TableDescription" && echo "✓ catalog-local created" || echo "✓ catalog-local ready"

# Create Users Table
echo "Creating users-local table..."
awslocal dynamodb create-table \
  --table-name users-local \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -q "TableDescription" && echo "✓ users-local created" || echo "✓ users-local ready"

echo ""
echo "=== LocalStack Initialization Complete ==="
echo "Available services: DynamoDB, S3, Secrets Manager, Lambda, API Gateway"
echo ""
echo "Access points:"
echo "  - LocalStack Gateway: http://localhost:4566"
echo "  - DynamoDB Admin: http://localhost:8001"
echo "  - API Server (serverless offline): http://localhost:4000"
echo ""
echo "To verify tables were created:"
echo "  aws dynamodb list-tables --endpoint-url http://localhost:4566 --region ap-south-1"
echo ""

