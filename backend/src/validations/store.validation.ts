import { z } from 'zod';
import { nameValidation, addressValidation, emailValidation } from './auth.validation';

/**
 * Store creation schema (Admin only)
 */
export const createStoreSchema = {
  body: z.object({
    name: nameValidation,
    email: emailValidation.optional().nullable(),
    address: z.string().min(1, 'Address is required').max(400, 'Address must not exceed 400 characters').trim(),
    ownerId: z.string().uuid('Invalid owner ID format').optional().nullable(),
  }),
};

/**
 * Store list / search query filters schema
 */
export const listStoresQuerySchema = {
  query: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    sort: z.enum(['name', 'address', 'rating', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
};

/**
 * Store ID route parameter schema
 */
export const storeIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid store ID format'),
  }),
};
