/**
 * Delete Product Handler
 * DELETE /product
 * Enhanced with soft delete and constraint checking
 */

const ProductService = require('../services/productService');
const ResponseFormatter = require('../utils/responseFormatter');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');

module.exports.handler = async (event) => {
  const startTime = Date.now();

  try {
    // Get product ID from query parameter or path
    const productId = event.queryStringParameters?.productId || event.pathParameters?.id;

    if (!productId) {
      return ErrorHandler.formatCustomError(
        'INVALID_INPUT',
        'Product ID is required',
        [],
        400
      );
    }

    Logger.logRequest('DELETE', `/product/${productId}`);

    // Check if product exists before deleting
    const product = await ProductService.getProductById(productId);
    if (!product) {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        [],
        404
      );
    }

    // Check if product is already deleted
    if (product.isDeleted) {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product already deleted',
        [],
        404
      );
    }

    // TODO: Check for active orders referencing this product
    // const activeOrders = await checkActiveOrders(productId);
    // if (activeOrders > 0) {
    //   return ErrorHandler.formatCustomError(
    //     'PRODUCT_IN_USE',
    //     'Cannot delete product with active orders',
    //     [],
    //     409
    //   );
    // }

    // Delete product (using soft delete by default)
    const useSoftDelete = event.queryStringParameters?.hardDelete !== 'true';
    await ProductService.deleteProduct(productId, useSoftDelete);

    const duration = Date.now() - startTime;
    Logger.logResponse('DELETE', `/product/${productId}`, 204, duration);

    // Return 204 No Content response
    return ResponseFormatter.noContent();

  } catch (error) {
    Logger.error('Error deleting product', error, event.queryStringParameters);

    if (error.code === 'PRODUCT_IN_USE') {
      return ErrorHandler.formatCustomError(
        'PRODUCT_IN_USE',
        'Cannot delete product with active orders',
        [],
        409
      );
    }

    if (error.code === 'PRODUCT_NOT_FOUND') {
      return ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        [],
        404
      );
    }

    return ErrorHandler.handleDatabaseError(error);
  }
};

