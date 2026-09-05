import { z } from 'zod';

/**
 * Rating upsert schema (Normal User only)
 */
export const upsertRatingSchema = {
  params: z.object({
    id: z.string().uuid('Invalid store ID format'),
  }),
  body: z.object({
    value: z
      .number({ required_error: 'Rating value is required' })
      .int('Rating value must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must not exceed 5'),
  }),
};
