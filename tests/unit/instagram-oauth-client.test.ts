import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exchangeCodeForAccessToken, fetchInstagramProfile } from '@/lib/instagram/oauth';

describe('instagram oauth client', () => {
  beforeEach(() => {
    process.env.META_APP_ID = 'meta-app-id';
    process.env.META_APP_SECRET = 'meta-app-secret';
    process.env.META_REDIRECT_URI = 'https://example.com/api/instagram/callback';
    delete process.env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD;
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
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: 'page-1',
                instagram_business_account: {
                  id: '1789',
                },
              },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
      .mockResolvedValueOnce(
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
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('https://graph.facebook.com/v23.0/me/accounts');
    expect(String(fetchMock.mock.calls[1][0])).toContain('https://graph.facebook.com/v23.0/1789?');
  });

  it('throws when no instagram business account is linked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: 'page-1' }],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await expect(fetchInstagramProfile('ig-token')).rejects.toThrow(
      'No Instagram professional account linked',
    );
  });

  it('accepts connected_instagram_account payload', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'page-1',
              connected_instagram_account: {
                id: '1799',
                username: 'creator_linked',
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const profile = await fetchInstagramProfile('ig-token');

    expect(profile).toEqual({
      id: '1799',
      username: 'creator_linked',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('logs me/accounts payload when debug flag is enabled', async () => {
    process.env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD = 'true';
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'page-1',
              connected_instagram_account: {
                id: '1799',
                username: 'creator_linked',
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await fetchInstagramProfile('ig-token');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[instagram-oauth] me/accounts payload',
      expect.objectContaining({
        data: expect.any(Array),
      }),
    );
  });
});
