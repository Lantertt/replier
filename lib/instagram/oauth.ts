const META_OAUTH_VERSION = 'v23.0';

interface OAuthTokenResponse {
  access_token: string;
  expires_in?: number;
}

interface InstagramProfileResponse {
  id: string;
  username?: string;
}

export function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID || '',
    redirect_uri: process.env.META_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement',
    state,
  });

  return `https://www.facebook.com/${META_OAUTH_VERSION}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID || '',
    client_secret: process.env.META_APP_SECRET || '',
    redirect_uri: process.env.META_REDIRECT_URI || '',
    code,
  });

  const response = await fetch(`https://graph.facebook.com/${META_OAUTH_VERSION}/oauth/access_token?${params.toString()}`);
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
    fields: 'id,username',
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/me?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load Instagram profile');
  }

  const data = (await response.json()) as InstagramProfileResponse;
  if (!data.id) {
    throw new Error('Instagram profile missing id');
  }

  return {
    id: data.id,
    username: data.username ?? 'unknown',
  };
}
