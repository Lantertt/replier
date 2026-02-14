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

function assertOk(response: Response, message: string): void {
  if (!response.ok) {
    throw new Error(message);
  }
}

export function normalizeComment(input: { id: string; text: string; username: string }): InstagramComment {
  return {
    id: input.id,
    text: input.text,
    username: input.username,
  };
}

export async function listPosts(accessToken: string): Promise<InstagramPost[]> {
  const params = new URLSearchParams({
    fields: 'id,caption,media_url,permalink,timestamp',
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/me/media?${params.toString()}`);
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
    fields: 'id,text,username',
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/${postId}/comments?${params.toString()}`);
  assertOk(response, 'Failed to fetch post comments');

  const data = (await response.json()) as {
    data?: Array<{ id: string; text?: string; username?: string }>;
  };

  return (data.data ?? []).map((comment) =>
    normalizeComment({
      id: comment.id,
      text: comment.text ?? '',
      username: comment.username ?? 'unknown',
    }),
  );
}

export async function publishReply(commentId: string, message: string, accessToken: string): Promise<{ id: string }> {
  const body = new URLSearchParams({
    message,
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/${commentId}/replies`, {
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
