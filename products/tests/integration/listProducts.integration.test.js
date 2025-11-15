/**
 * List Products Integration Tests
 * Tests for GET /product handler (list all products)
 */

const handler = require('../../handlers/listProducts').handler;
const ProductQueries = require('../../database/queries');

jest.mock('../../database/queries');

describe('GET /product - List Products Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Product Listing', () => {
    it('should list all products with default pagination', async () => {
      const event = {
        queryStringParameters: {}
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [
          { id: 'prod_1', name: 'Product 1', status: 'in-stock' },
          { id: 'prod_2', name: 'Product 2', status: 'low-stock' }
        ],
        count: 2
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(2);
      expect(body.pagination).toBeDefined();
    });

    it('should apply pagination parameters', async () => {
      const event = {
        queryStringParameters: {
          page: '2',
          limit: '50'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 50
        })
      );
    });

    it('should filter by category', async () => {
      const event = {
        queryStringParameters: {
          category: 'cat_1'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [
          { id: 'prod_1', categoryId: 'cat_1' }
        ],
        count: 1
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            category: 'cat_1'
          })
        })
      );
    });

    it('should filter by status', async () => {
      const event = {
        queryStringParameters: {
          status: 'in-stock'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: 'in-stock'
          })
        })
      );
    });

    it('should filter by price range', async () => {
      const event = {
        queryStringParameters: {
          minPrice: '50',
          maxPrice: '500'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            minPrice: 50,
            maxPrice: 500
          })
        })
      );
    });

    it('should sort by name ascending', async () => {
      const event = {
        queryStringParameters: {
          sortBy: 'name',
          sortOrder: 'asc'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: { by: 'name', order: 'asc' }
        })
      );
    });

    it('should sort by price descending', async () => {
      const event = {
        queryStringParameters: {
          sortBy: 'price',
          sortOrder: 'desc'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: { by: 'price', order: 'desc' }
        })
      );
    });

    it('should combine multiple filters and sorting', async () => {
      const event = {
        queryStringParameters: {
          category: 'cat_1',
          status: 'in-stock',
          minPrice: '50',
          sortBy: 'price',
          sortOrder: 'asc',
          page: '1',
          limit: '20'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ProductQueries.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
          filters: expect.any(Object),
          sort: expect.any(Object)
        })
      );
    });
  });

  describe('Pagination Metadata', () => {
    it('should include correct pagination metadata', async () => {
      const event = {
        queryStringParameters: {
          page: '1',
          limit: '20'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: Array(20).fill({ id: 'prod_1' }),
        count: 100
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        pages: 5,
        hasNextPage: true,
        hasPrevPage: false
      });
    });

    it('should indicate last page correctly', async () => {
      const event = {
        queryStringParameters: {
          page: '5',
          limit: '20'
        }
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: Array(20).fill({ id: 'prod_1' }),
        count: 100
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.pagination.hasNextPage).toBe(false);
      expect(body.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid page parameter', async () => {
      const event = {
        queryStringParameters: {
          page: 'invalid'
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle negative page number', async () => {
      const event = {
        queryStringParameters: {
          page: '-1'
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle invalid limit parameter', async () => {
      const event = {
        queryStringParameters: {
          limit: 'invalid'
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle limit exceeding maximum', async () => {
      const event = {
        queryStringParameters: {
          limit: '5000'
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle invalid sort order', async () => {
      const event = {
        queryStringParameters: {
          sortOrder: 'invalid'
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should handle database errors', async () => {
      const event = {
        queryStringParameters: {}
      };

      ProductQueries.getAllProducts.mockRejectedValue(
        new Error('Database error')
      );

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results', async () => {
      const event = {
        queryStringParameters: {}
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });

    it('should handle missing query parameters', async () => {
      const event = {};

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });

    it('should use default values for missing pagination params', async () => {
      const event = {
        queryStringParameters: {}
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      await handler(event);

      const callArgs = ProductQueries.getAllProducts.mock.calls[0][0];
      expect(callArgs.page).toBe(1);
      expect(callArgs.limit).toBeGreaterThan(0);
    });
  });

  describe('Response Format', () => {
    it('should include proper response headers', async () => {
      const event = {
        queryStringParameters: {}
      };

      ProductQueries.getAllProducts.mockResolvedValue({
        items: [],
        count: 0
      });

      const response = await handler(event);

      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should format product data correctly', async () => {
      const event = {
        queryStringParameters: {}
      };

      const mockProducts = [
        {
          id: 'prod_1',
          name: 'Product 1',
          categoryId: 'cat_1',
          basePrice: 50,
          status: 'in-stock'
        }
      ];

      ProductQueries.getAllProducts.mockResolvedValue({
        items: mockProducts,
        count: 1
      });

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('name');
      expect(body.data[0]).toHaveProperty('status');
    });
  });
});

