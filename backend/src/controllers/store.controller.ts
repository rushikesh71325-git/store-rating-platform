import { Request, Response, NextFunction } from 'express';
import storeService from '../services/store.service';
import { sendSuccess, sendCreated } from '../utils/response';

export class StoreController {
  /**
   * POST /api/v1/stores
   */
  async createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = await storeService.createStore(req.body);
      sendCreated(res, store, 'Store created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/stores
   */
  async getStores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const result = await storeService.getStores(req.query as any, currentUserId);
      sendSuccess(res, result.stores, 'Stores retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/stores/:id
   */
  async getStoreById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const store = await storeService.getStoreById(req.params.id, currentUserId);
      sendSuccess(res, store, 'Store details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();
export default storeController;
