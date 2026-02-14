import { z } from 'zod';

export const adContextSchema = z.object({
  targetIgUserId: z.string().min(1),
  productName: z.string().min(1),
  uspText: z.string().min(1),
  salesLink: z.string().url(),
  discountCode: z.string().min(1),
  requiredKeywords: z.array(z.string()),
  bannedKeywords: z.array(z.string()),
  toneNotes: z.string().min(1),
});

export type AdContextInput = z.infer<typeof adContextSchema>;
