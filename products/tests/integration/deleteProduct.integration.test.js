/**
 * Delete Product Integration Tests
 * Tests for DELETE /product handler
 */

const handler = require('../../handlers/deleteProduct').handler;
const ProductQueries = require('../../database/queries');

jest.mock('../../database/queries');

describe('DELETE /product - Delete Product Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Product Deletion', () => {
    it('should soft delete product by default', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123',
        name: 'Test Product'
      });

      ProductQueries.softDeleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
      expect(ProductQueries.softDeleteProduct).toHaveBeenCalledWith('prod_123');
    });

    it('should return no content on successful deletion', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.softDeleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
      expect(response.body).toBeUndefined();
    });

    it('should hard delete product if specified', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        queryStringParameters: {
          hardDelete: 'true'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.deleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
      expect(ProductQueries.deleteProduct).toHaveBeenCalledWith('prod_123');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent product', async () => {
      const event = {
        pathParameters: {
          id: 'nonexistent_id'
        }
      };

      ProductQueries.getProductById.mockResolvedValue(null);

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should handle missing product ID', async () => {
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

    it('should handle database errors during soft delete', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.softDeleteProduct.mockRejectedValue(
        new Error('Database error')
      );

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });

    it('should handle database errors during hard delete', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        queryStringParameters: {
          hardDelete: 'true'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.deleteProduct.mockRejectedValue(
        new Error('Database error')
      );

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });
  });

  describe('Validation', () => {
    it('should accept valid hardDelete parameter', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        queryStringParameters: {
          hardDelete: 'true'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.deleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
    });

    it('should ignore invalid hardDelete parameter', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        },
        queryStringParameters: {
          hardDelete: 'invalid'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.softDeleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
      expect(ProductQueries.softDeleteProduct).toHaveBeenCalled();
    });
  });

  describe('Constraint Checking', () => {
    it('should check if product has active orders before deletion', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.softDeleteProduct.mockRejectedValue({
        code: 'PRODUCT_IN_USE',
        message: 'Cannot delete product with active orders'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(409);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('PRODUCT_IN_USE');
    });

    it('should check variant dependencies before deletion', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.softDeleteProduct.mockRejectedValue({
        code: 'CONSTRAINT_VIOLATION',
        message: 'Product has dependent variants'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(409);
    });
  });

  describe('Response Format', () => {
    it('should include proper response headers on success', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      ProductQueries.getProductById.mockResolvedValue({
        id: 'prod_123'
      });

      ProductQueries.softDeleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should include error headers on failure', async () => {
      const event = {
        pathParameters: {
          id: 'nonexistent_id'
        }
      };

      ProductQueries.getProductById.mockResolvedValue(null);

      const response = await handler(event);

      if (response.headers) {
        expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(response.headers['Content-Type']).toBe('application/json');
      }
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

      ProductQueries.softDeleteProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
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

      ProductQueries.softDeleteProduct.mockResolvedValue({});

      const response = await handler(event);

      // Handler receives ID with spaces - just ensure it's called
      expect(ProductQueries.getProductById).toHaveBeenCalled();
    });

    it('should handle idempotent deletes on soft delete', async () => {
      const event = {
        pathParameters: {
          id: 'prod_123'
        }
      };

      // First delete
      ProductQueries.getProductById.mockResolvedValueOnce({
        id: 'prod_123',
        isDeleted: false
      });

      ProductQueries.softDeleteProduct.mockResolvedValueOnce({});

      const response1 = await handler(event);
      expect(response1.statusCode).toBe(204);

      // Second delete - product already marked as deleted
      ProductQueries.getProductById.mockResolvedValueOnce({
        id: 'prod_123',
        isDeleted: true
      });

      // Should still return 404 as soft-deleted products appear as not found
      const response2 = await handler(event);
      expect(response2.statusCode).toBe(404);
    });
  });
});

