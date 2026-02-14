const GRAPH_VERSION = 'v23.0';

export interface InstagramPost {
  id: string;
  caption: string | null;
  mediaUrl: string | null;
  permalink: string | null;
  timestamp: string | null;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
}

interface InstagramCommentsPayload {
  data?: Array<{
    id: string;
    text?: string;
    username?: string;
    from?: {
      username?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
}

function assertOk(response: Response, message: string): void {
  if (!response.ok) {
    throw new Error(message);
  }
}

function shouldLogInstagramComments(): boolean {
  if (process.env.LOG_INSTAGRAM_COMMENTS === 'true') {
    return true;
  }
  if (process.env.LOG_INSTAGRAM_COMMENTS === 'false') {
    return false;
  }
  return process.env.NODE_ENV !== 'production';
}

export function normalizeComment(input: { id: string; text: string; username: string }): InstagramComment {
  return {
    id: input.id,
    text: input.text,
    username: input.username,
  };
}

export async function listPosts(igUserId: string, accessToken: string): Promise<InstagramPost[]> {
  const params = new URLSearchParams({
    fields: 'id,caption,media_url,permalink,timestamp',
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/${GRAPH_VERSION}/${igUserId}/media?${params.toString()}`);
  assertOk(response, 'Failed to fetch Instagram posts');

  const data = (await response.json()) as {
    data?: Array<{ id: string; caption?: string; media_url?: string; permalink?: string; timestamp?: string }>;
  };

  return (data.data ?? []).map((post) => ({
    id: post.id,
    caption: post.caption ?? null,
    mediaUrl: post.media_url ?? null,
    permalink: post.permalink ?? null,
    timestamp: post.timestamp ?? null,
  }));
}

export async function listComments(postId: string, accessToken: string): Promise<InstagramComment[]> {
  const params = new URLSearchParams({
    fields: 'id,text,username,from,timestamp,parent_id',
    access_token: accessToken,
  });

  async function fetchCommentsFromHost(host: 'graph.instagram.com' | 'graph.facebook.com'): Promise<InstagramComment[]> {
    const url = `https://${host}/${GRAPH_VERSION}/${postId}/comments?${params.toString()}`;
    const response = await fetch(url);
    const raw = await response.text();

    if (shouldLogInstagramComments()) {
      console.info(
        '[instagram-comments] response',
        JSON.stringify({
          host,
          postId,
          status: response.status,
          raw,
        }),
      );
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch post comments (${host})`);
    }

    let payload: InstagramCommentsPayload;
    try {
      payload = JSON.parse(raw) as InstagramCommentsPayload;
    } catch {
      throw new Error(`Failed to parse post comments response (${host})`);
    }

    if (payload.error) {
      throw new Error(
        `Instagram comments API error (${host}): ${payload.error.message ?? 'unknown error'}${
          payload.error.code ? ` [${payload.error.code}]` : ''
        }`,
      );
    }

    return (payload.data ?? []).map((comment) =>
      normalizeComment({
        id: comment.id,
        text: comment.text ?? '',
        username: comment.username ?? comment.from?.username ?? 'unknown',
      }),
    );
  }

  const primaryComments = await fetchCommentsFromHost('graph.instagram.com');
  if (primaryComments.length > 0) {
    return primaryComments;
  }

  try {
    const fallbackComments = await fetchCommentsFromHost('graph.facebook.com');
    return fallbackComments;
  } catch (error) {
    if (shouldLogInstagramComments()) {
      console.warn(
        '[instagram-comments] fallback failed',
        JSON.stringify({
          postId,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
    return primaryComments;
  }
}

export async function publishReply(commentId: string, message: string, accessToken: string): Promise<{ id: string }> {
  const body = new URLSearchParams({
    message,
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/${GRAPH_VERSION}/${commentId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  assertOk(response, 'Failed to publish reply comment');

  const data = (await response.json()) as { id: string };
  if (!data.id) {
    throw new Error('Reply publish response missing id');
  }

  return data;
}
