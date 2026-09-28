import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  geohash: z.string().optional()
});

export const addDishSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().nonnegative('Price must be non-negative').optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional()
});
