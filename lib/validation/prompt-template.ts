import { z } from 'zod';

export const promptTemplateSchema = z.object({
  name: z.string().min(1),
  productName: z.string().min(1),
  promptBody: z.string().min(1),
});

export const promptTemplateUpdateSchema = z.object({
  promptId: z.string().uuid(),
  promptBody: z.string().min(1),
});
