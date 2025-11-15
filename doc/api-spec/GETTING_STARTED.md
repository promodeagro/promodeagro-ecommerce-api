# Getting Started with ProMode Agro E-Commerce API

Welcome! This guide will help you get started with the ProMode Agro E-Commerce API.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Choose Your Documentation
Pick the best format for your needs:

```
📋 Start Here
│
├─ 📄 README.md (5 min read)
│  └─ Quick overview, tool setup, troubleshooting
│
├─ 📊 API_DOCUMENTATION.md (30 min read)
│  └─ Complete reference with examples
│
├─ 📑 API_ENDPOINTS_INDEX.md (15 min read)
│  └─ All endpoints organized by module
│
├─ 🔧 IMPLEMENTATION_SUMMARY.md (10 min read)
│  └─ Project overview & statistics
│
└─ 📝 openapi-3.1.0.yaml
   └─ Machine-readable specification
```

### Step 2: Import into Your Tool

#### Option A: Postman
```bash
1. Open Postman
2. Click "Import" (top left)
3. Select "openapi-3.1.0.yaml"
4. All endpoints automatically imported ✅
5. Set environment variables for testing
```

#### Option B: Insomnia
```bash
1. Open Insomnia
2. Go to Import → File
3. Choose "openapi-3.1.0.yaml"
4. Select workspace
5. Ready to test! ✅
```

#### Option C: Browser (Swagger UI)
```bash
Visit: https://editor.swagger.io/
Then: File → Import URL → Point to openapi-3.1.0.yaml
```

### Step 3: Make Your First Request

#### Using cURL
```bash
# Get products
curl -X GET "http://localhost:4000/product" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Using JavaScript
```javascript
const response = await fetch('http://localhost:4000/product', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
const products = await response.json();
console.log(products);
```

#### Using Python
```python
import requests

headers = {'Authorization': 'Bearer YOUR_TOKEN'}
response = requests.get('http://localhost:4000/product', headers=headers)
products = response.json()
print(products)
```

---

## 🔑 Authentication

### Getting a Token

#### Method 1: Email/Password
```bash
curl -X POST "http://localhost:4000/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myuser",
    "email": "me@example.com",
    "password": "SecurePass@123",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_123",
  "username": "myuser"
}
```

#### Method 2: OTP
```bash
# Step 1: Request OTP
curl -X POST "http://localhost:4000/generateotp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Step 2: Validate OTP
curl -X POST "http://localhost:4000/login/validate-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'
```

#### Method 3: Login
```bash
curl -X POST "http://localhost:4000/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "me@example.com",
    "password": "SecurePass@123"
  }'
```

### Using the Token

Add the token to every request:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 Common Tasks

### Task 1: Get All Products
```bash
curl -X GET "http://localhost:4000/product?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "prod_123",
    "name": "Organic Tomatoes",
    "basePrice": 50,
    "inStock": true,
    "variants": [...]
  }
]
```

### Task 2: Create an Order
```bash
curl -X POST "http://localhost:4000/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user_123",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 2,
        "price": 50
      }
    ],
    "addressId": "addr_1",
    "deliverySlotId": "slot_1",
    "paymentMethod": "upi"
  }'
```

### Task 3: Track Order
```bash
curl -X GET "http://localhost:4000/getOrderById/order_456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Task 4: Add to Cart
```bash
curl -X POST "http://localhost:4000/cart/addItem" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user_123",
    "productId": "prod_123",
    "quantity": 2,
    "price": 50
  }'
```

### Task 5: Get Delivery Slots
```bash
curl -X GET "http://localhost:4000/getAvailableDeliverySlots?pincode=400001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ Tool Setup

### Postman Setup

1. **Import Collection**
   ```
   Click Import → Select openapi-3.1.0.yaml
   ```

2. **Create Environment**
   ```
   New Environment → Add variables:
   - base_url: http://localhost:4000
   - token: YOUR_JWT_TOKEN
   ```

3. **Use Variables**
   ```
   URL: {{base_url}}/product
   Header: Authorization: Bearer {{token}}
   ```

### Insomnia Setup

1. **Import Collection**
   ```
   File → Import → openapi-3.1.0.yaml
   ```

2. **Create Workspace**
   ```
   Set environment variables
   ```

3. **Test Requests**
   ```
   Click Send on any request
   ```

### Docker & Swagger UI

```bash
docker run -p 8080:8080 \
  -v $(pwd)/openapi-3.1.0.yaml:/spec.yaml \
  -e SWAGGER_JSON=/spec.yaml \
  swaggerapi/swagger-ui
```

Then visit: http://localhost:8080

---

## 📖 Complete Workflows

### Workflow: Complete Purchase

```
1️⃣  Register User
    POST /signup
    ↓
2️⃣  Add Address
    POST /addAddress
    ↓
3️⃣  Browse Products
    GET /products
    ↓
4️⃣  Add to Cart
    POST /cart/addItem
    ↓
5️⃣  Check Delivery Options
    GET /getAvailableDeliverySlots
    ↓
6️⃣  Create Order
    POST /order
    ↓
7️⃣  Make Payment
    POST /createPaymentLink
    ↓
8️⃣  Confirm Payment
    POST /razorpayWebhook
    ↓
9️⃣  Send Bill
    POST /sendBills
    ↓
🔟  Track Order
    GET /order/{userId}
```

### Example: Step by Step

```bash
# 1. Register
TOKEN=$(curl -s -X POST "http://localhost:4000/signup" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.token')

# 2. Add address
curl -X POST "http://localhost:4000/addAddress" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{...}'

# 3. Get products
curl -X GET "http://localhost:4000/products?q=tomato" \
  -H "Authorization: Bearer $TOKEN"

# 4. Create order
ORDER=$(curl -s -X POST "http://localhost:4000/order" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{...}' | jq -r '.id')

# 5. Get payment link
curl -X POST "http://localhost:4000/createPaymentLink" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"orderId\": \"$ORDER\", ...}"
```

---

## ⚠️ Common Issues & Solutions

### Issue: 401 Unauthorized

**Problem:**
```
Error: "status": 401, "message": "Unauthorized"
```

**Solutions:**
1. Check if you have a valid token
2. Token may have expired (typically 24 hours)
3. Include `Authorization: Bearer <token>` header
4. Try logging in again

### Issue: 404 Not Found

**Problem:**
```
Error: "status": 404, "message": "Not Found"
```

**Solutions:**
1. Verify endpoint path is correct
2. Check if resource ID exists
3. Verify HTTP method (GET vs POST, etc.)
4. Check base URL

### Issue: 400 Bad Request

**Problem:**
```
Error: "status": 400, "code": "VALIDATION_ERROR"
```

**Solutions:**
1. Check all required fields are provided
2. Verify data types match schema
3. Validate JSON syntax
4. Check field values against allowed values

### Issue: 500 Server Error

**Problem:**
```
Error: "status": 500, "message": "Internal Server Error"
```

**Solutions:**
1. Check server is running
2. Verify database connectivity
3. Check LocalStack is running (if local)
4. Review server logs

---

## 📚 Documentation Map

```
📚 Documentation Structure
│
├─ 🟢 START HERE
│  ├─ GETTING_STARTED.md (you are here)
│  └─ README.md
│
├─ 📖 COMPREHENSIVE GUIDE
│  ├─ API_DOCUMENTATION.md (detailed reference)
│  └─ 50+ code examples
│
├─ 📊 REFERENCE
│  ├─ API_ENDPOINTS_INDEX.md (all endpoints)
│  ├─ IMPLEMENTATION_SUMMARY.md (overview)
│  └─ openapi-3.1.0.yaml (machine-readable)
│
└─ 🔧 TOOLS & INTEGRATION
   ├─ Postman collection
   ├─ Insomnia import
   ├─ Swagger UI
   └─ SDK generation
```

---

## 🎯 Next Steps

### For Beginners
1. ✅ Read this guide (you're doing it!)
2. ✅ Import `openapi-3.1.0.yaml` into Postman
3. ✅ Try the signup endpoint
4. ✅ Browse products
5. ✅ Review `API_DOCUMENTATION.md` for examples

### For Developers
1. ✅ Review `API_ENDPOINTS_INDEX.md`
2. ✅ Check handler files for implementation
3. ✅ Implement complete workflows
4. ✅ Follow error handling patterns
5. ✅ Test all endpoints

### For DevOps
1. ✅ Review `IMPLEMENTATION_SUMMARY.md`
2. ✅ Set up monitoring
3. ✅ Configure rate limiting
4. ✅ Set up authentication
5. ✅ Deploy to production

---

## 🔗 External Resources

### Online Tools
- **Swagger Editor**: https://editor.swagger.io/
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **Thunder Client**: https://www.thunderclient.com/

### Learning
- **REST API Guide**: https://restfulapi.net/
- **OpenAPI Spec**: https://spec.openapis.org/
- **HTTP Status Codes**: https://httpwg.org/specs/

### Community
- **GitHub**: https://github.com/promodeagro/promodeagro-ecommerce-api
- **Issues**: Report problems or ask questions
- **Discussions**: Community discussions

---

## 📞 Need Help?

### Quick Help
- Check `README.md` troubleshooting section
- Review examples in `API_DOCUMENTATION.md`
- Look up endpoint in `API_ENDPOINTS_INDEX.md`

### Detailed Help
- Review full documentation: `API_DOCUMENTATION.md`
- Check project summary: `IMPLEMENTATION_SUMMARY.md`
- Open specification: `openapi-3.1.0.yaml`

### Report Issues
- GitHub Issues: https://github.com/promodeagro/promodeagro-ecommerce-api/issues
- Email: support@promodeagro.com

---

## ✅ Checklist: You're Ready!

- [ ] Chose documentation format
- [ ] Imported into tool (Postman/Insomnia)
- [ ] Got an authentication token
- [ ] Made first API call
- [ ] Tried a complete workflow
- [ ] Reviewed error handling
- [ ] Bookmarked key documentation files

---

## 🎓 Learning Path

### Level 1: Beginner (30 minutes)
- [ ] Read this guide
- [ ] Import into Postman
- [ ] Create user account
- [ ] Get products
- [ ] Try one workflow

### Level 2: Intermediate (2 hours)
- [ ] Read `API_DOCUMENTATION.md`
- [ ] Try all major endpoints
- [ ] Implement authentication
- [ ] Complete purchase workflow
- [ ] Handle errors

### Level 3: Advanced (4 hours)
- [ ] Review `openapi-3.1.0.yaml`
- [ ] Study all schemas
- [ ] Implement all workflows
- [ ] Set up webhooks
- [ ] Create custom integrations

---

## 🚀 Ready to Build?

### Sample Project: Simple Product Browser

```python
#!/usr/bin/env python3
import requests

# Configuration
BASE_URL = "http://localhost:4000"
TOKEN = "your_jwt_token_here"

# Headers
headers = {"Authorization": f"Bearer {TOKEN}"}

# Get all products
response = requests.get(f"{BASE_URL}/product", headers=headers)
products = response.json()

# Display products
for product in products:
    print(f"- {product['name']}: ${product['basePrice']}")

# Search for specific product
response = requests.get(
    f"{BASE_URL}/products/search",
    params={"query": "tomato"},
    headers=headers
)
results = response.json()
print(f"\nFound {len(results)} products matching 'tomato'")
```

### Sample Project: Order Creator

```javascript
// Complete order workflow
async function createOrder() {
  const base = "http://localhost:4000";
  const token = "your_jwt_token";
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Create order
  const order = await fetch(`${base}/order`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userId: "user_123",
      items: [{productId: "prod_123", quantity: 2, price: 50}],
      addressId: "addr_1",
      deliverySlotId: "slot_1",
      paymentMethod: "upi"
    })
  }).then(r => r.json());

  console.log("Order created:", order.id);

  // Get payment link
  const payment = await fetch(`${base}/createPaymentLink`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      orderId: order.id,
      amount: 100,
      customerEmail: "customer@example.com"
    })
  }).then(r => r.json());

  console.log("Payment link:", payment.paymentLink);
}

createOrder();
```

---

## 💡 Pro Tips

1. **Use Environment Variables**: Store token, base URL, IDs in Postman
2. **Save Common Requests**: Create Postman folders for workflows
3. **Test Locally First**: Test on http://localhost:4000 before production
4. **Check Status Codes**: Not just 200 - handle 400, 401, 404 too
5. **Use Request IDs**: Track requests for debugging
6. **Set Timeouts**: APIs may take time - set appropriate timeouts
7. **Batch Operations**: Use bulk endpoints for efficiency
8. **Monitor Rate Limits**: Check response headers for limits

---

## 🎉 You're All Set!

You now have everything you need to work with the ProMode Agro E-Commerce API:

✅ **Documentation**: 5 files covering everything  
✅ **Examples**: 50+ code examples in multiple languages  
✅ **Tools**: Ready for Postman, Insomnia, Swagger UI  
✅ **Support**: Error handling, troubleshooting, workflows  

**Start coding!** 🚀

---

**Next**: Pick a task from "Common Tasks" section above and start building!

---

Generated: January 20, 2024  
API Version: 1.0.0  
Last Updated: January 20, 2024

