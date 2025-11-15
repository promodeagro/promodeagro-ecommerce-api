/**
 * Create Product Handler
 * POST /product
 * Enhanced with validation, business logic, and proper error handling
 */

const ProductService = require('../services/productService');
const ResponseFormatter = require('../utils/responseFormatter');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');

module.exports.handler = async (event) => {
  const startTime = Date.now();
  let productData = {};

  try {
    Logger.logRequest('POST', '/product', event.body);

    // Parse request body
    if (!event.body) {
      return ErrorHandler.formatCustomError(
        'INVALID_INPUT',
        'Request body is required',
        [],
        400
      );
    }

    try {
      productData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return ErrorHandler.formatCustomError(
        'INVALID_JSON',
        'Invalid JSON in request body',
        [],
        400
      );
    }

    // Create product using service
    const product = await ProductService.createProduct(productData);

    // Format and return response
    const response = ResponseFormatter.created(
      ResponseFormatter.formatProduct(product),
      'Product created successfully'
    );

    const duration = Date.now() - startTime;
    Logger.logResponse('POST', '/product', 201, duration);

    return response;

  } catch (error) {
    Logger.error('Error creating product', error, { productData });

    // Handle specific error types
    if (error.code === 'VALIDATION_ERROR') {
      return ErrorHandler.formatValidationError(error.errors);
    }

    if (error.code === 'CATEGORY_NOT_FOUND') {
      return ErrorHandler.formatCustomError(
        'CATEGORY_NOT_FOUND',
        'Category not found',
        [],
        404
      );
    }

    if (error.code === 'DUPLICATE_PRODUCT') {
      return ErrorHandler.formatCustomError(
        'DUPLICATE_PRODUCT',
        'Product with this name already exists',
        [],
        409
      );
    }

    // Generic database error
    return ErrorHandler.handleDatabaseError(error);
  }
};

