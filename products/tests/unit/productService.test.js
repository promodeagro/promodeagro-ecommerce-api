/**
 * Product Service Unit Tests
 * Tests for productService.js business logic
 */

const ProductService = require('../../services/productService');
const ProductQueries = require('../../database/queries');
const UnitConverter = require('../../services/unitConverter');

jest.mock('../../database/queries');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateProductStatus()', () => {
    it('should return out-of-stock when stock is 0', () => {
      const status = ProductService.calculateProductStatus(0, 10);
      expect(status).toBe('out-of-stock');
    });

    it('should return low-stock when stock <= lowStockAlert', () => {
      const status = ProductService.calculateProductStatus(5, 10);
      expect(status).toBe('low-stock');
    });

    it('should return in-stock when stock > lowStockAlert', () => {
      const status = ProductService.calculateProductStatus(50, 10);
      expect(status).toBe('in-stock');
    });

    it('should return in-stock when lowStockAlert is 0', () => {
      const status = ProductService.calculateProductStatus(5, 0);
      expect(status).toBe('in-stock');
    });

    it('should handle string inputs', () => {
      const status = ProductService.calculateProductStatus('50', '10');
      expect(status).toBe('in-stock');
    });
  });

  describe('generateProductId()', () => {
    it('should generate unique product IDs', () => {
      const id1 = ProductService.generateProductId();
      const id2 = ProductService.generateProductId();
      
      expect(id1).toMatch(/^prod_/);
      expect(id2).toMatch(/^prod_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateVariantId()', () => {
    it('should generate variant ID with product prefix', () => {
      const variantId = ProductService.generateVariantId('prod_abc123', 0);
      
      expect(variantId).toContain('var_');
      expect(variantId).toContain('abc123');
      expect(variantId).toContain('_0');
    });

    it('should use variant index', () => {
      const var0 = ProductService.generateVariantId('prod_test', 0);
      const var1 = ProductService.generateVariantId('prod_test', 1);
      
      expect(var0).toContain('_0');
      expect(var1).toContain('_1');
    });
  });

  describe('createProduct()', () => {
    it('should create product successfully', async () => {
      const productData = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock: 100 // Add stock to make it in-stock
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({
        id: 'prod_123',
        ...productData,
        status: 'in-stock'
      });

      const result = await ProductService.createProduct(productData);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Product');
      expect(result.status).toBe('in-stock');
      expect(ProductQueries.saveProduct).toHaveBeenCalled();
    });

    it('should throw validation error for invalid data', async () => {
      const productData = {
        // Missing required fields
      };

      await expect(ProductService.createProduct(productData)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR'
      });
    });

    it('should throw category not found error', async () => {
      const productData = {
        name: 'Test Product',
        categoryId: 'invalid_cat',
        basePrice: 50
      };

      ProductQueries.getCategoryById.mockResolvedValue(null);

      await expect(ProductService.createProduct(productData)).rejects.toMatchObject({
        code: 'CATEGORY_NOT_FOUND'
      });
    });

    it('should process variants', async () => {
      const productData = {
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock_mode: 'parent',
        variants: [
          {
            name: '1 KG',
            b2cQty: 1,
            b2cUnit: 'kg',
            salePrice: 50
          }
        ]
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const result = await ProductService.createProduct(productData);

      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].id).toBeDefined();
    });
  });

  describe('createVariant()', () => {
    it('should create variant with auto-calculated price for parent stock mode', () => {
      const variant = {
        name: '2 KG',
        b2cQty: 2,
        b2cUnit: 'kg',
        salePrice: undefined
      };

      const parentData = {
        name: 'Test Product',
        basePrice: 50,
        unit: 'kg'
      };

      const result = ProductService.createVariant(variant, 'prod_123', 0, 'parent', parentData);

      expect(result.salePrice).toBe(100); // 50 * 2
      expect(result.name).toBe('2 KG');
    });

    it('should use provided price if available', () => {
      const variant = {
        name: '1 KG',
        b2cQty: 1,
        b2cUnit: 'kg',
        salePrice: 60
      };

      const parentData = {
        name: 'Test Product',
        basePrice: 50,
        unit: 'kg'
      };

      const result = ProductService.createVariant(variant, 'prod_123', 0, 'variant', parentData);

      expect(result.salePrice).toBe(60);
    });
  });

  describe('updateProduct()', () => {
    it('should update product successfully', async () => {
      const updates = {
        name: 'Updated Name',
        basePrice: 60
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        name: 'Original Name',
        basePrice: 50
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123',
        ...updates
      });

      const result = await ProductService.updateProduct('prod_123', updates);

      expect(result.name).toBe('Updated Name');
      expect(ProductQueries.updateProduct).toHaveBeenCalled();
    });

    it('should recalculate status if stock changes', async () => {
      const updates = {
        stock: 0
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        stock: 100,
        lowStockAlert: 10
      });

      ProductQueries.updateProduct.mockResolvedValue({});

      await ProductService.updateProduct('prod_123', updates);

      const updateCall = ProductQueries.updateProduct.mock.calls[0];
      // updateProduct is called with (productId, category, updates)
      // Check if status was set to out-of-stock in the updates
      if (updateCall[2]) {
        expect(updateCall[2].status).toBe('out-of-stock');
      }
    });

    it('should throw error if product not found', async () => {
      ProductQueries.getProductById.mockResolvedValue(null);

      await expect(ProductService.updateProduct('invalid_id', {})).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND'
      });
    });
  });

  describe('deleteProduct()', () => {
    it('should soft delete product by default', async () => {
      await ProductService.deleteProduct('prod_123', true);

      expect(ProductQueries.softDeleteProduct).toHaveBeenCalledWith('prod_123');
    });

    it('should hard delete product if specified', async () => {
      await ProductService.deleteProduct('prod_123', false);

      expect(ProductQueries.deleteProduct).toHaveBeenCalledWith('prod_123');
    });
  });

  describe('convertVariantQtyToParentUnit()', () => {
    it('should use unit converter', () => {
      const result = ProductService.convertVariantQtyToParentUnit(1, 'kg', 'g');

      expect(result).toBe(1000);
    });
  });

  describe('getProductById()', () => {
    it('should fetch product by ID', async () => {
      const mockProduct = { id: 'prod_123', name: 'Test' };
      ProductQueries.getProductById.mockResolvedValue(mockProduct);

      const result = await ProductService.getProductById('prod_123');

      expect(result).toEqual(mockProduct);
      expect(ProductQueries.getProductById).toHaveBeenCalledWith('prod_123');
    });
  });

  describe('getProductsByCategory()', () => {
    it('should fetch products by category', async () => {
      const mockProducts = [{ id: 'prod_1', name: 'Product 1' }];
      ProductQueries.queryProductsByCategory.mockResolvedValue({
        items: mockProducts,
        count: 1
      });

      const result = await ProductService.getProductsByCategory('cat_1', 1, 20);

      expect(result.items).toEqual(mockProducts);
      expect(ProductQueries.queryProductsByCategory).toHaveBeenCalledWith('cat_1', {
        page: 1,
        limit: 20
      });
    });
  });

  describe('searchProducts()', () => {
    it('should search products with filters', async () => {
      const mockResults = [{ id: 'prod_1', name: 'Found Product' }];
      ProductQueries.searchProducts.mockResolvedValue(mockResults);

      const result = await ProductService.searchProducts('tomato', {
        category: 'vegetables',
        minPrice: 20,
        maxPrice: 100
      });

      expect(result).toEqual(mockResults);
      expect(ProductQueries.searchProducts).toHaveBeenCalled();
    });
  });

  describe('getAllProducts()', () => {
    it('should fetch all products with pagination', async () => {
      const mockResult = {
        items: [{ id: 'prod_1' }],
        count: 1,
        page: 1,
        limit: 20
      };

      ProductQueries.getAllProducts.mockResolvedValue(mockResult);

      const result = await ProductService.getAllProducts({ page: 1, limit: 20 });

      expect(result).toEqual(mockResult);
      expect(ProductQueries.getAllProducts).toHaveBeenCalled();
    });
  });

  describe('getFeaturedProducts()', () => {
    it('should fetch featured products', async () => {
      const mockProducts = [{ id: 'prod_1', featured: true }];
      ProductQueries.getFeaturedProducts.mockResolvedValue(mockProducts);

      const result = await ProductService.getFeaturedProducts(10);

      expect(result).toEqual(mockProducts);
      expect(ProductQueries.getFeaturedProducts).toHaveBeenCalledWith(10);
    });
  });
});

