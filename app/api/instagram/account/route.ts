import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { listInstagramAccountsForUser, resolveSelectedInstagramAccount } from '@/lib/instagram/account-selection';

export async function GET() {
  if (process.env.SKIP_CLERK === 'true') {
    return NextResponse.json({ account: null, accounts: [] });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await listInstagramAccountsForUser(userId);
  const account = resolveSelectedInstagramAccount(accounts);

  return NextResponse.json({
    account: account
      ? {
        igUserId: account.igUserId,
        username: account.username,
      }
      : null,
    accounts,
  });
}
