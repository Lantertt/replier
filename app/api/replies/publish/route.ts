import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';
import { decryptToken } from '@/lib/crypto';
import { publishReply } from '@/lib/instagram/client';

interface PublishPayload {
  igCommentId?: string;
  message?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as PublishPayload;
  if (!body.igCommentId || !body.message) {
    return NextResponse.json({ error: 'igCommentId and message are required' }, { status: 400 });
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
  const reply = await publishReply(body.igCommentId, body.message, accessToken);

  return NextResponse.json({ reply });
}
