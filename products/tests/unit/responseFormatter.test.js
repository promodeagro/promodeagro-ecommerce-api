/**
 * Response Formatter Unit Tests
 * Tests for responseFormatter.js utility
 */

const ResponseFormatter = require('../../utils/responseFormatter');

describe('ResponseFormatter', () => {
  describe('success()', () => {
    it('should format success response with default status code', () => {
      const data = { id: 'prod_123', name: 'Test Product' };
      const response = ResponseFormatter.success(data, 'Success message');
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data).toEqual(data);
      expect(body.message).toBe('Success message');
    });

    it('should format success response with custom status code', () => {
      const data = { id: 'prod_123' };
      const response = ResponseFormatter.success(data, 'Created', 201);
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
    });

    it('should include metadata with timestamp and requestId', () => {
      const response = ResponseFormatter.success({}, 'Test');
      const body = JSON.parse(response.body);
      
      expect(body.meta).toBeDefined();
      expect(body.meta.timestamp).toBeDefined();
      expect(body.meta.requestId).toBeDefined();
      expect(body.meta.requestId).toMatch(/^req_/);
    });

    it('should include CORS headers', () => {
      const response = ResponseFormatter.success({});
      
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);
    });
  });

  describe('created()', () => {
    it('should format created response with 201 status', () => {
      const data = { id: 'prod_123', name: 'New Product' };
      const response = ResponseFormatter.created(data, 'Product created');
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data).toEqual(data);
    });

    it('should use default message if not provided', () => {
      const response = ResponseFormatter.created({});
      const body = JSON.parse(response.body);
      
      expect(body.message).toBe('Resource created successfully');
    });
  });

  describe('noContent()', () => {
    it('should format no content response with 204 status', () => {
      const response = ResponseFormatter.noContent();
      
      expect(response.statusCode).toBe(204);
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    it('should not include body for 204 response', () => {
      const response = ResponseFormatter.noContent();
      
      expect(response.body).toBeUndefined();
    });
  });

  describe('error()', () => {
    it('should format error response', () => {
      const response = ResponseFormatter.error(
        'PRODUCT_NOT_FOUND',
        'Product not found',
        404
      );
      
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('error');
      expect(body.code).toBe('PRODUCT_NOT_FOUND');
      expect(body.message).toBe('Product not found');
    });

    it('should use default status code if not provided', () => {
      const response = ResponseFormatter.error('ERROR_CODE', 'Error');
      
      expect(response.statusCode).toBe(400);
    });

    it('should include details if provided', () => {
      const details = [{ field: 'name', issue: 'Required' }];
      const response = ResponseFormatter.error(
        'VALIDATION_ERROR',
        'Invalid data',
        400,
        details
      );
      
      const body = JSON.parse(response.body);
      expect(body.details).toEqual(details);
    });

    it('should not include details if empty', () => {
      const response = ResponseFormatter.error(
        'ERROR',
        'Error message',
        400,
        []
      );
      
      const body = JSON.parse(response.body);
      expect(body.details).toBeUndefined();
    });
  });

  describe('paginated()', () => {
    it('should format paginated response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const response = ResponseFormatter.paginated(items, 1, 20, 50);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('success');
      expect(body.data).toEqual(items);
      expect(body.pagination).toBeDefined();
    });

    it('should calculate pagination metadata correctly', () => {
      const response = ResponseFormatter.paginated([], 1, 20, 100);
      
      const body = JSON.parse(response.body);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(20);
      expect(body.pagination.total).toBe(100);
      expect(body.pagination.pages).toBe(5);
      expect(body.pagination.hasNextPage).toBe(true);
      expect(body.pagination.hasPrevPage).toBe(false);
    });

    it('should set hasNextPage to false on last page', () => {
      const response = ResponseFormatter.paginated([], 5, 20, 100);
      
      const body = JSON.parse(response.body);
      expect(body.pagination.hasNextPage).toBe(false);
      expect(body.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('formatProduct()', () => {
    it('should format product from database', () => {
      const dbProduct = {
        id: 'prod_123',
        name: 'Test Product',
        categoryId: 'cat_1',
        categoryName: 'Vegetables',
        basePrice: 50,
        stock: 100,
        status: 'in-stock',
        variants: [],
        images: [],
        tags: [],
        onB2C: true,
        isActive: true,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      };
      
      const formatted = ResponseFormatter.formatProduct(dbProduct);
      
      expect(formatted.id).toBe('prod_123');
      expect(formatted.name).toBe('Test Product');
      expect(formatted.categoryName).toBe('Vegetables');
      expect(formatted.basePrice).toBe(50);
      expect(formatted.status).toBe('in-stock');
    });

    it('should provide default values for optional fields', () => {
      const dbProduct = {
        id: 'prod_123',
        name: 'Test Product'
      };
      
      const formatted = ResponseFormatter.formatProduct(dbProduct);
      
      expect(formatted.description).toBe('');
      expect(formatted.variants).toEqual([]);
      expect(formatted.images).toEqual([]);
      expect(formatted.tags).toEqual([]);
      expect(formatted.onB2C).toBe(true);
      expect(formatted.isActive).toBe(true);
    });

    it('should return null for null input', () => {
      const formatted = ResponseFormatter.formatProduct(null);
      
      expect(formatted).toBeNull();
    });

    it('should format variants array', () => {
      const dbProduct = {
        id: 'prod_123',
        name: 'Test Product',
        variants: [
          {
            id: 'var_1',
            name: '1 KG',
            b2cQty: 1,
            b2cUnit: 'kg',
            salePrice: 50
          }
        ]
      };
      
      const formatted = ResponseFormatter.formatProduct(dbProduct);
      
      expect(formatted.variants).toHaveLength(1);
      expect(formatted.variants[0].id).toBe('var_1');
    });
  });

  describe('formatVariant()', () => {
    it('should format variant object', () => {
      const variant = {
        id: 'var_1',
        name: '1 KG',
        b2cQty: 1,
        b2cUnit: 'kg',
        salePrice: 50,
        stock: 100
      };
      
      const formatted = ResponseFormatter.formatVariant(variant);
      
      expect(formatted.id).toBe('var_1');
      expect(formatted.name).toBe('1 KG');
      expect(formatted.salePrice).toBe(50);
    });

    it('should provide default values', () => {
      const variant = { id: 'var_1', name: 'Test' };
      const formatted = ResponseFormatter.formatVariant(variant);
      
      expect(formatted.stock).toBe(0);
      expect(formatted.onB2C).toBe(true);
      expect(formatted.images).toEqual([]);
    });

    it('should return null for null input', () => {
      const formatted = ResponseFormatter.formatVariant(null);
      
      expect(formatted).toBeNull();
    });
  });

  describe('generateRequestId()', () => {
    it('should generate unique request IDs', () => {
      const id1 = ResponseFormatter.generateRequestId();
      const id2 = ResponseFormatter.generateRequestId();
      
      expect(id1).toMatch(/^req_/);
      expect(id2).toMatch(/^req_/);
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp in request ID', () => {
      const id = ResponseFormatter.generateRequestId();
      const parts = id.split('_');
      
      expect(parts[0]).toBe('req');
      expect(Number(parts[1])).toBeGreaterThan(0);
    });
  });
});

