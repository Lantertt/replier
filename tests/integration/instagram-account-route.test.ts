import { afterEach, describe, expect, it } from 'vitest';

const originalSkipClerk = process.env.SKIP_CLERK;

describe('instagram account route', () => {
  afterEach(() => {
    process.env.SKIP_CLERK = originalSkipClerk;
  });

  it('returns empty account in SKIP_CLERK mode', async () => {
    process.env.SKIP_CLERK = 'true';

    const { GET } = await import('@/app/api/instagram/account/route');
    const response = await GET();
    const json = (await response.json()) as { account: null; accounts: [] };

    expect(response.status).toBe(200);
    expect(json).toEqual({ account: null, accounts: [] });
  });
});
