import { Router } from 'express';
import { merchantService } from '../merchant/service';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@merchant.com' && password === '123456') {
    res.json({ success: true, data: { token: 'mock-jwt-token', merchantId: 'm-100' } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

router.get('/:id/analytics', async (req, res) => {
  try {
    const data = await merchantService.getAnalytics(req.params.id);
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const data = await merchantService.getMenu(req.params.id);
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/:id/promote', async (req, res) => {
  try {
    const { dishId, budget } = req.body;
    const data = await merchantService.promoteListing(req.params.id, dishId, budget);
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
