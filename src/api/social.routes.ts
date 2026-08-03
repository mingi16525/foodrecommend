import { Router, Request, Response } from 'express';
import { socialService } from '../social/service';

const router = Router();

router.post('/posts', async (req: Request, res: Response): Promise<void> => {
  const { userId, type, content, videoUrl } = req.body;
  if (!userId || !type) {
    res.status(400).json({ error: 'userId and type are required' });
    return;
  }
  const newPost = await socialService.createPost(userId, type, content, videoUrl);
  res.json({ data: newPost });
});

router.get('/feed', async (req: Request, res: Response): Promise<void> => {
  const feed = await socialService.getFeed();
  res.json({ data: feed });
});

export const socialRouter = router;

