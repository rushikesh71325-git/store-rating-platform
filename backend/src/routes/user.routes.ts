import { Router } from 'express';
import { Role } from '@prisma/client';
import userController from '../controllers/user.controller';
import validate from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createUserSchema, listUsersQuerySchema, userIdParamSchema } from '../validations/user.validation';

const router = Router();

// Protect all user management endpoints: Admin only
router.use(authenticate, authorize(Role.ADMIN));

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user (Admin, Store Owner, or Normal User)
 * @access  Private (Admin only)
 */
router.post('/', validate(createUserSchema), (req, res, next) => userController.createUser(req, res, next));

/**
 * @route   GET /api/v1/users
 * @desc    Get paginated, filtered, and sorted list of users
 * @access  Private (Admin only)
 */
router.get('/', validate(listUsersQuerySchema), (req, res, next) => userController.getUsers(req, res, next));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user details (including store rating if Store Owner)
 * @access  Private (Admin only)
 */
router.get('/:id', validate(userIdParamSchema), (req, res, next) => userController.getUserById(req, res, next));

export default router;
