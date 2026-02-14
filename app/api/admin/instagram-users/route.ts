import { auth } from '@clerk/nextjs/server';
import { asc, ilike } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';
import { isAdminUser } from '@/lib/auth';
import { normalizeInstagramUsername } from '@/lib/instagram/username';

function assertAdmin(userId: string): boolean {
  return isAdminUser(userId, process.env.ADMIN_CLERK_USER_IDS || '');
}

export async function GET(request: Request) {
  if (process.env.SKIP_CLERK === 'true') {
    return NextResponse.json({ suggestions: [] });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!assertAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = normalizeInstagramUsername(url.searchParams.get('q'));

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const rows = await db()
    .select({
      igUserId: instagramAccounts.igUserId,
      username: instagramAccounts.username,
    })
    .from(instagramAccounts)
    .where(ilike(instagramAccounts.username, `${query}%`))
    .orderBy(asc(instagramAccounts.username))
    .limit(8);

  return NextResponse.json({ suggestions: rows });
}
