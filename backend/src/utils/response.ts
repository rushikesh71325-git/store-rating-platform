import { Response } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fields?: Record<string, string>;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', fields?: Record<string, string>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard Success Response (200 OK)
 */
export function sendSuccess<T>(res: Response, data: T, message?: string, meta?: any): Response {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
}

/**
 * Standard Resource Created Response (201 Created)
 */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standard Error Response
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code = 'ERROR',
  fields?: Record<string, string>
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
    },
  });
}
