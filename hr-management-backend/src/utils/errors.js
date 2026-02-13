/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    error.statusCode = 409;
    error.errorCode = 'DUPLICATE_ENTRY';
    error.message = 'Duplicate entry detected';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    error.statusCode = 400;
    error.errorCode = 'INVALID_REFERENCE';
    error.message = 'Invalid reference to related data';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    error_code: error.errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};
