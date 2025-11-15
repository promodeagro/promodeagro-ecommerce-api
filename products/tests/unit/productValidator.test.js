/**
 * Product Validator Unit Tests
 * Tests for productValidator.js service
 */

const ProductValidator = require('../../services/productValidator');

describe('ProductValidator', () => {
  describe('validateProductInput()', () => {
    it('should accept valid product data', () => {
      const data = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50
      };
      
      const errors = ProductValidator.validateProductInput(data);
      expect(errors).toHaveLength(0);
    });

    it('should require product name', () => {
      const data = {
        categoryId: 'cat_1',
        basePrice: 50
      };
      
      const errors = ProductValidator.validateProductInput(data);
      const nameError = errors.find(e => e.field === 'name');
      
      expect(nameError).toBeDefined();
    });

    it('should require category ID', () => {
      const data = {
        name: 'Test Product',
        basePrice: 50
      };
      
      const errors = ProductValidator.validateProductInput(data);
      const categoryError = errors.find(e => e.field === 'categoryId');
      
      expect(categoryError).toBeDefined();
    });

    it('should require base price', () => {
      const data = {
        name: 'Test Product',
        categoryId: 'cat_1'
      };
      
      const errors = ProductValidator.validateProductInput(data);
      const priceError = errors.find(e => e.field === 'basePrice');
      
      expect(priceError).toBeDefined();
    });

    it('should validate stock mode if provided', () => {
      const data = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock_mode: 'invalid'
      };
      
      const errors = ProductValidator.validateProductInput(data);
      const modeError = errors.find(e => e.field === 'stock_mode');
      
      expect(modeError).toBeDefined();
    });

    it('should accept valid stock modes', () => {
      const data1 = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock_mode: 'parent'
      };
      
      const data2 = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock_mode: 'variant'
      };
      
      expect(ProductValidator.validateProductInput(data1)).toHaveLength(0);
      expect(ProductValidator.validateProductInput(data2)).toHaveLength(0);
    });

    it('should validate stock if provided', () => {
      const data = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock: -5
      };
      
      const errors = ProductValidator.validateProductInput(data);
      const stockError = errors.find(e => e.field === 'stock');
      
      expect(stockError).toBeDefined();
    });

    it('should validate description length', () => {
      const longDescription = 'a'.repeat(2001);
      const data = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        description: longDescription
      };
      
      const errors = ProductValidator.validateProductInput(data);
      const descError = errors.find(e => e.field === 'description');
      
      expect(descError).toBeDefined();
    });

    it('should validate variants if provided', () => {
      const data = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        variants: [
          {
            // Missing required fields
          }
        ]
      };
      
      const errors = ProductValidator.validateProductInput(data);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateProductName()', () => {
    it('should accept valid product names', () => {
      expect(ProductValidator.validateProductName('Test Product')).toBeNull();
      expect(ProductValidator.validateProductName('Organic Tomatoes (Fresh)')).toBeNull();
      expect(ProductValidator.validateProductName('Product-123')).toBeNull();
    });

    it('should reject names shorter than 2 characters', () => {
      const error = ProductValidator.validateProductName('A');
      expect(error).toBeDefined();
      expect(error.field).toBe('name');
    });

    it('should reject names longer than 255 characters', () => {
      const longName = 'A'.repeat(256);
      const error = ProductValidator.validateProductName(longName);
      expect(error).toBeDefined();
    });

    it('should reject invalid characters', () => {
      const error = ProductValidator.validateProductName('Product@#$%');
      expect(error).toBeDefined();
    });

    it('should reject non-string input', () => {
      expect(ProductValidator.validateProductName(123)).toBeDefined();
      expect(ProductValidator.validateProductName(null)).toBeDefined();
    });
  });

  describe('validatePrice()', () => {
    it('should accept valid prices', () => {
      expect(ProductValidator.validatePrice(50)).toBeNull();
      expect(ProductValidator.validatePrice('50')).toBeNull();
      expect(ProductValidator.validatePrice(0)).toBeNull();
      expect(ProductValidator.validatePrice(999.99)).toBeNull();
    });

    it('should require price to be defined', () => {
      const error = ProductValidator.validatePrice(undefined);
      expect(error).toBeDefined();
    });

    it('should reject non-numeric prices', () => {
      const error = ProductValidator.validatePrice('abc');
      expect(error).toBeDefined();
    });

    it('should reject negative prices', () => {
      const error = ProductValidator.validatePrice(-50);
      expect(error).toBeDefined();
    });

    it('should use custom field name in error', () => {
      const error = ProductValidator.validatePrice(null, 'salePrice');
      expect(error.field).toBe('salePrice');
    });
  });

  describe('validateVariant()', () => {
    it('should validate complete variant', () => {
      const variant = {
        name: '1 KG',
        b2cQty: 1,
        b2cUnit: 'kg',
        salePrice: 50
      };
      
      const errors = ProductValidator.validateVariant(variant, 0);
      expect(errors).toHaveLength(0);
    });

    it('should require variant name', () => {
      const variant = {
        b2cQty: 1,
        b2cUnit: 'kg'
      };
      
      const errors = ProductValidator.validateVariant(variant, 0);
      const nameError = errors.find(e => e.field.includes('name'));
      
      expect(nameError).toBeDefined();
    });

    it('should require b2cQty and b2cUnit', () => {
      const variant = {
        name: '1 KG'
      };
      
      const errors = ProductValidator.validateVariant(variant, 0);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should use variant index in error field', () => {
      const variant = {};
      const errors = ProductValidator.validateVariant(variant, 2);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].field).toContain('variants[2]');
    });
  });

  describe('isValidUrl()', () => {
    it('should validate correct URLs', () => {
      expect(ProductValidator.isValidUrl('https://example.com/image.jpg')).toBe(true);
      expect(ProductValidator.isValidUrl('http://cdn.example.com/path/to/image.png')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(ProductValidator.isValidUrl('not-a-url')).toBe(false);
      expect(ProductValidator.isValidUrl('example.com')).toBe(false);
      expect(ProductValidator.isValidUrl('')).toBe(false);
    });
  });

  describe('validateUpdateData()', () => {
    it('should allow partial updates', () => {
      const updateData = {
        name: 'Updated Product'
      };
      
      const errors = ProductValidator.validateUpdateData(updateData);
      expect(errors).toHaveLength(0);
    });

    it('should validate provided fields', () => {
      const updateData = {
        basePrice: -50 // Invalid
      };
      
      const errors = ProductValidator.validateUpdateData(updateData);
      const priceError = errors.find(e => e.field === 'basePrice');
      
      expect(priceError).toBeDefined();
    });

    it('should not require all fields', () => {
      const updateData = {
        name: 'Updated Name'
        // Missing other fields
      };
      
      const errors = ProductValidator.validateUpdateData(updateData);
      expect(errors).toHaveLength(0);
    });
  });
});

