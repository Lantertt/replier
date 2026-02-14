import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';
import { decryptToken } from '@/lib/crypto';
import { listPosts } from '@/lib/instagram/client';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db().select().from(instagramAccounts).where(eq(instagramAccounts.clerkUserId, userId)).limit(1);
  const account = rows[0];

  if (!account) {
    return NextResponse.json({ error: 'Instagram account not connected' }, { status: 404 });
  }

  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return NextResponse.json({ error: 'TOKEN_ENCRYPTION_KEY is required' }, { status: 500 });
  }

  const accessToken = decryptToken(account.accessTokenEncrypted, encryptionKey);
  const posts = await listPosts(account.igUserId, accessToken);

  return NextResponse.json({ posts });
}
