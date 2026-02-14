import { z } from 'zod';

export const promptAssignmentSchema = z.object({
  targetIgUserId: z.string().min(1),
  promptTemplateId: z.string().uuid(),
});
