import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { adminAdContexts } from '@/db/schema';
import { isAdminUser } from '@/lib/auth';
import { adContextSchema } from '@/lib/validation/ad-context';

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
    return NextResponse.json({ error: 'igUserId is required' }, { status: 400 });
  }

  const contexts = await db()
    .select()
    .from(adminAdContexts)
    .where(eq(adminAdContexts.targetIgUserId, igUserId))
    .orderBy(desc(adminAdContexts.updatedAt));

  return NextResponse.json({ contexts });
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
  const parsed = adContextSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await db()
    .insert(adminAdContexts)
    .values({
      ...parsed.data,
      updatedByAdminClerkId: userId,
    })
    .returning();

  return NextResponse.json({ context: created[0] });
}
