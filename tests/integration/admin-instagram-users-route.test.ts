import { afterEach, describe, expect, it } from 'vitest';

const originalSkipClerk = process.env.SKIP_CLERK;

describe('admin instagram users route', () => {
  afterEach(() => {
    process.env.SKIP_CLERK = originalSkipClerk;
  });

  it('returns empty suggestions in SKIP_CLERK mode', async () => {
    process.env.SKIP_CLERK = 'true';

    const { GET } = await import('@/app/api/admin/instagram-users/route');
    const response = await GET(new Request('http://localhost:3000/api/admin/instagram-users?q=yo'));
    const json = (await response.json()) as { suggestions: unknown[] };

    expect(response.status).toBe(200);
    expect(json).toEqual({ suggestions: [] });
  });
});
