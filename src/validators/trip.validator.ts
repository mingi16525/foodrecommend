import { z } from 'zod';

export const tripPlanSchema = z.object({
  groupName: z.string().max(200).optional(),
  preferences: z.string().max(2000).optional()
});
