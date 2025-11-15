/**
 * Update Product Handler
 * PUT /product
 * Enhanced with validation and business logic
 */

const ProductService = require('../services/productService');
const ResponseFormatter = require('../utils/responseFormatter');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');

module.exports.handler = async (event) => {
  const startTime = Date.now();
  let updateData = {};

  try {
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
      updateData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return ErrorHandler.formatCustomError(
        'INVALID_JSON',
        'Invalid JSON in request body',
        [],
        400
      );
    }

    // Product ID is required
    const productId = updateData.id || event.pathParameters?.id;
    if (!productId) {
      return ErrorHandler.formatCustomError(
        'INVALID_INPUT',
        'Product ID is required',
        [],
        400
      );
    }

    Logger.logRequest('PUT', `/product/${productId}`, updateData);

    // Update product using service
    const updated = await ProductService.updateProduct(productId, updateData);

    if (!updated) {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        [],
        404
      );
    }

    // Format and return response
    const response = ResponseFormatter.success(
      ResponseFormatter.formatProduct(updated),
      'Product updated successfully'
    );

    const duration = Date.now() - startTime;
    Logger.logResponse('PUT', `/product/${productId}`, 200, duration);

    return response;

  } catch (error) {
    Logger.error('Error updating product', error, updateData);

    // Handle specific error types
    if (error.code === 'VALIDATION_ERROR') {
      return ErrorHandler.formatValidationError(error.errors);
    }

    if (error.code === 'PRODUCT_NOT_FOUND') {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        [],
        404
      );
    }

    // Generic database error
    return ErrorHandler.handleDatabaseError(error);
  }
};

