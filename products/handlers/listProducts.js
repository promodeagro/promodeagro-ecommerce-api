/**
 * List Products Handler
 * GET /product
 * Enhanced with pagination, filtering, and sorting
 */

const ProductService = require('../services/productService');
const ResponseFormatter = require('../utils/responseFormatter');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');

module.exports.handler = async (event) => {
  const startTime = Date.now();

  try {
    Logger.logRequest('GET', '/product', event.queryStringParameters);

    // Parse query parameters
    const params = event.queryStringParameters || {};
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    // Parse filters
    const filters = {};
    if (params.category) filters.category = params.category;
    if (params.status) filters.status = params.status;
    if (params.minPrice) filters.minPrice = parseFloat(params.minPrice);
    if (params.maxPrice) filters.maxPrice = parseFloat(params.maxPrice);

    // Get products from service
    const result = await ProductService.getAllProducts({
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      lastEvaluatedKey: params.lastEvaluatedKey ? JSON.parse(params.lastEvaluatedKey) : undefined,
    });

    // Format products
    const formattedProducts = (result.items || []).map(product => 
      ResponseFormatter.formatProduct(product)
    );

    // Calculate total (approximate based on scan count)
    const total = result.scannedCount || 0;

    // Format paginated response
    const response = ResponseFormatter.paginated(
      formattedProducts,
      page,
      limit,
      total,
      'Products retrieved successfully'
    );

    const duration = Date.now() - startTime;
    Logger.logResponse('GET', '/product', 200, duration);

    return response;

  } catch (error) {
    Logger.error('Error listing products', error, event.queryStringParameters);
    return ErrorHandler.handleDatabaseError(error);
  }
};

