import { z } from 'zod';
import { Role } from '@prisma/client';
import { nameValidation, emailValidation, passwordValidation, addressValidation } from './auth.validation';

/**
 * Admin create user schema
 */
export const createUserSchema = {
  body: z.object({
    name: nameValidation,
    email: emailValidation,
    password: passwordValidation,
    address: addressValidation,
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: 'Role must be ADMIN, NORMAL_USER, or STORE_OWNER' }),
    }),
  }),
};

/**
 * Admin list users query filters schema
 */
export const listUsersQuerySchema = {
  query: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    sort: z.enum(['name', 'email', 'address', 'role', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
};

/**
 * User ID route parameter schema
 */
export const userIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
};
