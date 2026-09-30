// src/shared/errors/index.ts
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500, public code: string = 'INTERNAL_ERROR', public details?: any) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError { constructor(message: string, details?: any) { super(message, 400, 'VALIDATION_ERROR', details); this.name = 'ValidationError'; } }
export class AuthenticationError extends AppError { constructor(message = 'Authentication required') { super(message, 401, 'AUTHENTICATION_ERROR'); this.name = 'AuthenticationError'; } }
export class AuthorizationError extends AppError { constructor(message = 'Insufficient permissions') { super(message, 403, 'AUTHORIZATION_ERROR'); this.name = 'AuthorizationError'; } }
export class NotFoundError extends AppError { constructor(resource = 'Resource') { super(`${resource} not found`, 404, 'NOT_FOUND'); this.name = 'NotFoundError'; } }
export class RateLimitError extends AppError { constructor(message: string, public retryAfter?: number) { super(message, 429, 'RATE_LIMIT_EXCEEDED'); this.name = 'RateLimitError'; } }
export class ConflictError extends AppError { constructor(message: string) { super(message, 409, 'CONFLICT'); this.name = 'ConflictError'; } }
export class BadRequestError extends AppError { constructor(message: string) { super(message, 400, 'BAD_REQUEST'); this.name = 'BadRequestError'; } }
export class ServiceUnavailableError extends AppError { constructor(message = 'Service temporarily unavailable') { super(message, 503, 'SERVICE_UNAVAILABLE'); this.name = 'ServiceUnavailableError'; } }
export class ExternalServiceError extends AppError { constructor(service: string, originalError: Error) { super(`${service} error: ${originalError.message}`, 502, 'EXTERNAL_SERVICE_ERROR', { service, originalMessage: originalError.message }); this.name = 'ExternalServiceError'; } }