#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      ProMode Agro - DynamoDB Table Creation Script         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENDPOINT=http://localhost:4566
REGION=ap-south-1

# Function to create table
create_table() {
  local table_name=$1
  local key_name=$2
  local sort_key=$3
  
  echo -e "${BLUE}Creating table: ${table_name}${NC}"
  
  if [ -z "$sort_key" ]; then
    # Only partition key
    aws dynamodb create-table \
      --table-name "$table_name" \
      --attribute-definitions AttributeName="$key_name",AttributeType=S \
      --key-schema AttributeName="$key_name",KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --endpoint-url "$ENDPOINT" \
      --region "$REGION" \
      --output table > /dev/null 2>&1
  else
    # Partition key + sort key
    aws dynamodb create-table \
      --table-name "$table_name" \
      --attribute-definitions \
        AttributeName="$key_name",AttributeType=S \
        AttributeName="$sort_key",AttributeType=S \
      --key-schema \
        AttributeName="$key_name",KeyType=HASH \
        AttributeName="$sort_key",KeyType=RANGE \
      --billing-mode PAY_PER_REQUEST \
      --endpoint-url "$ENDPOINT" \
      --region "$REGION" \
      --output table > /dev/null 2>&1
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ${table_name}${NC}"
  else
    # Check if table already exists
    if aws dynamodb describe-table \
      --table-name "$table_name" \
      --endpoint-url "$ENDPOINT" \
      --region "$REGION" \
      --output table > /dev/null 2>&1; then
      echo -e "${YELLOW}✓ ${table_name} (already exists)${NC}"
    else
      echo -e "${RED}✗ Failed to create ${table_name}${NC}"
      return 1
    fi
  fi
}

# Verify LocalStack is running
echo -e "${BLUE}Checking LocalStack health...${NC}"
if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
  echo -e "${RED}✗ LocalStack is not running!${NC}"
  echo "  Please start LocalStack first:"
  echo "  ${YELLOW}bash scripts/start-localstack.sh${NC}"
  exit 1
fi
echo -e "${GREEN}✓ LocalStack is running${NC}"
echo ""

# Create tables
echo -e "${BLUE}Creating DynamoDB tables...${NC}"
echo ""

create_table "products-local" "id"
create_table "orders-local" "id" "userId"
create_table "customers-local" "id"
create_table "inventory-local" "id"
create_table "catalog-local" "id"
create_table "users-local" "id"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All tables created successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# List tables
echo -e "${BLUE}Tables in LocalStack:${NC}"
aws dynamodb list-tables \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --query 'TableNames[]' \
  --output table
echo ""

echo -e "${BLUE}Access DynamoDB Admin:${NC}"
echo "  ${YELLOW}http://localhost:8001${NC}"
echo ""

