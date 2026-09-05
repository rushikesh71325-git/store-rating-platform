import { Router } from 'express';
import { Role } from '@prisma/client';
import storeController from '../controllers/store.controller';
import ratingController from '../controllers/rating.controller';
import validate from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createStoreSchema, listStoresQuerySchema, storeIdParamSchema } from '../validations/store.validation';
import { upsertRatingSchema } from '../validations/rating.validation';

const router = Router();

/**
 * @route   POST /api/v1/stores
 * @desc    Create a new store
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(createStoreSchema),
  (req, res, next) => storeController.createStore(req, res, next)
);

/**
 * @route   GET /api/v1/stores
 * @desc    Get paginated, filtered, and sorted list of stores with ratings
 * @access  Private (All authenticated roles)
 */
router.get(
  '/',
  authenticate,
  validate(listStoresQuerySchema),
  (req, res, next) => storeController.getStores(req, res, next)
);

/**
 * @route   GET /api/v1/stores/:id
 * @desc    Get store details and rating breakdown
 * @access  Private (All authenticated roles)
 */
router.get(
  '/:id',
  authenticate,
  validate(storeIdParamSchema),
  (req, res, next) => storeController.getStoreById(req, res, next)
);

/**
 * @route   POST /api/v1/stores/:id/ratings
 * @desc    Submit or update 1-5 rating for a store
 * @access  Private (Normal User only)
 */
router.post(
  '/:id/ratings',
  authenticate,
  authorize(Role.NORMAL_USER),
  validate(upsertRatingSchema),
  (req, res, next) => ratingController.upsertRating(req, res, next)
);

export default router;

