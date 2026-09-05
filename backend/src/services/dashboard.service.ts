import prisma from '../db';

export class DashboardService {
  /**
   * Get Admin Platform Overview Metrics
   */
  async getAdminStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  /**
   * Get Store Owner Reputation Metrics and Raters List
   */
  async getStoreOwnerStats(ownerId: string) {
    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    let totalRatingsCount = 0;
    let totalRatingsSum = 0;

    const formattedStores = stores.map((store) => {
      const storeRatingCount = store.ratings.length;
      const storeRatingSum = store.ratings.reduce((acc, r) => acc + r.value, 0);
      const storeAvgRating =
        storeRatingCount > 0 ? Number((storeRatingSum / storeRatingCount).toFixed(2)) : null;

      totalRatingsCount += storeRatingCount;
      totalRatingsSum += storeRatingSum;

      const raters = store.ratings.map((rating) => ({
        ratingId: rating.id,
        value: rating.value,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        user: {
          id: rating.user.id,
          name: rating.user.name,
          email: rating.user.email,
        },
      }));

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ratingCount: storeRatingCount,
        averageRating: storeAvgRating,
        raters,
      };
    });

    const overallAverageRating =
      totalRatingsCount > 0 ? Number((totalRatingsSum / totalRatingsCount).toFixed(2)) : null;

    return {
      stores: formattedStores,
      totalStores: stores.length,
      totalRatingsReceived: totalRatingsCount,
      overallAverageRating,
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
