import { describe, expect, it } from 'vitest';
import { normalizeComment } from '@/lib/instagram/client';

describe('instagram comment normalize', () => {
  it('maps graph response to UI shape', () => {
    const mapped = normalizeComment({ id: '1', text: 'hello', username: 'u1' });
    expect(mapped).toEqual({ id: '1', text: 'hello', username: 'u1' });
  });
});
