import { Router } from 'express';
import { DecisionComplexityEstimator, IntentType, RecommendationRequest } from '../recommendation/routing';
import { AuthRequest } from '../auth/authMiddleware';
import { eventCollector } from '../recommendation/eventCollector';
import { withCache } from '../utils/cache';
import { getExperimentGroup } from '../utils/abTesting';
import { db } from '../db';
import { validate } from '../middleware/validate';
import { swipeSchema } from '../validators/group.validator';

type RecommendationResult = {
  id: string;
  distanceScore: number;
  [key: string]: unknown;
};

export const recommendationRouter = Router();
const estimator = new DecisionComplexityEstimator();

recommendationRouter.get('/', async (req, res) => {
  const userId = (req as AuthRequest).user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;
  let location: { lat: number; lng: number } | undefined;
  
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
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
    
    const experimentGroup = getExperimentGroup(userId, 'recommendation_algorithm');
    // We could pass experimentGroup into the estimator to change behavior, but for now we'll just log it.
    
    // Cache key incorporates location if present
    const locKey = location ? `${location.lat}_${location.lng}` : 'none';
    const cacheKey = `recs:${userId}:${locKey}:${experimentGroup}`;

    const results = await withCache(cacheKey, 300, async () => {
      return await estimator.handleRequest(aiRequest) as RecommendationResult[];
    });

    // Enrich with Postgres data (price, image_url, restaurant_name)
    const dishIds = results.map((r: RecommendationResult) => r.id);
    if (dishIds.length > 0) {
      const dbRes = await db.query(`
        SELECT d.id, d.price, d.image_url, r.name as restaurant_name, d.item_type, d.description
        FROM dishes d
        LEFT JOIN restaurants r ON d.restaurant_id = r.id
        WHERE d.id = ANY($1)
      `, [dishIds]);

      const enrichedResults = results.map((r: RecommendationResult) => {
        const dbDish = dbRes.rows.find(d => d.id === r.id);
        return {
          ...r,
          price: dbDish?.price || 0,
          image_url: dbDish?.image_url || 'https://via.placeholder.com/400x300.png?text=Dish',
          restaurant_name: dbDish?.restaurant_name || 'Unknown Restaurant',
          distance: `${(r.distanceScore * 10).toFixed(1)}km`,
          item_type: dbDish?.item_type || 'single',
          description: dbDish?.description || ''
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

recommendationRouter.post('/swipe', validate(swipeSchema), async (req, res) => {
  const { dishId, action } = req.body;
  const userId = (req as AuthRequest).user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Gọi EventCollector (Kafka) thay vì ghi Database trực tiếp
    await eventCollector.trackSwipe(userId, dishId, action);
    res.json({ success: true, message: 'Event accepted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

recommendationRouter.post('/feedback', async (req, res) => {
  const userId = (req as AuthRequest).user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { rating, feedback } = req.body;
  if (rating === undefined) {
    return res.status(400).json({ error: 'rating is required' });
  }

  try {
    console.log(`[FEEDBACK] User ${userId} rated ${rating} with feedback: ${feedback}`);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

