import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/authMiddleware';
import { db } from '../db';

export const requireOwnership = (resourceType: 'user' | 'group') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const resourceId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (resourceType === 'user') {
      if (userId !== resourceId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      next();
      return;
    }

    if (resourceType === 'group') {
      const membership = await db.query(
        'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
        [resourceId, userId]
      );
      if (membership.rowCount === 0) {
        res.status(403).json({ error: 'Not a member of this group' });
        return;
      }
      next();
      return;
    }
  };
};
