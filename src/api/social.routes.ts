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

