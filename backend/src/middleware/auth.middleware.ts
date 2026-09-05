import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/response';

// Augment Express Request interface to include authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware that authenticates incoming requests using JWT Bearer tokens.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Authentication required. No token provided.', 401, 'UNAUTHORIZED');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError('Invalid Authorization header format. Expected Bearer <token>', 401, 'INVALID_TOKEN_FORMAT');
  }

  const token = parts[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error); // Forward TokenExpiredError / JsonWebTokenError to global errorHandler
  }
};

/**
 * Middleware to restrict route access by user role(s).
 * Must be placed AFTER `authenticate` middleware in the route chain.
 * @param allowedRoles List of roles permitted to access the route
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required before checking permissions.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: [${allowedRoles.join(', ')}], your role: ${req.user.role}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};
