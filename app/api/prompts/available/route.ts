import { and, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { promptAssignments, promptTemplates } from '@/db/schema';
import { getSelectedInstagramAccountForUser } from '@/lib/instagram/account-selection';

export async function GET() {
  if (process.env.SKIP_CLERK === 'true') {
    return NextResponse.json({ prompts: [] });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const linked = await getSelectedInstagramAccountForUser(userId);
  if (!linked) {
    return NextResponse.json({ prompts: [] });
  }

  const prompts = await db()
    .select({
      id: promptTemplates.id,
      name: promptTemplates.name,
      productName: promptTemplates.productName,
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

  return NextResponse.json({ prompts });
}
