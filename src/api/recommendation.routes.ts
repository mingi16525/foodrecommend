import { Router } from 'express';
import { DecisionComplexityEstimator, IntentType, RecommendationRequest } from '../recommendation/routing';
import { AuthRequest } from '../auth/authMiddleware';
import { eventCollector } from '../recommendation/eventCollector';

export const recommendationRouter = Router();
const estimator = new DecisionComplexityEstimator();

recommendationRouter.get('/', async (req, res) => {
  const userId = (req.query.userId as string) || (req as AuthRequest).user?.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const aiRequest: RecommendationRequest = {
      userId,
      intentType: IntentType.SWIPE,
      contextParams: {}
    };
    const results = await estimator.handleRequest(aiRequest);
    res.json({ data: results });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error in recommendation route:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

recommendationRouter.post('/swipe', async (req, res) => {
  const { dishId, action } = req.body;
  const userId = req.body.userId || (req as AuthRequest).user?.userId;
  
  if (!userId || !dishId || !action) {
    return res.status(400).json({ error: 'userId, dishId, and action are required' });
  }

  try {
    // Gọi EventCollector (Kafka) thay vì ghi Database trực tiếp
    await eventCollector.trackSwipe(userId, dishId, action);
    res.json({ success: true, message: 'Event accepted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});
