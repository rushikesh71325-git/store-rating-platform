import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError, sendError } from '../utils/response';
import env from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Custom Application Operational Errors
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.code, err.fields);
    return;
  }

  // 2. Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    err.errors.forEach((issue) => {
      const fieldPath = issue.path.join('.');
      fields[fieldPath || 'general'] = issue.message;
    });

    sendError(res, 400, 'Validation failed for one or more fields', 'VALIDATION_ERROR', fields);
    return;
  }

  // 3. Prisma Known Request Errors (e.g. Unique constraints, record not found)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      sendError(res, 409, `A record with this ${target} already exists`, 'DUPLICATE_RESOURCE');
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'The requested record was not found', 'NOT_FOUND');
      return;
    }
  }

  // 4. JWT Authentication Errors
  if (err instanceof TokenExpiredError) {
    sendError(res, 401, 'Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
    return;
  }

  if (err instanceof JsonWebTokenError) {
    sendError(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
    return;
  }

  // 5. Unhandled / Internal Server Errors (500)
  console.error('💥 Unhandled Exception:', err);
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';

  sendError(res, 500, message, 'INTERNAL_SERVER_ERROR');
};
