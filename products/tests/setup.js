/**
 * Jest Test Setup
 * Global configuration for tests
 */

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error and warn visible during tests
  error: jest.fn(),
  warn: jest.fn(),
  // Suppress other output
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Set test environment
process.env.AWS_REGION = 'ap-south-1';
process.env.NODE_ENV = 'test';

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      get: jest.fn(),
      put: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      query: jest.fn(),
      scan: jest.fn(),
      batchGet: jest.fn(),
      batchWrite: jest.fn(),
      transactWrite: jest.fn(),
    })),
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

