import { AppError } from './AppError.js';

export class NotFoundError extends AppError {
  constructor(message: string, errorCode = 'RESOURCE_NOT_FOUND') {
    super(message, 404, errorCode, true);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  public readonly details: any[];

  constructor(message: string, details: any[] = [], errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode, true);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, errorCode = 'UNAUTHORIZED_ACCESS') {
    super(message, 401, errorCode, true);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, errorCode = 'FORBIDDEN_ACCESS') {
    super(message, 403, errorCode, true);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode = 'RESOURCE_CONFLICT') {
    super(message, 409, errorCode, true);
    this.name = 'ConflictError';
  }
}
