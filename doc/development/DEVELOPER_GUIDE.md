# Developer Guide - API Development & Deployment

Complete guide for developers to create, modify, test, deploy, and verify APIs aligned with the Python CLI structure.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Creating New APIs](#creating-new-apis)
4. [Modifying Existing APIs](#modifying-existing-apis)
5. [Aligning with Python CLI](#aligning-with-python-cli)
6. [Local Testing](#local-testing)
7. [Deployment Guide](#deployment-guide)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                   Python CLI                                    │
│           (products_cli.py - Data Management)                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 Shared DynamoDB Tables                          │
│     (Products, Category_management, Orders, Customers, etc.)    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Node.js Lambda APIs                                │
│  (serverless.yml + handlers + services + database layers)       │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
/opt/mycode/promode/promodeagro-ecommerce-api/
├── products/
│   ├── handlers/              # Lambda function handlers
│   │   ├── createProduct.js
│   │   ├── updateProduct.js
│   │   ├── deleteProduct.js
│   │   ├── listProducts.js
│   │   ├── getProductById.js
│   │   └── ...
│   ├── services/              # Business logic layer
│   │   ├── productService.js
│   │   ├── productValidator.js
│   │   └── unitConverter.js
│   ├── database/              # Database layer
│   │   ├── dynamodb.js       # Connection & utilities
│   │   └── queries.js        # Query operations
│   ├── utils/                 # Utilities
│   │   ├── errorHandler.js
│   │   ├── responseFormatter.js
│   │   └── logger.js
│   ├── tests/                 # Test suite
│   │   ├── unit/
│   │   ├── integration/
│   │   └── ...
│   └── function.yml           # Function definitions
├── serverless.yml             # Framework configuration
├── scripts/
│   ├── create-dynamodb-tables.sh
│   └── ...
├── python-scripts/
│   └── products_cli.py        # Python CLI
└── doc/
    ├── api-spec/              # API documentation
    └── deployment/            # Deployment guides
```

---

## Development Setup

### Prerequisites

```bash
# Install Node.js (18+)
node --version  # Should be v18.x or higher

# Install serverless framework globally
npm install -g serverless

# Install AWS CLI
aws --version   # Should be 2.x

# Python (3.8+) for CLI
python3 --version
```

### Local Environment Setup

```bash
# 1. Navigate to project
cd /opt/mycode/promode/promodeagro-ecommerce-api

# 2. Install dependencies
npm install

# 3. Configure AWS credentials
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Default region (ap-south-1)
# Enter: Default output format (json)

# 4. Verify credentials
aws sts get-caller-identity
```

### Environment Variables

Create `.env.local` for local development:

```bash
# Database
DYNAMODB_ENDPOINT=http://localhost:4566  # For LocalStack
REGION=ap-south-1

# Table Names (should match Python CLI)
PRODUCTS_TABLE=Products
CATEGORY_TABLE_NAME=Category_management
UNIT_TABLE_NAME=Unit_management
STOCK_ADJUSTMENT_TABLE=Stock_adjustment
PINCODE_TABLE_NAME=Pincode_management
DELIVERY_TYPES_TABLE=Delivery_types
DELIVERY_SLOTS_TABLE=Delivery_slots
CUSTOMER_TABLE_NAME=Customers
ORDER_TABLE_NAME=Orders

# API Settings
STAGE=local
NODE_ENV=development
```

---

## Creating New APIs

### Step 1: Define the Function

Add to `products/function.yml`:

```yaml
newFeatureName:
  handler: products/newFeature.handler
  events:
    - httpApi:
        path: /new-endpoint
        method: post  # or get, put, delete
```

### Step 2: Identify DynamoDB Table

Check `products_cli.py` to see which table it uses:

```python
# Example from products_cli.py
self.products_table = self.dynamodb.Table('Products')
self.orders_table = self.dynamodb.Table('Orders')
```

Get the table name and use it from environment variables:

```javascript
// In your handler
const TABLE_NAME = process.env.PRODUCTS_TABLE;  // 'Products'
```

### Step 3: Create Database Layer (queries.js)

Add methods to `products/database/queries.js`:

```javascript
class ProductQueries {
  // Add new table constant
  static ORDERS_TABLE = process.env.ORDER_TABLE_NAME || 'Orders';

  // Add new query method
  static async getOrderById(orderId) {
    return db.get(this.ORDERS_TABLE, { id: orderId });
  }

  static async getAllOrders(options = {}) {
    const params = {
      Limit: options.limit || 100,
    };
    return db.scan(this.ORDERS_TABLE, params);
  }
}

module.exports = ProductQueries;
```

### Step 4: Create Service Layer (productService.js)

Add business logic to `products/services/productService.js`:

```javascript
class ProductService {
  // Match Python CLI logic
  static async createOrder(orderData) {
    // 1. Validate input
    const errors = [];
    if (!orderData.customerId) errors.push('customerId is required');
    if (!orderData.items || orderData.items.length === 0) errors.push('items is required');
    
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.code = 'VALIDATION_ERROR';
      error.errors = errors;
      throw error;
    }

    // 2. Fetch related data from DynamoDB (match CLI pattern)
    const customer = await ProductQueries.getCustomerById(orderData.customerId);
    if (!customer) {
      const error = new Error('Customer not found');
      error.code = 'CUSTOMER_NOT_FOUND';
      throw error;
    }

    // 3. Calculate totals (match Python CLI logic)
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.05;  // 5% tax (match CLI)
    const total = subtotal + tax;

    // 4. Prepare data
    const order = {
      id: uuid.v4(),
      customerId: orderData.customerId,
      items: orderData.items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 5. Save to DynamoDB
    await ProductQueries.saveOrder(order);

    return order;
  }
}

module.exports = ProductService;
```

### Step 5: Create Handler (newFeature.js)

Create `products/handlers/newFeature.js`:

```javascript
/**
 * New Feature Handler
 * POST /new-endpoint
 */

const ProductService = require('../services/productService');
const ResponseFormatter = require('../utils/responseFormatter');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');

module.exports.handler = async (event) => {
  const startTime = Date.now();
  let requestData = {};

  try {
    Logger.logRequest('POST', '/new-endpoint', event.body);

    // Parse request body
    if (!event.body) {
      return ErrorHandler.formatCustomError(
        'INVALID_INPUT',
        'Request body is required',
        [],
        400
      );
    }

    try {
      requestData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return ErrorHandler.formatCustomError(
        'INVALID_JSON',
        'Invalid JSON in request body',
        [],
        400
      );
    }

    // Call service layer
    const result = await ProductService.createOrder(requestData);

    // Format response
    const response = ResponseFormatter.created(result, 'Order created successfully');

    const duration = Date.now() - startTime;
    Logger.logResponse('POST', '/new-endpoint', 201, duration);

    return response;

  } catch (error) {
    Logger.error('Error creating order', error, { requestData });

    // Handle specific errors
    if (error.code === 'VALIDATION_ERROR') {
      return ErrorHandler.formatValidationError(error.errors);
    }

    if (error.code === 'CUSTOMER_NOT_FOUND') {
      return ErrorHandler.formatCustomError(
        'CUSTOMER_NOT_FOUND',
        'Customer not found',
        [],
        404
      );
    }

    // Generic error
    return ErrorHandler.formatError(error);
  }
};
```

### Step 6: Register in function.yml

Already done in Step 1.

---

## Modifying Existing APIs

### 1. To Change Database Interaction

**File:** `products/database/queries.js`

```javascript
// Find the query method
static async getProductById(productId) {
  return db.get(this.TABLE_NAME, { id: productId });
}

// Modify it (add filters, change logic, etc.)
static async getProductById(productId, includeDeleted = false) {
  const params = {
    Key: { id: productId },
    // Add condition to exclude deleted items
    ConditionExpression: includeDeleted ? undefined : 'attribute_not_exists(deletedAt)',
  };
  return db.get(this.TABLE_NAME, params);
}
```

### 2. To Change Business Logic

**File:** `products/services/productService.js`

```javascript
// Find the method
static async createProduct(productData) {
  // ... validation ...
  // ... transformation ...
  return ProductQueries.saveProduct(product);
}

// Add or modify logic
static async createProduct(productData) {
  // ... validation ...
  
  // Add new logic: fetch category details
  const category = await ProductQueries.getCategoryById(productData.categoryId);
  
  // Transform data
  const product = {
    ...productData,
    categoryName: category.name,  // Add category name
    status: this.calculateProductStatus(productData.stock),
  };
  
  return ProductQueries.saveProduct(product);
}
```

### 3. To Change API Response

**File:** `products/handlers/someHandler.js`

```javascript
// Find the response formatting
const response = ResponseFormatter.success(product, 'Product fetched');

// Modify response structure
const response = ResponseFormatter.success(
  {
    ...product,
    formattedPrice: `$${product.basePrice.toFixed(2)}`,  // Add formatted price
    inStock: product.stock > 0,  // Add computed field
  },
  'Product fetched'
);
```

### 4. Match Python CLI Logic

When modifying, check the Python CLI for the same operation:

```bash
# View Python CLI logic
grep -A 20 "def create_product" python-scripts/products_cli.py

# Apply same logic to Node.js service
# Example: If CLI calculates tax as 5%, use same in Node.js
```

---

## Aligning with Python CLI

### Key Alignment Points

| Aspect | Python CLI | Node.js API |
|--------|-----------|-----------|
| Table Names | `Products`, `Category_management` | From `process.env` |
| Partition Key | `id` | Always `id` (String) |
| Status Calculation | `calculate_product_status()` | `productService.calculateProductStatus()` |
| Unit Conversion | `convert_variant_qty_to_parent_unit()` | `unitConverter.convert()` |
| Error Handling | Custom exceptions | Custom error codes |
| Validation | Input validation in CLI | `productValidator.validate()` |

### Common Patterns to Match

**1. Product Status Calculation**

Python CLI:
```python
def calculate_product_status(self, stock: int, low_stock_alert: int) -> str:
    if stock == 0:
        return 'out-of-stock'
    elif low_stock_alert > 0 and stock <= low_stock_alert:
        return 'low-stock'
    else:
        return 'in-stock'
```

Node.js API:
```javascript
static calculateProductStatus(stock, lowStockAlert) {
  if (stock === 0) return 'out-of-stock';
  if (lowStockAlert > 0 && stock <= lowStockAlert) return 'low-stock';
  return 'in-stock';
}
```

**2. Unit Conversion**

Python CLI:
```python
def convert_variant_qty_to_parent_unit(self, qty_str: str, variant_unit: str, parent_unit: str) -> float:
    # ... conversion logic ...
```

Node.js API:
```javascript
static convertVariantQty(qtyStr, variantUnit, parentUnit) {
  // Same logic as Python CLI
}
```

**3. Table Access**

Python CLI:
```python
self.products_table = self.dynamodb.Table('Products')
self.products_table.put_item(Item=product)
```

Node.js API:
```javascript
const TABLE_NAME = process.env.PRODUCTS_TABLE;  // 'Products'
await ProductQueries.saveProduct(product);      // Uses TABLE_NAME internally
```

---

## Local Testing

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- productService.test.js

# Run with coverage
npm run test:coverage
```

**Test File Location:** `products/tests/unit/`

**Example Unit Test:**
```javascript
describe('ProductService', () => {
  describe('createProduct', () => {
    it('should create product with correct status', async () => {
      const product = await ProductService.createProduct({
        name: 'Test Product',
        stock: 100,
        basePrice: 50,
      });

      expect(product.status).toBe('in-stock');
    });

    it('should validate required fields', async () => {
      expect(() => ProductService.createProduct({}))
        .toThrow('name is required');
    });
  });
});
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- createProduct.integration.test.js
```

**Test File Location:** `products/tests/integration/`

**Example Integration Test:**
```javascript
describe('POST /product', () => {
  it('should create product in DynamoDB', async () => {
    const mockProduct = {
      name: 'Test Product',
      stock: 100,
      basePrice: 50,
    };

    const result = await handler({
      body: JSON.stringify(mockProduct),
    });

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).data.id).toBeDefined();
  });
});
```

### Manual Testing with AWS CLI

```bash
# Test getting a product
aws dynamodb get-item \
  --table-name Products \
  --key '{"id":{"S":"product-id-here"}}' \
  --region ap-south-1

# Test scanning products
aws dynamodb scan \
  --table-name Products \
  --max-items 10 \
  --region ap-south-1

# Test put item
aws dynamodb put-item \
  --table-name Products \
  --item '{"id":{"S":"new-id"},"name":{"S":"Test Product"}}' \
  --region ap-south-1
```

---

## Deployment Guide

### Pre-Deployment Checklist

```bash
# ✅ 1. Create DynamoDB tables
./scripts/create-dynamodb-tables.sh

# ✅ 2. Verify tables created
aws dynamodb list-tables --region ap-south-1

# ✅ 3. Run tests
npm run test

# ✅ 4. Check for errors
npm run lint

# ✅ 5. Verify AWS credentials
aws sts get-caller-identity

# ✅ 6. Verify serverless.yml is valid
serverless print
```

### Deployment Steps

```bash
# Step 1: Clean previous build
npm run clean

# Step 2: Install production dependencies
npm install

# Step 3: Deploy to AWS
serverless deploy --stage prod

# Expected output:
# ✅ Service deployed
# ✅ Functions deployed
# ✅ Endpoints deployed
# ✅ Stack update complete
```

### Alternative: Deploy Specific Function

```bash
# Deploy only one function (faster for testing)
serverless deploy function -f createProduct --stage prod

# This updates only the createProduct Lambda function
```

---

## Post-Deployment Verification

### 1. Check Deployment Status

```bash
# View deployed stack
aws cloudformation describe-stacks \
  --stack-name promodeAgro-ecommerce-api-prod \
  --region ap-south-1

# Should show: StackStatus = CREATE_COMPLETE or UPDATE_COMPLETE
```

### 2. Test API Endpoints

```bash
# Get API endpoint
ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name promodeAgro-ecommerce-api-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' \
  --output text \
  --region ap-south-1)

# Test endpoint
curl -X GET "$ENDPOINT/product"

# Test with data
curl -X POST "$ENDPOINT/product" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","basePrice":100,"stock":50}'
```

### 3. Verify DynamoDB Tables

```bash
# Scan Products table
aws dynamodb scan \
  --table-name Products \
  --region ap-south-1

# Should return items created by API
```

### 4. Check Lambda Logs

```bash
# View recent logs
aws logs tail /aws/lambda/promodeAgro-ecommerce-api-prod-createProduct --follow

# View specific log stream
aws logs tail /aws/lambda/promodeAgro-ecommerce-api-prod-createProduct \
  --start-time 5m \
  --follow
```

### 5. Verify API Gateway

```bash
# List API stages
aws apigateway get-stage \
  --rest-api-id <api-id> \
  --stage-name prod

# Should show: stageName = prod, deploymentId = <id>
```

### 6. Test Python CLI Against Deployed API

```bash
# Ensure CLI uses AWS endpoints (not LocalStack)
export DYNAMODB_ENDPOINT=""  # Empty means use AWS

# Run CLI
python3 python-scripts/products_cli.py

# Create data via CLI
# Then verify via API:
curl -X GET "$ENDPOINT/product"  # Should see CLI data
```

### 7. End-to-End Test

```bash
# Sequence:
# 1. Create product via API
curl -X POST "$ENDPOINT/product" \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Test","basePrice":99.99,"stock":10}'

# 2. List products via CLI
python3 python-scripts/products_cli.py  # Choose: List Products

# 3. Should see API-created product in CLI ✅

# 4. Create product via CLI
# Choose: Create Product in CLI

# 5. Get product via API
curl -X GET "$ENDPOINT/product"  # Should see CLI-created product ✅
```

---

## Troubleshooting

### Issue: "Table does not exist"

**Symptom:** API returns `Requested resource not found` error

**Solution:**
```bash
# 1. Create tables
./scripts/create-dynamodb-tables.sh

# 2. Verify tables exist
aws dynamodb list-tables --region ap-south-1

# 3. Check table name in queries.js matches env var
grep "TABLE_NAME =" products/database/queries.js
```

### Issue: "Access Denied" error

**Symptom:** Lambda can't access DynamoDB tables

**Solution:**
```bash
# 1. Check IAM role permissions
aws iam get-role-policy \
  --role-name promodeAgro-ecommerce-api-prod-ap-south-1-lambdaRole \
  --policy-name promodeAgro-ecommerce-api-prod-policy

# 2. Redeploy to update IAM role
serverless deploy --stage prod

# 3. Verify tables accessible
aws dynamodb describe-table --table-name Products --region ap-south-1
```

### Issue: "Invalid environment variable"

**Symptom:** `undefined` table names in logs

**Solution:**
```bash
# 1. Check serverless.yml environment section
grep -A 10 "environment:" serverless.yml

# 2. Verify all 9 table names are defined
grep "TABLE_NAME" serverless.yml | wc -l  # Should be 9

# 3. Redeploy with correct config
serverless deploy --stage prod
```

### Issue: "Function timeout"

**Symptom:** Lambda times out after 29 seconds

**Solution:**
```bash
# 1. Check serverless.yml timeout
grep "timeout:" serverless.yml

# 2. Increase if needed
serverless.yml:
  provider:
    timeout: 60  # Change from 29 to 60

# 3. Redeploy
serverless deploy --stage prod
```

### Issue: "Cold start performance issue"

**Symptom:** First request takes 5-10 seconds

**Solution:** Normal for Lambda cold starts. Not an error.
```bash
# Optimize:
# 1. Reduce bundle size (remove unused dependencies)
# 2. Use Lambda provisioned concurrency (costs more)
# 3. Keep functions warm with scheduled invocations
```

---

## Best Practices

### Code Organization

✅ **DO:**
```javascript
// Group by responsibility
- handlers/    (API endpoints)
- services/    (Business logic)
- database/    (DynamoDB operations)
- utils/       (Shared utilities)

// Keep handlers thin
module.exports.handler = async (event) => {
  // 1. Parse input
  // 2. Call service
  // 3. Format response
  // 4. Return
};
```

❌ **DON'T:**
```javascript
// Mix concerns
module.exports.handler = async (event) => {
  // Database queries directly
  const params = { TableName: 'Products', ... };
  const result = await dynamodb.query(params);
  
  // Business logic
  result.status = calculateStatus(...);
  
  // All in one function = hard to test
};
```

### Error Handling

✅ **DO:**
```javascript
try {
  // Logic
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    return ErrorHandler.formatValidationError(error.errors);
  }
  if (error.code === 'NOT_FOUND') {
    return ErrorHandler.formatCustomError('NOT_FOUND', 'Item not found', [], 404);
  }
  return ErrorHandler.formatError(error);  // Generic error
}
```

❌ **DON'T:**
```javascript
try {
  // Logic
} catch (error) {
  console.log(error);  // Don't just log
  return { statusCode: 500, body: error.message };  // Inconsistent format
}
```

### Database Operations

✅ **DO:**
```javascript
// Use queries.js layer
const product = await ProductQueries.getProductById(id);

// Check null explicitly
if (!product) {
  throw new Error('Product not found');
}
```

❌ **DON'T:**
```javascript
// DynamoDB calls in handlers
const params = { TableName: 'Products', Key: { id } };
const result = await dynamodb.get(params);

// Assume result exists
return result.Item;  // Crashes if null
```

### Environment Variables

✅ **DO:**
```javascript
// Use consistent naming
const TABLE_NAME = process.env.PRODUCTS_TABLE || 'Products';
const CUSTOMER_TABLE = process.env.CUSTOMER_TABLE_NAME || 'Customers';

// Make them static class properties
class ProductQueries {
  static TABLE_NAME = process.env.PRODUCTS_TABLE || 'Products';
}
```

❌ **DON'T:**
```javascript
// Hardcode table names
const TABLE_NAME = 'Products';

// Inconsistent naming
const table1 = process.env.PROD_TABLE;
const table2 = 'Products';
const table3 = process.env.TABLE_NAME;  // Which one?
```

### Testing

✅ **DO:**
```javascript
// Test each layer independently
describe('ProductService', () => {
  it('calculates status correctly', () => {
    // Mock database
    // Test business logic only
  });
});

describe('POST /product handler', () => {
  it('calls service and formats response', () => {
    // Mock service
    // Test handler logic only
  });
});
```

❌ **DON'T:**
```javascript
// Integration test as unit test
it('creates product end-to-end', async () => {
  // Makes actual DynamoDB calls
  // Tests everything at once
  // Hard to debug when it fails
});
```

### Logging

✅ **DO:**
```javascript
Logger.logRequest('POST', '/product', event.body);
Logger.logResponse('POST', '/product', 201, duration);
Logger.info('Product created', { productId, userId });
Logger.error('Error creating product', error, { productData });
```

❌ **DON'T:**
```javascript
console.log('Creating product');
console.log(event.body);
console.log('Done');
// Hard to search and parse later
```

---

## Quick Reference

### Creating an API

1. Add function to `products/function.yml`
2. Add query methods to `products/database/queries.js`
3. Add business logic to `products/services/productService.js`
4. Create handler in `products/handlers/newFeature.js`
5. Add unit tests in `products/tests/unit/`
6. Add integration tests in `products/tests/integration/`

### Modifying an API

1. Find the handler in `products/handlers/`
2. Trace to service layer in `products/services/`
3. Make changes aligned with Python CLI logic
4. Update tests
5. Run `npm test`
6. Deploy `serverless deploy --stage prod`

### Testing Locally

```bash
npm run test:unit              # Unit tests
npm run test:integration       # Integration tests
npm run test:coverage          # Coverage report
```

### Testing in Production

```bash
# Get endpoint
ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name promodeAgro-ecommerce-api-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' \
  --output text \
  --region ap-south-1)

# Test
curl "$ENDPOINT/product"
```

### Common Commands

```bash
npm run clean                  # Remove build artifacts
npm install                    # Install dependencies
npm run test                   # Run all tests
serverless print               # Show config
serverless deploy              # Deploy
serverless logs -f createProduct  # View logs
aws dynamodb scan --table-name Products  # Scan table
```

---

## Support & Resources

- **Python CLI:** `/opt/mycode/promode/promodeagro-ecommerce-api/python-scripts/products_cli.py`
- **Test Files:** `/opt/mycode/promode/promodeagro-ecommerce-api/products/tests/`
- **API Spec:** `/opt/mycode/promode/promodeagro-ecommerce-api/doc/api-spec/`
- **AWS CLI Docs:** https://docs.aws.amazon.com/cli/
- **Serverless Docs:** https://www.serverless.com/framework/docs

---

**Last Updated:** November 15, 2025
**Version:** 1.0

