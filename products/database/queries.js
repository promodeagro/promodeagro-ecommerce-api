/**
 * Database Queries Layer
 * Handles all product-related database operations
 */

const db = require('./dynamodb');

class ProductQueries {
  // Table names from environment variables (match Python CLI)
  static TABLE_NAME = process.env.PRODUCTS_TABLE || 'Products';
  static CATEGORY_TABLE_NAME = process.env.CATEGORY_TABLE_NAME || 'Category_management';
  static UNIT_TABLE_NAME = process.env.UNIT_TABLE_NAME || 'Unit_management';
  static STOCK_ADJUSTMENT_TABLE = process.env.STOCK_ADJUSTMENT_TABLE || 'Stock_adjustment';
  static PINCODE_TABLE_NAME = process.env.PINCODE_TABLE_NAME || 'Pincode_management';
  static DELIVERY_TYPES_TABLE = process.env.DELIVERY_TYPES_TABLE || 'Delivery_types';
  static DELIVERY_SLOTS_TABLE = process.env.DELIVERY_SLOTS_TABLE || 'Delivery_slots';
  static CUSTOMER_TABLE_NAME = process.env.CUSTOMER_TABLE_NAME || 'Customers';
  static ORDER_TABLE_NAME = process.env.ORDER_TABLE_NAME || 'Orders';

  /**
   * Save product to database
   * @param {Object} product - Product object to save
   * @returns {Promise} - Save result
   */
  static async saveProduct(product) {
    return db.put(this.TABLE_NAME, product);
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise} - Product object or null
   */
  static async getProductById(productId) {
    return db.get(this.TABLE_NAME, { id: productId });
  }

  /**
   * Query products by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options (page, limit, etc.)
   * @returns {Promise} - Query result with items and pagination
   */
  static async queryProductsByCategory(categoryId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const startIndex = (page - 1) * limit;

    const params = {
      IndexName: 'categoryId-index', // Assumes GSI exists
      KeyConditionExpression: 'categoryId = :categoryId',
      ExpressionAttributeValues: {
        ':categoryId': categoryId,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
    };

    // Add exclusiveStartKey if not first page
    if (page > 1) {
      // This is simplified - would need proper pagination token handling in production
      params.ExclusiveStartKey = {
        id: `skip_${startIndex}`,
        categoryId: categoryId,
      };
    }

    const result = await db.query(this.TABLE_NAME, params);
    return {
      items: result.items,
      count: result.count,
      page: page,
      limit: limit,
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
  }

  /**
   * Search products by name/query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} - Search results
   */
  static async searchProducts(query, filters = {}) {
    const { category, minPrice, maxPrice, limit = 50 } = filters;

    // This is simplified - in production, would use Algolia or more sophisticated indexing
    const params = {
      IndexName: 'name-index', // Assumes GSI on name exists
      KeyConditionExpression: 'begins_with(#name, :query)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':query': query,
      },
      Limit: limit,
    };

    // Add price filters if provided
    if (minPrice !== undefined || maxPrice !== undefined) {
      let filterExpression = [];
      if (minPrice !== undefined) {
        params.ExpressionAttributeValues[':minPrice'] = minPrice;
        filterExpression.push('basePrice >= :minPrice');
      }
      if (maxPrice !== undefined) {
        params.ExpressionAttributeValues[':maxPrice'] = maxPrice;
        filterExpression.push('basePrice <= :maxPrice');
      }
      if (filterExpression.length > 0) {
        params.FilterExpression = filterExpression.join(' AND ');
      }
    }

    const result = await db.query(this.TABLE_NAME, params);
    return result.items || [];
  }

  /**
   * Get all products with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise} - Products with pagination info
   */
  static async getAllProducts(options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    // Use scan for getting all products
    const params = {
      Limit: limit,
      ScanIndexForward: sortOrder === 'asc',
    };

    // Add exclusiveStartKey for pagination if needed
    if (options.lastEvaluatedKey) {
      params.ExclusiveStartKey = options.lastEvaluatedKey;
    }

    const result = await db.scan(this.TABLE_NAME, params);
    
    return {
      items: result.items || [],
      count: result.count,
      scannedCount: result.scannedCount,
      page: page,
      limit: limit,
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
  }

  /**
   * Update product
   * @param {string} productId - Product ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} - Updated product
   */
  static async updateProduct(productId, updates) {
    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Increment version if it exists
    if (updates.version !== undefined) {
      updateData.version = (updates.version || 0) + 1;
    }

    return db.update(this.TABLE_NAME, { id: productId }, updateData);
  }

  /**
   * Delete product
   * @param {string} productId - Product ID
   * @returns {Promise} - Delete result
   */
  static async deleteProduct(productId) {
    return db.delete(this.TABLE_NAME, { id: productId });
  }

  /**
   * Soft delete product (mark as deleted)
   * @param {string} productId - Product ID
   * @returns {Promise} - Updated product
   */
  static async softDeleteProduct(productId) {
    return this.updateProduct(productId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    });
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise} - Category object
   */
  static async getCategoryById(categoryId) {
    return db.get(this.CATEGORY_TABLE_NAME, { id: categoryId });
  }

  /**
   * Get products with low stock
   * @param {number} threshold - Low stock threshold
   * @returns {Promise} - Products with low stock
   */
  static async getProductsWithLowStock(threshold = 10) {
    // Simplified - would need proper GSI or scan with filter
    const params = {
      FilterExpression: 'lowStockAlert > :zero AND #stock <= lowStockAlert',
      ExpressionAttributeNames: {
        '#stock': 'stock',
      },
      ExpressionAttributeValues: {
        ':zero': 0,
      },
    };

    const result = await db.scan(this.TABLE_NAME, params);
    return result.items || [];
  }

  /**
   * Get products by group ID
   * @param {string} groupId - Group ID
   * @returns {Promise} - Products in group
   */
  static async getProductsByGroupId(groupId) {
    const params = {
      IndexName: 'groupId-index', // Assumes GSI exists
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId,
      },
    };

    const result = await db.query(this.TABLE_NAME, params);
    return result.items || [];
  }

  /**
   * Check if product exists
   * @param {string} productId - Product ID
   * @returns {Promise} - Boolean
   */
  static async productExists(productId) {
    const product = await this.getProductById(productId);
    return !!product;
  }

  /**
   * Batch get products
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise} - Array of products
   */
  static async batchGetProducts(productIds) {
    const keys = productIds.map(id => ({ id }));
    return db.batchGet(this.TABLE_NAME, keys);
  }

  /**
   * Count products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise} - Product count
   */
  static async countProductsByCategory(categoryId) {
    const params = {
      IndexName: 'categoryId-index',
      KeyConditionExpression: 'categoryId = :categoryId',
      ExpressionAttributeValues: {
        ':categoryId': categoryId,
      },
      Select: 'COUNT',
    };

    const result = await db.query(this.TABLE_NAME, params);
    return result.count || 0;
  }

  /**
   * Get featured products
   * @param {number} limit - Number of featured products
   * @returns {Promise} - Featured products
   */
  static async getFeaturedProducts(limit = 20) {
    const params = {
      FilterExpression: 'onB2C = :true AND isActive = :true AND attribute_exists(rating)',
      ExpressionAttributeValues: {
        ':true': true,
      },
      Limit: limit,
      ScanIndexForward: false,
    };

    const result = await db.scan(this.TABLE_NAME, params);
    return result.items || [];
  }
}

module.exports = ProductQueries;

