import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exchangeCodeForAccessToken, fetchInstagramProfile } from '@/lib/instagram/oauth';

describe('instagram oauth client', () => {
  beforeEach(() => {
    process.env.META_APP_ID = 'meta-app-id';
    process.env.META_APP_SECRET = 'meta-app-secret';
    process.env.META_REDIRECT_URI = 'https://example.com/api/instagram/callback';
    vi.restoreAllMocks();
  });

  it('exchanges auth code via Meta graph oauth endpoint', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'ig-token', expires_in: 3600 }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await exchangeCodeForAccessToken('code-123');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toContain('https://graph.facebook.com/v23.0/oauth/access_token');
    expect(String(requestUrl)).toContain('client_id=meta-app-id');
    expect(String(requestUrl)).toContain('client_secret=meta-app-secret');
    expect(String(requestUrl)).toContain('code=code-123');
    expect(requestInit).toBeUndefined();
  });

  it('uses id field in profile response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: '1789', username: 'creator' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const profile = await fetchInstagramProfile('ig-token');

    expect(profile).toEqual({
      id: '1789',
      username: 'creator',
    });
  });
});
