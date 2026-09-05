import prisma from '../db';
import { AppError } from '../utils/response';

export class RatingService {
  /**
   * Submit or update a 1-5 rating for a store (Normal User only)
   */
  async upsertRating(userId: string, storeId: string, value: number) {
    // 1. Verify that the store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }

    // 2. Perform atomic database upsert using compound unique key (userId, storeId)
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        value,
      },
      create: {
        userId,
        storeId,
        value,
      },
    });

    // 3. Recalculate store's overall aggregate rating and count
    const aggregate = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { value: true },
      _count: { value: true },
    });

    const averageRating = aggregate._avg.value ? Number(aggregate._avg.value.toFixed(2)) : null;
    const ratingCount = aggregate._count.value;

    return {
      rating,
      storeStats: {
        storeId,
        averageRating,
        ratingCount,
      },
    };
  }
}

export const ratingService = new RatingService();
export default ratingService;
