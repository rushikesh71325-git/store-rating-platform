import { Prisma, Role } from '@prisma/client';
import prisma from '../db';
import { AppError } from '../utils/response';

export interface CreateStoreInput {
  name: string;
  email?: string | null;
  address: string;
  ownerId?: string | null;
}

export interface ListStoresQuery {
  name?: string;
  address?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class StoreService {
  /**
   * Create a new store (Admin only)
   */
  async createStore(input: CreateStoreInput) {
    if (input.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: input.ownerId },
      });

      if (!owner) {
        throw new AppError('Assigned store owner not found', 404, 'OWNER_NOT_FOUND', {
          ownerId: 'User does not exist',
        });
      }

      if (owner.role !== Role.STORE_OWNER) {
        throw new AppError('Assigned user must have the STORE_OWNER role', 400, 'INVALID_OWNER_ROLE', {
          ownerId: 'User is not a STORE_OWNER',
        });
      }
    }

    return prisma.store.create({
      data: {
        name: input.name,
        email: input.email || null,
        address: input.address,
        ownerId: input.ownerId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * List stores with search, sort, pagination, aggregate average rating, and user's rating
   */
  async getStores(query: ListStoresQuery, currentUserId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {};

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.address) {
      where.address = { contains: query.address, mode: 'insensitive' };
    }

    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order || 'desc';

    // If sorting by standard database columns
    if (sortField !== 'rating') {
      const [total, rawStores] = await Promise.all([
        prisma.store.count({ where }),
        prisma.store.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortField]: sortOrder },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            ratings: {
              select: {
                id: true,
                userId: true,
                value: true,
              },
            },
          },
        }),
      ]);

      const stores = rawStores.map((store) => {
        const ratingCount = store.ratings.length;
        const averageRating =
          ratingCount > 0
            ? Number((store.ratings.reduce((acc, r) => acc + r.value, 0) / ratingCount).toFixed(2))
            : null;

        const userRatingObj = currentUserId ? store.ratings.find((r) => r.userId === currentUserId) : null;

        const { ratings, ...rest } = store;
        return {
          ...rest,
          ratingCount,
          averageRating,
          userRating: userRatingObj ? userRatingObj.value : null,
        };
      });

      return {
        stores,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    // When sorting by computed aggregate rating
    const allMatchingStores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            id: true,
            userId: true,
            value: true,
          },
        },
      },
    });

    const formattedAll = allMatchingStores.map((store) => {
      const ratingCount = store.ratings.length;
      const averageRating =
        ratingCount > 0
          ? Number((store.ratings.reduce((acc, r) => acc + r.value, 0) / ratingCount).toFixed(2))
          : null;

      const userRatingObj = currentUserId ? store.ratings.find((r) => r.userId === currentUserId) : null;

      const { ratings, ...rest } = store;
      return {
        ...rest,
        ratingCount,
        averageRating,
        userRating: userRatingObj ? userRatingObj.value : null,
      };
    });

    formattedAll.sort((a, b) => {
      const ratingA = a.averageRating ?? (sortOrder === 'asc' ? 999 : -1);
      const ratingB = b.averageRating ?? (sortOrder === 'asc' ? 999 : -1);
      if (ratingA === ratingB) {
        return a.name.localeCompare(b.name); // Stable secondary sort per PRD
      }
      return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
    });

    const total = formattedAll.length;
    const paginatedStores = formattedAll.slice(skip, skip + limit);

    return {
      stores: paginatedStores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single store by ID
   */
  async getStoreById(id: string, currentUserId?: string) {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            id: true,
            userId: true,
            value: true,
          },
        },
      },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }

    const ratingCount = store.ratings.length;
    const averageRating =
      ratingCount > 0
        ? Number((store.ratings.reduce((acc, r) => acc + r.value, 0) / ratingCount).toFixed(2))
        : null;

    const userRatingObj = currentUserId ? store.ratings.find((r) => r.userId === currentUserId) : null;

    const { ratings, ...rest } = store;
    return {
      ...rest,
      ratingCount,
      averageRating,
      userRating: userRatingObj ? userRatingObj.value : null,
    };
  }
}

export const storeService = new StoreService();
export default storeService;
