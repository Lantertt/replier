import { z } from 'zod';

export const promptAssignmentSchema = z.object({
  targetIgUserId: z.string().min(1),
  promptTemplateId: z.string().uuid(),
});

export const promptAssignmentBatchSchema = z.object({
  targetIgUserIds: z.array(z.string().min(1)).min(1),
  promptTemplateId: z.string().uuid(),
});
