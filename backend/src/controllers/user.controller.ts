import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { sendSuccess, sendCreated } from '../utils/response';

export class UserController {
  /**
   * POST /api/v1/users
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      sendCreated(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getUsers(req.query as any);
      sendSuccess(res, result.users, 'Users retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      sendSuccess(res, user, 'User details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
export default userController;
