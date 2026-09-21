import { Router } from 'express';
import { db } from '../db';
import { redisCache } from '../utils/cache';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'ok',
      redis: 'ok'
    }
  };

  try {
    await db.query('SELECT 1');
  } catch {
    health.checks.database = 'error';
    health.status = 'error';
  }

  try {
    const ping = await redisCache.ping();
    if (ping !== 'PONG') throw new Error('Redis down');
  } catch {
    health.checks.redis = 'error';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
