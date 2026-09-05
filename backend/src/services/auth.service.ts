import { Role } from '@prisma/client';
import prisma from '../db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/response';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  address?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  /**
   * Register a new Normal User
   */
  async signup(input: SignupInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS', {
        email: 'Email is already registered',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        address: input.address || null,
        role: Role.NORMAL_USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  /**
   * Authenticate user across any role (Admin, Normal User, Store Owner)
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Update password for currently authenticated user
   */
  async updatePassword(userId: string, input: UpdatePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isCurrentValid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new AppError('Current password does not match', 400, 'INVALID_CURRENT_PASSWORD', {
        currentPassword: 'Incorrect current password',
      });
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Get authenticated user profile
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }
}

export const authService = new AuthService();
export default authService;
