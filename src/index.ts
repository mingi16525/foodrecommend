import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { recommendationRouter } from './api/recommendation.routes';
import { userRouter } from './api/user.routes';
import { restaurantRouter } from './api/restaurant.routes';
import { socialRouter } from './api/social.routes';
import { groupRouter } from './api/group.routes';
import { authRouter } from './api/auth.routes';
import { healthRouter } from './api/health.routes';
import { tripRouter } from './api/trip.routes';
import paymentRouter from './api/payment.routes';
import notificationRouter from './api/notification.routes';
import { loyaltyRoutes } from './api/loyalty.routes';
import { subscriptionRouter } from './api/subscription.routes';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';
import { authenticateToken } from './auth/authMiddleware';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { setupSocket } from './socket';

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || '*' } });

app.disable('x-powered-by');

app.use(helmet());
app.set('io', io);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10kb' }));

app.use(metricsMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/recommendation', authenticateToken as express.RequestHandler, recommendationRouter);
app.use('/api/users', authenticateToken as express.RequestHandler, userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/social', authenticateToken as express.RequestHandler, socialRouter);
app.use('/api/groups', authenticateToken as express.RequestHandler, groupRouter);
app.use('/api/trip', authenticateToken as express.RequestHandler, tripRouter);
app.use('/api/payment', authenticateToken as express.RequestHandler, paymentRouter);
app.use('/api/notifications', authenticateToken as express.RequestHandler, notificationRouter);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/subscription', subscriptionRouter);

const file = fs.readFileSync(path.resolve(__dirname, '../docs/swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/metrics', metricsHandler);

app.get('/', (req, res) => {
  res.send('FoodRecommend API is running');
});

import { NotFoundError } from './errors/CustomErrors';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
});

app.use(errorHandler);

setupSocket(io);

import { db } from './db';

if (require.main === module) {
  server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await db.end();
        logger.info('Database pool closed.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
      }
    });
    
    // Force shutdown if it takes too long
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
