/**
 * Product Validator Service
 * Validates product input data before processing
 */

const UnitConverter = require('./unitConverter');

class ProductValidator {
  /**
   * Validate complete product input
   * @param {Object} data - Product data to validate
   * @returns {Array} - Array of validation errors (empty if valid)
   */
  static validateProductInput(data) {
    const errors = [];

    // Required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Product name is required and must be a non-empty string'
      });
    }

    if (!data.categoryId || typeof data.categoryId !== 'string') {
      errors.push({
        field: 'categoryId',
        message: 'Category ID is required'
      });
    }

    // Validate basePrice
    const priceError = this.validatePrice(data.basePrice, 'basePrice');
    if (priceError) errors.push(priceError);

    // Validate stock_mode if provided
    if (data.stock_mode && !['parent', 'variant'].includes(data.stock_mode)) {
      errors.push({
        field: 'stock_mode',
        message: 'Stock mode must be either "parent" or "variant"'
      });
    }

    // Validate stock if provided
    if (data.stock !== undefined && data.stock !== null) {
      if (!Number.isInteger(data.stock) || data.stock < 0) {
        errors.push({
          field: 'stock',
          message: 'Stock must be a non-negative integer'
        });
      }
    }

    // Validate unit if provided
    if (data.unit && !UnitConverter.isValidUnit(data.unit)) {
      errors.push({
        field: 'unit',
        message: `Invalid unit. Supported units: ${Object.keys(UnitConverter.getSupportedUnits()).join(', ')}`
      });
    }

    // Validate low stock alert
    if (data.lowStockAlert !== undefined && data.lowStockAlert !== null) {
      if (!Number.isInteger(data.lowStockAlert) || data.lowStockAlert < 0) {
        errors.push({
          field: 'lowStockAlert',
          message: 'Low stock alert must be a non-negative integer'
        });
      }
    }

    // Validate product name format
    const nameFormatError = this.validateProductName(data.name);
    if (nameFormatError) errors.push(nameFormatError);

    // Validate description if provided
    if (data.description && data.description.length > 2000) {
      errors.push({
        field: 'description',
        message: 'Description must not exceed 2000 characters'
      });
    }

    // Validate variants if provided
    if (data.variants && Array.isArray(data.variants)) {
      data.variants.forEach((variant, index) => {
        const variantErrors = this.validateVariant(variant, index);
        errors.push(...variantErrors);
      });
    }

    // Validate images if provided
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((image, index) => {
        if (typeof image !== 'string' || !this.isValidUrl(image)) {
          errors.push({
            field: `images[${index}]`,
            message: 'Each image must be a valid URL'
          });
        }
      });
    }

    // Validate tags if provided
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag, index) => {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push({
            field: `tags[${index}]`,
            message: 'Each tag must be a non-empty string'
          });
        }
      });
    }

    return errors;
  }

  /**
   * Validate single variant
   * @param {Object} variant - Variant data
   * @param {number} index - Variant index
   * @returns {Array} - Validation errors
   */
  static validateVariant(variant, index = 0) {
    const errors = [];
    const fieldPrefix = `variants[${index}]`;

    // Check variant is object
    if (typeof variant !== 'object' || variant === null) {
      errors.push({
        field: fieldPrefix,
        message: 'Variant must be an object'
      });
      return errors;
    }

    // Validate required fields
    if (!variant.name || typeof variant.name !== 'string') {
      errors.push({
        field: `${fieldPrefix}.name`,
        message: 'Variant name is required'
      });
    }

    if (!variant.b2cQty || variant.b2cQty <= 0) {
      errors.push({
        field: `${fieldPrefix}.b2cQty`,
        message: 'B2C quantity is required and must be positive'
      });
    }

    if (!variant.b2cUnit || typeof variant.b2cUnit !== 'string') {
      errors.push({
        field: `${fieldPrefix}.b2cUnit`,
        message: 'B2C unit is required'
      });
    }

    // Validate unit
    if (variant.b2cUnit && !UnitConverter.isValidUnit(variant.b2cUnit)) {
      errors.push({
        field: `${fieldPrefix}.b2cUnit`,
        message: 'Invalid B2C unit'
      });
    }

    // Validate pricing
    if (variant.salePrice !== undefined && variant.salePrice !== null) {
      const priceError = this.validatePrice(variant.salePrice, `${fieldPrefix}.salePrice`);
      if (priceError) errors.push(priceError);
    }

    if (variant.purchasePrice !== undefined && variant.purchasePrice !== null) {
      const priceError = this.validatePrice(variant.purchasePrice, `${fieldPrefix}.purchasePrice`);
      if (priceError) errors.push(priceError);
    }

    // Validate stock if provided
    if (variant.stock !== undefined && variant.stock !== null) {
      if (!Number.isInteger(variant.stock) || variant.stock < 0) {
        errors.push({
          field: `${fieldPrefix}.stock`,
          message: 'Stock must be a non-negative integer'
        });
      }
    }

    return errors;
  }

  /**
   * Validate product name
   * @param {string} name - Product name
   * @returns {Object|null} - Error object or null
   */
  static validateProductName(name) {
    if (!name || typeof name !== 'string') {
      return {
        field: 'name',
        message: 'Product name must be a string'
      };
    }

    if (name.length < 2 || name.length > 255) {
      return {
        field: 'name',
        message: 'Product name must be between 2 and 255 characters'
      };
    }

    // Check for valid characters (alphanumeric, spaces, common symbols)
    const validNameRegex = /^[a-zA-Z0-9\s\-\.\,\&\(\)]+$/;
    if (!validNameRegex.test(name)) {
      return {
        field: 'name',
        message: 'Product name contains invalid characters'
      };
    }

    return null;
  }

  /**
   * Validate price
   * @param {number|string} price - Price to validate
   * @param {string} fieldName - Field name for error message
   * @returns {Object|null} - Error object or null
   */
  static validatePrice(price, fieldName = 'price') {
    if (price === undefined || price === null) {
      return {
        field: fieldName,
        message: 'Price is required'
      };
    }

    const numPrice = parseFloat(price);
    
    if (isNaN(numPrice)) {
      return {
        field: fieldName,
        message: 'Price must be a valid number'
      };
    }

    if (numPrice < 0) {
      return {
        field: fieldName,
        message: 'Price cannot be negative'
      };
    }

    return null;
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Validate update data (partial validation)
   * @param {Object} data - Update data
   * @param {Object} existingProduct - Existing product (optional)
   * @returns {Array} - Validation errors
   */
  static validateUpdateData(data, existingProduct = {}) {
    const errors = [];

    // Validate name if provided
    if (data.name !== undefined) {
      const nameError = this.validateProductName(data.name);
      if (nameError) errors.push(nameError);
    }

    // Validate basePrice if provided
    if (data.basePrice !== undefined) {
      const priceError = this.validatePrice(data.basePrice, 'basePrice');
      if (priceError) errors.push(priceError);
    }

    // Validate stock if provided
    if (data.stock !== undefined && data.stock !== null) {
      if (!Number.isInteger(data.stock) || data.stock < 0) {
        errors.push({
          field: 'stock',
          message: 'Stock must be a non-negative integer'
        });
      }
    }

    // Validate variants if provided
    if (data.variants && Array.isArray(data.variants)) {
      data.variants.forEach((variant, index) => {
        const variantErrors = this.validateVariant(variant, index);
        errors.push(...variantErrors);
      });
    }

    return errors;
  }
}

module.exports = ProductValidator;

