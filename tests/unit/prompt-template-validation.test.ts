import { describe, expect, it } from 'vitest';

import { promptTemplateUpdateSchema } from '@/lib/validation/prompt-template';

describe('prompt template update validation', () => {
  it('accepts prompt body update payload', () => {
    const parsed = promptTemplateUpdateSchema.safeParse({
      promptId: '550e8400-e29b-41d4-a716-446655440000',
      promptBody: 'updated prompt body',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects empty prompt body', () => {
    const parsed = promptTemplateUpdateSchema.safeParse({
      promptId: '550e8400-e29b-41d4-a716-446655440000',
      promptBody: '',
    });

    expect(parsed.success).toBe(false);
  });
});
