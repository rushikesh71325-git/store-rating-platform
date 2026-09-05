import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  /**
   * GET /api/v1/admin/dashboard
   */
  async getAdminStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getAdminStats();
      sendSuccess(res, stats, 'Admin dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/store-owner/dashboard
   */
  async getStoreOwnerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const stats = await dashboardService.getStoreOwnerStats(ownerId);
      sendSuccess(res, stats, 'Store owner dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
export default dashboardController;
