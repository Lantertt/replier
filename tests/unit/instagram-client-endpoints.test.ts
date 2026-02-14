import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listComments, listPosts, publishReply } from '@/lib/instagram/client';

describe('instagram client endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads comments via graph.facebook.com endpoint', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: 'comment-1', text: 'great', username: 'user1' }],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await listComments('post-1', 'token-1');

    const [requestUrl] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toContain('https://graph.facebook.com/v23.0/post-1/comments');
  });

  it('loads posts via graph.facebook.com endpoint with ig user id', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: 'post-1', caption: 'hello' }],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await listPosts('ig-user-1', 'token-1');

    const [requestUrl] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toContain('https://graph.facebook.com/v23.0/ig-user-1/media');
  });

  it('publishes replies via graph.facebook.com endpoint', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'reply-1' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await publishReply('comment-1', 'thanks', 'token-1');

    const [requestUrl] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toBe('https://graph.facebook.com/v23.0/comment-1/replies');
  });
});
