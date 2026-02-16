import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { replyDrafts } from '@/db/schema';
import { getSelectedInstagramAccountForUser } from '@/lib/instagram/account-selection';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const linked = await getSelectedInstagramAccountForUser(userId);
  if (!linked) {
    return NextResponse.json({ drafts: [] });
  }

  const drafts = await db()
    .select({
      id: replyDrafts.id,
      igCommentId: replyDrafts.igCommentId,
      intent: replyDrafts.intent,
      status: replyDrafts.status,
      aiDraft: replyDrafts.aiDraft,
      createdAt: replyDrafts.createdAt,
    })
    .from(replyDrafts)
    .where(eq(replyDrafts.targetIgUserId, linked.igUserId))
    .orderBy(desc(replyDrafts.createdAt));

  return NextResponse.json({ drafts });
}
