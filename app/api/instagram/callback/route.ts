import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';
import { encryptToken } from '@/lib/crypto';
import { buildInstagramCallbackDebugMeta } from '@/lib/instagram/callback-debug';
import { buildInstagramCallbackPayload, shouldLogInstagramCallbackPayload } from '@/lib/instagram/callback-payload';
import { exchangeCodeForAccessToken, fetchInstagramProfile } from '@/lib/instagram/oauth';
import { parseSignedOAuthState } from '@/lib/oauth-state';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const debugEnabled = shouldLogInstagramCallbackPayload(process.env);
  const requestId = crypto.randomUUID().slice(0, 8);

  if (debugEnabled) {
    const debugMeta = buildInstagramCallbackDebugMeta({
      requestId,
      requestUrl: request.url,
      code,
      state,
      headers: request.headers,
    });
    const queryPayload = buildInstagramCallbackPayload(requestUrl.searchParams);
    console.info('[instagram-callback] start', JSON.stringify(debugMeta));
    console.info('[instagram-callback] request url', request.url);
    console.info('[instagram-callback] query payload raw', JSON.stringify(queryPayload, null, 2));
  }

  try {
    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const stateSecret = process.env.CLERK_SECRET_KEY || process.env.TOKEN_ENCRYPTION_KEY;
    if (!stateSecret) {
      return NextResponse.json({ error: 'OAuth state secret is not configured' }, { status: 500 });
    }

    const parsedState = parseSignedOAuthState(state.trim(), stateSecret);
    if (!parsedState.valid) {
      if (debugEnabled) {
        console.info('[instagram-callback] invalid state', JSON.stringify({ requestId, reason: parsedState.reason }));
      }
      return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 });
    }

    if (debugEnabled) {
      console.info('[instagram-callback] token exchange start', JSON.stringify({ requestId }));
    }
    const token = await exchangeCodeForAccessToken(code);
    if (debugEnabled) {
      console.info('[instagram-callback] token exchange ok', JSON.stringify({ requestId, expiresIn: token.expiresIn }));
    }

    const profile = await fetchInstagramProfile(token.accessToken);
    if (debugEnabled) {
      console.info('[instagram-callback] profile loaded', JSON.stringify({ requestId, igUserId: profile.id, username: profile.username }));
    }
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

    if (debugEnabled) {
      console.info('[instagram-callback] account upserted', JSON.stringify({ requestId, igUserId: profile.id }));
    }

    return NextResponse.redirect(new URL('/dashboard/account?connected=1', request.url));
  } catch (error) {
    if (debugEnabled) {
      console.error(
        '[instagram-callback] error',
        JSON.stringify({
          requestId,
          name: error instanceof Error ? error.name : 'UnknownError',
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
    throw error;
  }
}
