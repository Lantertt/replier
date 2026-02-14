import { z } from 'zod';

export const promptGenerateSchema = z.object({
  name: z.string().min(1),
  productName: z.string().min(1),
  productInfo: z.string().min(1),
  audienceInfo: z.string().optional(),
  additionalRequirements: z.string().optional(),
});
