import { afterEach, describe, expect, it } from 'vitest';

const originalSkipClerk = process.env.SKIP_CLERK;

describe('available prompts route', () => {
  afterEach(() => {
    process.env.SKIP_CLERK = originalSkipClerk;
  });

  it('returns empty prompts in SKIP_CLERK mode', async () => {
    process.env.SKIP_CLERK = 'true';

    const { GET } = await import('@/app/api/prompts/available/route');
    const response = await GET();
    const json = (await response.json()) as { prompts: unknown[] };

    expect(response.status).toBe(200);
    expect(json).toEqual({ prompts: [] });
  });
});
