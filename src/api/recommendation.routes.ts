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
        SELECT d.id, d.name as dish_name, d.price, d.image_url, d.item_type, d.description,
               r.id as restaurant_id, r.name as restaurant_name, r.address as restaurant_address,
               r.location as restaurant_location, r.delivery_links
        FROM dishes d
        LEFT JOIN restaurants r ON d.restaurant_id = r.id
        WHERE d.id = ANY($1)
      `, [dishIds]);

      const enrichedResults = results.map((r: RecommendationResult) => {
        const dbDish = dbRes.rows.find(d => d.id === r.id);
        const loc = (dbDish?.restaurant_location && typeof dbDish.restaurant_location === 'object')
          ? dbDish.restaurant_location
          : {};
        const payload = (r.payload as Record<string, unknown>) || {};
        const lat = loc.lat != null ? Number(loc.lat) : (payload.lat != null ? Number(payload.lat) : null);
        const lng = loc.lng != null ? Number(loc.lng) : (payload.lng != null ? Number(payload.lng) : null);

        let distanceText = `${(r.distanceScore * 10).toFixed(1)}km`;
        if (location && lat != null && lng != null) {
          const R = 6371;
          const dLat = (lat - location.lat) * Math.PI / 180;
          const dLon = (lng - location.lng) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(location.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distKm = R * c;
          distanceText = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`;
        }

        return {
          ...r,
          name: dbDish?.dish_name || r.name || 'Món ngon',
          price: dbDish?.price ? Number(dbDish.price) : 0,
          image_url: dbDish?.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
          restaurant_id: dbDish?.restaurant_id || null,
          restaurant_name: dbDish?.restaurant_name || 'Quán ngon',
          restaurant_address: dbDish?.restaurant_address || 'Hà Nội',
          lat,
          lng,
          delivery_links: dbDish?.delivery_links || {},
          distance: distanceText,
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
    // 1. Lưu trực tiếp vào Database user_swipes để kiểm tra dữ liệu đồng bộ
    try {
      const dishCheck = await db.query('SELECT id FROM dishes WHERE id = $1', [dishId]);
      if (dishCheck.rows.length > 0) {
        await db.query(
          'INSERT INTO user_swipes (user_id, dish_id, action) VALUES ($1, $2, $3)',
          [userId, dishId, action]
        );
        console.log(`[Swipe] Persisted swipe '${action}' for user ${userId} on dish ${dishId} to user_swipes`);
      } else {
        console.warn(`[Swipe] Dish ${dishId} not in dishes table, skipped DB insert.`);
      }
    } catch (dbErr: unknown) {
      console.error('[Swipe] Error inserting user_swipes:', (dbErr as Error).message);
    }

    // 2. Gọi EventCollector (Kafka & Redis FeatureStore)
    await eventCollector.trackSwipe(userId, dishId, action);
    res.json({ success: true, message: 'Event accepted' });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message || 'Internal server error' });
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

