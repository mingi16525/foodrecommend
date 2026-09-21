import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../auth/authMiddleware';
import { notificationService } from '../services/notification.service';

const router = Router();

// Save device token
router.post('/device-token', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  const userId = req.user?.userId;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    await notificationService.saveDeviceToken(userId!, token);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving device token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
