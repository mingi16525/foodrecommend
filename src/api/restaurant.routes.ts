import { Router } from 'express';

export const restaurantRouter = Router();

restaurantRouter.get('/', (req, res) => {
  res.json({ message: 'Restaurant API placeholder' });
});
