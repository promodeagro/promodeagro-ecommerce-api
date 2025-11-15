/**
 * Get Product By ID Integration Tests
 * Tests for GET /product/{id} handler
 */

const handler = require('../../handlers/getProductById').handler;
const ProductQueries = require('../../database/queries');

jest.mock('../../database/queries');

describe('GET /product/{id} - Get Product By ID Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Product Retrieval', () => {
    it('should retrieve product by ID', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      const mockProduct = {
        id: 'prod_123',
        name: 'Test Product',
        categoryId: 'cat_1',
        basePrice: 50,
        stock: 100,
        status: 'in-stock'
      };

      ProductQueries.getProductById.mockResolvedValue(mockProduct);

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('prod_123');
      expect(body.data.name).toBe('Test Product');
    });

    it('should include all product fields', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      const mockProduct = {
        id: 'prod_123',
        name: 'Complete Product',
        description: 'Full description',
        categoryId: 'cat_1',
        categoryName: 'Vegetables',
        basePrice: 50,
        stock: 100,
        status: 'in-stock',
        unit: 'kg',
        variants: [
          { id: 'var_1', name: '1 KG', salePrice: 50 }
        ],
        images: ['image1.jpg'],
        tags: ['tag1'],
        onB2C: true,
        isActive: true,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      };

      ProductQueries.getProductById.mockResolvedValue(mockProduct);

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('name');
      expect(body.data).toHaveProperty('categoryName');
      expect(body.data).toHaveProperty('variants');
      expect(body.data).toHaveProperty('createdAt');
    });

    it('should format variants correctly', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      const mockProduct = {
        id: 'prod_123',
        name: 'Product with Variants',
        variants: [
          { id: 'var_1', name: '1 KG', b2cQty: 1, salePrice: 50 },
          { id: 'var_2', name: '2 KG', b2cQty: 2, salePrice: 100 }
        ]
      };

      ProductQueries.getProductById.mockResolvedValue(mockProduct);

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data.variants).toHaveLength(2);
      expect(body.data.variants[0]).toHaveProperty('id');
      expect(body.data.variants[0]).toHaveProperty('name');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for missing product', async () => {
      const event = {
        pathParameters: {
          id: 'nonexistent_id'
        }
      };

      ProductQueries.getProductById.mockResolvedValue(null);

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('error');
      expect(body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return 404 for deleted product', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      const deletedProduct = {
        id: 'prod_123',
        isDeleted: true
      };

      ProductQueries.getProductById.mockResolvedValue(deletedProduct);

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should handle missing product ID in path', async () => {
      const event = {
        pathParameters: null
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INVALID_INPUT');
    });

    it('should handle empty product ID', async () => {
      const event = {
        pathParameters: {
          id: ''
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle database errors', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockRejectedValue(
        new Error('Database error')
      );

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });
  });

  describe('Response Format', () => {
    it('should include proper response headers', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        name: 'Test'
      });

      const response = await handler(event);

      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should include metadata in response', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        name: 'Test'
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.meta).toBeDefined();
      expect(body.meta.timestamp).toBeDefined();
      expect(body.meta.requestId).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in product ID', async () => {
      const event = {
        pathParameters: {
          id: 'prod_abc-123_xyz'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_abc-123_xyz'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });

    it('should handle whitespace in product ID', async () => {
      const event = {
        pathParameters: {
          id: '  prod_123  '
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      const response = await handler(event);

      // Handler receives ID with spaces - just ensure it's called
      expect(ProductQueries.getProductById).toHaveBeenCalled();
    });
  });
});

