import { Router } from 'express';
import { DecisionComplexityEstimator, IntentType, RecommendationRequest } from '../recommendation/routing';
import { AuthRequest } from '../auth/authMiddleware';
import { eventCollector } from '../recommendation/eventCollector';
import { db } from '../db';

export const recommendationRouter = Router();
const estimator = new DecisionComplexityEstimator();

recommendationRouter.get('/', async (req, res) => {
  const userId = (req.query.userId as string) || (req as AuthRequest).user?.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;
  let location: { lat: number; lng: number } | undefined;
  
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      location = { lat, lng };
    }
  }

  try {
    const aiRequest: RecommendationRequest = {
      userId,
      intentType: IntentType.SWIPE,
      contextParams: {
        location: location
      }
    };
    const results = await estimator.handleRequest(aiRequest) as any[];

    // Enrich with Postgres data (price, image_url, restaurant_name)
    const dishIds = results.map((r: any) => r.id);
    if (dishIds.length > 0) {
      const dbRes = await db.query(`
        SELECT d.id, d.price, d.image_url, r.name as restaurant_name
        FROM dishes d
        LEFT JOIN restaurants r ON d.restaurant_id = r.id
        WHERE d.id = ANY($1)
      `, [dishIds]);

      const enrichedResults = results.map((r: any) => {
        const dbDish = dbRes.rows.find(d => d.id === r.id);
        return {
          ...r,
          price: dbDish?.price || 0,
          image_url: dbDish?.image_url || 'https://via.placeholder.com/400x300.png?text=Dish',
          restaurant_name: dbDish?.restaurant_name || 'Unknown Restaurant',
          distance: `${(r.distanceScore * 10).toFixed(1)}km`
        };
      });
      res.json({ data: enrichedResults });
    } else {
      res.json({ data: [] });
    }
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
