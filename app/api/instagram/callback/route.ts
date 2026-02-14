import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';
import { encryptToken } from '@/lib/crypto';
import { buildInstagramCallbackPayload, shouldLogInstagramCallbackPayload } from '@/lib/instagram/callback-payload';
import { exchangeCodeForAccessToken, fetchInstagramProfile } from '@/lib/instagram/oauth';
import { parseSignedOAuthState } from '@/lib/oauth-state';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  if (shouldLogInstagramCallbackPayload(process.env)) {
    const queryPayload = buildInstagramCallbackPayload(requestUrl.searchParams);
    console.info('[instagram-callback] request url', request.url);
    console.info('[instagram-callback] query payload raw', JSON.stringify(queryPayload, null, 2));
  }

  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  const stateSecret = process.env.CLERK_SECRET_KEY || process.env.TOKEN_ENCRYPTION_KEY;
  if (!stateSecret) {
    return NextResponse.json({ error: 'OAuth state secret is not configured' }, { status: 500 });
  }

  const parsedState = parseSignedOAuthState(state.trim(), stateSecret);
  if (!parsedState.valid) {
    return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 });
  }

  const token = await exchangeCodeForAccessToken(code);
  const profile = await fetchInstagramProfile(token.accessToken);
  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!encryptionKey) {
    return NextResponse.json({ error: 'TOKEN_ENCRYPTION_KEY is required' }, { status: 500 });
  }

  const encryptedToken = encryptToken(token.accessToken, encryptionKey);
  const tokenExpiresAt = new Date(Date.now() + token.expiresIn * 1000);
  const dbClient = db();

  await dbClient
    .insert(instagramAccounts)
    .values({
      clerkUserId: parsedState.clerkUserId,
      igUserId: profile.id,
      username: profile.username,
      accessTokenEncrypted: encryptedToken,
      tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: instagramAccounts.igUserId,
      set: {
        clerkUserId: parsedState.clerkUserId,
        username: profile.username,
        accessTokenEncrypted: encryptedToken,
        tokenExpiresAt,
        updatedAt: new Date(),
      },
    });

  return NextResponse.redirect(new URL('/dashboard/account?connected=1', request.url));
}
