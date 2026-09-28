import { Router, Request, Response } from 'express';
import { restaurantService } from '../restaurant/service';
import { authenticateToken } from '../auth/authMiddleware';

export const adminRouter = Router();

// In a real app, you should add a requireAdmin middleware here.
// For MVP, we'll just require authentication.
adminRouter.put('/restaurants/claim/:id', authenticateToken as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const restaurant = await restaurantService.approveClaim(id);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant claim not found or already processed' });
      return;
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
