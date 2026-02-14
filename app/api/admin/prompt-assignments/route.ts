import { and, desc, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { promptAssignments, promptTemplates } from '@/db/schema';
import { isAdminUser } from '@/lib/auth';
import { promptAssignmentSchema } from '@/lib/validation/prompt-assignment';

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
  const igUserId = url.searchParams.get('igUserId');
  if (!igUserId) {
    return NextResponse.json({ assignments: [] });
  }

  const assignments = await db()
    .select({
      id: promptAssignments.id,
      targetIgUserId: promptAssignments.targetIgUserId,
      promptTemplateId: promptAssignments.promptTemplateId,
      promptName: promptTemplates.name,
      productName: promptTemplates.productName,
      isActive: promptAssignments.isActive,
      updatedAt: promptAssignments.updatedAt,
    })
    .from(promptAssignments)
    .innerJoin(promptTemplates, eq(promptTemplates.id, promptAssignments.promptTemplateId))
    .where(and(eq(promptAssignments.targetIgUserId, igUserId), eq(promptAssignments.isActive, true)))
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
  const parsed = promptAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await db()
    .insert(promptAssignments)
    .values({
      ...parsed.data,
      grantedByAdminClerkId: userId,
    })
    .onConflictDoUpdate({
      target: [promptAssignments.targetIgUserId, promptAssignments.promptTemplateId],
      set: {
        isActive: true,
        grantedByAdminClerkId: userId,
        updatedAt: new Date(),
      },
    })
    .returning();

  return NextResponse.json({ assignment: created[0] });
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
