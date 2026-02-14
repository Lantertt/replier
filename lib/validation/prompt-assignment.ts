import { z } from 'zod';

export const promptAssignmentSchema = z.object({
  targetIgUserId: z.string().min(1),
  promptTemplateId: z.string().uuid(),
});

export const promptAssignmentBatchSchema = z
  .object({
    targetIgUserIds: z.array(z.string().min(1)).optional(),
    targetUsernames: z.array(z.string().min(1)).optional(),
    promptTemplateId: z.string().uuid(),
  })
  .superRefine((value, ctx) => {
    const hasIgUserIds = Array.isArray(value.targetIgUserIds) && value.targetIgUserIds.length > 0;
    const hasUsernames = Array.isArray(value.targetUsernames) && value.targetUsernames.length > 0;

    if (!hasIgUserIds && !hasUsernames) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'targetIgUserIds or targetUsernames is required',
        path: ['targetIgUserIds'],
      });
    }
  });
