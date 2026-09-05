import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import env from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Signs a payload into a JWT token using the configured secret and expiry.
 * @param payload Object containing userId, email, and role
 * @returns string Signed JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

/**
 * Verifies and decodes a signed JWT token.
 * Throws JsonWebTokenError or TokenExpiredError if invalid.
 * @param token Raw JWT token string
 * @returns JwtPayload Decoded token claims
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
