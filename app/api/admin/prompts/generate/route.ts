import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { promptTemplates } from '@/db/schema';
import { generateOperationalPrompt } from '@/lib/ai/operational-prompt';
import { isAdminUser } from '@/lib/auth';
import { promptGenerateSchema } from '@/lib/validation/prompt-generate';

function assertAdmin(userId: string): boolean {
  return isAdminUser(userId, process.env.ADMIN_CLERK_USER_IDS || '');
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
  const parsed = promptGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const generatedPrompt = await generateOperationalPrompt(parsed.data);

  const created = await db()
    .insert(promptTemplates)
    .values({
      name: parsed.data.name,
      productName: parsed.data.productName,
      promptBody: generatedPrompt,
      updatedByAdminClerkId: userId,
    })
    .returning();

  return NextResponse.json({
    prompt: created[0],
    generatedPrompt,
  });
}
