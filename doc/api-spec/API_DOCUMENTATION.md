# ProMode Agro E-Commerce API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [API Endpoints Summary](#api-endpoints-summary)
5. [Detailed Endpoint Reference](#detailed-endpoint-reference)
6. [Error Handling](#error-handling)
7. [Request/Response Examples](#requestresponse-examples)

---

## Overview

ProMode Agro E-Commerce API is a comprehensive REST API for managing an agricultural e-commerce platform. It provides functionality for:

- **Product Management**: Create, read, update, delete products with variants
- **Order Management**: Complete order lifecycle from creation to delivery
- **Inventory Tracking**: Real-time inventory management
- **Customer Management**: User profiles and address management
- **Payment Processing**: Integration with Razorpay, Cashfree, PhonePay
- **Delivery Management**: Delivery slots and pincode-based delivery
- **Shopping Features**: Cart, wishlist, reviews, offers
- **Sales Analytics**: Top-selling products and categories
- **User Authentication**: Email/password and OTP-based authentication

**API Version**: 1.0.0  
**Base URL**: `http://localhost:4000` (Development)  
**Production URL**: `https://api.promodeagro.com`

---

## Authentication

The API supports two authentication methods:

### 1. JWT Bearer Token
After login or signup, you'll receive a JWT token. Include it in all subsequent requests:

```bash
Authorization: Bearer <your_jwt_token>
```

### 2. API Key (Alternative)
Some endpoints may accept an API key in the header:

```bash
X-API-Key: <your_api_key>
```

### Session-based Auth (OTP)
For OTP-based login:
1. Call `/generateotp` with phone number
2. User receives OTP
3. Call `/login/validate-otp` with OTP to get token

---

## Base URL

```
Development:  http://localhost:4000
LocalStack:   http://localhost:4566
Production:   https://api.promodeagro.com
```

All API endpoints are relative to the base URL.

---

## API Endpoints Summary

### Product Management (15 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/product` | Get all products |
| POST | `/product` | Create a new product |
| PUT | `/product` | Update a product |
| DELETE | `/product` | Delete a product |
| GET | `/product/{id}` | Get product by ID |
| GET | `/products` | Search products |
| GET | `/products/search` | Global search |
| GET | `/productByGroupId` | Get by group ID |
| GET | `/getProductByCategory` | Get by category |
| GET | `/getProductBySubCategory` | Get by subcategory |
| GET | `/getProduct` | Demo products |
| GET | `/homePageProducts` | Homepage featured |
| GET | `/homePageProductsDemo` | Demo homepage |
| PUT | `/updatePriceByQty` | Update price by quantity |
| GET | `/getproducts` | Alternate endpoint |

### Order Management (7 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/order` | Get all orders |
| POST | `/order` | Create order |
| GET | `/order/{userId}` | Get user orders |
| GET | `/getOrderById/{id}` | Get order by ID |
| PUT | `/updateOrder/{id}` | Update order |
| PUT | `/updateOrderStatus` | Update status |
| DELETE | `/deleteOrderById/{id}` | Delete order |
| POST | `/cancelOrderRequest` | Cancel order |

### Cart Management (7 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/addItem` | Add single item |
| POST | `/cart/addListOfItems` | Add multiple items |
| GET | `/cart/getItems` | Get cart items |
| PUT | `/cart/updateItem` | Update item qty |
| PUT | `/cart/updateListOfItems` | Update multiple items |
| DELETE | `/cart/deleteItem` | Remove item |
| DELETE | `/cart/remnoveAll/{userId}` | Clear cart |

### Inventory Management (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Get all items |
| POST | `/inventory` | Create item |
| GET | `/inventory/{id}` | Get by ID |
| PUT | `/inventory/{id}` | Update item |
| DELETE | `/inventory/{id}` | Delete item |

### Customer Management (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer` | Get all customers |
| POST | `/customer` | Create customer |
| GET | `/customer/{customerId}` | Get by ID |
| PUT | `/customer/{customerId}` | Update customer |
| DELETE | `/customer/{customerId}` | Delete customer |
| GET | `/getCustomerByPhone/{phoneNumber}` | Get by phone |

### User Management (15 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/getAllUsers` | Get all users |
| GET | `/getByUserName` | Get by username |
| GET | `/getAllUsersEmail` | Get all with emails |
| GET | `/get-users-by-role-in-group` | Get by role/group |
| POST | `/addAddress` | Add address |
| PUT | `/updateAddress` | Update address |
| GET | `/getAllAddress/{userId}` | Get user addresses |
| GET | `/getDefaultAddress/{userId}` | Get default address |
| POST | `/setDefaultAddress` | Set default address |
| DELETE | `/deleteAddress` | Delete address |
| PUT | `/updatePersnalDetail` | Update personal info |
| GET | `/getPersnalDetails` | Get personal info |
| DELETE | `/deleteUser/{userId}` | Delete user |
| POST | `/createUserAndAddress` | Create user + address |
| GET | `/getUserByNumber` | Get by phone |

### Authentication (8 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Sign up |
| POST | `/login` | Login |
| POST | `/signupwithmno` | Signup with phone |
| POST | `/signinwithotp` | Signin with OTP |
| POST | `/generateotp` | Generate OTP |
| POST | `/verify` | Verify phone |
| POST | `/login/validate-otp` | Validate OTP |
| POST | `/changePassword` | Change password |

### Payment (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/createRazorPayPaymentOrder` | Create Razorpay order |
| POST | `/createPaymentLink` | Create payment link |
| POST | `/razorpayWebhook` | Razorpay webhook |
| POST | `/cashFreeWebhook` | Cashfree webhook |
| POST | `/phonepayWebhook` | PhonePay webhook |

### Delivery (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/deliverySlot` | Create slot |
| GET | `/getAvailableDeliverySlots` | Get available slots |
| GET | `/slots` | Get all slots |
| GET | `/slots/{pincode}` | Get slots by pincode |
| GET | `/slot/{pincode}` | Get slot (alternate) |

### Category Management (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/category` | Get categories |
| POST | `/category` | Create category |
| GET | `/getAllCategories` | Get all (alt) |

### Wishlist & Save (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/addProductInWishList` | Add to wishlist |
| DELETE | `/removeProductInWishList` | Remove from wishlist |
| GET | `/getUserWishList` | Get wishlist |
| POST | `/SaveForLater` | Save for later |

### Reviews (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/addProductReview` | Add review |
| GET | `/getProductReview/{productId}` | Get reviews |

### Offers (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/createOffer` | Create offer |
| PUT | `/updateOffer/{offerId}` | Update offer |
| GET | `/getAllOffers` | Get all offers |
| GET | `/getOffers` | Get active offers |
| GET | `/getOffersProductsByOffersId/{offerId}` | Get offer products |

### Sales Analytics (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/addSales` | Add sales record |
| GET | `/getTopSellingProducts` | Top products |
| GET | `/getTopSellingCategories` | Top categories |
| GET | `/getTopSelngSubcategoryProducts` | Top subcategory |

### Bills & Invoices (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sendBills` | Send bill via WhatsApp |
| POST | `/generate-bill` | Generate invoice |

### Utilities (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/demo` | Demo endpoint |
| GET | `/getSecrets` | Get secrets |
| POST | `/groupsDynamic` | Manage groups |
| POST | `/saveSession` | Save session |
| POST | `/createFeedback` | Submit feedback |

**Total: 100+ API Endpoints**

---

## Detailed Endpoint Reference

### Products

#### GET /product
Get all products with optional pagination

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Example Request:**
```bash
curl -X GET "http://localhost:4000/product?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "prod_123",
    "name": "Organic Tomatoes",
    "description": "Fresh organic tomatoes",
    "categoryId": "cat_1",
    "categoryName": "Vegetables",
    "basePrice": 50,
    "variants": [
      {
        "id": "var_1",
        "name": "1 KG",
        "quantity": 1,
        "unit": "kg",
        "price": 50,
        "stock": 100
      }
    ],
    "images": ["image1.jpg", "image2.jpg"],
    "rating": 4.5,
    "reviewCount": 12,
    "inStock": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
]
```

#### POST /product
Create a new product

**Request Body:**
```json
{
  "name": "Organic Tomatoes",
  "description": "Fresh organic tomatoes from the farm",
  "categoryId": "cat_1",
  "subCategoryId": "subcat_1",
  "basePrice": 50,
  "variants": [
    {
      "name": "1 KG",
      "quantity": 1,
      "unit": "kg",
      "price": 50,
      "stock": 100
    },
    {
      "name": "2 KG",
      "quantity": 2,
      "unit": "kg",
      "price": 90,
      "stock": 50
    }
  ],
  "images": ["image1.jpg"]
}
```

**Example Response (201):**
```json
{
  "id": "prod_123",
  "name": "Organic Tomatoes",
  "categoryId": "cat_1",
  "basePrice": 50,
  "variants": [
    {
      "id": "var_1",
      "name": "1 KG",
      "price": 50
    }
  ],
  "message": "Product created successfully"
}
```

#### GET /product/{id}
Get a specific product by ID

**Path Parameters:**
- `id` (string, required): Product ID

**Example Request:**
```bash
curl -X GET "http://localhost:4000/product/prod_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
{
  "id": "prod_123",
  "name": "Organic Tomatoes",
  "description": "Fresh organic tomatoes",
  "categoryId": "cat_1",
  "categoryName": "Vegetables",
  "basePrice": 50,
  "variants": [...],
  "images": [...],
  "rating": 4.5,
  "reviewCount": 12,
  "inStock": true
}
```

#### PUT /product
Update an existing product

**Request Body:**
```json
{
  "id": "prod_123",
  "name": "Organic Tomatoes - Updated",
  "description": "Fresh organic tomatoes from certified farms",
  "basePrice": 55,
  "variants": [
    {
      "id": "var_1",
      "name": "1 KG",
      "price": 55,
      "stock": 120
    }
  ]
}
```

**Example Response (200):**
```json
{
  "id": "prod_123",
  "name": "Organic Tomatoes - Updated",
  "message": "Product updated successfully"
}
```

#### DELETE /product
Delete a product

**Query Parameters:**
- `productId` (string, required): Product ID to delete

**Example Request:**
```bash
curl -X DELETE "http://localhost:4000/product?productId=prod_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (204):**
```
No content
```

### Orders

#### GET /order
Get all orders

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page

**Example Request:**
```bash
curl -X GET "http://localhost:4000/order?page=1" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "order_456",
    "userId": "user_123",
    "items": [
      {
        "productId": "prod_123",
        "productName": "Organic Tomatoes",
        "quantity": 2,
        "price": 50,
        "total": 100
      }
    ],
    "totalAmount": 110,
    "deliveryCharge": 10,
    "status": "pending",
    "address": {
      "id": "addr_1",
      "recipientName": "John Doe",
      "addressLine1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001"
    },
    "deliverySlot": {
      "date": "2024-01-22",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    "paymentMethod": "upi",
    "paymentStatus": "completed",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /order
Create a new order

**Request Body:**
```json
{
  "userId": "user_123",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 50
    },
    {
      "productId": "prod_124",
      "quantity": 1,
      "price": 30
    }
  ],
  "addressId": "addr_1",
  "deliverySlotId": "slot_1",
  "paymentMethod": "upi",
  "notes": "Please deliver carefully"
}
```

**Example Response (201):**
```json
{
  "id": "order_456",
  "userId": "user_123",
  "totalAmount": 130,
  "status": "pending",
  "paymentStatus": "pending",
  "message": "Order created successfully"
}
```

#### GET /order/{userId}
Get all orders for a specific user

**Path Parameters:**
- `userId` (string, required): User ID

**Example Request:**
```bash
curl -X GET "http://localhost:4000/order/user_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "order_456",
    "status": "pending",
    "totalAmount": 130,
    "items": [...],
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "order_457",
    "status": "delivered",
    "totalAmount": 250,
    "items": [...],
    "createdAt": "2024-01-14T15:20:00Z"
  }
]
```

#### PUT /updateOrderStatus
Update order status

**Request Body:**
```json
{
  "orderId": "order_456",
  "status": "shipped"
}
```

**Valid Status Values:**
- `pending` - Initial state
- `processing` - Being prepared
- `shipped` - In transit
- `delivered` - Delivered to customer
- `cancelled` - Order cancelled

**Example Response (200):**
```json
{
  "id": "order_456",
  "status": "shipped",
  "message": "Order status updated successfully"
}
```

### Cart

#### POST /cart/addItem
Add a single item to cart

**Request Body:**
```json
{
  "userId": "user_123",
  "productId": "prod_123",
  "variantId": "var_1",
  "quantity": 2,
  "price": 50
}
```

**Example Response (201):**
```json
{
  "message": "Item added to cart successfully",
  "cartCount": 3
}
```

#### GET /cart/getItems
Get all items in user's cart

**Query Parameters:**
- `userId` (string, required): User ID

**Example Request:**
```bash
curl -X GET "http://localhost:4000/cart/getItems?userId=user_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "userId": "user_123",
    "productId": "prod_123",
    "variantId": "var_1",
    "quantity": 2,
    "price": 50,
    "addedAt": "2024-01-20T10:30:00Z"
  },
  {
    "userId": "user_123",
    "productId": "prod_124",
    "variantId": "var_2",
    "quantity": 1,
    "price": 30,
    "addedAt": "2024-01-20T11:15:00Z"
  }
]
```

#### PUT /cart/updateItem
Update quantity of a cart item

**Request Body:**
```json
{
  "userId": "user_123",
  "productId": "prod_123",
  "quantity": 3,
  "price": 50
}
```

**Example Response (200):**
```json
{
  "message": "Cart item updated successfully"
}
```

#### DELETE /cart/deleteItem
Remove an item from cart

**Query Parameters:**
- `userId` (string, required): User ID
- `productId` (string, required): Product ID

**Example Request:**
```bash
curl -X DELETE "http://localhost:4000/cart/deleteItem?userId=user_123&productId=prod_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (204):**
```
No content
```

### Authentication

#### POST /signup
Create a new user account

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "9876543210",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Example Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_123",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "customer"
}
```

#### POST /login
Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Example Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_123",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "customer"
}
```

#### POST /generateotp
Generate OTP for phone number

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Example Response (200):**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

#### POST /login/validate-otp
Validate OTP for login

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Example Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_123",
  "username": "johndoe"
}
```

### Payment

#### POST /createRazorPayPaymentOrder
Create a Razorpay payment order

**Request Body:**
```json
{
  "orderId": "order_456",
  "amount": 1300,
  "currency": "INR"
}
```

**Example Response (201):**
```json
{
  "id": "razorpay_order_123",
  "amount": 1300,
  "currency": "INR",
  "orderId": "order_456",
  "key": "rzp_live_xxxx"
}
```

#### POST /createPaymentLink
Create a payment link for checkout

**Request Body:**
```json
{
  "orderId": "order_456",
  "amount": 1300,
  "customerEmail": "john@example.com",
  "customerPhone": "9876543210"
}
```

**Example Response (201):**
```json
{
  "paymentLink": "https://checkout.razorpay.com/l/1234xyz",
  "orderId": "order_456"
}
```

### Delivery

#### POST /deliverySlot
Create a delivery time slot

**Request Body:**
```json
{
  "pincode": "400001",
  "date": "2024-01-25",
  "startTime": "09:00",
  "endTime": "12:00",
  "capacity": 50
}
```

**Example Response (201):**
```json
{
  "id": "slot_123",
  "pincode": "400001",
  "date": "2024-01-25",
  "startTime": "09:00",
  "endTime": "12:00",
  "capacity": 50,
  "booked": 0,
  "isAvailable": true
}
```

#### GET /getAvailableDeliverySlots
Get available delivery slots

**Query Parameters:**
- `pincode` (string, optional): Filter by pincode
- `date` (string, optional): Filter by date (YYYY-MM-DD)

**Example Request:**
```bash
curl -X GET "http://localhost:4000/getAvailableDeliverySlots?pincode=400001&date=2024-01-25" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "slot_123",
    "pincode": "400001",
    "date": "2024-01-25",
    "startTime": "09:00",
    "endTime": "12:00",
    "capacity": 50,
    "booked": 15,
    "isAvailable": true
  },
  {
    "id": "slot_124",
    "pincode": "400001",
    "date": "2024-01-25",
    "startTime": "14:00",
    "endTime": "17:00",
    "capacity": 50,
    "booked": 48,
    "isAvailable": true
  }
]
```

### Wishlist

#### POST /addProductInWishList
Add product to wishlist

**Request Body:**
```json
{
  "userId": "user_123",
  "productId": "prod_123"
}
```

**Example Response (201):**
```json
{
  "message": "Product added to wishlist successfully"
}
```

#### GET /getUserWishList
Get user's wishlist

**Query Parameters:**
- `userId` (string, required): User ID

**Example Request:**
```bash
curl -X GET "http://localhost:4000/getUserWishList?userId=user_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "prod_123",
    "name": "Organic Tomatoes",
    "price": 50,
    "categoryName": "Vegetables"
  },
  {
    "id": "prod_124",
    "name": "Fresh Onions",
    "price": 30,
    "categoryName": "Vegetables"
  }
]
```

### Reviews

#### POST /addProductReview
Submit a product review

**Request Body:**
```json
{
  "productId": "prod_123",
  "userId": "user_123",
  "rating": 5,
  "title": "Excellent Quality",
  "comment": "Fresh and high quality tomatoes. Very satisfied with the purchase!"
}
```

**Example Response (201):**
```json
{
  "id": "review_789",
  "productId": "prod_123",
  "userId": "user_123",
  "rating": 5,
  "title": "Excellent Quality",
  "createdAt": "2024-01-20T15:30:00Z"
}
```

#### GET /getProductReview/{productId}
Get all reviews for a product

**Path Parameters:**
- `productId` (string, required): Product ID

**Example Request:**
```bash
curl -X GET "http://localhost:4000/getProductReview/prod_123" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "review_789",
    "productId": "prod_123",
    "userId": "user_123",
    "userName": "John Doe",
    "rating": 5,
    "title": "Excellent Quality",
    "comment": "Fresh and high quality tomatoes",
    "createdAt": "2024-01-20T15:30:00Z"
  }
]
```

### Offers

#### POST /createOffer
Create a promotional offer

**Request Body:**
```json
{
  "name": "Weekend Special",
  "description": "20% off on all vegetables",
  "discountPercentage": 20,
  "validFrom": "2024-01-20T00:00:00Z",
  "validTill": "2024-01-22T23:59:59Z",
  "applicableProducts": ["prod_123", "prod_124", "prod_125"]
}
```

**Example Response (201):**
```json
{
  "id": "offer_123",
  "name": "Weekend Special",
  "discountPercentage": 20,
  "isActive": true
}
```

#### GET /getOffers
Get all active offers

**Example Request:**
```bash
curl -X GET "http://localhost:4000/getOffers" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
[
  {
    "id": "offer_123",
    "name": "Weekend Special",
    "description": "20% off on all vegetables",
    "discountPercentage": 20,
    "validFrom": "2024-01-20T00:00:00Z",
    "validTill": "2024-01-22T23:59:59Z",
    "isActive": true
  }
]
```

---

## Error Handling

All error responses follow this format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "issue": "Specific issue description"
  },
  "timestamp": "2024-01-20T15:30:00Z"
}
```

### Common HTTP Status Codes

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Service temporarily down |

### Example Error Response

**Request:**
```bash
curl -X POST "http://localhost:4000/order" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123"
  }'
```

**Response (400):**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "items": "Items array is required",
    "addressId": "Delivery address is required",
    "deliverySlotId": "Delivery slot is required"
  },
  "timestamp": "2024-01-20T15:30:00Z"
}
```

---

## Request/Response Examples

### Complete Order Flow Example

#### 1. Sign Up
```bash
curl -X POST "http://localhost:4000/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
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
  "username": "johndoe",
  "role": "customer"
}
```

#### 2. Add Address
```bash
curl -X POST "http://localhost:4000/addAddress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "userId": "user_123",
    "type": "home",
    "recipientName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  }'
```

#### 3. Add Items to Cart
```bash
curl -X POST "http://localhost:4000/cart/addItem" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "user_123",
    "productId": "prod_123",
    "variantId": "var_1",
    "quantity": 2,
    "price": 50
  }'
```

#### 4. Get Available Delivery Slots
```bash
curl -X GET "http://localhost:4000/getAvailableDeliverySlots?pincode=400001" \
  -H "Authorization: Bearer <token>"
```

#### 5. Create Order
```bash
curl -X POST "http://localhost:4000/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
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
    "deliverySlotId": "slot_123",
    "paymentMethod": "upi"
  }'
```

#### 6. Create Payment Link
```bash
curl -X POST "http://localhost:4000/createPaymentLink" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "orderId": "order_456",
    "amount": 100,
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210"
  }'
```

#### 7. Submit Product Review
```bash
curl -X POST "http://localhost:4000/addProductReview" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "productId": "prod_123",
    "userId": "user_123",
    "rating": 5,
    "title": "Excellent Quality",
    "comment": "Fresh and high quality product!"
  }'
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit:** 1000 requests per hour per API key
- **Headers Returned:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

**Example Rate Limit Header:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1705779000
```

---

## Pagination

List endpoints support pagination using query parameters:

```bash
GET /product?page=2&limit=20
```

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Filtering & Search

Most list endpoints support filtering:

```bash
GET /product?category=vegetables&minPrice=20&maxPrice=100
GET /order?status=pending&date=2024-01-20
```

---

## Versioning

Current API version: **1.0.0**

Future versions will be available at:
- `/v2/product`
- `/v2/order`
- etc.

---

## Support & Resources

- **API Documentation**: See `openapi-3.1.0.yaml` for detailed OpenAPI spec
- **GitHub Repository**: https://github.com/promodeagro/promodeagro-ecommerce-api
- **Issue Tracker**: https://github.com/promodeagro/promodeagro-ecommerce-api/issues
- **Email Support**: support@promodeagro.com

---

**Last Updated:** January 2024  
**Document Version:** 1.0

