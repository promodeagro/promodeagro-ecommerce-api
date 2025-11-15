# ProMode Agro eCommerce API

A production-grade, serverless REST API for agricultural eCommerce platform. Built with **AWS Lambda**, **Serverless Framework**, and **DynamoDB**, providing comprehensive eCommerce functionality including product management, order processing, user authentication, payment gateway integration, and inventory tracking.

**Status:** Production (deployed on AWS ap-south-1)  
**Architecture:** Serverless (AWS Lambda + API Gateway + DynamoDB)  
**Runtime:** Node.js 18.x  
**Framework Version:** Serverless 3.x

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Module Documentation](#module-documentation)
9. [Local Development](#local-development)
10. [Deployment](#deployment)
11. [Technologies & Dependencies](#technologies--dependencies)
12. [Notes & Known Issues](#notes--known-issues)

---

## Project Overview

**ProMode Agro eCommerce API** is a complete backend solution for agricultural product eCommerce. It handles:

- 🛍️ **Product Catalog Management** - Create, read, update, delete products with advanced filtering and search
- 📦 **Order Processing** - Full order lifecycle management with status tracking and confirmation workflows
- 👥 **User Management** - Authentication, registration, address management, and role-based access
- 💳 **Multi-Gateway Payment Processing** - Razorpay, Cashfree, PhonePe integration with webhook support
- 📊 **Inventory Tracking** - Real-time stock management with automatic sync from orders
- 🛒 **Shopping Features** - Cart management, wishlist, save for later, reviews
- 📅 **Delivery Management** - Delivery slot scheduling
- 🎁 **Promotional Features** - Offers, discounts, and seasonal promotions
- 📈 **Sales Analytics** - Sales tracking and reporting

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS API Gateway (HTTP API)                 │
│                    (CORS enabled, all methods)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  JWT Authorizer │
                    │  (Users Module) │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼──────────┐ ┌──────▼─────────┐
│  Lambda        │  │  Lambda           │ │  Lambda        │
│  Functions     │  │  Functions        │ │  Functions     │
│  (Products)    │  │  (Orders)         │ │  (Payments)    │
└────────┬───────┘  └────────┬──────────┘ └──────┬─────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                ┌────────────▼──────────────┐
                │   AWS DynamoDB           │
                │   (Multiple Tables)      │
                └────────────┬─────────────┘
                             │
        ┌────────────────────┼────────────────────────┐
        │                    │                        │
   ┌────▼─────┐      ┌───────▼────────┐      ┌──────▼───────┐
   │  Algolia  │      │  AWS S3        │      │  AWS Secrets │
   │  (Search) │      │  (Images)      │      │  (Config)    │
   └──────────┘      └────────────────┘      └──────────────┘
```

### AWS Resources

- **Compute:** AWS Lambda (Node.js 18.x runtime)
- **API:** AWS HTTP API Gateway with custom JWT authorizer
- **Database:** AWS DynamoDB (multiple tables)
- **Storage:** AWS S3 (product images, documents)
- **Secrets:** AWS Secrets Manager (API keys, sensitive config)
- **Authentication:** JWT tokens + AWS Cognito user pool
- **Search:** Algolia (product search and filtering)
- **Region:** ap-south-1 (Asia Pacific - Mumbai)

---

## Features

### ✅ Core Features

- **RESTful API Design** - Standard HTTP methods (GET, POST, PUT, DELETE)
- **JWT Authentication** - Secure token-based authentication
- **OTP Verification** - Email/SMS-based OTP for user verification
- **Pagination** - Products and orders support pagination
- **Error Handling** - Comprehensive error responses
- **CORS Support** - Cross-origin requests enabled

### ✅ eCommerce Features

- **Product Management** - Full CRUD with filtering by category, price, availability
- **Advanced Search** - Algolia-powered global search with faceting
- **Inventory Management** - Real-time stock tracking and updates
- **Order Management** - Complete lifecycle (create, update, cancel, confirm)
- **Multi-Payment Gateway** - Razorpay, Cashfree, PhonePe
- **Payment Webhooks** - Handle payment status updates
- **Cart Operations** - Add, update, remove items; batch operations
- **Wishlist & Save for Later** - User favorites management
- **Product Reviews** - User ratings and comments
- **Delivery Slots** - Schedule deliveries
- **Order Bills** - Generate and send bills (PDF)

### ✅ Performance Features

- **Lambda Warmup** - Scheduled warmup every 5 minutes to prevent cold starts
- **Pagination** - Reduce memory load with paginated responses
- **Efficient Queries** - DynamoDB with query optimization

---

## Project Structure

```
promodeagro-ecommerce-api/
├── serverless.yml                    # Main Serverless configuration
├── package.json                      # Dependencies and scripts
├── handler.js                        # Template handler
├── README.md                         # This file
│
├── products/                         # Product Management Module
│   ├── function.yml                 # Lambda function definitions
│   ├── createProduct.js             # Create new product
│   ├── updateProduct.js             # Update existing product
│   ├── delete.js                    # Delete product
│   ├── getAllProducts.js            # Get all products with pagination
│   ├── getById.js                   # Get product by ID
│   ├── getProductByGroupId.js       # Get products by group
│   ├── getProductsByCategory.js     # Filter by category
│   ├── searchApi.js                 # Search products
│   ├── globalSearch.js              # Algolia global search
│   ├── updateInAlgolia.js           # Sync to Algolia
│   └── ... (14+ files)
│
├── order/                           # Order Management Module
│   ├── function.yml
│   ├── createorder.js               # Create new order
│   ├── updateOrder.js               # Update order
│   ├── getAllOrders.js              # Get all orders
│   ├── getOrderById.js              # Get order by ID
│   ├── cancelOrderRequest.js        # Request cancellation
│   ├── confirmOrder.js              # Confirm order
│   ├── updateOrderStatus.js         # Update status
│   ├── validateOrder.js             # Validate order data
│   └── ... (13+ files)
│
├── Users/                           # User Management Module
│   ├── function.yml
│   ├── authorizer.js                # JWT authorization
│   ├── login.js                     # User login
│   ├── createUserAndAddress.js      # User registration
│   ├── sendOtp.js                   # Send OTP
│   ├── validate-otp.js              # Validate OTP
│   ├── changeUserPassword.js        # Password change
│   ├── forgetPassword.js            # Password reset
│   ├── createAddress.js             # Add address
│   ├── updateAddress.js             # Update address
│   ├── setDefaultAddress.js         # Set default address
│   ├── getAllUsers.js               # Get all users
│   ├── getByUserName.js             # Get user by username
│   ├── getUserByRole.js             # Get users by role
│   └── ... (23+ files)
│
├── payment/                         # Payment Gateway Module
│   ├── function.yml
│   ├── createPaymentLink.js         # Create payment link
│   ├── createPaymentOrder.js        # Create payment order
│   ├── checkPaymentStatus.js        # Check payment status
│   ├── razorpayWebhook.js           # Razorpay webhooks
│   ├── cashFreeWebhook.js           # Cashfree webhooks
│   ├── phonepayWebhook.js           # PhonePe webhooks
│   └── ... (12+ files)
│
├── cart/                            # Shopping Cart Module
│   ├── function.yml
│   ├── addItemsInCart.js            # Add item to cart
│   ├── updateItemsInCart.js         # Update cart item
│   ├── deleteItemsInCart.js         # Remove from cart
│   ├── getItemsInCart.js            # Get cart contents
│   ├── removeAllItemsInCart.js      # Clear cart
│   └── ... (8+ files)
│
├── inventory/                       # Inventory Management Module
│   ├── function.yml
│   ├── createInventory.js           # Create inventory item
│   ├── updateInventory.js           # Update stock
│   ├── getAllInventory.js           # Get all items
│   ├── getById.js                   # Get item by ID
│   ├── updateInventryFromOrder.js   # Auto-update from orders
│   └── deleteById.js
│
├── category/                        # Category Management Module
│   └── function.yml
│
├── wishlist/                        # Wishlist Module
│   └── function.yml
│
├── reviews/                         # Product Reviews Module
│   └── function.yml
│
├── offers/                          # Promotional Offers Module
│   └── function.yml
│
├── deliverySlots/                   # Delivery Scheduling Module
│   └── function.yml
│
├── sales/                           # Sales Analytics Module
│   └── function.yml
│
├── OrderBills/                      # Order Billing Module
│   ├── function.yml
│   └── ... (PDF generation, email)
│
├── saveForLater/                    # Save for Later Module
│   └── function.yml
│
├── userSession/                     # User Session Module
│   └── function.yml
│
├── stepFunctions/                   # AWS Step Functions
│   └── function.yml
│
├── RBAC/                            # Role-Based Access Control (DISABLED)
│   └── function.yml
│
├── Login/                           # Legacy Login Module (DISABLED)
│   └── function.yml
│
├── Customer/                        # Legacy Customer Module (DISABLED)
│   └── function.yml
│
├── AppSyncFunctions/                # GraphQL Functions
│   └── Products.js
│
├── api-specs.yaml                   # OpenAPI/Swagger specifications
├── api-documentation.md             # Detailed API documentation
└── doc/                             # Additional documentation
```

---

## Setup & Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **AWS Account** with appropriate permissions
- **AWS CLI** configured with credentials
- **Serverless Framework** 3.x

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/Appkube-ecommerce/appkube-ecommerce-api.git
cd appkube-ecommerce-api
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Install Serverless Framework (if not already installed)

```bash
npm install -g serverless
```

#### 4. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region (ap-south-1), and output format
```

Alternatively, set environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-south-1
```

#### 5. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If available, or create manually
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# AWS Configuration
AWS_REGION=ap-south-1
REGION=ap-south-1

# DynamoDB Tables
PRODUCTS_TABLE=Products
ORDER_TABLE_NAME=Orders
CUSTOMER_TABLE_NAME=Customers
DYNAMODB_TABLE_NAME=DynamoDB
Inventory_TABLE_NAME=Inventory
Catalog_TABLE_NAME=Catalog

# External APIs & Services
FACEBOOK_GRAPH_API_URL=https://graph.facebook.com/v12.0
FACEBOOK_ACCESS_TOKEN=your_facebook_token

# Payment Gateway Keys
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret
PHONEPAY_MERCHANT_ID=your_phonepay_merchant_id
PHONEPAY_API_KEY=your_phonepay_api_key

# Algolia Search
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key

# JWT Secret (for token signing)
JWT_SECRET=your_jwt_secret_key

# AWS Cognito
COGNITO_USER_POOL_ID=your_cognito_user_pool_id
COGNITO_CLIENT_ID=your_cognito_client_id

# Notification Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# API Configuration
API_TIMEOUT=29
NODE_ENV=production
```

---

## API Endpoints

### Product Endpoints

```
POST   /product                      # Create new product
GET    /product                      # Get all products (with pagination & filters)
PUT    /product                      # Update product
DELETE /product                      # Delete product
GET    /product/{id}                 # Get product by ID
GET    /productByGroupId             # Get products by group ID
GET    /productsByCategory           # Get products by category
GET    /productsBySubCategory        # Get products by subcategory
GET    /search                       # Search products (Algolia)
PUT    /updatePriceByQty             # Update price based on quantity
```

### Order Endpoints

```
POST   /orders                       # Create new order
GET    /orders                       # Get all orders
GET    /orders/{id}                  # Get order by ID
GET    /orders/user/{userId}         # Get orders by user ID
PUT    /orders/{id}                  # Update order
DELETE /orders/{id}                  # Delete order
POST   /orders/{id}/confirm          # Confirm order
POST   /orders/{id}/cancel           # Request cancellation
POST   /orders/{id}/status           # Update order status
```

### User Endpoints

```
POST   /auth/signup                  # Register new user
POST   /auth/signin                  # Login user
POST   /auth/send-otp                # Send OTP for verification
POST   /auth/validate-otp            # Validate OTP
POST   /auth/forgot-password         # Request password reset
PUT    /auth/change-password         # Change password
GET    /users                        # Get all users
GET    /users/{id}                   # Get user by ID
GET    /users/name/{username}        # Get user by username
GET    /users/phone/{phoneNumber}    # Get user by phone
PUT    /users/{id}                   # Update user
DELETE /users/{id}                   # Delete user
```

### Address Endpoints

```
POST   /addresses                    # Create address
GET    /addresses/{userId}           # Get user addresses
PUT    /addresses/{id}               # Update address
DELETE /addresses/{id}               # Delete address
PUT    /addresses/{id}/default       # Set as default address
GET    /addresses/{id}/default       # Get default address
```

### Cart Endpoints

```
POST   /cart/items                   # Add item to cart
GET    /cart/items/{userId}          # Get cart items
PUT    /cart/items/{itemId}          # Update cart item
DELETE /cart/items/{itemId}          # Remove item from cart
DELETE /cart/items/{userId}          # Clear cart
POST   /cart/items/batch             # Batch add items
PUT    /cart/items/batch             # Batch update items
```

### Payment Endpoints

```
POST   /payments                     # Create payment link
GET    /payments/{id}/status         # Check payment status
POST   /webhooks/razorpay            # Razorpay webhook
POST   /webhooks/cashfree            # Cashfree webhook
POST   /webhooks/phonepay            # PhonePe webhook
```

### Inventory Endpoints

```
POST   /inventory                    # Create inventory item
GET    /inventory                    # Get all inventory items
GET    /inventory/{id}               # Get inventory by ID
PUT    /inventory/{id}               # Update inventory
DELETE /inventory/{id}               # Delete inventory
```

### Wishlist Endpoints

```
POST   /wishlist/items               # Add to wishlist
GET    /wishlist/{userId}            # Get user wishlist
DELETE /wishlist/items/{itemId}      # Remove from wishlist
```

### Review Endpoints

```
POST   /reviews                      # Create review
GET    /reviews/product/{productId}  # Get product reviews
PUT    /reviews/{id}                 # Update review
DELETE /reviews/{id}                 # Delete review
```

For complete API specifications, see [api-specs.yaml](./api-specs.yaml) and [api-documentation.md](./api-documentation.md).

---

## Module Documentation

### 📦 Products Module

Manages product catalog with advanced search and filtering.

**Key Features:**
- CRUD operations for products
- Algolia integration for search
- Category and subcategory filtering
- Price range filtering
- Availability status tracking
- Rating and review integration

**Files:** `products/function.yml`, 24+ handler files

---

### 📋 Order Module

Handles complete order lifecycle management.

**Key Features:**
- Order creation with validation
- Order status tracking (pending, confirmed, shipped, delivered, cancelled)
- Order confirmation workflows
- Cancellation requests
- Auto-inventory sync
- Order history by user

**Files:** `order/function.yml`, 13+ handler files

---

### 👥 Users Module

Manages user authentication, registration, and profile management.

**Key Features:**
- JWT-based authentication
- User registration with OTP verification
- Login/Logout functionality
- Password management (change, reset)
- Multiple address management
- Role-based access control
- User profile management

**Files:** `Users/function.yml`, 23+ handler files

---

### 💳 Payment Module

Integrates multiple payment gateways with webhook support.

**Key Features:**
- Razorpay integration
- Cashfree integration
- PhonePe integration
- Payment link generation
- Payment status checking
- Webhook handlers for payment updates
- Secure payment processing

**Files:** `payment/function.yml`, 12+ handler files

---

### 🛒 Cart Module

Shopping cart management with batch operations.

**Key Features:**
- Add/remove/update cart items
- Batch operations
- Cart persistence
- Cart totals calculation

**Files:** `cart/function.yml`, 8 handler files

---

### 📊 Inventory Module

Real-time inventory tracking and management.

**Key Features:**
- Stock level management
- Automatic updates from orders
- Low stock alerts
- Inventory history

**Files:** `inventory/function.yml`, 7 handler files

---

### 🎁 Additional Modules

- **Wishlist** - User favorite items
- **Reviews** - Product ratings and comments
- **Offers** - Promotional discounts
- **DeliverySlots** - Schedule deliveries
- **Sales** - Sales analytics
- **OrderBills** - Bill generation and email
- **SaveForLater** - Deferred purchases
- **UserSession** - Session management

---

## Local Development

### Start Local Server

```bash
npm install
serverless offline start
```

The API will be available at `http://localhost:4000`

### Testing Endpoints Locally

```bash
# Test product creation
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","category":"Vegetables","price":100}'

# Test get all products
curl http://localhost:4000/product

# Test user login
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Development Workflow

1. Make code changes in any module
2. Serverless offline automatically reloads the changes
3. Test locally before committing
4. Commit and push to repository
5. Deploy to production when ready

---

## Deployment

### Prerequisites for Deployment

- AWS credentials configured
- IAM role with Lambda, DynamoDB, API Gateway, and S3 permissions
- Environment variables set in `.env` file

### Deploy to Production

```bash
# Deploy all functions
serverless deploy --stage prod

# Deploy specific function
serverless deploy function -f getAllProduct --stage prod

# View deployment logs
serverless logs -f getAllProduct --stage prod
```

### Deployment Configuration

- **Provider:** AWS
- **Region:** ap-south-1 (Mumbai)
- **Stage:** prod
- **Runtime:** Node.js 18.x
- **IAM Role:** `arn:aws:iam::851725323791:role/ecommerce_Lambda_Role`
- **Timeout:** 29 seconds

### Lambda Warmup

To prevent cold starts, Lambda functions are warmed every 5 minutes via scheduled events. This is configured in `serverless.yml` under `plugins.serverless-plugin-warmup`.

---

## Technologies & Dependencies

### Core Technologies

- **Node.js** 18.x - JavaScript runtime
- **Serverless Framework** 3.x - Infrastructure as code
- **AWS Lambda** - Compute service
- **AWS DynamoDB** - NoSQL database
- **AWS API Gateway** - HTTP API management
- **AWS S3** - Object storage
- **AWS Cognito** - User authentication
- **JWT** - Token-based authentication

### Key Dependencies

**AWS SDK:**
- `@aws-sdk/client-dynamodb` - DynamoDB client
- `@aws-sdk/client-s3` - S3 client
- `@aws-sdk/client-secrets-manager` - Secrets Manager
- `@aws-sdk/lib-dynamodb` - DynamoDB Document client
- `@aws-sdk/util-dynamodb` - DynamoDB utilities

**Search & Data:**
- `algoliasearch` - Algolia search integration

**Payment Gateways:**
- `razorpay` - Razorpay payment processing
- `cashfree-pg` - Cashfree payment gateway
- `axios` - HTTP client for API calls

**Utilities:**
- `jsonwebtoken` - JWT token management
- `express` - Web framework
- `dotenv` - Environment variable management
- `dayjs` - Date/time utilities
- `uuid` - Unique ID generation
- `sharp` - Image processing
- `pdf-lib` - PDF generation
- `body-parser` - Request body parsing

**Dev Dependencies:**
- `serverless-offline` - Local testing
- `serverless-plugin-warmup` - Lambda warmup
- `serverless-domain-manager` - Custom domain management

---

## Notes & Known Issues

### ✅ Production Ready

- JWT-based authentication implemented
- All major CRUD operations functional
- Multi-payment gateway support
- Error handling in place
- CORS enabled for client integration

### ⚠️ Currently Disabled Modules

The following modules are commented out in `serverless.yml` and not currently deployed:

- **RBAC** (`RBAC/function.yml`) - Role-Based Access Control
- **Login** (`Login/function.yml`) - Separate login module (Users module handles this)
- **Customer** (`Customer/function.yml`) - Separate customer module
- **Webhooks** (`webhooks/function.yml`) - Webhook management

These may be re-enabled or refactored in future versions.

### 📝 Notes

- Product search is powered by Algolia for fast, scalable search
- Payment webhooks are critical for order confirmation - ensure they're accessible from payment gateways
- DynamoDB tables must be created manually or via infrastructure-as-code tools
- Lambda coldstart time is ~3-5 seconds; warmup plugin mitigates this
- Environment variables must be set before deployment
- JWT tokens should have appropriate expiration times

### 🐛 Potential Issues & Recommendations

1. **Test Payment Webhooks** - Ensure payment gateway webhooks can reach your API endpoints
2. **DynamoDB Throughput** - Monitor and adjust read/write capacity as traffic grows
3. **Lambda Concurrency** - Set reserved concurrency to handle peak traffic
4. **Error Logging** - Use CloudWatch logs for debugging production issues
5. **Rate Limiting** - Consider implementing rate limiting for API endpoints

---

## Contributing

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test locally
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Create a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Support

For issues, questions, or contributions, please:

1. Check existing [issues](https://github.com/Appkube-ecommerce/appkube-ecommerce-api/issues)
2. Create a new issue with detailed description
3. Contact the development team

---

## Additional Resources

- [API Specifications (OpenAPI/Swagger)](./api-specs.yaml)
- [Detailed API Documentation](./api-documentation.md)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

---

**Last Updated:** November 2025  
**Version:** 2.0.0 (Production)
