import { Router, Request, Response } from 'express';
import { restaurantService } from '../restaurant/service';
import { withCache } from '../utils/cache';

import { AuthRequest, authenticateToken } from '../auth/authMiddleware';
import { validate } from '../middleware/validate';
import { createRestaurantSchema, addDishSchema } from '../validators/restaurant.validator';

const router = Router();

router.get('/search', async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;
  if (!query) {
    res.status(400).json({ error: 'Search query "q" is required' });
    return;
  }
  const results = await withCache(`restaurant:search:${query}`, 300, () => restaurantService.searchRestaurants(query));
  res.json({ data: results });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const restaurant = await withCache(`restaurant:${id}`, 3600, () => restaurantService.getRestaurantById(id));
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  res.json({ data: restaurant });
});

router.get('/:id/dishes', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const dishes = await withCache(`restaurant:${id}:dishes`, 3600, () => restaurantService.getDishesByRestaurantId(id));
  if (!dishes) {
    res.status(404).json({ error: 'Dishes not found' });
    return;
  }
  res.json({ data: dishes });
});

router.post('/', authenticateToken, validate(createRestaurantSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { name, address, geohash } = req.body;
  const newRestaurant = await restaurantService.createRestaurant(userId, name, address, geohash);
  res.json({ data: newRestaurant });
});

router.post('/:id/dishes', authenticateToken, validate(addDishSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const restaurantId = req.params.id as string;
  const { name, price, description, imageUrl } = req.body;
  const newDish = await restaurantService.addDish(restaurantId, name, price, description, imageUrl);
  res.json({ data: newDish });
});

router.post('/:id/claim', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const restaurantId = req.params.id as string;
  const restaurant = await restaurantService.claimRestaurant(restaurantId, userId);
  if (!restaurant) {
    res.status(400).json({ error: 'Restaurant already claimed or not found' });
    return;
  }
  res.json({ data: restaurant });
});

export const restaurantRouter = router;
