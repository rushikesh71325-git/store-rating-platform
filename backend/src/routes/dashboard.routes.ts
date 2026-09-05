import { Router } from 'express';
import { Role } from '@prisma/client';
import dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/dashboard/admin
 * @desc    Get platform overview stats (total users, stores, ratings)
 * @access  Private (Admin only)
 */
router.get(
  '/admin',
  authenticate,
  authorize(Role.ADMIN),
  (req, res, next) => dashboardController.getAdminStats(req, res, next)
);

/**
 * @route   GET /api/v1/dashboard/store-owner
 * @desc    Get store owner reputation stats and individual raters
 * @access  Private (Store Owner only)
 */
router.get(
  '/store-owner',
  authenticate,
  authorize(Role.STORE_OWNER),
  (req, res, next) => dashboardController.getStoreOwnerStats(req, res, next)
);

export default router;
