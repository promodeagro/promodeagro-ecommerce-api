/**
 * Response Formatter Utility
 * Standardizes response formatting across all product APIs
 */

class ResponseFormatter {
  /**
   * Format success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} - Formatted response
   */
  static success(data, message = 'Success', statusCode = 200) {
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        status: 'success',
        data: data,
        message: message,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        }
      })
    };
  }

  /**
   * Format paginated response
   * @param {Array} data - Array of items
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @param {number} total - Total items count
   * @param {string} message - Success message
   * @returns {Object} - Formatted paginated response
   */
  static paginated(data = [], page = 1, limit = 20, total = 0, message = 'Success') {
    const pages = Math.ceil(total / limit);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        status: 'success',
        data: data,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: pages,
          hasNextPage: page < pages,
          hasPrevPage: page > 1,
        },
        message: message,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        }
      })
    };
  }

  /**
   * Format error response
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} details - Additional error details
   * @returns {Object} - Formatted error response
   */
  static error(code, message, statusCode = 400, details = []) {
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        status: 'error',
        code: code,
        message: message,
        details: details.length > 0 ? details : undefined,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        }
      })
    };
  }

  /**
   * Format created response (201)
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   * @returns {Object} - Formatted response
   */
  static created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  /**
   * Format no content response (204)
   * @returns {Object} - Formatted response
   */
  static noContent() {
    return {
      statusCode: 204,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    };
  }

  /**
   * Format product response from database document
   * @param {Object} dbProduct - Product from database
   * @returns {Object} - Formatted product for API response
   */
  static formatProduct(dbProduct) {
    if (!dbProduct) return null;

    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description || '',
      categoryId: dbProduct.categoryId,
      categoryName: dbProduct.categoryName || '',
      subCategoryId: dbProduct.subCategoryId,
      subCategoryName: dbProduct.subCategoryName || '',
      basePrice: dbProduct.basePrice,
      purchasePrice: dbProduct.purchasePrice,
      comparePrice: dbProduct.comparePrice,
      stock: dbProduct.stock,
      unit: dbProduct.unit,
      status: dbProduct.status || 'in-stock',
      lowStockAlert: dbProduct.lowStockAlert,
      variants: (dbProduct.variants || []).map(v => this.formatVariant(v)),
      images: dbProduct.images || [],
      tags: dbProduct.tags || [],
      onB2C: dbProduct.onB2C !== false,
      isActive: dbProduct.isActive !== false,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
      version: dbProduct.version || 1,
    };
  }

  /**
   * Format variant response
   * @param {Object} variant - Variant object
   * @returns {Object} - Formatted variant
   */
  static formatVariant(variant) {
    if (!variant) return null;

    return {
      id: variant.id,
      name: variant.name,
      b2cQty: variant.b2cQty,
      b2cUnit: variant.b2cUnit,
      stock: variant.stock || 0,
      purchasePrice: variant.purchasePrice,
      salePrice: variant.salePrice,
      comparePrice: variant.comparePrice,
      status: variant.status || 'in-stock',
      lowStockAlert: variant.lowStockAlert,
      onB2C: variant.onB2C !== false,
      images: variant.images || [],
    };
  }

  /**
   * Generate unique request ID
   * @returns {string} - Unique request ID
   */
  static generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ResponseFormatter;

