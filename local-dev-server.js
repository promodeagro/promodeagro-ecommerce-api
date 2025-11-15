#!/usr/bin/env node

/**
 * Local Development Server for ProMode Agro eCommerce API
 * This server simulates Lambda functions locally
 */

require('dotenv').config({ path: '.env.local' });

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging
app.use((req, res, next) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'ProMode Agro eCommerce API - Local Development Server',
    info: 'Routes are dynamically loaded from handler files',
    environment: {
      AWS_REGION: process.env.AWS_REGION,
      DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
    },
  });
});

// Generic route handler factory
const createHandler = (handlerPath, methodName = 'handler') => {
  return async (req, res) => {
    try {
      // Check if handler file exists
      const fullPath = path.join(__dirname, handlerPath);
      if (!fs.existsSync(fullPath)) {
        return res.status(501).json({ message: 'Handler not implemented', path: req.path });
      }

      // Load handler
      delete require.cache[require.resolve(fullPath)];
      const module = require(fullPath);
      const handler = module[methodName] || module.handler;

      if (!handler || typeof handler !== 'function') {
        return res.status(501).json({ message: 'Handler method not found', path: req.path });
      }

      // Build event
      const event = {
        pathParameters: req.params || {},
        queryStringParameters: req.query || {},
        body: Object.keys(req.body || {}).length > 0 ? JSON.stringify(req.body) : null,
        headers: req.headers || {},
        httpMethod: req.method,
        path: req.path,
      };

      // Call handler
      const result = await handler(event);
      if (!result) {
        return res.status(500).json({ message: 'Handler returned empty response' });
      }

      const statusCode = result.statusCode || 200;
      let body = result.body;

      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // Keep as string
        }
      }

      res.status(statusCode).json(body || {});
    } catch (error) {
      console.error(`Error handling ${req.method} ${req.path}:`, error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
};

// Product routes
app.get('/product', createHandler('products/getAllProducts.js'));
app.post('/product', createHandler('products/createProduct.js'));
app.put('/product', createHandler('products/updateProduct.js'));
app.delete('/product', createHandler('products/delete.js', 'deleteProduct'));
app.get('/product/:id', createHandler('products/getById.js', 'getProductById'));
app.get('/productByGroupId', createHandler('products/getProductByGroupId.js'));
app.get('/products', createHandler('products/searchApi.js'));
app.get('/products/search', createHandler('products/globalSearch.js'));
app.get('/getProductByCategory', createHandler('products/getProductsByCategory.js'));
app.get('/getProductBySubCategory', createHandler('products/getProductsBySubCategory.js'));
app.get('/demo', createHandler('products/demo.js'));

// User routes
app.get('/getAllUsers', createHandler('Users/getAllUsers.js'));
app.get('/getByUserName', createHandler('Users/getByUserName.js'));
app.get('/getUserByRole', createHandler('Users/getUserByRole.js'));
app.post('/createUserAndAddress', createHandler('Users/createUserAndAddress.js'));

// Order routes
app.get('/order', createHandler('order/getAllOrders.js'));
app.post('/order', createHandler('order/createOrder.js'));
app.get('/order/:id', createHandler('order/getOrderById.js'));
app.get('/order/:userId', createHandler('order/getOrderByuserId.js'));

// Cart routes
app.post('/cart/addItem', createHandler('cart/addItemsInCart.js'));
app.put('/cart/updateItem', createHandler('cart/updateItemsInCart.js'));
app.get('/cart/getItems', createHandler('cart/getItemsInCart.js'));
app.delete('/cart/deleteItem', createHandler('cart/deleteItemsInCart.js'));

// Category routes
app.get('/category', createHandler('category/getAllCategory.js'));
app.post('/category', createHandler('category/createCategory.js'));

// Wishlist routes
app.post('/addProductInWishList', createHandler('wishlist/addProductInWishList.js'));
app.get('/getUserWishList', createHandler('wishlist/getUsersInWishList.js'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path, method: req.method });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n${'╔════════════════════════════════════════════════════════════╗'}`);
  console.log(`║ ProMode Agro eCommerce API - Local Dev Server             ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`\nEnvironment:`);
  console.log(`  AWS_REGION: ${process.env.AWS_REGION}`);
  console.log(`  DYNAMODB_ENDPOINT: ${process.env.DYNAMODB_ENDPOINT}`);
  console.log(`  PRODUCTS_TABLE: ${process.env.PRODUCTS_TABLE}`);
  console.log(`\n✓ Handlers loaded and routes registered`);
  console.log(`Press Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
