#!/usr/bin/env node

/**
 * Local Development Server for ProMode Agro eCommerce API
 * This server simulates the Lambda functions locally without needing Serverless Offline
 */

require('dotenv').config({ path: '.env.local' });

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
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

// Load all function handlers from files
const functionFiles = [
  'products/getAllProducts.js',
  'products/createProduct.js',
  'products/updateProduct.js',
  'products/delete.js',
  'products/getById.js',
];

const handlers = {};

// Dynamically import and setup routes
functionFiles.forEach(file => {
  try {
    const handler = require(path.join(__dirname, file));
    if (handler && handler.handler) {
      handlers[file] = handler.handler;
      console.log(`✓ Loaded handler: ${file}`);
    }
  } catch (err) {
    console.log(`⚠ Could not load: ${file}`);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Default route listing
app.get('/', (req, res) => {
  res.json({
    message: 'ProMode Agro eCommerce API - Local Development Server',
    endpoints: [
      'GET  /health',
      'GET  /product',
      'POST /product',
      'PUT  /product',
      'DELETE /product',
      'GET  /product/{id}',
    ],
    environment: {
      AWS_REGION: process.env.AWS_REGION,
      DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
      PRODUCTS_TABLE: process.env.PRODUCTS_TABLE,
    },
  });
});

// Products routes
app.get('/product', async (req, res) => {
  try {
    const handler = require('./products/getAllProducts.js');
    const event = { queryStringParameters: req.query };
    const result = await handler.handler(event);
    const statusCode = result.statusCode || 200;
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.post('/product', async (req, res) => {
  try {
    const handler = require('./products/createProduct.js');
    const event = { body: JSON.stringify(req.body) };
    const result = await handler.handler(event);
    const statusCode = result.statusCode || 200;
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.get('/product/:id', async (req, res) => {
  try {
    const handler = require('./products/getById.js');
    const event = { pathParameters: { id: req.params.id } };
    const result = await handler.getProductById(event);
    const statusCode = result.statusCode || 200;
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.put('/product', async (req, res) => {
  try {
    const handler = require('./products/updateProduct.js');
    const event = { body: JSON.stringify(req.body) };
    const result = await handler.handler(event);
    const statusCode = result.statusCode || 200;
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.delete('/product', async (req, res) => {
  try {
    const handler = require('./products/delete.js');
    const event = { body: JSON.stringify(req.body) };
    const result = await handler.deleteProduct(event);
    const statusCode = result.statusCode || 200;
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
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
  console.log(`\nEndpoints available at:\n`);
  console.log(`  http://localhost:${PORT}/product`);
  console.log(`  http://localhost:${PORT}/product/{id}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

