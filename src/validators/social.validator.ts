import { z } from 'zod';

export const createPostSchema = z.object({
  type: z.string().min(1, 'Post type is required'),
  content: z.string().max(5000).optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  restaurantId: z.string().uuid().optional(),
  restaurantName: z.string().min(1).optional(),
  restaurantAddress: z.string().min(1).optional(),
  dishId: z.string().uuid().optional(),
  dishIds: z.array(z.string().uuid()).optional()
});
