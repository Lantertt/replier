interface OAuthTokenResponse {
  access_token: string;
  expires_in?: number;
}

interface InstagramProfileResponse {
  id: string;
  user_id?: string;
  username?: string;
}

export function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID || '',
    redirect_uri: process.env.META_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'instagram_business_basic,instagram_business_manage_comments',
    state,
  });

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    client_id: process.env.META_APP_ID || '',
    client_secret: process.env.META_APP_SECRET || '',
    grant_type: 'authorization_code',
    redirect_uri: process.env.META_REDIRECT_URI || '',
    code,
  });

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!response.ok) {
    throw new Error('Failed to exchange OAuth code for access token');
  }

  const data = (await response.json()) as OAuthTokenResponse;
  if (!data.access_token) {
    throw new Error('OAuth token exchange returned no access token');
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in ?? 3600,
  };
}

export async function fetchInstagramProfile(accessToken: string): Promise<{ id: string; username: string }> {
  const params = new URLSearchParams({
    fields: 'user_id,username',
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/me?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load Instagram profile');
  }

  const data = (await response.json()) as InstagramProfileResponse;
  const id = data.user_id || data.id;
  if (!id) {
    throw new Error('Instagram profile missing id');
  }

  return {
    id,
    username: data.username ?? 'unknown',
  };
}
