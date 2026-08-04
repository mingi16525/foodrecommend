import { Router, Request, Response } from 'express';
import { restaurantService } from '../restaurant/service';

const router = Router();

router.get('/search', async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;
  if (!query) {
    res.status(400).json({ error: 'Search query "q" is required' });
    return;
  }
  const results = await restaurantService.searchRestaurants(query);
  res.json({ data: results });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const restaurant = await restaurantService.getRestaurantById(id);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  res.json({ data: restaurant });
});

router.get('/:id/review-summary', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const summary = await restaurantService.getReviewSummary(id);
    res.json({ data: summary });
  } catch (error) {
    console.error('Error fetching review summary:', error);
    res.status(500).json({ error: 'Failed to fetch review summary' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const restaurants = await restaurantService.getAllRestaurants();
  res.json({ data: restaurants });
});

export const restaurantRouter = router;
