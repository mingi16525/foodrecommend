import { z } from 'zod';

export const createPostSchema = z.object({
  type: z.string().min(1, 'Post type is required'),
  content: z.string().max(5000).optional(),
  videoUrl: z.string().url('Invalid video URL').optional()
});
