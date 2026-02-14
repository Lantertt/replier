const META_OAUTH_VERSION = 'v23.0';

interface OAuthTokenResponse {
  access_token: string;
  expires_in?: number;
}

interface InstagramProfileResponse {
  user_id?: string;
  id?: string;
  username?: string;
}

export function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID || '',
    redirect_uri: process.env.META_REDIRECT_URI || '',
    response_type: 'code',
    scope:
      'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights',
    force_reauth: 'true',
    state,
  });

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    client_id: process.env.META_APP_ID || '',
    client_secret: process.env.META_APP_SECRET || '',
    redirect_uri: process.env.META_REDIRECT_URI || '',
    grant_type: 'authorization_code',
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
  const shouldDebug = process.env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD === 'true' || process.env.NODE_ENV !== 'production';
  const profileParams = new URLSearchParams({
    fields: 'user_id,id,username',
    access_token: accessToken,
  });

  const profileResponse = await fetch(`https://graph.instagram.com/${META_OAUTH_VERSION}/me?${profileParams.toString()}`);
  const profileRaw = await profileResponse.text();
  if (shouldDebug) {
    console.info('[instagram-oauth] me status', profileResponse.status);
    console.info('[instagram-oauth] me raw', profileRaw);
  }

  if (!profileResponse.ok) {
    throw new Error('Failed to load Instagram profile');
  }

  let profilePayload: InstagramProfileResponse;
  try {
    profilePayload = JSON.parse(profileRaw) as InstagramProfileResponse;
  } catch {
    throw new Error('Failed to parse Instagram profile payload');
  }

  const igUserId = profilePayload.user_id ?? profilePayload.id;
  if (!igUserId) {
    throw new Error('Instagram profile missing id');
  }

  return {
    id: igUserId,
    username: profilePayload.username ?? 'unknown',
  };
}
