import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import env from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './utils/response';

const app = express();

// 1. CORS Configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Mount Central API v1 Router
app.use('/api/v1', apiRouter);

// 4. Handle 404 for Unmatched Routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} - Route not found`, 404, 'NOT_FOUND'));
});

// 5. Global Error Handling Middleware (Must be registered last)
app.use(errorHandler);

export default app;
