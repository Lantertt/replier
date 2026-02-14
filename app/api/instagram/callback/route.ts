import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts, oauthStates } from '@/db/schema';
import { encryptToken } from '@/lib/crypto';
import { exchangeCodeForAccessToken, fetchInstagramProfile } from '@/lib/instagram/oauth';
import { isOAuthStateExpired } from '@/lib/oauth-state';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  const dbClient = db();
  const rows = await dbClient.select().from(oauthStates).where(eq(oauthStates.state, state)).limit(1);
  const stateRecord = rows[0];

  await dbClient.delete(oauthStates).where(eq(oauthStates.state, state));

  if (!stateRecord || isOAuthStateExpired(stateRecord.expiresAt)) {
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

  await dbClient
    .insert(instagramAccounts)
    .values({
      clerkUserId: stateRecord.clerkUserId,
      igUserId: profile.id,
      username: profile.username,
      accessTokenEncrypted: encryptedToken,
      tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: instagramAccounts.igUserId,
      set: {
        clerkUserId: stateRecord.clerkUserId,
        username: profile.username,
        accessTokenEncrypted: encryptedToken,
        tokenExpiresAt,
        updatedAt: new Date(),
      },
    });

  return NextResponse.redirect(new URL('/dashboard/account?connected=1', request.url));
}
