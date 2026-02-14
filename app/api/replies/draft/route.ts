import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { generateDraftFromPrompt } from '@/lib/ai/draft';
import { classifyIntent } from '@/lib/ai/intent';
import { db } from '@/db/client';
import { instagramAccounts, promptAssignments, promptTemplates, replyDrafts } from '@/db/schema';

interface DraftPayload {
  igCommentId?: string;
  commentText?: string;
  postId?: string;
  selectedPromptId?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as DraftPayload;
  if (!payload.igCommentId || !payload.commentText || !payload.postId) {
    return NextResponse.json({ error: 'igCommentId, commentText, postId are required' }, { status: 400 });
  }

  const dbClient = db();
  const linkedRows = await dbClient
    .select({ igUserId: instagramAccounts.igUserId })
    .from(instagramAccounts)
    .where(eq(instagramAccounts.clerkUserId, userId))
    .limit(1);

  const linked = linkedRows[0];
  if (!linked) {
    return NextResponse.json({ error: 'Instagram account not connected' }, { status: 404 });
  }

  const availablePrompts = await dbClient
    .select({
      id: promptTemplates.id,
      name: promptTemplates.name,
      productName: promptTemplates.productName,
      promptBody: promptTemplates.promptBody,
    })
    .from(promptAssignments)
    .innerJoin(promptTemplates, eq(promptTemplates.id, promptAssignments.promptTemplateId))
    .where(
      and(
        eq(promptAssignments.targetIgUserId, linked.igUserId),
        eq(promptAssignments.isActive, true),
        eq(promptTemplates.isActive, true),
      ),
    );

  if (availablePrompts.length === 0) {
    return NextResponse.json({ error: 'No prompt access granted for this user' }, { status: 403 });
  }

  const selectedPrompt = payload.selectedPromptId
    ? availablePrompts.find((prompt) => prompt.id === payload.selectedPromptId)
    : availablePrompts[0];

  if (!selectedPrompt) {
    return NextResponse.json({ error: 'Selected prompt is not available for this user' }, { status: 403 });
  }

  const intent = classifyIntent(payload.commentText);
  const status = intent === 'risk' ? 'hold' : 'draft';

  const aiDraft = await generateDraftFromPrompt({
    commentText: payload.commentText,
    intent,
    operationalPrompt: selectedPrompt.promptBody,
  });

  const inserted = await dbClient
    .insert(replyDrafts)
    .values({
      igCommentId: payload.igCommentId,
      targetIgUserId: linked.igUserId,
      intent,
      originalComment: payload.commentText,
      aiDraft,
      status,
    })
    .returning({ id: replyDrafts.id, status: replyDrafts.status, aiDraft: replyDrafts.aiDraft, intent: replyDrafts.intent });

  return NextResponse.json({ draft: inserted[0], selectedPrompt: { id: selectedPrompt.id, name: selectedPrompt.name } });
}
