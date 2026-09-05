import { Request, Response, NextFunction } from 'express';
import ratingService from '../services/rating.service';
import { sendSuccess } from '../utils/response';

export class RatingController {
  /**
   * POST /api/v1/stores/:id/ratings
   */
  async upsertRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const storeId = req.params.id;
      const { value } = req.body;

      const result = await ratingService.upsertRating(userId, storeId, value);
      sendSuccess(res, result, 'Rating submitted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const ratingController = new RatingController();
export default ratingController;
