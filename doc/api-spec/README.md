# ProMode Agro E-Commerce API Specification

## Overview

This directory contains comprehensive API documentation and specifications for the ProMode Agro E-Commerce platform. The API is built using AWS Lambda, API Gateway, and DynamoDB, providing a serverless, scalable solution for agricultural e-commerce operations.

## 📁 Files in This Directory

### 1. **openapi-3.1.0.yaml**
   - **Purpose**: Complete OpenAPI 3.1.0 specification of all API endpoints
   - **Coverage**: 100+ endpoints across 18 functional modules
   - **Format**: Machine-readable YAML for code generation and documentation
   - **Usage**: 
     - Import into Postman, Insomnia, or Swagger UI
     - Use for SDK code generation
     - Integrate with CI/CD pipelines for testing
   
   **How to Use:**
   ```bash
   # View in Swagger UI (online)
   https://editor.swagger.io/?url=https://your-domain/openapi-3.1.0.yaml
   
   # Or locally with docker
   docker run -p 8080:8080 \
     -e SWAGGER_JSON=/openapi-3.1.0.yaml \
     -v $(pwd)/openapi-3.1.0.yaml:/openapi-3.1.0.yaml \
     swaggerapi/swagger-ui
   ```

### 2. **API_DOCUMENTATION.md**
   - **Purpose**: Comprehensive human-readable API documentation
   - **Content**:
     - Complete endpoint summary table (100+ endpoints)
     - Detailed endpoint reference with examples
     - Request/response examples
     - Error handling guide
     - Authentication methods
     - Complete order flow walkthrough
   - **Usage**: Read as Markdown or convert to HTML/PDF

### 3. **README.md** (this file)
   - **Purpose**: Navigation guide and quick reference
   - **Content**: File descriptions, quick start, troubleshooting

---

## 🚀 Quick Start

### 1. View API Documentation
```bash
# View in your editor
cat API_DOCUMENTATION.md

# Or convert to HTML (requires pandoc)
pandoc API_DOCUMENTATION.md -o API_DOCUMENTATION.html
```

### 2. Import OpenAPI Spec into Postman

#### Option A: Direct Import
1. Open Postman
2. Click `Import` (top-left)
3. Select `File` tab
4. Choose `openapi-3.1.0.yaml`
5. All endpoints will be imported as a collection

#### Option B: Link Import
1. In Postman, go to `Import` → `Link`
2. Paste the URL to `openapi-3.1.0.yaml`
3. Click `Continue`

### 3. View in Swagger UI

#### Online (via Swagger Editor)
```
https://editor.swagger.io/?url=<direct_link_to_openapi-3.1.0.yaml>
```

#### Locally with Docker
```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON_URL=file:///openapi-3.1.0.yaml \
  -v $(pwd):/spec \
  swaggerapi/swagger-ui
```

#### Or use Swagger UI alternative tools:
- **Redoc**: https://redoc.ly/
- **API Elements**: https://apielements.com/
- **Stoplight Elements**: https://stoplight.io/

---

## 📊 API Endpoints Summary

### Total Endpoints: **100+**

| Module | Count | Examples |
|--------|-------|----------|
| Products | 15 | Create, Read, Update, Delete, Search, Filter by category |
| Orders | 8 | Create order, Track status, Update, Cancel |
| Cart | 7 | Add/update items, Get cart, Clear cart |
| Inventory | 5 | Track stock, Update quantities |
| Customers | 6 | CRUD operations, Search by phone |
| Users | 15 | Authentication, Address management, Profile |
| Payment | 5 | Razorpay, Cashfree, PhonePay integrations |
| Delivery | 5 | Manage slots, Filter by pincode |
| Categories | 3 | Create, read, update categories |
| Wishlist | 4 | Add/remove from wishlist, Save for later |
| Reviews | 2 | Create and retrieve product reviews |
| Offers | 5 | Create promotions, Get active offers |
| Sales | 4 | Sales analytics, Top-selling products |
| Bills | 2 | Generate invoices, Send via WhatsApp |
| Auth | 8 | Signup, Login, OTP verification |
| Webhooks | 1 | Generic webhook handler |
| Utilities | 5 | Demo endpoints, Feedback, Sessions |

---

## 🔐 Authentication

The API supports multiple authentication methods:

### 1. **JWT Bearer Token** (Recommended)
```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:4000/order
```

### 2. **API Key** (Alternative)
```bash
curl -H "X-API-Key: <your_api_key>" \
  http://localhost:4000/order
```

### 3. **OTP-based Authentication**
```bash
# Generate OTP
POST /generateotp
{ "phone": "9876543210" }

# Verify OTP
POST /login/validate-otp
{ "phone": "9876543210", "otp": "123456" }
```

---

## 🌐 Environment URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:4000` |
| LocalStack | `http://localhost:4566` |
| Production | `https://api.promodeagro.com` |

---

## 📝 Common Use Cases

### Use Case 1: Product Catalog Management
```
1. GET /product - List all products
2. POST /product - Add new product
3. PUT /product - Update product
4. GET /product/{id} - Get specific product
5. DELETE /product - Remove product
6. GET /products/search - Search products
```

### Use Case 2: Complete Order Flow
```
1. POST /signup - User registration
2. POST /addAddress - Add delivery address
3. POST /cart/addItem - Add products to cart
4. GET /getAvailableDeliverySlots - Check delivery options
5. POST /order - Create order
6. POST /createPaymentLink - Get payment link
7. POST /login/validate-otp - Confirm payment
8. POST /sendBills - Send order confirmation
```

### Use Case 3: Inventory Management
```
1. POST /inventory - Add inventory item
2. GET /getAllInventory - View all stock
3. PUT /inventory/{id} - Update quantities
4. GET /inventory/{id} - Check specific item stock
```

### Use Case 4: Customer Analytics
```
1. GET /getTopSellingProducts - Best sellers
2. GET /getTopSellingCategories - Popular categories
3. GET /getAllOrders - Sales tracking
4. GET /order/{userId} - Customer history
```

---

## 🔧 Testing & Integration

### Using cURL
```bash
# Get products
curl -X GET "http://localhost:4000/product" \
  -H "Authorization: Bearer <token>"

# Create order
curl -X POST "http://localhost:4000/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "user_123",
    "items": [...],
    "addressId": "addr_1",
    "deliverySlotId": "slot_1",
    "paymentMethod": "upi"
  }'
```

### Using Postman
1. Import `openapi-3.1.0.yaml`
2. Create environment with:
   - `base_url`: http://localhost:4000
   - `token`: Your JWT token
3. Use variables in requests: `{{base_url}}/product`, `Authorization: Bearer {{token}}`

### Using Insomnia
1. `Import` → `Insomnia` format
2. Or import OpenAPI directly
3. Create workspace with environment variables
4. Test requests with full history tracking

### Using Python
```python
import requests

# Setup
BASE_URL = "http://localhost:4000"
headers = {
    "Authorization": "Bearer <your_token>",
    "Content-Type": "application/json"
}

# Get products
response = requests.get(f"{BASE_URL}/product", headers=headers)
products = response.json()

# Create order
order_data = {
    "userId": "user_123",
    "items": [...],
    "addressId": "addr_1",
    "deliverySlotId": "slot_1",
    "paymentMethod": "upi"
}
response = requests.post(f"{BASE_URL}/order", json=order_data, headers=headers)
```

### Using JavaScript/Node.js
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const token = '<your_jwt_token>';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Get products
async function getProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/product`, { headers });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Create order
async function createOrder(orderData) {
  try {
    const response = await axios.post(`${BASE_URL}/order`, orderData, { headers });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {
    "field": "Field name with issue",
    "issue": "Specific problem"
  },
  "timestamp": "2024-01-20T15:30:00Z"
}
```

### Common Error Codes
| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |

---

## 📖 API Documentation Structure

### For Each Endpoint:
- **Path**: API route
- **Method**: HTTP method (GET, POST, PUT, DELETE)
- **Description**: What the endpoint does
- **Parameters**: Query/path parameters with types
- **Request Body**: Expected JSON structure
- **Response**: Success and error responses
- **Example**: cURL command with sample request/response

### Schema Definitions:
All request/response schemas defined in `components/schemas` including:
- Product, Order, Cart, Inventory, Customer, User
- Address, Category, DeliverySlot, Review, Offer
- And 15+ more data models

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized"
**Solution**: 
- Ensure you have a valid JWT token from `/signup` or `/login`
- Token may have expired (typically 24 hours)
- Include `Authorization: Bearer <token>` header

### Issue: "404 Not Found"
**Solution**:
- Verify endpoint path is correct
- Check if resource ID exists
- Verify HTTP method (GET vs POST, etc.)

### Issue: "400 Bad Request"
**Solution**:
- Validate request body matches schema
- Check all required fields are provided
- Ensure data types are correct (string, integer, etc.)
- Verify JSON syntax

### Issue: "500 Internal Server Error"
**Solution**:
- Check server logs: `logs/api.log`
- Verify database connectivity
- Check if dependent services are running (LocalStack, DynamoDB)
- Retry request

### Issue: "CORS Error" (when testing from browser)
**Solution**:
- This API runs serverless, CORS is configured in API Gateway
- For local testing, use Postman or terminal instead
- Production: CORS headers pre-configured

---

## 🚢 Deployment

### Local Testing
```bash
# Start LocalStack
docker-compose up localstack

# Deploy with Serverless Framework
serverless deploy

# Run tests
npm test
```

### Production Deployment
```bash
# Deploy to AWS
serverless deploy --stage prod

# View deployed endpoints
serverless info --stage prod
```

---

## 📚 Additional Resources

### API Specification Files
- **OpenAPI/Swagger**: `openapi-3.1.0.yaml`
- **Human Documentation**: `API_DOCUMENTATION.md`
- **Postman Collection**: (Can be generated from OpenAPI)

### External Tools & Services
- **Swagger Editor**: https://editor.swagger.io/
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **REST Client**: https://github.com/rest-client/rest-client
- **Thunder Client** (VS Code): https://www.thunderclient.com/

### Related Documentation
- **Backend Code**: See parent directory
- **Database Schema**: `doc/Business Document.md`, `doc/Ecommerce PRD.md`
- **LocalStack Setup**: `doc/localstack/`

---

## 📝 Versioning

**Current Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: January 2024

### Version History
- **1.0.0** (2024-01-20): Initial release with 100+ endpoints

---

## 👥 Support

| Channel | Contact |
|---------|---------|
| Email | support@promodeagro.com |
| GitHub Issues | https://github.com/promodeagro/promodeagro-ecommerce-api/issues |
| Documentation | See `API_DOCUMENTATION.md` |

---

## 📄 License

Proprietary - ProMode Agro Pvt. Ltd.

---

## 🎯 Next Steps

1. **For Developers**:
   - Import `openapi-3.1.0.yaml` into your API client
   - Start with read endpoints (GET requests)
   - Review error codes and handling
   - Implement complete order flow

2. **For Integration Partners**:
   - Generate SDKs from OpenAPI spec
   - Test webhooks integration
   - Review rate limiting policies
   - Set up payment gateway callbacks

3. **For DevOps/Infrastructure**:
   - Review deployment documentation
   - Configure monitoring and logging
   - Set up API rate limiting
   - Configure CORS and security headers

---

**Happy Coding! 🚀**

