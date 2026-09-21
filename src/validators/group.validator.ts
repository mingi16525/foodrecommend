import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(200)
});

export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export const splitEquallySchema = z.object({
  totalAmount: z.number().finite().min(0),
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required')
});

export const splitItemsSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1),
    price: z.number().finite().min(0),
    userId: z.string().uuid(),
    quantity: z.number().int().min(1).optional().default(1)
  })).min(1)
});

export const swipeSchema = z.object({
  dishId: z.string().uuid('Invalid dish ID format'),
  action: z.enum(['like', 'skip'])
});

export const voteSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID format')
});

export const addItemSchema = z.object({
  dishId: z.string().uuid('Invalid dish ID format'),
  quantity: z.number().int().min(1),
  price: z.number().finite().min(0)
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1),
  restaurantId: z.string().uuid().optional()
});
