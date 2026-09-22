import { Router, Request, Response } from 'express';
import { restaurantService } from '../restaurant/service';
import { withCache } from '../utils/cache';

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

export const restaurantRouter = router;
