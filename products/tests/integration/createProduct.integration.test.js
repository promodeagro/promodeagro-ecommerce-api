/**
 * Create Product Integration Tests
 * Tests for POST /product handler
 */

const handler = require('../../handlers/createProduct').handler;
const ProductQueries = require('../../database/queries');

jest.mock('../../database/queries');

describe('POST /product - Create Product Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Product Creation', () => {
    it('should create product with valid data', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Organic Tomatoes',
          categoryId: 'cat_1',
          basePrice: 50,
          description: 'Fresh organic tomatoes',
          stock: 100,
          variants: []
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data.name).toBe('Organic Tomatoes');
      expect(body.data.status).toBe('in-stock');
    });

    it('should create product with variants', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Tomatoes',
          categoryId: 'cat_1',
          basePrice: 50,
          stock_mode: 'parent',
          stock: 100,
          unit: 'kg',
          variants: [
            {
              name: '1 KG',
              b2cQty: 1,
              b2cUnit: 'kg'
            },
            {
              name: '2 KG',
              b2cQty: 2,
              b2cUnit: 'kg'
            }
          ]
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body.data.variants).toHaveLength(2);
    });

    it('should calculate stock status correctly', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Low Stock Product',
          categoryId: 'cat_1',
          basePrice: 50,
          stock: 5,
          lowStockAlert: 10
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('low-stock');
    });

    it('should assign metadata correctly', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: 50
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.meta).toBeDefined();
      expect(body.meta.timestamp).toBeDefined();
      expect(body.meta.requestId).toBeDefined();
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing product name', async () => {
      const event = {
        body: JSON.stringify({
          categoryId: 'cat_1',
          basePrice: 50
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('error');
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: 'name' })
      );
    });

    it('should reject missing category ID', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          basePrice: 50
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: 'categoryId' })
      );
    });

    it('should reject invalid base price', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: -50
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: 'basePrice' })
      );
    });

    it('should reject invalid stock quantity', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: 50,
          stock: -10
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: 'stock' })
      );
    });

    it('should reject invalid stock mode', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: 50,
          stock_mode: 'invalid'
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid product name format', async () => {
      const event = {
        body: JSON.stringify({
          name: 'A', // Too short
          categoryId: 'cat_1',
          basePrice: 50
        })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in request body', async () => {
      const event = {
        body: 'invalid json'
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INVALID_JSON');
    });

    it('should handle missing request body', async () => {
      const event = {};

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INVALID_INPUT');
    });

    it('should handle category not found', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'invalid_cat',
          basePrice: 50
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue(null);

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('CATEGORY_NOT_FOUND');
    });

    it('should handle database errors', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: 50
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockRejectedValue(
        new Error('Database error')
      );

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
    });
  });

  describe('Response Format', () => {
    it('should include proper response headers', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: 50
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const response = await handler(event);

      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should format product data correctly', async () => {
      const event = {
        body: JSON.stringify({
          name: 'Test Product',
          categoryId: 'cat_1',
          basePrice: 50,
          description: 'Test Description',
          images: ['image1.jpg'],
          tags: ['tag1']
        })
      };

      ProductQueries.getCategoryById.mockResolvedValue({
        id: 'cat_1',
        name: 'Vegetables'
      });

      ProductQueries.saveProduct.mockResolvedValue({});

      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('name');
      expect(body.data).toHaveProperty('categoryId');
      expect(body.data).toHaveProperty('basePrice');
      expect(body.data).toHaveProperty('status');
      expect(body.data).toHaveProperty('createdAt');
    });
  });
});

