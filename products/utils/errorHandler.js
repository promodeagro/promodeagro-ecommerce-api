/**
 * Error Handler Utility
 * Standardizes error handling and formatting across all product APIs
 */

class ErrorHandler {
  /**
   * Error code to HTTP status mapping
   */
  static ERROR_CODES = {
    // Validation Errors (400)
    VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR', message: 'Validation failed' },
    INVALID_INPUT: { status: 400, code: 'INVALID_INPUT', message: 'Invalid input data' },
    MISSING_REQUIRED_FIELD: { status: 400, code: 'MISSING_REQUIRED_FIELD', message: 'Missing required field' },
    INVALID_PRICE: { status: 400, code: 'INVALID_PRICE', message: 'Invalid price value' },
    INVALID_QUANTITY: { status: 400, code: 'INVALID_QUANTITY', message: 'Invalid quantity value' },
    INVALID_UNIT: { status: 400, code: 'INVALID_UNIT', message: 'Invalid unit' },
    
    // Authentication Errors (401)
    UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized access' },
    INVALID_TOKEN: { status: 401, code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    
    // Forbidden Errors (403)
    FORBIDDEN: { status: 403, code: 'FORBIDDEN', message: 'Access forbidden' },
    INSUFFICIENT_PERMISSIONS: { status: 403, code: 'INSUFFICIENT_PERMISSIONS', message: 'Insufficient permissions' },
    
    // Not Found Errors (404)
    NOT_FOUND: { status: 404, code: 'NOT_FOUND', message: 'Resource not found' },
    PRODUCT_NOT_FOUND: { status: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
    CATEGORY_NOT_FOUND: { status: 404, code: 'CATEGORY_NOT_FOUND', message: 'Category not found' },
    VARIANT_NOT_FOUND: { status: 404, code: 'VARIANT_NOT_FOUND', message: 'Variant not found' },
    
    // Conflict Errors (409)
    CONFLICT: { status: 409, code: 'CONFLICT', message: 'Resource conflict' },
    DUPLICATE_PRODUCT: { status: 409, code: 'DUPLICATE_PRODUCT', message: 'Product with this name already exists' },
    PRODUCT_IN_USE: { status: 409, code: 'PRODUCT_IN_USE', message: 'Cannot delete product with active orders' },
    
    // Server Errors (500)
    INTERNAL_ERROR: { status: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' },
    DATABASE_ERROR: { status: 500, code: 'DATABASE_ERROR', message: 'Database operation failed' },
    EXTERNAL_SERVICE_ERROR: { status: 500, code: 'EXTERNAL_SERVICE_ERROR', message: 'External service error' },
  };

  /**
   * Handle error and return standardized response
   * @param {Error} error - Error object
   * @param {string} errorCode - Error code from ERROR_CODES
   * @returns {Object} - Formatted error response
   */
  static handle(error, errorCode = 'INTERNAL_ERROR') {
    const errorConfig = this.ERROR_CODES[errorCode] || this.ERROR_CODES.INTERNAL_ERROR;
    
    // Log the error
    this.logError(error, errorCode);
    
    return {
      statusCode: errorConfig.status,
      body: JSON.stringify({
        status: 'error',
        code: errorConfig.code,
        message: error.message || errorConfig.message,
        timestamp: new Date().toISOString(),
      })
    };
  }

  /**
   * Format validation errors
   * @param {Array} errors - Array of validation errors
   * @returns {Object} - Formatted error response
   */
  static formatValidationError(errors = []) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: errors.map(error => ({
          field: error.field || 'unknown',
          message: error.message || 'Invalid value'
        })),
        timestamp: new Date().toISOString(),
      })
    };
  }

  /**
   * Format custom error response
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Array} details - Additional error details
   * @returns {Object} - Formatted error response
   */
  static formatCustomError(code, message, details = []) {
    const errorConfig = this.ERROR_CODES[code] || this.ERROR_CODES.INTERNAL_ERROR;
    
    return {
      statusCode: errorConfig.status,
      body: JSON.stringify({
        status: 'error',
        code: errorConfig.code,
        message: message || errorConfig.message,
        details: details.length > 0 ? details : undefined,
        timestamp: new Date().toISOString(),
      })
    };
  }

  /**
   * Log error to console/logging service
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  static logError(error, context = 'ERROR') {
    console.error(`[${context}] ${new Date().toISOString()}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }

  /**
   * Handle database errors
   * @param {Error} error - Database error
   * @returns {Object} - Formatted error response
   */
  static handleDatabaseError(error) {
    if (error.code === 'ValidationException') {
      return this.handle(new Error('Invalid data for database operation'), 'VALIDATION_ERROR');
    }
    if (error.code === 'ResourceNotFoundException') {
      return this.handle(new Error('Resource not found'), 'NOT_FOUND');
    }
    if (error.code === 'ConditionalCheckFailedException') {
      return this.handle(new Error('Resource conflict'), 'CONFLICT');
    }
    return this.handle(error, 'DATABASE_ERROR');
  }

  /**
   * Handle validation exception
   * @param {Array} errors - Array of validation errors
   * @returns {Object} - Formatted error response
   */
  static handleValidationException(errors = []) {
    return this.formatValidationError(errors);
  }
}

module.exports = ErrorHandler;

