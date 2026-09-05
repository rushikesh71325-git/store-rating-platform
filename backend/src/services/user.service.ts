import { Prisma, Role } from '@prisma/client';
import prisma from '../db';
import { hashPassword } from '../utils/password';
import { AppError } from '../utils/response';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  address?: string | null;
  role: Role;
}

export interface ListUsersQuery {
  name?: string;
  email?: string;
  address?: string;
  role?: Role;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * Create a user (Admin only)
   */
  async createUser(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS', {
        email: 'Email is already registered',
      });
    }

    const passwordHash = await hashPassword(input.password);

    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        address: input.address || null,
        role: input.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * List users with search filters, sorting, and pagination
   */
  async getUsers(query: ListUsersQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.address) {
      where.address = { contains: query.address, mode: 'insensitive' };
    }
    if (query.role) {
      where.role = query.role;
    }

    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order || 'desc';

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get user details by ID (includes store rating if Store Owner)
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        storesOwned: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: {
                value: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // If user is a Store Owner, compute store ratings
    let storeOwnerDetails = null;
    if (user.role === Role.STORE_OWNER) {
      const stores = user.storesOwned.map((store) => {
        const ratingCount = store.ratings.length;
        const avgRating =
          ratingCount > 0
            ? Number((store.ratings.reduce((acc, r) => acc + r.value, 0) / ratingCount).toFixed(2))
            : null;

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          ratingCount,
          averageRating: avgRating,
        };
      });

      storeOwnerDetails = { stores };
    }

    const { storesOwned, ...userBase } = user;
    return {
      ...userBase,
      ...(storeOwnerDetails ? { storeOwnerDetails } : {}),
    };
  }
}

export const userService = new UserService();
export default userService;
