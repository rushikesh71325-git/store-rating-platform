import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import storeRoutes from './store.routes';
import dashboardRoutes from './dashboard.routes';
import { sendSuccess } from '../utils/response';

const apiRouter = Router();

// Platform Health Check
apiRouter.get('/health', (_req, res) => {
  sendSuccess(
    res,
    {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Store Rating API',
    },
    'Service is running smoothly'
  );
});

// Feature Routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/stores', storeRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;
