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

# Configure AWS CLI for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=ap-south-1
AWS_ENDPOINT="http://localhost:4566"

# Create Products Table
echo "Creating products-local table..."
aws dynamodb create-table \
  --endpoint-url "$AWS_ENDPOINT" \
  --table-name products-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 > /dev/null && echo "✓ products-local created" || echo "✓ products-local ready"

# Create Orders Table
echo "Creating orders-local table..."
aws dynamodb create-table \
  --endpoint-url "$AWS_ENDPOINT" \
  --table-name orders-local \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH AttributeName=userId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>&1 > /dev/null && echo "✓ orders-local created" || echo "✓ orders-local ready"

# Create Customers Table
echo "Creating customers-local table..."
aws dynamodb create-table \
  --endpoint-url "$AWS_ENDPOINT" \
  --table-name customers-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 > /dev/null && echo "✓ customers-local created" || echo "✓ customers-local ready"

# Create Inventory Table
echo "Creating inventory-local table..."
aws dynamodb create-table \
  --endpoint-url "$AWS_ENDPOINT" \
  --table-name inventory-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 > /dev/null && echo "✓ inventory-local created" || echo "✓ inventory-local ready"

# Create Catalog Table
echo "Creating catalog-local table..."
aws dynamodb create-table \
  --endpoint-url "$AWS_ENDPOINT" \
  --table-name catalog-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 > /dev/null && echo "✓ catalog-local created" || echo "✓ catalog-local ready"

# Create Users Table
echo "Creating users-local table..."
aws dynamodb create-table \
  --endpoint-url "$AWS_ENDPOINT" \
  --table-name users-local \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 > /dev/null && echo "✓ users-local created" || echo "✓ users-local ready"

echo ""
echo "=== LocalStack Initialization Complete ==="
echo ""
