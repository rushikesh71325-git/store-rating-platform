import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with a salt factor of 10.
 * @param password Plaintext password string
 * @returns Promise<string> Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plaintext password with an existing bcrypt hash.
 * @param password Plaintext candidate password string
 * @param hash Stored bcrypt hash string
 * @returns Promise<boolean> True if match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
