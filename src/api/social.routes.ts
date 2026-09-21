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

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const feed = await socialService.getFeed(lat, lng, page, limit);
  res.json({ data: feed });
});

router.post('/posts/:id/like', async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await socialService.likePost(postId, userId);
  
  // Optional: Emit notification to author if author_id is accessible.
  // Using simple emitting logic for now.
  res.json({ success: true });
});

router.delete('/posts/:id/like', async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await socialService.unlikePost(postId, userId);
  res.json({ success: true });
});

router.post('/posts/:id/comments', async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const { commentText } = req.body;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const newComment = await socialService.commentPost(postId, userId, commentText);
  res.json({ data: newComment });
});

export const socialRouter = router;
