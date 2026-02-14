import { and, desc, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { promptTemplates } from '@/db/schema';
import { isAdminUser } from '@/lib/auth';
import { promptTemplateSchema } from '@/lib/validation/prompt-template';

function assertAdmin(userId: string): boolean {
  return isAdminUser(userId, process.env.ADMIN_CLERK_USER_IDS || '');
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!assertAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const prompts = await db()
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.isActive, true))
    .orderBy(desc(promptTemplates.updatedAt));

  return NextResponse.json({ prompts });
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
  const parsed = promptTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await db()
    .insert(promptTemplates)
    .values({
      ...parsed.data,
      updatedByAdminClerkId: userId,
    })
    .returning();

  return NextResponse.json({ prompt: created[0] });
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
  const promptId = url.searchParams.get('promptId');
  if (!promptId) {
    return NextResponse.json({ error: 'promptId is required' }, { status: 400 });
  }

  await db()
    .update(promptTemplates)
    .set({ isActive: false, updatedAt: new Date(), updatedByAdminClerkId: userId })
    .where(and(eq(promptTemplates.id, promptId), eq(promptTemplates.isActive, true)));

  return NextResponse.json({ ok: true });
}
