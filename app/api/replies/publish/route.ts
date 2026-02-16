import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { decryptToken } from '@/lib/crypto';
import { getSelectedInstagramAccountForUser } from '@/lib/instagram/account-selection';
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

  const account = await getSelectedInstagramAccountForUser(userId);

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
