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
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local test_num=$1
  local test_name=$2
  local method=$3
  local endpoint=$4
  local data=$5
  local expected_status=$6

  echo -e "${BLUE}Test ${test_num}: ${test_name}${NC}"
  echo -e "  ${YELLOW}${method} ${API_URL}${endpoint}${NC}"
  
  if [ -z "$data" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  
  if [[ "$HTTP_CODE" == "2"* ]]; then
    echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
    ((FAILED++))
  fi
  echo ""
}

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

# ============================================================================
# TEST 1: Get all products (should be empty initially)
# ============================================================================
test_endpoint 1 "Get all products (list)" "GET" "/product" "" "200"

# ============================================================================
# TEST 2: Create a product with all required fields
# ============================================================================
PRODUCT_PAYLOAD='{
  "name": "Organic Tomatoes",
  "mrp": 100,
  "savingsPercentage": 20,
  "about": "Fresh, juicy organic tomatoes from local farms",
  "images": ["iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
  "imageType": "image/png",
  "description": "High quality organic tomatoes, pesticide-free",
  "unit": "grams",
  "category": "vegetables",
  "subCategory": "tomatoes",
  "availability": true,
  "brand": "Fresh Farm",
  "currency": "INR",
  "ratings": 4.5
}'

test_endpoint 2 "Create a product" "POST" "/product" "$PRODUCT_PAYLOAD" "200"

# ============================================================================
# TEST 3: Get all products (should show created product)
# ============================================================================
test_endpoint 3 "Get all products (after creation)" "GET" "/product" "" "200"

# ============================================================================
# TEST 4: Get product by category
# ============================================================================
test_endpoint 4 "Get products by category" "GET" "/getProductByCategory?category=vegetables" "" "200"

# ============================================================================
# TEST 5: Create a user/customer
# ============================================================================
USER_PAYLOAD='{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+91-9876543210",
  "password": "Test@1234"
}'

test_endpoint 5 "Create a user" "POST" "/createUserAndAddress" "$USER_PAYLOAD" "200"

# ============================================================================
# TEST 6: Get all users
# ============================================================================
test_endpoint 6 "Get all users" "GET" "/getAllUsers" "" "200"

# ============================================================================
# TEST 7: Create a cart item
# ============================================================================
CART_PAYLOAD='{
  "UserId": "user-001",
  "ProductId": "prod-001",
  "Quantity": 2,
  "Price": 80
}'

test_endpoint 7 "Add item to cart" "POST" "/cart/addItem" "$CART_PAYLOAD" "200"

# ============================================================================
# TEST 8: Get cart items
# ============================================================================
test_endpoint 8 "Get cart items" "GET" "/cart/getItems?userId=user-001" "" "200"

# ============================================================================
# TEST 9: Create a category
# ============================================================================
CATEGORY_PAYLOAD='{
  "name": "Fresh Produce",
  "description": "Fresh vegetables and fruits",
  "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}'

test_endpoint 9 "Create a category" "POST" "/category" "$CATEGORY_PAYLOAD" "200"

# ============================================================================
# TEST 10: Get all categories
# ============================================================================
test_endpoint 10 "Get all categories" "GET" "/getAllCategories" "" "200"

# ============================================================================
# TEST 11: Create an order
# ============================================================================
ORDER_PAYLOAD='{
  "userId": "user-001",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "price": 160
    }
  ],
  "totalPrice": 160,
  "paymentMethod": "razorpay",
  "status": "pending",
  "shippingAddress": "123 Main St, City, State 12345"
}'

test_endpoint 11 "Create an order" "POST" "/order" "$ORDER_PAYLOAD" "200"

# ============================================================================
# TEST 12: Get all orders
# ============================================================================
test_endpoint 12 "Get all orders" "GET" "/order" "" "200"

# ============================================================================
# TEST 13: Search products
# ============================================================================
test_endpoint 13 "Search products" "GET" "/products/search?query=tomato" "" "200"

# ============================================================================
# TEST 14: Create a wishlist item
# ============================================================================
WISHLIST_PAYLOAD='{
  "UserId": "user-001",
  "ProductId": "prod-001"
}'

test_endpoint 14 "Add to wishlist" "POST" "/addProductInWishList" "$WISHLIST_PAYLOAD" "200"

# ============================================================================
# TEST 15: Get wishlist
# ============================================================================
test_endpoint 15 "Get wishlist" "GET" "/getUserWishList?userId=user-001" "" "200"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ API Tests Completed!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Results:${NC}"
echo -e "  ${GREEN}✓ Passed: $PASSED${NC}"
echo -e "  ${RED}✗ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! 🎉${NC}"
else
  echo -e "${YELLOW}Some tests failed. Check the output above for details.${NC}"
fi

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  • Check DynamoDB Admin for data:"
echo "    ${YELLOW}http://localhost:8001${NC}"
echo ""
echo "  • View API logs:"
echo "    ${YELLOW}Keep the terminal running bash scripts/start-api.sh open${NC}"
echo ""
echo "  • Test individual endpoints:"
echo "    ${YELLOW}curl http://localhost:4000/product${NC}"
echo ""
