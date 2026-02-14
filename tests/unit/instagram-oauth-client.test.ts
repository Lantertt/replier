import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { exchangeCodeForAccessToken, fetchInstagramProfile } from '@/lib/instagram/oauth';

describe('instagram oauth client', () => {
  beforeEach(() => {
    process.env.META_APP_ID = 'meta-app-id';
    process.env.META_APP_SECRET = 'meta-app-secret';
    process.env.META_REDIRECT_URI = 'https://example.com/api/instagram/callback';
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exchanges auth code via instagram oauth endpoint', async () => {
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
    expect(String(requestUrl)).toBe('https://api.instagram.com/oauth/access_token');
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    expect(String(requestInit?.body)).toContain('client_id=meta-app-id');
    expect(String(requestInit?.body)).toContain('client_secret=meta-app-secret');
    expect(String(requestInit?.body)).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Finstagram%2Fcallback');
    expect(String(requestInit?.body)).toContain('grant_type=authorization_code');
    expect(String(requestInit?.body)).toContain('code=code-123');
  });

  it('uses user_id field in profile response', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ user_id: '1789', username: 'creator' }), {
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
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('https://graph.instagram.com/v23.0/me?');
  });

  it('falls back to id field in profile response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: '1799', username: 'creator2' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const profile = await fetchInstagramProfile('ig-token');

    expect(profile).toEqual({
      id: '1799',
      username: 'creator2',
    });
  });

  it('throws when profile payload has no id', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ username: 'creator' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(fetchInstagramProfile('ig-token')).rejects.toThrow('Instagram profile missing id');
  });

  it('logs me payload when debug flag is enabled', async () => {
    process.env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD = 'true';
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ user_id: '1789', username: 'creator' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await fetchInstagramProfile('ig-token');

    expect(consoleSpy).toHaveBeenCalledWith('[instagram-oauth] me status', 200);
    expect(consoleSpy).toHaveBeenCalledWith('[instagram-oauth] me raw', expect.stringContaining('"user_id":"1789"'));
  });
});
