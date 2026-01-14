/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

/**
 * Forbidden error class (alias for AuthorizationError)
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN_ERROR");
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

/**
 * Database error class
 */
export class DatabaseError extends AppError {
  constructor(message = "Database error") {
    super(message, 500, "DATABASE_ERROR");
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends AppError {
  constructor(message = "External service error", service = null) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR");
    this.service = service;
  }
}

/**
 * Handle Sequelize validation errors
 */
export const handleSequelizeError = (error) => {
  if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    return new ValidationError("Validation failed", errors);
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    const field = error.errors[0]?.path || "field";
    return new ConflictError(`${field} already exists`);
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    console.error("💥 Foreign Key Constraint Error:", {
      message: error.message,
      table: error.table,
      fields: error.fields,
      value: error.value,
      index: error.index,
      reltype: error.reltype,
      parent: error.parent
    });
    return new ValidationError("Invalid reference to related resource");
  }

  if (error.name === "SequelizeDatabaseError") {
    // Log detailed error for debugging
    console.error("💥 SequelizeDatabaseError:", {
      message: error.message,
      sql: error.sql,
      parameters: error.parameters,
      original: error.original?.message,
    });
    return new DatabaseError(
      error.original?.message || error.message || "Database operation failed"
    );
  }

  return error;
};

/**
 * Handle JWT errors
 */
export const handleJWTError = (error) => {
  if (error.name === "JsonWebTokenError") {
    return new AuthenticationError("Invalid token");
  }

  if (error.name === "TokenExpiredError") {
    return new AuthenticationError("Token expired");
  }

  if (error.name === "NotBeforeError") {
    return new AuthenticationError("Token not active");
  }

  return error;
};

/**
 * Handle multer errors
 */
export const handleMulterError = (error) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new ValidationError("File too large");
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return new ValidationError("Too many files");
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return new ValidationError("Unexpected file field");
  }

  return error;
};

/**
 * Create error response object
 */
export const createErrorResponse = (error, includeStack = false) => {
  const response = {
    status: error.status || "error",
    message: error.message,
    code: error.code || null,
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  if (error.service) {
    response.service = error.service;
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

/**
 * Log error with context
 */
export const logError = (error, context = {}) => {
  const logData = {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    stack: error.stack,
    ...context,
  };

  if (error.statusCode >= 500) {
    console.error("Server Error:", logData);
  } else {
    console.warn("Client Error:", logData);
  }
};

/**
 * Async error handler wrapper
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (error, req, res, next) => {
  // Handle known error types
  let err = error;

  if (error.name?.startsWith("Sequelize")) {
    err = handleSequelizeError(error);
  } else if (
    error.name?.includes("JsonWebToken") ||
    error.name?.includes("Token")
  ) {
    err = handleJWTError(error);
  } else if (error.code?.startsWith("LIMIT_")) {
    err = handleMulterError(error);
  }

  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error
  logError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
  });

  // Send error response
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorResponse = createErrorResponse(err, isDevelopment);

  res.status(err.statusCode).json(errorResponse);
};
