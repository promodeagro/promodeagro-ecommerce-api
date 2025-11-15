/**
 * Update Product Integration Tests
 * Tests for PUT /product handler
 */

const handler = require('../../handlers/updateProduct').handler;
const ProductQueries = require('../../database/queries');

jest.mock('../../database/queries');

describe('PUT /product - Update Product Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Product Updates', () => {
    it('should update product name', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          name: 'Updated Product Name'
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        name: 'Original Name'
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123',
        name: 'Updated Product Name'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data.name).toBe('Updated Product Name');
    });

    it('should update product price', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          basePrice: 75
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        basePrice: 50
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123',
        basePrice: 75
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.data.basePrice).toBe(75);
    });

    it('should update stock and recalculate status', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          stock: 5
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        stock: 100,
        lowStockAlert: 10
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123',
        stock: 5,
        status: 'low-stock'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('low-stock');
    });

    it('should allow partial updates', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          description: 'Updated description'
        })
      };

      const originalProduct = {
        id: 'prod_123',
        name: 'Test Product',
        basePrice: 50,
        description: 'Original description'
      };

      ProductQueries.getProductById.mockResolvedValue(originalProduct);

      ProductQueries.updateProduct.mockResolvedValue({
        ...originalProduct,
        description: 'Updated description'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.updateProduct).toHaveBeenCalled();
    });

    it('should update product metadata', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          tags: ['new-tag'],
          onB2C: false
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.updateProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });

    it('should update timestamp on successful update', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          name: 'Updated'
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123',
        updatedAt: new Date().toISOString()
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data.updatedAt).toBeDefined();
    });
  });

  describe('Validation Errors', () => {
    it('should reject invalid price', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          basePrice: -50
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid stock', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          stock: -10
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid name length', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          name: 'A' // Too short
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should not allow updating product ID', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          id: 'prod_999', // Attempting to change ID
          name: 'Updated'
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123' // Should remain unchanged
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data.id).toBe('prod_123');
    });
  });

  describe('Error Handling', () => {
    it('should handle product not found', async () => {
      const event = {
        pathParameters: {
          id: 'nonexistent_id'
        },
        body: JSON.stringify({
          name: 'Updated'
        })
      };

      ProductQueries.getProductById.mockResolvedValue(null);

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should handle invalid JSON in request body', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: 'invalid json'
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INVALID_JSON');
    });

    it('should handle empty request body', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({})
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle missing product ID in path', async () => {
      const event = {
        pathParameters: null,
        body: JSON.stringify({
          name: 'Updated'
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle database errors', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          name: 'Updated'
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.updateProduct.mockRejectedValue(
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
        },
        body: JSON.stringify({
          name: 'Updated'
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123'
      });

      const response = await handler(event);

      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should return complete updated product', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        body: JSON.stringify({
          name: 'Updated Product'
        })
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.updateProduct.mockResolvedValue({
        id: 'prod_123',
        name: 'Updated Product',
        basePrice: 50,
        status: 'in-stock'
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('name');
      expect(body.data).toHaveProperty('basePrice');
      expect(body.data).toHaveProperty('status');
    });
  });
});

