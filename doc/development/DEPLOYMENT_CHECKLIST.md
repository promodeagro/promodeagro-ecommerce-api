# Deployment Checklist

Complete step-by-step checklist for deploying and verifying APIs.

---

## Pre-Deployment (Day -1)

### Code Review

- [ ] All code changes committed to git
- [ ] All tests passing: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No console.log left in code
- [ ] Error handling implemented
- [ ] Logging implemented
- [ ] Comments added to complex logic

### Testing

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Manual API tests completed
- [ ] Tested against Python CLI logic
- [ ] Edge cases tested

### Documentation

- [ ] Code comments updated
- [ ] Function parameters documented
- [ ] Error codes documented
- [ ] API response format documented

### Environment

- [ ] AWS credentials configured: `aws sts get-caller-identity`
- [ ] Correct region set: `ap-south-1`
- [ ] AWS account verified
- [ ] IAM permissions verified

---

## Deployment Day

### Pre-Deployment Tasks (1 hour before)

```bash
# ✅ Task 1: Clean build
npm run clean
```

- [ ] Previous build artifacts removed

```bash
# ✅ Task 2: Install dependencies
npm install
```

- [ ] All dependencies installed
- [ ] No installation errors
- [ ] node_modules created

```bash
# ✅ Task 3: Verify code
npm run test
```

- [ ] All tests passing
- [ ] No test failures
- [ ] Coverage acceptable (>80%)

```bash
# ✅ Task 4: Check configuration
serverless print
```

- [ ] serverless.yml valid
- [ ] All functions listed
- [ ] Environment variables correct
- [ ] Table names correct (9 tables)

```bash
# ✅ Task 5: Verify DynamoDB tables
aws dynamodb list-tables --region ap-south-1
```

- [ ] All 9 tables exist:
  - [ ] Products
  - [ ] Category_management
  - [ ] Unit_management
  - [ ] Stock_adjustment
  - [ ] Pincode_management
  - [ ] Delivery_types
  - [ ] Delivery_slots
  - [ ] Customers
  - [ ] Orders

```bash
# ✅ Task 6: Verify AWS credentials
aws sts get-caller-identity
```

- [ ] Credentials valid
- [ ] Correct AWS account
- [ ] Correct region

### Deployment Execution (5-10 minutes)

```bash
# ✅ MAIN DEPLOYMENT COMMAND
serverless deploy --stage prod
```

**Expected Output:**
```
✓ Service deployed
✓ Functions deployed (17 functions)
✓ Endpoints deployed
✓ Stack update complete
```

**Watch for:**
- [ ] No error messages
- [ ] All functions deployed successfully
- [ ] API endpoints shown
- [ ] Stack update completed

### Immediate Post-Deployment (First 15 minutes)

```bash
# ✅ Task 1: Verify deployment
aws cloudformation describe-stacks \
  --stack-name promodeAgro-ecommerce-api-prod \
  --region ap-south-1 \
  --query 'Stacks[0].StackStatus'
```

- [ ] Stack status: CREATE_COMPLETE or UPDATE_COMPLETE
- [ ] No ROLLBACK messages
- [ ] No FAILED status

```bash
# ✅ Task 2: Get API endpoint
ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name promodeAgro-ecommerce-api-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' \
  --output text \
  --region ap-south-1)

echo $ENDPOINT  # Save this value
```

- [ ] Endpoint URL retrieved
- [ ] URL format: https://xxx.execute-api.ap-south-1.amazonaws.com/prod

```bash
# ✅ Task 3: Test basic connectivity
curl -X GET "$ENDPOINT/product"
```

Expected Response:
```json
{
  "success": true,
  "data": [],
  "message": "Products fetched successfully"
}
```

- [ ] HTTP status 200
- [ ] Response is valid JSON
- [ ] Contains expected fields
- [ ] Data array present (even if empty)

### Functional Verification (30 minutes)

#### Test 1: Create Product

```bash
curl -X POST "$ENDPOINT/product" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "categoryId": "cat-001",
    "basePrice": 99.99,
    "stock": 100,
    "unit": "kg"
  }'
```

Expected:
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "xxx",
    "name": "Test Product",
    "status": "in-stock"
  }
}
```

- [ ] Status code 201
- [ ] Product created
- [ ] Status calculated correctly
- [ ] Response has correct fields

#### Test 2: Get Product

```bash
PRODUCT_ID="<id from previous response>"

curl -X GET "$ENDPOINT/product/$PRODUCT_ID"
```

Expected:
- [ ] HTTP status 200
- [ ] Product data returned
- [ ] Same data as created
- [ ] Matches DynamoDB entry

#### Test 3: List Products

```bash
curl -X GET "$ENDPOINT/product"
```

Expected:
- [ ] HTTP status 200
- [ ] Array of products
- [ ] Newly created product in list
- [ ] Correct pagination info

#### Test 4: Update Product

```bash
curl -X PUT "$ENDPOINT/product" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$PRODUCT_ID'",
    "basePrice": 119.99,
    "stock": 75
  }'
```

Expected:
- [ ] HTTP status 200
- [ ] Product updated
- [ ] New price reflected
- [ ] Status recalculated

#### Test 5: Error Handling

```bash
# Test with invalid data
curl -X POST "$ENDPOINT/product" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

Expected:
- [ ] HTTP status 400
- [ ] Error message informative
- [ ] Error code present
- [ ] Proper format

### DynamoDB Verification (15 minutes)

#### Scan Products Table

```bash
aws dynamodb scan \
  --table-name Products \
  --max-items 10 \
  --region ap-south-1
```

- [ ] Table accessible
- [ ] Items returned
- [ ] Newly created product present
- [ ] Correct structure

#### Verify Item Format

```bash
aws dynamodb get-item \
  --table-name Products \
  --key '{"id":{"S":"'$PRODUCT_ID'"}}' \
  --region ap-south-1
```

- [ ] Item retrieved
- [ ] All expected fields present
- [ ] Data types correct
- [ ] Timestamps valid

### Lambda Logs Verification (10 minutes)

```bash
# View recent logs
aws logs tail /aws/lambda/promodeAgro-ecommerce-api-prod-createProduct \
  --start-time 10m \
  --follow
```

- [ ] No ERROR messages
- [ ] Request logs visible
- [ ] Response logs visible
- [ ] Execution times reasonable

```bash
# Search for errors
aws logs grep "ERROR" \
  /aws/lambda/promodeAgro-ecommerce-api-prod-createProduct \
  --start-time 10m
```

- [ ] No errors found
- [ ] All requests successful

### Python CLI Integration Test (10 minutes)

```bash
# 1. Ensure AWS credentials
export AWS_ACCESS_KEY_ID=<your-key>
export AWS_SECRET_ACCESS_KEY=<your-secret>
export AWS_DEFAULT_REGION=ap-south-1

# 2. Ensure LocalStack endpoint is empty
export DYNAMODB_ENDPOINT=""

# 3. Run CLI
python3 python-scripts/products_cli.py
```

- [ ] CLI connects successfully
- [ ] Can list products (includes API-created products)
- [ ] Can create products
- [ ] No connection errors
- [ ] Data format correct

### Performance Check (5 minutes)

```bash
# Test response times
time curl -X GET "$ENDPOINT/product" > /dev/null

# Should be < 2 seconds for typical request
```

- [ ] Response time acceptable (< 2 sec)
- [ ] No timeouts
- [ ] Consistent performance

### IAM & Security (5 minutes)

```bash
# Verify Lambda role
aws iam get-role-policy \
  --role-name promodeAgro-ecommerce-api-prod-ap-south-1-lambdaRole \
  --policy-name promodeAgro-ecommerce-api-prod-policy
```

- [ ] Role exists
- [ ] DynamoDB permissions present
- [ ] Correct resources specified

---

## Post-Deployment Monitoring (First 24 hours)

### Hourly Checks (Next 4 hours)

```bash
# Check Lambda error rate
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --start-time <1-hour-ago> \
  --end-time <now> \
  --period 300 \
  --statistics Sum
```

- [ ] Error count near 0
- [ ] No unusual spikes

```bash
# Check Lambda duration
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --start-time <1-hour-ago> \
  --end-time <now> \
  --period 300 \
  --statistics Average,Maximum
```

- [ ] Average < 500ms
- [ ] Maximum < 5000ms

### Daily Checks (Next 7 days)

- [ ] Run integration tests
- [ ] Check error logs
- [ ] Monitor API latency
- [ ] Verify data integrity
- [ ] Check DynamoDB usage

---

## Rollback Procedure (If needed)

```bash
# 1. Check previous version
aws cloudformation describe-stack-resources \
  --stack-name promodeAgro-ecommerce-api-prod \
  --region ap-south-1

# 2. Update with previous configuration
serverless deploy --stage prod --force

# 3. If needed, restore from backup
# Contact DevOps team for database restore
```

---

## Sign-Off

- [ ] All tests passed
- [ ] API responsive
- [ ] DynamoDB accessible
- [ ] Python CLI compatible
- [ ] Logs clean (no errors)
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation updated

**Deployment Status:** ✅ **SUCCESS**

**Deployed By:** ________________

**Date & Time:** ________________

**Verification Completed By:** ________________

---

## Troubleshooting Quick Links

| Issue | Command |
|-------|---------|
| View deployment logs | `serverless logs -f <function>` |
| Check stack status | `aws cloudformation describe-stacks` |
| View DynamoDB items | `aws dynamodb scan --table-name Products` |
| Check IAM role | `aws iam get-role-policy --role-name <role>` |
| Monitor Lambda | `aws cloudwatch get-metric-statistics` |
| Check API status | `curl $ENDPOINT/product` |
| View recent errors | `aws logs tail /aws/lambda/...` |

---

**Last Updated:** November 15, 2025

