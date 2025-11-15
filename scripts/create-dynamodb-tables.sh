#!/bin/bash

# Script to create DynamoDB tables in AWS for production
# Usage: ./scripts/create-dynamodb-tables.sh
# Region: ap-south-1
# Billing: PAY_PER_REQUEST (on-demand, scales automatically)
# Tables match Python CLI: products_cli.py

set -e

REGION="ap-south-1"
BILLING_MODE="PAY_PER_REQUEST"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Creating DynamoDB Tables for Production               ║"
echo "║        Tables match Python CLI (products_cli.py)               ║"
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

# Create all tables (matching Python CLI)
TABLES=(
    "Products"
    "Category_management"
    "Unit_management"
    "Stock_adjustment"
    "Pincode_management"
    "Delivery_types"
    "Delivery_slots"
    "Customers"
    "Orders"
)

echo "Creating 9 tables to match Python CLI (products_cli.py)..."
echo ""

for table in "${TABLES[@]}"; do
    create_table "$table"
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ ALL TABLES CREATED                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Tables created (matching Python CLI):"
for table in "${TABLES[@]}"; do
    echo "  ✅ $table"
done
echo ""
echo "Table Structure:"
echo "  • Partition Key: id (String)"
echo "  • Billing Mode: PAY_PER_REQUEST (on-demand)"
echo "  • Region: $REGION"
echo ""
echo "Next steps:"
echo "  1. Redeploy API: serverless deploy --stage prod"
echo "  2. Test CLI: python3 products_cli.py"
echo "  3. Test API: curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod/product"
echo ""
