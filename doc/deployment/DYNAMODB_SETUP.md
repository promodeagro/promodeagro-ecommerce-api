# DynamoDB Setup Guide - Production Configuration

## Problem Fixed ✅

Your Lambda functions were trying to connect to LocalStack (127.0.0.1:4566) instead of AWS DynamoDB in production, causing:
```
"connect ECONNREFUSED 127.0.0.1:4566"
```

## Solution Applied

1. **Updated `serverless.yml`**: Environment variables now default to AWS DynamoDB
2. **Updated `products/database/dynamodb.js`**: Only uses endpoint if explicitly set (for LocalStack)
3. **Created table creation script**: Easy way to set up all required tables

## Configuration

### Environment Variables

**Production (stage: prod):**
```yaml
DYNAMODB_ENDPOINT: ''  # Empty = use AWS DynamoDB
REGION: ap-south-1
PRODUCTS_TABLE: products
ORDER_TABLE_NAME: orders
CUSTOMER_TABLE_NAME: customers
Inventory_TABLE_NAME: inventory
Catalog_TABLE_NAME: catalog
DYNAMODB_TABLE_NAME: users
CART_TABLE: cart
WISHLIST_TABLE: wishlist
```

**Local Development (optional):**
```bash
# .env.local
DYNAMODB_ENDPOINT=http://localhost:4566
PRODUCTS_TABLE=products-local
ORDER_TABLE_NAME=orders-local
# ... other tables with -local suffix
```

## Quick Setup

### Option 1: Automatic (Recommended)

Run the provided script:
```bash
./scripts/create-dynamodb-tables.sh
```

This creates all 8 required tables in ap-south-1.

### Option 2: Manual via AWS CLI

```bash
# Create products table
aws dynamodb create-table \
  --table-name products \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# Repeat for: orders, customers, inventory, catalog, users, cart, wishlist
```

### Option 3: AWS Console

1. Go to **AWS Console → DynamoDB**
2. Click **Create Table**
3. For each table, use:
   - Table name: `products`, `orders`, `customers`, etc.
   - Partition key: `id` (String)
   - Billing mode: **Pay per request**

## Required Tables

| Table Name | Partition Key | Purpose |
|-----------|---------------|---------|
| products | id (String) | Product catalog |
| orders | id (String) | Order management |
| customers | id (String) | Customer data |
| inventory | id (String) | Stock management |
| catalog | id (String) | Catalog data |
| users | id (String) | User accounts |
| cart | id (String) | Shopping cart |
| wishlist | id (String) | Wishlist items |

## Deployment Steps

1. **Create DynamoDB Tables**
   ```bash
   ./scripts/create-dynamodb-tables.sh
   ```

2. **Verify Tables Exist**
   ```bash
   aws dynamodb list-tables --region ap-south-1
   ```

3. **Redeploy Lambda Functions**
   ```bash
   serverless deploy --stage prod
   ```

4. **Test API**
   ```bash
   curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod/product
   ```

## How It Works

### Connection Flow

**Production:**
```
Lambda Function
  ↓
DYNAMODB_ENDPOINT = '' (empty)
  ↓
AWS SDK uses default AWS DynamoDB endpoint
  ↓
IAM role authenticates request
  ↓
Real AWS DynamoDB in ap-south-1
```

**Local Development (with LocalStack):**
```
Lambda Function
  ↓
DYNAMODB_ENDPOINT = 'http://localhost:4566'
  ↓
AWS SDK uses LocalStack endpoint
  ↓
LocalStack container
```

## Files Modified

1. **serverless.yml**
   - Changed default endpoints from LocalStack to empty string
   - Changed table names from `*-local` to production names
   - Updated environment variables

2. **products/database/dynamodb.js**
   - Added check for DYNAMODB_ENDPOINT environment variable
   - Only sets endpoint if it's explicitly provided (non-empty)
   - Allows AWS SDK to use default AWS endpoints

## IAM Permissions Required

Your Lambda execution role needs these DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:*:table/*"
    }
  ]
}
```

The Serverless Framework automatically creates a role with these permissions when deploying.

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:4566"

**Cause:** Lambda is still trying to use LocalStack endpoint

**Fix:**
1. Verify serverless.yml DYNAMODB_ENDPOINT is empty for prod stage
2. Redeploy: `serverless deploy --stage prod`
3. Check CloudWatch logs

### Error: "ResourceNotFoundException"

**Cause:** DynamoDB tables don't exist

**Fix:**
1. Create tables: `./scripts/create-dynamodb-tables.sh`
2. Verify: `aws dynamodb list-tables --region ap-south-1`
3. Wait for tables to be ACTIVE
4. Redeploy APIs

### Error: "User: arn:aws:iam::... is not authorized"

**Cause:** Lambda IAM role missing DynamoDB permissions

**Fix:**
1. Check Lambda execution role in AWS Console
2. Add DynamoDB permissions (see IAM Permissions section)
3. Wait 1-2 minutes for permissions to propagate
4. Test API again

## Billing

**Pay Per Request** (recommended for this setup):
- You only pay for the requests you actually make
- No need to provision capacity
- Automatically scales
- Good for unpredictable traffic

Example costs:
- 1 million read requests: ~$0.25
- 1 million write requests: ~$1.25
- Storage: $0.25 per GB

## Verification Checklist

- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] All 8 DynamoDB tables created
- [ ] Tables in ACTIVE state (`aws dynamodb list-tables`)
- [ ] Lambda functions deployed (`serverless deploy --stage prod`)
- [ ] API Gateway shows all endpoints
- [ ] Test API call successful
- [ ] CloudWatch logs show no errors

## Next Steps

1. ✅ Create DynamoDB tables
2. ✅ Deploy Lambda functions
3. ✅ Test API endpoints
4. ✅ Monitor CloudWatch logs
5. ✅ Set up alarms (optional)

## Additional Resources

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/)
- [AWS Lambda Execution Role](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)

---

**Status:** ✅ Configuration complete - Ready for AWS DynamoDB setup

