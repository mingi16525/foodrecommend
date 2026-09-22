import { Router, Request, Response } from 'express';
import { socialService } from '../social/service';
import { AuthRequest, authenticateToken, optionalAuthenticateToken } from '../auth/authMiddleware';
import { validate } from '../middleware/validate';
import { createPostSchema } from '../validators/social.validator';

const router = Router();

router.post('/posts', authenticateToken, validate(createPostSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, content, videoUrl } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const newPost = await socialService.createPost(userId, type, content, videoUrl);
  res.json({ data: newPost });
});

router.get('/feed', optionalAuthenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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

  const feed = await socialService.getFeed(req.user?.userId, lat, lng, page, limit);
  res.json({ data: feed });
});

router.get('/feed/liked', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  // Temporary: In a real app we'd have getLikedPosts method
  const feed = await socialService.getFeed(userId, undefined, undefined, page, limit);
  // Filter memory for simplicity since it's an MVP, though SQL is better
  const liked = feed.filter(f => f.is_liked);
  res.json({ data: liked });
});

router.get('/feed/saved', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const feed = await socialService.getFeed(userId, undefined, undefined, page, limit);
  const saved = feed.filter(f => f.is_saved);
  res.json({ data: saved });
});

router.get('/feed/my-posts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const feed = await socialService.getFeed(userId, undefined, undefined, page, limit);
  const myPosts = feed.filter(f => f.user_id === userId);
  res.json({ data: myPosts });
});

router.post('/posts/:id/like', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await socialService.likePost(postId, userId);
  
  // Optional: Emit notification to author if author_id is accessible.
  // Using simple emitting logic for now.
  res.json({ success: true });
});

router.delete('/posts/:id/like', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await socialService.unlikePost(postId, userId);
  res.json({ success: true });
});

router.post('/posts/:id/comments', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const { commentText } = req.body;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const newComment = await socialService.commentPost(postId, userId, commentText);
  res.json({ data: newComment });
});

router.get('/posts/:id/comments', async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const comments = await socialService.getComments(postId, page, limit);
  res.json({ data: comments });
});

router.post('/posts/:id/save', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await socialService.savePost(postId, userId);
  res.json({ success: true });
});

router.delete('/posts/:id/save', async (req: AuthRequest, res: Response): Promise<void> => {
  const postId = req.params.id as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await socialService.unsavePost(postId, userId);
  res.json({ success: true });
});

export const socialRouter = router;
