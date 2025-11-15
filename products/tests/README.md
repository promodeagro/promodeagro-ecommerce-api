# Product API Tests

Comprehensive test suite for the Product API including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/
│   ├── errorHandler.test.js ................. 15+ test cases
│   ├── responseFormatter.test.js ........... 20+ test cases
│   ├── unitConverter.test.js .............. 25+ test cases
│   ├── productValidator.test.js ........... 30+ test cases
│   └── productService.test.js ............. 35+ test cases
├── integration/
│   ├── createProduct.integration.test.js .. 30+ test cases
│   ├── listProducts.integration.test.js ... 25+ test cases
│   ├── getProductById.integration.test.js . 20+ test cases
│   ├── updateProduct.integration.test.js .. 25+ test cases
│   └── deleteProduct.integration.test.js .. 15+ test cases
├── e2e/
│   └── products.e2e.test.js ............... 40+ test cases
├── jest.config.js .......................... Jest configuration
├── setup.js ............................... Test setup & mocks
└── README.md .............................. This file
```

## Running Tests

### Run All Tests
```bash
npm test -- products/tests
```

### Run Tests by Type
```bash
# Unit tests only
npm test -- products/tests/unit

# Integration tests only
npm test -- products/tests/integration

# E2E tests only
npm test -- products/tests/e2e
```

### Run Specific Test File
```bash
npm test -- products/tests/unit/errorHandler.test.js
```

### Run Tests with Coverage
```bash
npm test -- products/tests --coverage
```

### Watch Mode
```bash
npm test -- products/tests --watch
```

## Test Coverage

- **Unit Tests**: 125+ test cases
  - Error handling, response formatting, validation, service logic, unit conversion

- **Integration Tests**: 115+ test cases
  - Handler integration with services and database, error scenarios, response formats

- **E2E Tests**: 40+ test cases
  - Complete workflows, cross-module interactions

**Total Test Cases**: 280+

**Coverage Target**: 80%+ for lines and functions

## Test Organization

### Unit Tests (`unit/`)

Each utility and service has dedicated unit tests covering:
- Valid inputs and happy paths
- Edge cases and boundary conditions
- Error handling
- Input validation
- Data transformation

**Files:**
1. **errorHandler.test.js** (15 tests)
   - Error code mapping
   - Error formatting
   - Database error handling
   - Custom error responses

2. **responseFormatter.test.js** (20 tests)
   - Success responses (200, 201)
   - Error responses
   - Pagination formatting
   - Product formatting
   - Metadata generation

3. **unitConverter.test.js** (25 tests)
   - Weight conversions (kg ↔ g)
   - Volume conversions (L ↔ ml)
   - Unit validation
   - Conversion factors
   - Edge cases (zero, negative, invalid)

4. **productValidator.test.js** (30 tests)
   - Product input validation
   - Product name validation
   - Price validation
   - Variant validation
   - Update data validation
   - URL validation

5. **productService.test.js** (35 tests)
   - Product status calculation
   - Product creation with mocking
   - Variant creation and pricing
   - Product updates
   - Product deletion (soft/hard)
   - CRUD operations
   - Database queries

### Integration Tests (`integration/`)

Handler integration tests covering:
- Complete request/response cycles
- Handler + Service + Database interactions
- Error scenarios and validation
- Response format verification

**Files:**
1. **createProduct.integration.test.js** (30 tests)
   - Product creation with variants
   - Status calculation
   - Validation errors
   - Category lookup
   - Database save
   - Error responses

2. **listProducts.integration.test.js** (25 tests)
   - Product listing
   - Pagination
   - Filtering
   - Sorting
   - Response format

3. **getProductById.integration.test.js** (20 tests)
   - Single product retrieval
   - Not found handling
   - Response format
   - Deleted product handling

4. **updateProduct.integration.test.js** (25 tests)
   - Product updates
   - Partial updates
   - Status recalculation
   - Version tracking
   - Validation errors

5. **deleteProduct.integration.test.js** (15 tests)
   - Soft delete
   - Hard delete
   - Product existence check
   - Constraint validation
   - 204 response

### E2E Tests (`e2e/`)

End-to-end workflow tests covering:
- Complete user journeys
- Multi-step operations
- Cross-module interactions
- Performance considerations

## Test Features

✅ **Comprehensive Coverage**
- Happy path scenarios
- Error conditions
- Edge cases
- Boundary conditions

✅ **Mocking**
- DynamoDB operations mocked
- External service calls mocked
- Database queries isolated

✅ **Assertions**
- Response status codes
- Response body structure
- Data transformations
- Error messages

✅ **Performance**
- Tests run in parallel
- Jest configuration optimized
- Fast test execution

## Mock Data

Tests use realistic mock data:
- Product IDs: `prod_123`, `prod_abc123`
- Category IDs: `cat_1`, `cat_2`
- User IDs: `user_123`
- Prices: Positive numbers (50, 99.99, etc.)
- Stock quantities: Non-negative integers
- Valid units: kg, g, l, ml

## Best Practices Used

1. **Isolation**: Each test is independent
2. **Clarity**: Clear test names describing what's being tested
3. **Arrangement**: Arrange-Act-Assert pattern
4. **Mocking**: External dependencies mocked
5. **Coverage**: Comprehensive scenario coverage
6. **Maintainability**: Well-organized, easy to update

## Running Tests in CI/CD

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- products/tests --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

```bash
# Run single test file with verbose output
npm test -- products/tests/unit/errorHandler.test.js --verbose

# Run tests with stack traces
npm test -- products/tests --verbose

# Debug specific test
npm test -- products/tests/unit/errorHandler.test.js -t "should handle validation error"
```

## Adding New Tests

1. Create test file in appropriate directory (unit/integration/e2e)
2. Import required modules and utilities
3. Use consistent naming pattern: `describe` → `it`
4. Mock external dependencies
5. Follow Arrange-Act-Assert pattern
6. Ensure test name describes the scenario

Example:
```javascript
describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create product successfully with valid data', async () => {
    // Arrange
    const productData = { name: 'Test', categoryId: 'cat_1', basePrice: 50 };
    
    // Act
    const result = await ProductService.createProduct(productData);
    
    // Assert
    expect(result.id).toBeDefined();
  });
});
```

## Test Results

**Expected Results**: ✅ All tests passing
**Coverage Target**: 80%+
**Execution Time**: < 30 seconds for full suite

---

**Last Updated**: January 20, 2024  
**Test Suite Version**: 1.0  
**Total Test Cases**: 280+

