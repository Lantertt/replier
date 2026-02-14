import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts, promptAssignments, promptTemplates } from '@/db/schema';
import { isAdminUser } from '@/lib/auth';
import { normalizeInstagramUsername, normalizeInstagramUsernames } from '@/lib/instagram/username';
import { promptAssignmentBatchSchema, promptAssignmentSchema } from '@/lib/validation/prompt-assignment';

function assertAdmin(userId: string): boolean {
  return isAdminUser(userId, process.env.ADMIN_CLERK_USER_IDS || '');
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!assertAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  let resolvedIgUserId = url.searchParams.get('igUserId')?.trim() || '';

  const username = normalizeInstagramUsername(url.searchParams.get('username'));
  if (!resolvedIgUserId && username) {
    const account = await db()
      .select({ igUserId: instagramAccounts.igUserId })
      .from(instagramAccounts)
      .where(ilike(instagramAccounts.username, username))
      .limit(1);
    resolvedIgUserId = account[0]?.igUserId ?? '';
  }

  if (!resolvedIgUserId) {
    return NextResponse.json({ assignments: [] });
  }

  const assignments = await db()
    .select({
      id: promptAssignments.id,
      targetIgUserId: promptAssignments.targetIgUserId,
      targetUsername: instagramAccounts.username,
      promptTemplateId: promptAssignments.promptTemplateId,
      promptName: promptTemplates.name,
      productName: promptTemplates.productName,
      isActive: promptAssignments.isActive,
      updatedAt: promptAssignments.updatedAt,
    })
    .from(promptAssignments)
    .innerJoin(promptTemplates, eq(promptTemplates.id, promptAssignments.promptTemplateId))
    .leftJoin(instagramAccounts, eq(instagramAccounts.igUserId, promptAssignments.targetIgUserId))
    .where(and(eq(promptAssignments.targetIgUserId, resolvedIgUserId), eq(promptAssignments.isActive, true)))
    .orderBy(desc(promptAssignments.updatedAt));

  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!assertAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsedBatch = promptAssignmentBatchSchema.safeParse(body);

  let targetIgUserIds: string[] = [];
  let targetUsernames: string[] = [];
  let promptTemplateId = '';

  if (parsedBatch.success) {
    targetIgUserIds = parsedBatch.data.targetIgUserIds ?? [];
    targetUsernames = parsedBatch.data.targetUsernames ?? [];
    promptTemplateId = parsedBatch.data.promptTemplateId;
  } else {
    const parsedSingle = promptAssignmentSchema.safeParse(body);
    if (!parsedSingle.success) {
      return NextResponse.json({ error: parsedSingle.error.flatten() }, { status: 400 });
    }
    targetIgUserIds = [parsedSingle.data.targetIgUserId];
    promptTemplateId = parsedSingle.data.promptTemplateId;
  }

  const normalizedIgUserIds = Array.from(new Set(targetIgUserIds.map((value) => value.trim()).filter(Boolean)));
  const normalizedUsernames = normalizeInstagramUsernames(targetUsernames);

  let mappedIgUserIds: string[] = [];
  if (normalizedUsernames.length > 0) {
    const usernameFilters = normalizedUsernames.map((targetUsername) => ilike(instagramAccounts.username, targetUsername));
    const linkedAccounts = await db()
      .select({
        igUserId: instagramAccounts.igUserId,
        username: instagramAccounts.username,
      })
      .from(instagramAccounts)
      .where(usernameFilters.length === 1 ? usernameFilters[0] : or(...usernameFilters));

    const matchedUsernames = new Set(linkedAccounts.map((account) => normalizeInstagramUsername(account.username)));
    const missingUsernames = normalizedUsernames.filter((targetUsername) => !matchedUsernames.has(targetUsername));

    if (missingUsernames.length > 0) {
      return NextResponse.json(
        {
          error: `연결된 Instagram username을 찾을 수 없습니다: ${missingUsernames.map((value) => `@${value}`).join(', ')}`,
        },
        { status: 400 },
      );
    }

    mappedIgUserIds = linkedAccounts.map((account) => account.igUserId);
  }

  const resolvedIgUserIds = Array.from(new Set([...normalizedIgUserIds, ...mappedIgUserIds]));

  if (resolvedIgUserIds.length === 0) {
    return NextResponse.json({ error: 'targetIgUserIds or targetUsernames is required' }, { status: 400 });
  }

  const created = await db()
    .insert(promptAssignments)
    .values(
      resolvedIgUserIds.map((targetIgUserId) => ({
        targetIgUserId,
        promptTemplateId,
        grantedByAdminClerkId: userId,
      })),
    )
    .onConflictDoUpdate({
      target: [promptAssignments.targetIgUserId, promptAssignments.promptTemplateId],
      set: {
        isActive: true,
        grantedByAdminClerkId: userId,
        updatedAt: new Date(),
      },
    })
    .returning();

  return NextResponse.json({ assignments: created, assignedCount: created.length });
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!assertAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const assignmentId = url.searchParams.get('assignmentId');
  if (!assignmentId) {
    return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 });
  }

  await db()
    .update(promptAssignments)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(promptAssignments.id, assignmentId), eq(promptAssignments.isActive, true)));

  return NextResponse.json({ ok: true });
}
