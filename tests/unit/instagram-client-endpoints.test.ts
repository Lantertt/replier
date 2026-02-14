import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listComments, listPosts, publishReply } from '@/lib/instagram/client';

describe('instagram client endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads comments via graph.instagram.com endpoint', async () => {
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
    expect(String(requestUrl)).toContain('https://graph.instagram.com/v23.0/post-1/comments');
  });

  it('maps comment username from from.username when username field is missing', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: 'comment-2', text: 'hello', from: { username: 'from-user' } }],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const comments = await listComments('post-2', 'token-2');

    expect(comments).toEqual([
      {
        id: 'comment-2',
        text: 'hello',
        username: 'from-user',
      },
    ]);
  });

  it('retries comments lookup with graph.facebook.com when instagram host returns empty list', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [],
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
        new Response(
          JSON.stringify({
            data: [{ id: 'comment-3', text: 'fallback', from: { username: 'fallback-user' } }],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

    const comments = await listComments('post-3', 'token-3');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('https://graph.instagram.com/v23.0/post-3/comments');
    expect(String(fetchMock.mock.calls[1][0])).toContain('https://graph.facebook.com/v23.0/post-3/comments');
    expect(comments[0]?.username).toBe('fallback-user');
  });

  it('returns primary empty list when fallback host fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [],
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
        new Response(
          JSON.stringify({
            error: { message: 'Unsupported get request', code: 100 },
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

    const comments = await listComments('post-4', 'token-4');

    expect(comments).toEqual([]);
  });

  it('loads posts via graph.instagram.com endpoint with ig user id', async () => {
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
    expect(String(requestUrl)).toContain('https://graph.instagram.com/v23.0/ig-user-1/media');
  });

  it('publishes replies via graph.instagram.com endpoint', async () => {
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
    expect(String(requestUrl)).toBe('https://graph.instagram.com/v23.0/comment-1/replies');
  });
});
