import { Router, Request, Response } from 'express';
import { NotificationService } from '../notifications/service';

const router = Router();

// POST /api/notifications/token
router.post('/token', (req: Request, res: Response) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    res.status(400).json({ error: 'userId and token are required' });
    return;
  }
  
  NotificationService.registerToken(userId, token);
  res.status(200).json({ message: 'Token registered successfully' });
});

// POST /api/notifications/send
router.post('/send', async (req: Request, res: Response) => {
  const { userId, title, body, data } = req.body;
  if (!userId || !title || !body) {
    res.status(400).json({ error: 'userId, title, and body are required' });
    return;
  }

  const result = await NotificationService.sendToUser(userId, { title, body, data });
  res.status(200).json({ message: 'Notification sent (mock)', result });
});

export default router;
