import { describe, expect, it } from 'vitest';
import { adContextSchema } from '@/lib/validation/ad-context';

describe('ad context schema', () => {
  it('requires target ig user id', () => {
    const parsed = adContextSchema.safeParse({ targetIgUserId: '' });
    expect(parsed.success).toBe(false);
  });
});
