import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { buildMetaOAuthUrl } from '@/lib/instagram/oauth';
import { buildSignedOAuthState } from '@/lib/oauth-state';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stateSecret = process.env.CLERK_SECRET_KEY || process.env.TOKEN_ENCRYPTION_KEY;
  if (!stateSecret) {
    return NextResponse.json({ error: 'OAuth state secret is not configured' }, { status: 500 });
  }
  const state = buildSignedOAuthState(userId, stateSecret);

  return NextResponse.redirect(buildMetaOAuthUrl(state));
}
