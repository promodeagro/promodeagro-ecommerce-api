# Python CLI & Node.js API Integration Guide

## Overview

The Python CLI (`products_cli.py`) and Node.js APIs now share the exact same DynamoDB table structure and names. This enables complete data synchronization and unified data management.

## 9 Unified DynamoDB Tables

| Table Name | Purpose | Used By |
|---|---|---|
| `Products` | Product catalog and details | CLI & API |
| `Category_management` | Categories | CLI & API |
| `Unit_management` | Units of measurement | CLI & API |
| `Stock_adjustment` | Stock adjustments | CLI & API |
| `Pincode_management` | Location/pincode data | CLI & API |
| `Delivery_types` | Delivery type config | CLI & API |
| `Delivery_slots` | Delivery time slots | CLI & API |
| `Customers` | Customer information | CLI & API |
| `Orders` | Order data | CLI & API |

## Configuration Files Updated

### 1. serverless.yml (Environment Variables)

```yaml
environment:
  PRODUCTS_TABLE: 'Products'
  CATEGORY_TABLE_NAME: 'Category_management'
  UNIT_TABLE_NAME: 'Unit_management'
  STOCK_ADJUSTMENT_TABLE: 'Stock_adjustment'
  PINCODE_TABLE_NAME: 'Pincode_management'
  DELIVERY_TYPES_TABLE: 'Delivery_types'
  DELIVERY_SLOTS_TABLE: 'Delivery_slots'
  CUSTOMER_TABLE_NAME: 'Customers'
  ORDER_TABLE_NAME: 'Orders'
```

These environment variables are available to all Lambda functions.

### 2. products/database/queries.js (Table Constants)

```javascript
class ProductQueries {
  static TABLE_NAME = process.env.PRODUCTS_TABLE || 'Products';
  static CATEGORY_TABLE_NAME = process.env.CATEGORY_TABLE_NAME || 'Category_management';
  static UNIT_TABLE_NAME = process.env.UNIT_TABLE_NAME || 'Unit_management';
  static STOCK_ADJUSTMENT_TABLE = process.env.STOCK_ADJUSTMENT_TABLE || 'Stock_adjustment';
  static PINCODE_TABLE_NAME = process.env.PINCODE_TABLE_NAME || 'Pincode_management';
  static DELIVERY_TYPES_TABLE = process.env.DELIVERY_TYPES_TABLE || 'Delivery_types';
  static DELIVERY_SLOTS_TABLE = process.env.DELIVERY_SLOTS_TABLE || 'Delivery_slots';
  static CUSTOMER_TABLE_NAME = process.env.CUSTOMER_TABLE_NAME || 'Customers';
  static ORDER_TABLE_NAME = process.env.ORDER_TABLE_NAME || 'Orders';
}
```

All table queries use these constants.

### 3. scripts/create-dynamodb-tables.sh (Table Creation)

Creates all 9 tables with:
- Partition Key: `id` (String)
- Billing Mode: PAY_PER_REQUEST (on-demand)
- Region: ap-south-1

## Integration Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Python CLI                                  │
│              (products_cli.py)                               │
│                                                              │
│  • Create/Edit Products                                     │
│  • Manage Categories, Units                                 │
│  • Track Stock Adjustments                                  │
│  • Manage Customers, Orders                                 │
└──────────────┬───────────────────────────────────────────────┘
               │ Uses same table names
               ↓
┌──────────────────────────────────────────────────────────────┐
│              Shared DynamoDB Tables                          │
│                                                              │
│  ✅ Products  ✅ Category_management  ✅ Unit_management     │
│  ✅ Stock_adjustment  ✅ Pincode_management                 │
│  ✅ Delivery_types  ✅ Delivery_slots                        │
│  ✅ Customers  ✅ Orders                                    │
└──────────────┬───────────────────────────────────────────────┘
               │ Retrieved by environment variables
               ↓
┌──────────────────────────────────────────────────────────────┐
│             Node.js Lambda APIs                              │
│        (Serverless Framework)                                │
│                                                              │
│  • POST /product (Create)                                   │
│  • GET /product (List)                                      │
│  • PUT /product (Update)                                    │
│  • DELETE /product (Delete)                                 │
│  • GET /product/{id} (Get single)                           │
│  • ... other endpoints ...                                  │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating Data (CLI → DynamoDB → API)

1. **Python CLI**
   ```python
   cli = ProductsCLI('ap-south-1')
   cli.products_table = dynamodb.Table('Products')
   cli.products_table.put_item(Item=product_data)
   ```

2. **DynamoDB**
   - Stores product in `Products` table

3. **Node.js API**
   ```javascript
   const TABLE_NAME = process.env.PRODUCTS_TABLE; // 'Products'
   const product = await db.get(TABLE_NAME, { id: productId });
   ```

### Data Sharing

| Operation | Source | Table | Destination |
|---|---|---|---|
| Create product | CLI | Products | API can read |
| Create order | API | Orders | CLI can read |
| Update category | CLI | Category_management | API can read |
| Query customers | API | Customers | CLI can read |

## Deployment Steps

### Step 1: Create DynamoDB Tables

```bash
cd /opt/mycode/promode/promodeagro-ecommerce-api
./scripts/create-dynamodb-tables.sh
```

Creates all 9 tables with PascalCase names matching Python CLI.

### Step 2: Redeploy Lambda Functions

```bash
serverless deploy --stage prod
```

Deploys APIs with updated environment variables.

### Step 3: Test Integration

**Test Python CLI:**
```bash
python3 python-scripts/products_cli.py
```

Should connect to 'Products' table without errors.

**Test Node.js API:**
```bash
curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod/product
```

Should return products from 'Products' table.

**Test Data Sharing:**
1. Create product via CLI
2. Call API: `GET /product`
3. Should see CLI-created product ✅

## Environment Variables (Lambda)

Available to all Lambda functions:

```
PRODUCTS_TABLE=Products
CATEGORY_TABLE_NAME=Category_management
UNIT_TABLE_NAME=Unit_management
STOCK_ADJUSTMENT_TABLE=Stock_adjustment
PINCODE_TABLE_NAME=Pincode_management
DELIVERY_TYPES_TABLE=Delivery_types
DELIVERY_SLOTS_TABLE=Delivery_slots
CUSTOMER_TABLE_NAME=Customers
ORDER_TABLE_NAME=Orders
```

Usage in handlers:

```javascript
const { ProductQueries } = require('../database/queries');

// Automatically uses PRODUCTS_TABLE env var
const products = await ProductQueries.getAllProducts();
```

## Python CLI to Node.js API Mapping

| CLI Operation | Table | Node.js Endpoint |
|---|---|---|
| Create Product | Products | POST /product |
| List Products | Products | GET /product |
| Update Product | Products | PUT /product |
| Delete Product | Products | DELETE /product |
| Get Product by ID | Products | GET /product/{id} |
| Manage Categories | Category_management | (future endpoints) |
| Manage Units | Unit_management | (future endpoints) |
| Track Stock | Stock_adjustment | (future endpoints) |
| Manage Orders | Orders | (future endpoints) |

## Fallback Behavior

If environment variables are not set, the code falls back to default table names:

```javascript
static TABLE_NAME = process.env.PRODUCTS_TABLE || 'Products';
// Tries env var first, uses 'Products' if not set
```

This ensures compatibility:
- **Production**: Environment variables from serverless.yml
- **Local Development**: Uses default hardcoded names
- **Testing**: Can override with test env vars

## Common Issues & Solutions

### Issue: API gets "ResourceNotFound" error

**Cause:** Tables don't exist yet

**Solution:**
```bash
./scripts/create-dynamodb-tables.sh
```

### Issue: CLI connects but API doesn't

**Cause:** Lambda environment variables not updated

**Solution:**
```bash
serverless deploy --stage prod
```

### Issue: Data created by CLI not visible to API

**Cause:** Different table names being used

**Solution:**
Verify environment variables in Lambda:
```bash
aws lambda get-function-configuration \
  --function-name <function-name> \
  | grep -A 10 "Environment"
```

Should show all 9 table names correctly.

### Issue: Data created by API not visible to CLI

**Cause:** CLI connecting to wrong table

**Solution:**
Verify CLI code uses correct table names:
```python
self.products_table = self.dynamodb.Table('Products')
# Should be 'Products' not 'products'
```

## Verification Checklist

- [ ] All 9 DynamoDB tables created
- [ ] Tables have partition key 'id' (String)
- [ ] serverless.yml has 9 environment variables
- [ ] products/database/queries.js has 9 table constants
- [ ] Lambda functions deployed
- [ ] Python CLI connects to 'Products' table
- [ ] Node.js API returns products
- [ ] CLI-created data visible via API
- [ ] API-created data visible via CLI
- [ ] No table name mismatches
- [ ] Environment variables working correctly

## Production Readiness

✅ Python CLI and Node.js APIs unified
✅ Shared DynamoDB infrastructure
✅ Environment-based configuration
✅ Consistent table naming
✅ Complete data synchronization
✅ Fallback behavior for local development
✅ Documentation complete

## Related Files

- `python-scripts/products_cli.py` - Python CLI implementation
- `serverless.yml` - Environment variables
- `products/database/queries.js` - Table constants
- `products/database/dynamodb.js` - Database connection
- `scripts/create-dynamodb-tables.sh` - Table creation
- Lambda handlers in `products/handlers/` - Use table names from env vars

---

**Status:** ✅ Complete - Python CLI and Node.js APIs fully integrated
**Date:** November 15, 2025
**Version:** 1.0

