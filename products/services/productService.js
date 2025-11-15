/**
 * Product Service
 * Core business logic for product operations
 * Implements patterns from CLI: products_cli.py
 */

const { v4: uuidv4 } = require('uuid');
const UnitConverter = require('./unitConverter');
const ProductValidator = require('./productValidator');
const ProductQueries = require('../database/queries');
const Logger = require('../utils/logger');

class ProductService {
  /**
   * Calculate product status based on stock
   * Matches CLI: calculate_product_status()
   *
   * @param {number} stock - Current stock quantity
   * @param {number} lowStockAlert - Low stock alert threshold
   * @returns {string} - 'out-of-stock', 'low-stock', or 'in-stock'
   */
  static calculateProductStatus(stock, lowStockAlert = 0) {
    stock = parseInt(stock) || 0;
    lowStockAlert = parseInt(lowStockAlert) || 0;

    if (stock === 0) {
      return 'out-of-stock';
    } else if (lowStockAlert > 0 && stock <= lowStockAlert) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  }

  /**
   * Generate unique product ID
   * @returns {string} - Product ID in format: prod_{uuid}
   */
  static generateProductId() {
    return `prod_${uuidv4()}`;
  }

  /**
   * Generate unique variant ID
   * @param {string} productId - Parent product ID
   * @param {number} variantIndex - Variant index
   * @returns {string} - Variant ID
   */
  static generateVariantId(productId, variantIndex = 0) {
    return `var_${productId.replace('prod_', '')}_${variantIndex}`;
  }

  /**
   * Create new product
   * Matches CLI: create_product()
   *
   * @param {Object} data - Product data
   * @returns {Promise<Object>} - Created product
   */
  static async createProduct(data) {
    Logger.info('Creating product', { productName: data.name });

    try {
      // Validate input
      const validationErrors = ProductValidator.validateProductInput(data);
      if (validationErrors.length > 0) {
        throw {
          code: 'VALIDATION_ERROR',
          errors: validationErrors,
        };
      }

      // Verify category exists
      const category = await ProductQueries.getCategoryById(data.categoryId);
      if (!category) {
        throw {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        };
      }

      // Generate product ID
      const productId = this.generateProductId();

      // Process variants
      let variants = [];
      if (data.variants && Array.isArray(data.variants)) {
        variants = data.variants.map((variant, index) => {
          return this.createVariant(variant, productId, index, data.stock_mode, data);
        });
      }

      // Calculate product status
      const status = this.calculateProductStatus(data.stock || 0, data.lowStockAlert || 0);

      // Create product object
      const product = {
        id: productId,
        name: data.name,
        description: data.description || '',
        categoryId: data.categoryId,
        categoryName: category.name || '',
        subCategoryId: data.subCategoryId || '',
        subCategoryName: data.subCategoryName || '',
        groupId: data.groupId || '',
        basePrice: parseFloat(data.basePrice) || 0,
        purchasePrice: parseFloat(data.purchasePrice) || 0,
        comparePrice: parseFloat(data.comparePrice) || 0,
        stock: parseInt(data.stock) || 0,
        unit: data.unit || 'kg',
        stock_mode: data.stock_mode || 'parent',
        status: status,
        lowStockAlert: parseInt(data.lowStockAlert) || 0,
        variants: variants,
        images: data.images || [],
        tags: data.tags || [],
        onB2C: data.onB2C !== false,
        isActive: data.isActive !== false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      // Save to database
      await ProductQueries.saveProduct(product);

      Logger.info('Product created successfully', { productId: productId });
      return product;

    } catch (error) {
      Logger.error('Error creating product', error, { data });
      throw error;
    }
  }

  /**
   * Create variant object
   * Matches CLI: variant creation logic
   *
   * @param {Object} variant - Variant data
   * @param {string} productId - Parent product ID
   * @param {number} index - Variant index
   * @param {string} stockMode - Stock mode (parent/variant)
   * @param {Object} parentData - Parent product data
   * @returns {Object} - Variant object
   */
  static createVariant(variant, productId, index, stockMode, parentData) {
    // Calculate variant price if stock_mode is parent
    let variantPrice = parseFloat(variant.salePrice) || 0;
    let variantPurchasePrice = parseFloat(variant.purchasePrice) || 0;

    if (stockMode === 'parent' && parentData.basePrice) {
      // Auto-calculate variant price based on parent
      const qtyInParentUnit = UnitConverter.convert(
        variant.b2cQty,
        variant.b2cUnit || 'kg',
        parentData.unit || 'kg'
      );

      variantPrice = parseFloat(parentData.basePrice) * qtyInParentUnit;
      variantPurchasePrice = parseFloat(parentData.purchasePrice || 0) * qtyInParentUnit;
    }

    return {
      id: this.generateVariantId(productId, index),
      name: variant.name || parentData.name,
      b2cQty: parseFloat(variant.b2cQty) || 0,
      b2cUnit: variant.b2cUnit || 'kg',
      stock: stockMode === 'variant' ? (parseInt(variant.stock) || 0) : 0,
      unit: variant.unit || '',
      purchasePrice: variantPurchasePrice,
      salePrice: variantPrice,
      comparePrice: parseFloat(variant.comparePrice) || 0,
      status: this.calculateProductStatus(
        parseInt(variant.stock) || 0,
        parseInt(variant.lowStockAlert) || 0
      ),
      lowStockAlert: parseInt(variant.lowStockAlert) || 0,
      onB2C: variant.onB2C !== false,
      images: variant.images || [],
      expiryDate: variant.expiryDate || '',
    };
  }

  /**
   * Update product
   * Matches CLI: update_product()
   *
   * @param {string} productId - Product ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated product
   */
  static async updateProduct(productId, updates) {
    Logger.info('Updating product', { productId });

    try {
      // Validate update data
      const validationErrors = ProductValidator.validateUpdateData(updates);
      if (validationErrors.length > 0) {
        throw {
          code: 'VALIDATION_ERROR',
          errors: validationErrors,
        };
      }

      // Get existing product
      const existingProduct = await ProductQueries.getProductById(productId);
      if (!existingProduct) {
        throw {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        };
      }

      // Prepare update data
      const updateData = { ...updates };

      // Recalculate status if stock changed
      if (updates.stock !== undefined) {
        updateData.status = this.calculateProductStatus(
          updates.stock,
          updates.lowStockAlert || existingProduct.lowStockAlert
        );
      }

      // Handle variant updates
      if (updates.variants && Array.isArray(updates.variants)) {
        updateData.variants = updates.variants.map((variant, index) => {
          return this.createVariant(variant, productId, index, existingProduct.stock_mode, updates);
        });
      }

      // Update in database
      const updated = await ProductQueries.updateProduct(productId, updateData);

      Logger.info('Product updated successfully', { productId });
      return updated;

    } catch (error) {
      Logger.error('Error updating product', error, { productId, updates });
      throw error;
    }
  }

  /**
   * Delete product
   * @param {string} productId - Product ID to delete
   * @param {boolean} softDelete - Use soft delete (default: true)
   * @returns {Promise<void>}
   */
  static async deleteProduct(productId, softDelete = true) {
    Logger.info('Deleting product', { productId, softDelete });

    try {
      if (softDelete) {
        await ProductQueries.softDeleteProduct(productId);
      } else {
        await ProductQueries.deleteProduct(productId);
      }

      Logger.info('Product deleted successfully', { productId });
    } catch (error) {
      Logger.error('Error deleting product', error, { productId });
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Product object
   */
  static async getProductById(productId) {
    Logger.debug('Fetching product', { productId });
    return ProductQueries.getProductById(productId);
  }

  /**
   * Get products by category with pagination
   * @param {string} categoryId - Category ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Products with pagination info
   */
  static async getProductsByCategory(categoryId, page = 1, limit = 20) {
    Logger.debug('Fetching products by category', { categoryId, page, limit });
    return ProductQueries.queryProductsByCategory(categoryId, { page, limit });
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} - Search results
   */
  static async searchProducts(query, filters = {}) {
    Logger.debug('Searching products', { query, filters });
    return ProductQueries.searchProducts(query, filters);
  }

  /**
   * Get all products
   * @param {Object} options - Options (page, limit, sort, etc.)
   * @returns {Promise<Object>} - Products with pagination
   */
  static async getAllProducts(options = {}) {
    Logger.debug('Fetching all products', options);
    return ProductQueries.getAllProducts(options);
  }

  /**
   * Get featured/homepage products
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} - Featured products
   */
  static async getFeaturedProducts(limit = 20) {
    Logger.debug('Fetching featured products', { limit });
    return ProductQueries.getFeaturedProducts(limit);
  }

  /**
   * Convert variant quantity to parent unit
   * Matches CLI: convert_variant_qty_to_parent_unit()
   *
   * @param {number|string} qty - Quantity
   * @param {string} variantUnit - Variant unit
   * @param {string} parentUnit - Parent unit
   * @returns {number} - Converted quantity
   */
  static convertVariantQtyToParentUnit(qty, variantUnit, parentUnit) {
    return UnitConverter.convert(qty, variantUnit, parentUnit);
  }
}

module.exports = ProductService;

