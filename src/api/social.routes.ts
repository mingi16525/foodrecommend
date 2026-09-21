import { Router, Request, Response } from 'express';
import { socialService } from '../social/service';
import { AuthRequest } from '../auth/authMiddleware';
import { validate } from '../middleware/validate';
import { createPostSchema } from '../validators/social.validator';

const router = Router();

router.post('/posts', validate(createPostSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, content, videoUrl } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const newPost = await socialService.createPost(userId, type, content, videoUrl);
  res.json({ data: newPost });
});

router.get('/feed', async (req: Request, res: Response): Promise<void> => {
  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;
  let lat: number | undefined;
  let lng: number | undefined;
  
  if (latStr && lngStr) {
    lat = parseFloat(latStr);
    lng = parseFloat(lngStr);
  }

  const feed = await socialService.getFeed(lat, lng);
  res.json({ data: feed });
});

export const socialRouter = router;

