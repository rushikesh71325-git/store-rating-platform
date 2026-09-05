import { Router } from 'express';
import authController from '../controllers/auth.controller';
import validate from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { signupSchema, loginSchema, updatePasswordSchema } from '../validations/auth.validation';
import { sendSuccess } from '../utils/response';

const router = Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Self-register as a Normal User
 * @access  Public
 */
router.post('/signup', validate(signupSchema), (req, res, next) => authController.signup(req, res, next));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login across all roles (Admin, Normal User, Store Owner)
 * @access  Public
 */
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

/**
 * @route   PATCH /api/v1/auth/password
 * @desc    Update password for authenticated user
 * @access  Private (All authenticated roles)
 */
router.patch(
  '/password',
  authenticate,
  validate(updatePasswordSchema),
  (req, res, next) => authController.updatePassword(req, res, next)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (All authenticated roles)
 */
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout (stateless JWT session termination)
 * @access  Private
 */
router.post('/logout', authenticate, (_req, res) => {
  sendSuccess(res, null, 'Logged out successfully');
});

export default router;
