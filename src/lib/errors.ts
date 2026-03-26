/**
 * Centralized error handling for FootLineBot
 * 
 * Provides standardized error classes and error codes
 * for consistent error handling across the application.
 */

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
  // User errors (1000-1999)
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DUPLICATE_USER: 'DUPLICATE_USER',
  INVALID_USER_DATA: 'INVALID_USER_DATA',
  
  // Group errors (2000-2999)
  GROUP_NOT_FOUND: 'GROUP_NOT_FOUND',
  DUPLICATE_GROUP: 'DUPLICATE_GROUP',
  GROUP_NOT_REGISTERED: 'GROUP_NOT_REGISTERED',
  NOT_GROUP_MEMBER: 'NOT_GROUP_MEMBER',
  NOT_GROUP_ADMIN: 'NOT_GROUP_ADMIN',
  
  // Event errors (3000-3999)
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_FULL: 'EVENT_FULL',
  EVENT_CLOSED: 'EVENT_CLOSED',
  EVENT_EXPIRED: 'EVENT_EXPIRED',
  INVALID_EVENT_DATA: 'INVALID_EVENT_DATA',
  
  // Registration errors (4000-4999)
  REGISTRATION_NOT_FOUND: 'REGISTRATION_NOT_FOUND',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  NOT_REGISTERED: 'NOT_REGISTERED',
  WAITLIST_FULL: 'WAITLIST_FULL',
  
  // LINE API errors (5000-5999)
  LINE_API_ERROR: 'LINE_API_ERROR',
  LINE_INVALID_SIGNATURE: 'LINE_INVALID_SIGNATURE',
  LINE_PROFILE_NOT_FOUND: 'LINE_PROFILE_NOT_FOUND',
  LINE_RATE_LIMITED: 'LINE_RATE_LIMITED',
  
  // Authentication errors (6000-6999)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  
  // System errors (9000-9999)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================================================
// Application Error Class
// ============================================================================

export interface AppErrorOptions {
  statusCode?: number;
  code?: ErrorCode;
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public statusCode: number;
  public code?: ErrorCode;
  public cause?: unknown;
  public details?: Record<string, unknown>;
  public timestamp: string;

  constructor(
    message: string,
    options: AppErrorOptions = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = options.statusCode || 500;
    this.code = options.code;
    this.cause = options.cause;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
    };
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, options?: AppErrorOptions) {
    const message = id 
      ? `${resource} not found: ${id}` 
      : `${resource} not found`;
    super(message, { statusCode: 404, ...options });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', options?: AppErrorOptions) {
    super(message, { statusCode: 401, code: ErrorCodes.UNAUTHORIZED, ...options });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', options?: AppErrorOptions) {
    super(message, { statusCode: 403, code: ErrorCodes.FORBIDDEN, ...options });
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, { statusCode: 409, ...options });
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string, 
    details?: Record<string, unknown>,
    options?: AppErrorOptions
  ) {
    super(message, { 
      statusCode: 400, 
      code: ErrorCodes.VALIDATION_ERROR,
      details,
      ...options 
    });
    this.name = 'ValidationError';
  }
}

export class LineApiError extends AppError {
  constructor(
    message: string,
    originalError?: unknown,
    options?: AppErrorOptions
  ) {
    super(message, { 
      statusCode: 502, 
      code: ErrorCodes.LINE_API_ERROR,
      cause: originalError,
      ...options 
    });
    this.name = 'LineApiError';
  }
}

// ============================================================================
// Error Handlers
// ============================================================================

/**
 * Handle Prisma errors and convert them to AppErrors
 */
export function handlePrismaError(error: any): never {
  const prismaCode = error?.code;
  
  switch (prismaCode) {
    case 'P2002': // Unique constraint failed
      throw new ConflictError('Resource already exists', {
        code: ErrorCodes.DUPLICATE_USER,
      });
    
    case 'P2025': // Record not found
      throw new NotFoundError('Record');
    
    case 'P2003': // Foreign key constraint failed
      throw new ValidationError('Related resource not found', {
        code: ErrorCodes.GROUP_NOT_FOUND,
      });
    
    default:
      throw new AppError('Database operation failed', {
        statusCode: 500,
        code: ErrorCodes.DATABASE_ERROR,
        cause: error,
      });
  }
}

/**
 * Handle LINE API errors and convert them to AppErrors
 */
export function handleLineApiError(error: any): never {
  const status = error?.status || error?.statusCode;
  
  switch (status) {
    case 401:
      throw new LineApiError('LINE API authentication failed. Check access token.', error);
    
    case 403:
      throw new LineApiError('LINE API permission denied. Check bot permissions.', error);
    
    case 404:
      throw new LineApiError('Resource not found in LINE API', error, {
        code: ErrorCodes.LINE_PROFILE_NOT_FOUND,
      });
    
    case 429:
      throw new LineApiError('LINE API rate limit exceeded', error, {
        code: ErrorCodes.LINE_RATE_LIMITED,
      });
    
    default:
      throw new LineApiError(`LINE API error: ${error?.message || 'Unknown error'}`, error);
  }
}

/**
 * Global error handler for API routes
 */
export function handleApiError(error: unknown): {
  status: number;
  body: { success: boolean; error: string; code?: string };
} {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: error.message,
        code: error.code,
      },
    };
  }
  
  // Unknown error - log and return generic 500
  console.error('Unhandled API error:', error);
  return {
    status: 500,
    body: {
      success: false,
      error: 'Internal server error',
      code: ErrorCodes.INTERNAL_ERROR,
    },
  };
}

export default AppError;
