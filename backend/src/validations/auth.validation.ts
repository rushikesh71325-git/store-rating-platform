import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(16, 'Password must not exceed 16 characters')
  .regex(
    passwordRegex,
    'Password must be 8-16 characters and include at least one uppercase letter and one special character'
  );

export const nameValidation = z
  .string()
  .min(10, 'Name must be between 10 and 60 characters')
  .max(60, 'Name must be between 20 and 60 characters')
  .trim();

export const addressValidation = z
  .string()
  .max(400, 'Address must not exceed 400 characters')
  .optional()
  .nullable();

export const emailValidation = z
  .string()
  .email('Please provide a valid email address')
  .max(255, 'Email must not exceed 255 characters')
  .trim()
  .toLowerCase();

/**
 * Normal user self-signup schema
 */
export const signupSchema = {
  body: z.object({
    name: nameValidation,
    email: emailValidation,
    password: passwordValidation,
    address: addressValidation,
  }),
};

/**
 * User login schema (all roles)
 */
export const loginSchema = {
  body: z.object({
    email: emailValidation,
    password: z.string().min(1, 'Password is required'),
  }),
};

/**
 * Authenticated user password update schema
 */
export const updatePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
  }),
};
