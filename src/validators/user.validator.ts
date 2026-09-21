import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  preferences: z.object({
    favorite_flavors: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    dietary_restrictions: z.array(z.string()).optional(),
    hated_dishes: z.array(z.string()).optional()
  })
});
