/**
 * DynamoDB Connection and Utilities
 * Handles connection pooling, retries, and error handling for DynamoDB operations
 */

const AWS = require('aws-sdk');

class DynamoDBConnection {
  constructor() {
    // Initialize DynamoDB Document Client
    const config = {
      region: process.env.REGION || process.env.AWS_REGION || 'ap-south-1',
      convertEmptyValues: true,
    };

    // Use custom endpoint only if explicitly set (for LocalStack/local development)
    if (process.env.DYNAMODB_ENDPOINT && process.env.DYNAMODB_ENDPOINT.trim()) {
      config.endpoint = process.env.DYNAMODB_ENDPOINT;
    }

    this.documentClient = new AWS.DynamoDB.DocumentClient(config);

    // Configuration
    this.maxRetries = 3;
    this.retryDelay = 100; // milliseconds
  }

  /**
   * Get single instance (singleton pattern)
   */
  static getInstance() {
    if (!DynamoDBConnection.instance) {
      DynamoDBConnection.instance = new DynamoDBConnection();
    }
    return DynamoDBConnection.instance;
  }

  /**
   * Execute query with retry logic
   * @param {Function} operation - Query operation to execute
   * @param {number} attempt - Current attempt number
   * @returns {Promise} - Query result
   */
  async executeWithRetry(operation, attempt = 0) {
    try {
      return await operation();
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} - True if retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'ProvisionedThroughputExceededException',
      'ThrottlingException',
      'RequestLimitExceeded',
      'ServiceUnavailable',
      'InternalServerError',
      'RequestTimeout',
    ];
    return retryableErrors.includes(error.code);
  }

  /**
   * Put item in DynamoDB
   * @param {string} tableName - Table name
   * @param {Object} item - Item to put
   * @returns {Promise} - Put operation result
   */
  async put(tableName, item) {
    const params = {
      TableName: tableName,
      Item: item,
    };

    return this.executeWithRetry(() => this.documentClient.put(params).promise());
  }

  /**
   * Get item from DynamoDB
   * @param {string} tableName - Table name
   * @param {Object} key - Item key
   * @returns {Promise} - Get operation result
   */
  async get(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key,
    };

    const result = await this.executeWithRetry(() => this.documentClient.get(params).promise());
    return result.Item;
  }

  /**
   * Update item in DynamoDB
   * @param {string} tableName - Table name
   * @param {Object} key - Item key
   * @param {Object} updates - Updates to apply
   * @returns {Promise} - Update operation result
   */
  async update(tableName, key, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    let expressionIndex = 0;

    for (const [field, value] of Object.entries(updates)) {
      const nameKey = `#field${expressionIndex}`;
      const valueKey = `:val${expressionIndex}`;

      expressionAttributeNames[nameKey] = field;
      expressionAttributeValues[valueKey] = value;
      updateExpressions.push(`${nameKey} = ${valueKey}`);
      expressionIndex++;
    }

    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const result = await this.executeWithRetry(() => this.documentClient.update(params).promise());
    return result.Attributes;
  }

  /**
   * Delete item from DynamoDB
   * @param {string} tableName - Table name
   * @param {Object} key - Item key
   * @returns {Promise} - Delete operation result
   */
  async delete(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key,
    };

    return this.executeWithRetry(() => this.documentClient.delete(params).promise());
  }

  /**
   * Query items from DynamoDB
   * @param {string} tableName - Table name
   * @param {Object} params - Query parameters
   * @returns {Promise} - Query result
   */
  async query(tableName, params) {
    const queryParams = {
      TableName: tableName,
      ...params,
    };

    const result = await this.executeWithRetry(() => 
      this.documentClient.query(queryParams).promise()
    );
    return {
      items: result.Items || [],
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  /**
   * Scan items from DynamoDB
   * @param {string} tableName - Table name
   * @param {Object} params - Scan parameters
   * @returns {Promise} - Scan result
   */
  async scan(tableName, params) {
    const scanParams = {
      TableName: tableName,
      ...params,
    };

    const result = await this.executeWithRetry(() => 
      this.documentClient.scan(scanParams).promise()
    );
    return {
      items: result.Items || [],
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  /**
   * Batch get items
   * @param {string} tableName - Table name
   * @param {Array} keys - Array of keys to get
   * @returns {Promise} - Batch get result
   */
  async batchGet(tableName, keys) {
    const params = {
      RequestItems: {
        [tableName]: {
          Keys: keys,
        },
      },
    };

    const result = await this.executeWithRetry(() => 
      this.documentClient.batchGet(params).promise()
    );
    return result.Responses[tableName] || [];
  }

  /**
   * Batch write items
   * @param {string} tableName - Table name
   * @param {Array} items - Array of items to write
   * @returns {Promise} - Batch write result
   */
  async batchWrite(tableName, items) {
    const writeRequests = items.map(item => ({
      PutRequest: {
        Item: item,
      },
    }));

    const params = {
      RequestItems: {
        [tableName]: writeRequests,
      },
    };

    return this.executeWithRetry(() => 
      this.documentClient.batchWrite(params).promise()
    );
  }

  /**
   * Transact write items
   * @param {Array} transactItems - Array of transact write items
   * @returns {Promise} - Transact write result
   */
  async transactWrite(transactItems) {
    const params = {
      TransactItems: transactItems,
    };

    return this.executeWithRetry(() => 
      this.documentClient.transactWrite(params).promise()
    );
  }
}

// Export singleton instance
module.exports = DynamoDBConnection.getInstance();

