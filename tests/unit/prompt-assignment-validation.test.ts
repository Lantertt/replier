import { describe, expect, it } from 'vitest';

import { promptAssignmentBatchSchema } from '@/lib/validation/prompt-assignment';

describe('prompt assignment batch validation', () => {
  it('accepts multiple target ig user ids', () => {
    const parsed = promptAssignmentBatchSchema.safeParse({
      targetIgUserIds: ['ig_1', 'ig_2'],
      promptTemplateId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects empty ig user id list', () => {
    const parsed = promptAssignmentBatchSchema.safeParse({
      targetIgUserIds: [],
      promptTemplateId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(parsed.success).toBe(false);
  });
});
