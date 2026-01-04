const logger = require('../config/logger');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Prisma errors
  if (err.code === 'P2002') {
    return errorResponse(
      res,
      'DUPLICATE_ENTRY',
      'A record with this value already exists',
      409
    );
  }

  if (err.code === 'P2025') {
    return errorResponse(
      res,
      'NOT_FOUND',
      'The requested record was not found',
      404
    );
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(
      res,
      'VALIDATION_ERROR',
      err.message,
      400,
      err.details
    );
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(
    res,
    err.code || 'INTERNAL_ERROR',
    message,
    statusCode
  );
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    'NOT_FOUND',
    `Route ${req.originalUrl} not found`,
    404
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
};

