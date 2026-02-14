const META_OAUTH_VERSION = 'v23.0';

interface OAuthTokenResponse {
  access_token: string;
  expires_in?: number;
}

interface InstagramProfileResponse {
  id: string;
  username?: string;
}

interface FacebookPagesResponse {
  data?: Array<{
    id: string;
    instagram_business_account?: {
      id: string;
      username?: string;
    };
    connected_instagram_account?: {
      id: string;
      username?: string;
    };
  }>;
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
  const pagesParams = new URLSearchParams({
    fields: 'id,instagram_business_account{id,username},connected_instagram_account{id,username}',
    access_token: accessToken,
  });

  const pagesResponse = await fetch(`https://graph.facebook.com/${META_OAUTH_VERSION}/me/accounts?${pagesParams.toString()}`);
  if (!pagesResponse.ok) {
    throw new Error('Failed to load Facebook pages');
  }

  const pagesPayload = (await pagesResponse.json()) as FacebookPagesResponse;
  const linkedPage = (pagesPayload.data ?? []).find(
    (page) => page.connected_instagram_account?.id || page.instagram_business_account?.id,
  );
  const linkedAccount = linkedPage?.connected_instagram_account ?? linkedPage?.instagram_business_account;
  if (!linkedAccount?.id) {
    throw new Error('No Instagram professional account linked');
  }

  if (linkedAccount.username) {
    return {
      id: linkedAccount.id,
      username: linkedAccount.username,
    };
  }

  const profileParams = new URLSearchParams({
    fields: 'id,username',
    access_token: accessToken,
  });

  const profileResponse = await fetch(
    `https://graph.facebook.com/${META_OAUTH_VERSION}/${linkedAccount.id}?${profileParams.toString()}`,
  );
  if (!profileResponse.ok) {
    throw new Error('Failed to load Instagram profile');
  }

  const profilePayload = (await profileResponse.json()) as InstagramProfileResponse;
  if (!profilePayload.id) {
    throw new Error('Instagram profile missing id');
  }

  return {
    id: profilePayload.id,
    username: profilePayload.username ?? 'unknown',
  };
}
