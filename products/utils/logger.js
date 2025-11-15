/**
 * Logger Utility
 * Provides consistent logging across all product APIs
 */

class Logger {
  static LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
  };

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {string} - Formatted log message
   */
  static formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    return `[${timestamp}] [${level}] ${message} ${dataStr}`;
  }

  /**
   * Log error
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or data
   * @param {Object} context - Additional context
   */
  static error(message, error, context = {}) {
    const data = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    console.error(this.formatMessage(this.LOG_LEVELS.ERROR, message, data));
  }

  /**
   * Log warning
   * @param {string} message - Warning message
   * @param {Object} data - Additional data
   */
  static warn(message, data = {}) {
    console.warn(this.formatMessage(this.LOG_LEVELS.WARN, message, data));
  }

  /**
   * Log info
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   */
  static info(message, data = {}) {
    console.log(this.formatMessage(this.LOG_LEVELS.INFO, message, data));
  }

  /**
   * Log debug
   * @param {string} message - Debug message
   * @param {Object} data - Additional data
   */
  static debug(message, data = {}) {
    if (process.env.DEBUG === 'true') {
      console.debug(this.formatMessage(this.LOG_LEVELS.DEBUG, message, data));
    }
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {Object} data - Request data
   */
  static logRequest(method, path, data = {}) {
    this.info(`${method} ${path}`, data);
  }

  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {number} statusCode - HTTP status code
   * @param {number} duration - Request duration in ms
   */
  static logResponse(method, path, statusCode, duration) {
    this.info(`${method} ${path} - ${statusCode} (${duration}ms)`, { statusCode, duration });
  }

  /**
   * Log database operation
   * @param {string} operation - Operation name
   * @param {string} table - Table name
   * @param {Object} params - Operation parameters
   */
  static logDatabaseOperation(operation, table, params = {}) {
    this.debug(`Database: ${operation} on ${table}`, params);
  }

  /**
   * Log validation
   * @param {string} context - Validation context
   * @param {Array} errors - Validation errors
   */
  static logValidation(context, errors = []) {
    if (errors.length > 0) {
      this.warn(`Validation failed: ${context}`, { errors });
    }
  }
}

module.exports = Logger;

