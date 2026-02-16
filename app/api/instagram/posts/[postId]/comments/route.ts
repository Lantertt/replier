import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { decryptToken } from '@/lib/crypto';
import { getSelectedInstagramAccountForUser } from '@/lib/instagram/account-selection';
import { listComments } from '@/lib/instagram/client';

export async function GET(_request: Request, context: { params: Promise<{ postId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await context.params;
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
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
  const comments = await listComments(postId, accessToken);

  return NextResponse.json({ comments });
}
