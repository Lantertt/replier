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
  const shouldDebug = process.env.DEBUG_INSTAGRAM_CALLBACK_PAYLOAD === 'true' || process.env.NODE_ENV !== 'production';

  if (shouldDebug) {
    try {
      const permissionsParams = new URLSearchParams({
        access_token: accessToken,
      });
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/${META_OAUTH_VERSION}/me/permissions?${permissionsParams.toString()}`,
      );
      const permissionsRaw = await permissionsResponse.text();
      console.info('[instagram-oauth] me/permissions status', permissionsResponse.status);
      console.info('[instagram-oauth] me/permissions raw', permissionsRaw);
    } catch (error) {
      console.info('[instagram-oauth] me/permissions debug error', String(error));
    }
  }

  const pagesParams = new URLSearchParams({
    fields: 'id,name,tasks,instagram_business_account{id,username},connected_instagram_account{id,username}',
    access_token: accessToken,
  });

  const pagesResponse = await fetch(`https://graph.facebook.com/${META_OAUTH_VERSION}/me/accounts?${pagesParams.toString()}`);
  const pagesRaw = await pagesResponse.text();
  if (shouldDebug) {
    console.info('[instagram-oauth] me/accounts status', pagesResponse.status);
    console.info('[instagram-oauth] me/accounts raw', pagesRaw);
  }

  if (!pagesResponse.ok) {
    throw new Error('Failed to load Facebook pages');
  }

  let pagesPayload: FacebookPagesResponse;
  try {
    pagesPayload = JSON.parse(pagesRaw) as FacebookPagesResponse;
  } catch {
    throw new Error('Failed to parse Facebook pages payload');
  }

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
