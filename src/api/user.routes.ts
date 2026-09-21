import { Router, Response } from 'express';
import { userService } from '../user/service';
import { AuthRequest } from '../auth/authMiddleware';
import { requireOwnership } from '../middleware/authorization';
import { validate } from '../middleware/validate';
import { updatePreferencesSchema } from '../validators/user.validator';

export const userRouter = Router();

userRouter.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const profile = await userService.getUserProfile(userId);
  if (!profile) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(profile);
});

userRouter.put('/me/preferences', validate(updatePreferencesSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { preferences } = req.body;
  
  const updated = await userService.updatePreferences(userId, preferences);
  res.json({ success: true, data: updated });
});

userRouter.get('/:id', requireOwnership('user'), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.id as string;
  const profile = await userService.getUserProfile(userId);
  if (!profile) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ data: profile });
});

userRouter.put('/:id/preferences', requireOwnership('user'), validate(updatePreferencesSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.id as string;
  const { preferences } = req.body;
  
  const updated = await userService.updatePreferences(userId, preferences);
  res.json({ success: true, data: updated });
});

userRouter.get('/', (req, res) => {
  res.json({ message: 'User API placeholder' });
});
