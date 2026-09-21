import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../auth/authMiddleware';
import { loyaltyService } from '../services/loyalty.service';

const router = Router();

router.get('/info', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const info = await loyaltyService.getLoyaltyInfo(userId);
    res.json({ data: info });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/referral', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { code } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!code) return res.status(400).json({ error: 'Referral code is required' });

  try {
    await loyaltyService.processReferral(userId, code);
    res.json({ message: 'Referral code applied successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
});

export const loyaltyRoutes = router;
