import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { ForbiddenError } from '../errors/CustomErrors';
import { AuthRequest } from '../auth/authMiddleware';

export const requirePremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
      return next(new ForbiddenError('Unauthorized access'));
    }

    const { rows } = await db.query(
      'SELECT subscription_tier, subscription_expires_at FROM users WHERE id = $1',
      [userId]
    );

    const user = rows[0];
    if (!user) {
      return next(new ForbiddenError('User not found'));
    }

    if (user.subscription_tier !== 'PREMIUM') {
      return next(new ForbiddenError('This feature requires a Premium subscription.'));
    }

    // Check expiration if any
    if (user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date()) {
      // Auto downgrade can be handled via a cron job, but we'll block access here
      return next(new ForbiddenError('Your Premium subscription has expired.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
