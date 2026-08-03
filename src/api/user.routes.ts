import { Router, Request, Response } from 'express';
import { userService } from '../user/service';

export const userRouter = Router();

userRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id as string;
  const profile = await userService.getUserProfile(userId);
  if (!profile) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ data: profile });
});

userRouter.put('/:id/preferences', async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id as string;
  const { preferences } = req.body;
  if (!preferences) {
    res.status(400).json({ error: 'Preferences are required' });
    return;
  }
  
  const updated = await userService.updatePreferences(userId, preferences);
  res.json({ success: true, data: updated });
});

userRouter.get('/', (req, res) => {
  res.json({ message: 'User API placeholder' });
});
