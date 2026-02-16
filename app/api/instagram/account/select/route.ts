import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { setActiveInstagramAccount } from '@/lib/instagram/account-selection';

interface SelectAccountPayload {
  igUserId?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as SelectAccountPayload;
  const igUserId = payload.igUserId?.trim();

  if (!igUserId) {
    return NextResponse.json({ error: 'igUserId is required' }, { status: 400 });
  }

  const updated = await setActiveInstagramAccount(userId, igUserId);
  if (!updated) {
    return NextResponse.json({ error: 'Selected account is not connected to this user' }, { status: 404 });
  }

  return NextResponse.json({ selectedIgUserId: igUserId });
}
