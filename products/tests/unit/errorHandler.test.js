/**
 * Error Handler Unit Tests
 * Tests for errorHandler.js utility
 */

const ErrorHandler = require('../../utils/errorHandler');

describe('ErrorHandler', () => {
  describe('ERROR_CODES', () => {
    it('should have validation error codes', () => {
      expect(ErrorHandler.ERROR_CODES.VALIDATION_ERROR).toEqual({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
    });

    it('should have not found error codes', () => {
      expect(ErrorHandler.ERROR_CODES.PRODUCT_NOT_FOUND).toEqual({
        status: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found'
      });
    });

    it('should have conflict error codes', () => {
      expect(ErrorHandler.ERROR_CODES.DUPLICATE_PRODUCT).toEqual({
        status: 409,
        code: 'DUPLICATE_PRODUCT',
        message: 'Product with this name already exists'
      });
    });

    it('should have server error codes', () => {
      expect(ErrorHandler.ERROR_CODES.INTERNAL_ERROR).toEqual({
        status: 500,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      });
    });
  });

  describe('handle()', () => {
    it('should format error with known error code', () => {
      const error = new Error('Test error');
      const response = ErrorHandler.handle(error, 'VALIDATION_ERROR');
      
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.status).toBe('error');
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.message).toBe('Test error');
    });

    it('should use default error code if not found', () => {
      const error = new Error('Test error');
      const response = ErrorHandler.handle(error, 'UNKNOWN_CODE');
      
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(500);
      expect(body.code).toBe('INTERNAL_ERROR');
    });

    it('should include timestamp in response', () => {
      const error = new Error('Test error');
      const response = ErrorHandler.handle(error, 'VALIDATION_ERROR');
      
      const body = JSON.parse(response.body);
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('formatValidationError()', () => {
    it('should format validation errors correctly', () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'price', message: 'Price must be positive' }
      ];
      
      const response = ErrorHandler.formatValidationError(errors);
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(400);
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.errors).toHaveLength(2);
      expect(body.errors[0].field).toBe('name');
    });

    it('should handle empty errors array', () => {
      const response = ErrorHandler.formatValidationError([]);
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(400);
      expect(body.errors).toEqual([]);
    });

    it('should provide default field name', () => {
      const errors = [{ message: 'Error without field' }];
      const response = ErrorHandler.formatValidationError(errors);
      const body = JSON.parse(response.body);
      
      expect(body.errors[0].field).toBe('unknown');
    });
  });

  describe('formatCustomError()', () => {
    it('should format custom error correctly', () => {
      const response = ErrorHandler.formatCustomError(
        'PRODUCT_NOT_FOUND',
        'Product 123 not found',
        [],
        404
      );
      
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(404);
      expect(body.code).toBe('PRODUCT_NOT_FOUND');
      expect(body.message).toBe('Product 123 not found');
    });

    it('should include details if provided', () => {
      const details = [{ reason: 'Product was deleted' }];
      const response = ErrorHandler.formatCustomError(
        'NOT_FOUND',
        'Not found',
        details,
        404
      );
      
      const body = JSON.parse(response.body);
      expect(body.details).toEqual(details);
    });

    it('should not include details if empty', () => {
      const response = ErrorHandler.formatCustomError(
        'NOT_FOUND',
        'Not found',
        [],
        404
      );
      
      const body = JSON.parse(response.body);
      expect(body.details).toBeUndefined();
    });
  });

  describe('handleDatabaseError()', () => {
    it('should handle ValidationException', () => {
      const error = new Error('Invalid data');
      error.code = 'ValidationException';
      
      const response = ErrorHandler.handleDatabaseError(error);
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(400);
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle ResourceNotFoundException', () => {
      const error = new Error('Not found');
      error.code = 'ResourceNotFoundException';
      
      const response = ErrorHandler.handleDatabaseError(error);
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(404);
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should handle ConditionalCheckFailedException', () => {
      const error = new Error('Conflict');
      error.code = 'ConditionalCheckFailedException';
      
      const response = ErrorHandler.handleDatabaseError(error);
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(409);
      expect(body.code).toBe('CONFLICT');
    });

    it('should handle unknown database errors', () => {
      const error = new Error('Unknown error');
      error.code = 'UnknownError';
      
      const response = ErrorHandler.handleDatabaseError(error);
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(500);
      expect(body.code).toBe('DATABASE_ERROR');
    });
  });

  describe('logError()', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    afterEach(() => {
      consoleErrorSpy.mockClear();
    });

    it('should log error to console', () => {
      const error = new Error('Test error');
      ErrorHandler.logError(error, 'TEST_CONTEXT');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include error details in log', () => {
      const error = new Error('Test error');
      ErrorHandler.logError(error, 'TEST_CONTEXT');
      
      const callArgs = consoleErrorSpy.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('message');
      expect(callArgs[1]).toHaveProperty('stack');
    });
  });
});

