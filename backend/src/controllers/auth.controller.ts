import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';

export class AuthController {
  /**
   * POST /api/v1/auth/signup
   */
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      sendCreated(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/password
   */
  async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await authService.updatePassword(userId, req.body);
      sendSuccess(res, result, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getCurrentUser(userId);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
