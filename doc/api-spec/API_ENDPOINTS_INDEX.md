# ProMode Agro E-Commerce API - Complete Endpoints Index

**Total Endpoints: 100+**  
**Last Updated: January 2024**  
**API Version: 1.0.0**

---

## 📋 Complete Endpoints List by Category

### 🛍️ PRODUCTS (15 endpoints)

#### Core CRUD
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/product` | `products/getAllProducts` | Get all products with pagination |
| 2 | POST | `/product` | `products/createProduct` | Create new product |
| 3 | PUT | `/product` | `products/updateProduct` | Update existing product |
| 4 | DELETE | `/product` | `products/deleteProduct` | Delete product |
| 5 | GET | `/product/{id}` | `products/getProductById` | Get specific product by ID |

#### Search & Filter
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 6 | GET | `/products` | `products/searchApi` | Search products with filters |
| 7 | GET | `/products/search` | `products/globalSearch` | Global search across all fields |
| 8 | GET | `/productByGroupId` | `products/getProductByGroupId` | Filter by group ID |
| 9 | GET | `/getProductByCategory` | `products/getProductsByCategory` | Get by category |
| 10 | GET | `/getProductBySubCategory` | `products/getProductsBySubCategory` | Get by subcategory |

#### Display & Featured
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 11 | GET | `/getProduct` | `products/demoProducts` | Get demo category products |
| 12 | GET | `/homePageProducts` | `products/homePageProducts` | Homepage featured products |
| 13 | GET | `/homePageProductsDemo` | `products/demoHomeProducts` | Demo homepage products |
| 14 | PUT | `/updatePriceByQty` | `products/updatePriceByQuantity` | Update price based on quantity |
| 15 | GET | `/getproducts` | `products/searchApi` | Alternate products endpoint |

---

### 📦 ORDERS (8 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/order` | `order/getAllOrders` | Get all orders (paginated) |
| 2 | POST | `/order` | `order/createorder` | Create new order |
| 3 | GET | `/order/{userId}` | `order/getOrderByUserId` | Get user's orders |
| 4 | GET | `/getOrderById/{id}` | `order/getOrderById` | Get specific order details |
| 5 | PUT | `/updateOrder/{id}` | `order/updateOrder` | Update order details |
| 6 | PUT | `/updateOrderStatus` | `order/updateOrderStatus` | Update order status |
| 7 | DELETE | `/deleteOrderById/{id}` | `order/deleteOrderById` | Delete order |
| 8 | POST | `/cancelOrderRequest` | `order/cancelOrderRequest` | Request order cancellation |

---

### 🛒 CART (7 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/cart/addItem` | `cart/addItemsInCart` | Add single item to cart |
| 2 | POST | `/cart/addListOfItems` | `cart/addListItemsInCart` | Add multiple items at once |
| 3 | GET | `/cart/getItems` | `cart/getItemsInCart` | Get all cart items |
| 4 | PUT | `/cart/updateItem` | `cart/updateItemsInCart` | Update item quantity |
| 5 | PUT | `/cart/updateListOfItems` | `cart/updateListOfItemsInCart` | Update multiple items |
| 6 | DELETE | `/cart/deleteItem` | `cart/deleteItemsInCart` | Remove item from cart |
| 7 | DELETE | `/cart/remnoveAll/{userId}` | `cart/removeAllItemsInCart` | Clear entire cart |

---

### 📊 INVENTORY (5 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/inventory` | `inventory/getAllInventory` | Get all inventory items |
| 2 | POST | `/inventory` | `inventory/createInventory` | Create inventory record |
| 3 | GET | `/inventory/{id}` | `inventory/getInventoryById` | Get specific inventory item |
| 4 | PUT | `/inventory/{id}` | `inventory/updateInventory` | Update inventory quantity |
| 5 | DELETE | `/inventory/{id}` | `inventory/deleteInventoryById` | Delete inventory record |

---

### 👥 CUSTOMERS (6 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/customer` | `Customer/getAllCustomer` | Get all customers |
| 2 | POST | `/customer` | `Customer/createCustomer` | Create new customer |
| 3 | GET | `/customer/{customerId}` | `Customer/getCustomerById` | Get customer by ID |
| 4 | PUT | `/customer/{customerId}` | `Customer/updateCustomer` | Update customer details |
| 5 | DELETE | `/customer/{customerId}` | `Customer/deleteCustomerById` | Delete customer |
| 6 | GET | `/getCustomerByPhone/{phoneNumber}` | `Customer/getCustomerByPhone` | Get customer by phone |

---

### 👤 USERS & AUTHENTICATION (23 endpoints)

#### User Management
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/getAllUsers` | `Users/getAllUsers` | Get all users |
| 2 | GET | `/getByUserName` | `Users/getByUserName` | Get user by username |
| 3 | GET | `/getAllUsersEmail` | `Users/getAllUsersEmail` | Get users with emails |
| 4 | GET | `/get-users-by-role-in-group` | `Users/getUserByRole` | Get users by role/group |

#### Address Management
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 5 | POST | `/addAddress` | `Users/createAddress` | Add user address |
| 6 | PUT | `/updateAddress` | `Users/updateAddress` | Update address |
| 7 | GET | `/getAllAddress/{userId}` | `Users/getAllAddress` | Get all user addresses |
| 8 | GET | `/getDefaultAddress/{userId}` | `Users/getDefaultAddress` | Get default address |
| 9 | POST | `/setDefaultAddress` | `Users/setDefaultAddress` | Set default address |
| 10 | DELETE | `/deleteAddress` | `Users/deleteAddress` | Delete address |

#### Profile Management
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 11 | PUT | `/updatePersnalDetail` | `Users/updateUserProfile` | Update personal details |
| 12 | GET | `/getPersnalDetails` | `Users/getPersonalDetails` | Get personal details |
| 13 | DELETE | `/deleteUser/{userId}` | `Users/deleteUser` | Delete user account |
| 14 | POST | `/createUserAndAddress` | `Users/createUserAndAddress` | Create user with address |
| 15 | GET | `/getUserByNumber` | `Users/getUserByPhoneNumber` | Get user by phone |

#### Authentication
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 16 | POST | `/signup` | `Users/signup` | User registration |
| 17 | POST | `/login` | `Users/login` | User login |
| 18 | POST | `/changePassword` | `Users/changeUserPassword` | Change password |
| 19 | POST | `/forgetPassword` | `Users/forgetPassword` | Password reset |
| 20 | POST | `/signupwithmno` | `loginwithotp/signup` | Signup with phone |
| 21 | POST | `/signinwithotp` | `loginwithotp/signin` | Signin with OTP |
| 22 | POST | `/generateotp` | `loginwithotp/otp` | Generate OTP |
| 23 | POST | `/verify` | `loginwithotp/verify` | Verify OTP |

#### OTP Authentication
| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 24 | POST | `/login/validate-otp` | `Users/validate-otp` | Validate OTP for login |

---

### 💳 PAYMENT (5 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/createRazorPayPaymentOrder` | `payment/createPaymentOrder` | Create Razorpay payment order |
| 2 | POST | `/createPaymentLink` | `payment/createPaymentLink` | Create payment checkout link |
| 3 | POST | `/razorpayWebhook` | `payment/razorpayWebhook` | Razorpay webhook receiver |
| 4 | POST | `/cashFreeWebhook` | `payment/cashFreeWebhook` | Cashfree webhook receiver |
| 5 | POST | `/phonepayWebhook` | `payment/phonepayWebhook` | PhonePay webhook receiver |

---

### 🚚 DELIVERY & SLOTS (5 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/deliverySlot` | `deliverySlots/createDeliverySlots` | Create delivery time slot |
| 2 | GET | `/getAvailableDeliverySlots` | `deliverySlots/getAllAvailableDeliverySlots` | Get available slots |
| 3 | GET | `/slots` | `deliverySlots/getAllSlots` | Get all delivery slots |
| 4 | GET | `/slots/{pincode}` | `deliverySlots/getSlotsByPincode` | Get slots by pincode |
| 5 | GET | `/slot/{pincode}` | `deliverySlots/pincode` | Get slot by pincode (alt) |

---

### 🏷️ CATEGORIES (3 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/category` | `category/getAllCategory` | Get all categories |
| 2 | POST | `/category` | `category/createCategory` | Create new category |
| 3 | GET | `/getAllCategories` | `category/getCategories` | Get categories (alternate) |

---

### ❤️ WISHLIST & SAVE (4 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/addProductInWishList` | `wishlist/addProductInWishList` | Add product to wishlist |
| 2 | DELETE | `/removeProductInWishList` | `wishlist/removeProductInWishlist` | Remove from wishlist |
| 3 | GET | `/getUserWishList` | `wishlist/getUserProductWishList` | Get user's wishlist |
| 4 | POST | `/SaveForLater` | `saveForLater/addProductSaveForLater` | Save product for later |

---

### ⭐ REVIEWS (2 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/addProductReview` | `reviews/createReviews` | Submit product review |
| 2 | GET | `/getProductReview/{productId}` | `reviews/getReviews` | Get product reviews |

---

### 🎁 OFFERS (5 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/createOffer` | `offers/createOffers` | Create promotional offer |
| 2 | PUT | `/updateOffer/{offerId}` | `offers/updateOffers` | Update offer details |
| 3 | GET | `/getAllOffers` | `offers/getAllOffers` | Get all offers |
| 4 | GET | `/getOffers` | `offers/getOffers` | Get active offers |
| 5 | GET | `/getOffersProductsByOffersId/{offerId}` | `offers/getOffersProductsByOfferId` | Get offer products |

---

### 📈 SALES ANALYTICS (4 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/addSales` | `sales/createSales` | Record sales transaction |
| 2 | GET | `/getTopSellingProducts` | `sales/getTopSellingProducts` | Get best-selling products |
| 3 | GET | `/getTopSellingCategories` | `sales/getTopSellingCategoryProducts` | Get top categories |
| 4 | GET | `/getTopSelngSubcategoryProducts` | `sales/getTopSelngSubcategoryProducts` | Get top subcategories |

---

### 📄 BILLS & INVOICES (2 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST | `/sendBills` | `OrderBills/shareBillsOnWhatsaap` | Send bill via WhatsApp |
| 2 | POST | `/generate-bill` | `OrderBills/generateBill` | Generate invoice |

---

### 🔗 WEBHOOKS (1 endpoint)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | POST/GET/PUT/DELETE | `/webhook` | `webhooks/webhook` | Generic webhook handler (ANY method) |

---

### 🛠️ UTILITIES (7 endpoints)

| # | Method | Endpoint | Handler | Description |
|---|--------|----------|---------|-------------|
| 1 | GET | `/demo` | `products/demo` | Demo/test endpoint |
| 2 | GET | `/getSecrets` | `products/getSecrets` | Get system secrets (admin) |
| 3 | POST | `/groupsDynamic` | `RBAC/groupsDynamic` | Manage dynamic user groups |
| 4 | POST | `/saveSession` | `userSession/saveSession` | Save user session data |
| 5 | POST | `/createFeedback` | `Users/createFeedback` | Submit user feedback |
| 6 | POST | `/createUserInWhatsaapCommerce` | `whatsaapNotifications/createUser` | Create WhatsApp user |
| 7 | GET | `/getAllInventory` | `inventory/getAllInventory` | Get all inventory (alt) |

---

## 📊 Module Breakdown

```
Total Endpoints: 100+

By Module:
├── Products             15 endpoints (15%)
├── Users/Auth          24 endpoints (24%)
├── Orders               8 endpoints (8%)
├── Cart                 7 endpoints (7%)
├── Inventory            5 endpoints (5%)
├── Customers            6 endpoints (6%)
├── Payment              5 endpoints (5%)
├── Delivery             5 endpoints (5%)
├── Categories           3 endpoints (3%)
├── Wishlist             4 endpoints (4%)
├── Reviews              2 endpoints (2%)
├── Offers               5 endpoints (5%)
├── Sales                4 endpoints (4%)
├── Bills                2 endpoints (2%)
├── Webhooks             1 endpoint  (1%)
└── Utilities            7 endpoints (7%)
```

---

## 🔐 Authentication Methods

### 1. **JWT Bearer Token**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Obtained from**: `/signup`, `/login`, `/login/validate-otp`

### 2. **API Key**
```bash
X-API-Key: sk_live_xxxxxxxxxxxx
```

### 3. **OTP-Based**
```bash
POST /generateotp
POST /login/validate-otp
POST /verify
```

---

## 🚀 HTTP Methods Distribution

| Method | Count | Examples |
|--------|-------|----------|
| GET | ~45 | List, retrieve, search endpoints |
| POST | ~30 | Create, submit, generate endpoints |
| PUT | ~20 | Update, modify endpoints |
| DELETE | ~5 | Delete, remove endpoints |
| ANY | 1 | Webhook endpoint |

---

## 📝 Response Status Codes

| Code | Usage | Examples |
|------|-------|----------|
| 200 | Success | GET requests, successful updates |
| 201 | Created | POST requests creating resources |
| 204 | No Content | DELETE requests |
| 400 | Bad Request | Validation errors, invalid data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal errors |
| 503 | Unavailable | Service temporarily down |

---

## 🔄 Request/Response Examples

### Example 1: Get All Products
```bash
GET /product?page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "prod_123",
    "name": "Organic Tomatoes",
    "price": 50,
    "inStock": true
  }
]
```

### Example 2: Create Order
```bash
POST /order
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_123",
  "items": [{"productId": "prod_123", "quantity": 2}],
  "addressId": "addr_1",
  "deliverySlotId": "slot_1",
  "paymentMethod": "upi"
}

Response: 201 Created
{
  "id": "order_456",
  "status": "pending",
  "totalAmount": 100
}
```

### Example 3: Login
```bash
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_123",
  "username": "username"
}
```

---

## 🎯 Common Workflows

### 1. **User Onboarding**
1. POST `/signup` - Create account
2. POST `/addAddress` - Add delivery address
3. GET `/getAllAddress/{userId}` - Verify addresses
4. POST `/setDefaultAddress` - Set default

### 2. **Product Purchase**
1. GET `/products` - Browse products
2. POST `/cart/addItem` - Add to cart
3. GET `/getAvailableDeliverySlots` - Check delivery
4. POST `/order` - Create order
5. POST `/createPaymentLink` - Get payment link

### 3. **Order Management**
1. POST `/order` - Create order
2. GET `/getOrderById/{id}` - Check status
3. PUT `/updateOrderStatus` - Update status
4. POST `/sendBills` - Send confirmation

### 4. **Inventory Control**
1. POST `/inventory` - Add stock
2. GET `/getAllInventory` - View inventory
3. PUT `/inventory/{id}` - Update quantities
4. DELETE `/inventory/{id}` - Remove items

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `openapi-3.1.0.yaml` | Machine-readable OpenAPI specification |
| `API_DOCUMENTATION.md` | Detailed human-readable documentation |
| `README.md` | Navigation and quick reference |
| `API_ENDPOINTS_INDEX.md` | This file - complete endpoints list |

---

## 🔗 External Resources

- **Swagger Editor**: https://editor.swagger.io/
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **GitHub Repository**: https://github.com/promodeagro/promodeagro-ecommerce-api

---

## 📞 Support

- **Email**: support@promodeagro.com
- **GitHub Issues**: https://github.com/promodeagro/promodeagro-ecommerce-api/issues
- **Documentation**: See `API_DOCUMENTATION.md`

---

**Generated**: January 2024  
**API Version**: 1.0.0  
**Status**: Production Ready

