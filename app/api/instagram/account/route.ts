import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';

export async function GET() {
  if (process.env.SKIP_CLERK === 'true') {
    return NextResponse.json({ account: null });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db()
    .select({
      igUserId: instagramAccounts.igUserId,
      username: instagramAccounts.username,
    })
    .from(instagramAccounts)
    .where(eq(instagramAccounts.clerkUserId, userId))
    .limit(1);

  const account = rows[0];

  return NextResponse.json({
    account: account
      ? {
        igUserId: account.igUserId,
        username: account.username,
      }
      : null,
  });
}
