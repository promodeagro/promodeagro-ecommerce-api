#!/bin/bash

# Script to create DynamoDB tables in AWS for production
# Usage: ./scripts/create-dynamodb-tables.sh
# Region: ap-south-1
# Billing: PAY_PER_REQUEST (on-demand, scales automatically)

set -e

REGION="ap-south-1"
BILLING_MODE="PAY_PER_REQUEST"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Creating DynamoDB Tables for Production               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Region: $REGION"
echo "Billing Mode: $BILLING_MODE"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Function to create table
create_table() {
    local table_name=$1
    echo "Creating table: $table_name..."
    
    aws dynamodb create-table \
        --table-name "$table_name" \
        --attribute-definitions AttributeName=id,AttributeType=S \
        --key-schema AttributeName=id,KeyType=HASH \
        --billing-mode "$BILLING_MODE" \
        --region "$REGION" \
        --output text > /dev/null 2>&1 || true
    
    # Wait for table to be created
    echo "Waiting for $table_name to be ACTIVE..."
    aws dynamodb wait table-exists \
        --table-name "$table_name" \
        --region "$REGION"
    
    echo "✅ $table_name created successfully"
}

# Create all tables
TABLES=(
    "products"
    "orders"
    "customers"
    "inventory"
    "catalog"
    "users"
    "cart"
    "wishlist"
)

echo "Creating tables..."
echo ""

for table in "${TABLES[@]}"; do
    create_table "$table"
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ ALL TABLES CREATED                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Tables created:"
for table in "${TABLES[@]}"; do
    echo "  ✅ $table"
done
echo ""
echo "Next steps:"
echo "  1. Redeploy: serverless deploy --stage prod"
echo "  2. Test: curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod/product"
echo ""

