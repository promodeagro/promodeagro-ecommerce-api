/**
 * Get Product By ID Handler
 * GET /product/{id}
 * Enhanced with proper error handling
 */

const ProductService = require('../services/productService');
const ResponseFormatter = require('../utils/responseFormatter');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');

module.exports.handler = async (event) => {
  const startTime = Date.now();

  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return ErrorHandler.formatCustomError(
        'INVALID_INPUT',
        'Product ID is required',
        [],
        400
      );
    }

    Logger.logRequest('GET', `/product/${productId}`);

    // Get product from service
    const product = await ProductService.getProductById(productId);

    if (!product) {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        [],
        404
      );
    }

    // Skip if product is deleted
    if (product.isDeleted) {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        [],
        404
      );
    }

    // Format and return response
    const response = ResponseFormatter.success(
      ResponseFormatter.formatProduct(product),
      'Product retrieved successfully'
    );

    const duration = Date.now() - startTime;
    Logger.logResponse('GET', `/product/${productId}`, 200, duration);

    return response;

  } catch (error) {
    Logger.error('Error getting product', error, event.pathParameters);
    return ErrorHandler.handleDatabaseError(error);
  }
};

