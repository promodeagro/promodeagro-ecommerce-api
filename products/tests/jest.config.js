/**
 * Jest Configuration for Product API Tests
 */

module.exports = {
  displayName: 'products-api-tests',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    '../utils/**/*.js',
    '../services/**/*.js',
    '../database/**/*.js',
    '../handlers/**/*.js',
    '!../handlers/index.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testTimeout: 10000,
  verbose: true,
  bail: false,
};

