import { Router } from 'express';
import { recommendationEngine } from '../recommendation/engine';

export const recommendationRouter = Router();

recommendationRouter.get('/', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const results = await recommendationEngine.getRecommendations(userId);
    res.json({ data: results });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

recommendationRouter.post('/swipe', async (req, res) => {
  const { userId, dishId, action } = req.body;
  
  if (!userId || !dishId || !action) {
    return res.status(400).json({ error: 'userId, dishId, and action are required' });
  }

  try {
    const result = await recommendationEngine.processSwipeEvent(userId, dishId, action);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});
