#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        ProMode Agro - API Endpoint Testing Script          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000"

# Check if API is running
echo -e "${BLUE}Checking if API is running at ${API_URL}...${NC}"
if ! curl -s "$API_URL/product" > /dev/null 2>&1; then
  echo -e "${RED}✗ API is not running!${NC}"
  echo ""
  echo "Start the API with:"
  echo "  ${YELLOW}bash scripts/start-api.sh${NC}"
  exit 1
fi
echo -e "${GREEN}✓ API is running${NC}"
echo ""

# Test 1: Get all products
echo -e "${BLUE}Test 1: Get all products${NC}"
curl -s -X GET "$API_URL/product" | jq . 2>/dev/null || curl -s "$API_URL/product"
echo ""
echo ""

# Test 2: Create a product
echo -e "${BLUE}Test 2: Create a product${NC}"
PRODUCT=$(curl -s -X POST "$API_URL/product" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-001",
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "availability": true,
    "description": "Fresh organic tomatoes from farm"
  }')
echo "$PRODUCT" | jq . 2>/dev/null || echo "$PRODUCT"
echo ""
echo ""

# Test 3: Get product by ID
echo -e "${BLUE}Test 3: Get product by ID${NC}"
curl -s -X GET "$API_URL/product/prod-001" | jq . 2>/dev/null || curl -s "$API_URL/product/prod-001"
echo ""
echo ""

# Test 4: Get all products again (verify product was created)
echo -e "${BLUE}Test 4: Get all products (verify product was created)${NC}"
curl -s -X GET "$API_URL/product" | jq . 2>/dev/null || curl -s "$API_URL/product"
echo ""
echo ""

# Test 5: Update product
echo -e "${BLUE}Test 5: Update product${NC}"
curl -s -X PUT "$API_URL/product" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-001",
    "name": "Premium Organic Tomatoes",
    "category": "Vegetables",
    "price": 75,
    "availability": true
  }' | jq . 2>/dev/null || echo "Update request sent"
echo ""
echo ""

# Test 6: Create an order
echo -e "${BLUE}Test 6: Create an order${NC}"
ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "order-001",
    "userId": "user-001",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 5
      }
    ],
    "totalPrice": 375,
    "paymentMethod": "razorpay",
    "status": "pending",
    "address": "123 Main St, City, State 12345"
  }')
echo "$ORDER" | jq . 2>/dev/null || echo "$ORDER"
echo ""
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ API tests completed!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  • Check DynamoDB Admin for data:"
echo "    ${YELLOW}http://localhost:8001${NC}"
echo ""
echo "  • View API logs:"
echo "    ${YELLOW}Keep the terminal running bash scripts/start-api.sh open${NC}"
echo ""
echo "  • Test more endpoints:"
echo "    ${YELLOW}curl http://localhost:4000/product${NC}"
echo ""

