import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { oauthStates } from '@/db/schema';
import { buildMetaOAuthUrl } from '@/lib/instagram/oauth';
import { buildOAuthStateExpiry, generateOAuthState } from '@/lib/oauth-state';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = generateOAuthState();

  await db().insert(oauthStates).values({
    state,
    clerkUserId: userId,
    expiresAt: buildOAuthStateExpiry(),
  });

  return NextResponse.redirect(buildMetaOAuthUrl(state));
}
