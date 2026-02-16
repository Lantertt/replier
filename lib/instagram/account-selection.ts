import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { instagramAccounts } from '@/db/schema';

export interface InstagramAccountSummary {
  igUserId: string;
  username: string;
  isActive: boolean;
}

export interface InstagramAccountWithToken extends InstagramAccountSummary {
  accessTokenEncrypted: string;
}

export function resolveSelectedInstagramAccount<T extends { isActive: boolean }>(accounts: T[]): T | null {
  return accounts.find((account) => account.isActive) ?? accounts[0] ?? null;
}

export async function listInstagramAccountsForUser(clerkUserId: string): Promise<InstagramAccountSummary[]> {
  return db()
    .select({
      igUserId: instagramAccounts.igUserId,
      username: instagramAccounts.username,
      isActive: instagramAccounts.isActive,
    })
    .from(instagramAccounts)
    .where(eq(instagramAccounts.clerkUserId, clerkUserId))
    .orderBy(desc(instagramAccounts.updatedAt));
}

export async function getSelectedInstagramAccountForUser(clerkUserId: string): Promise<InstagramAccountWithToken | null> {
  const rows = await db()
    .select({
      igUserId: instagramAccounts.igUserId,
      username: instagramAccounts.username,
      isActive: instagramAccounts.isActive,
      accessTokenEncrypted: instagramAccounts.accessTokenEncrypted,
    })
    .from(instagramAccounts)
    .where(eq(instagramAccounts.clerkUserId, clerkUserId))
    .orderBy(desc(instagramAccounts.updatedAt));

  return resolveSelectedInstagramAccount(rows);
}

export async function setActiveInstagramAccount(clerkUserId: string, igUserId: string): Promise<boolean> {
  const dbClient = db();
  const targetRows = await dbClient
    .select({ igUserId: instagramAccounts.igUserId })
    .from(instagramAccounts)
    .where(and(eq(instagramAccounts.clerkUserId, clerkUserId), eq(instagramAccounts.igUserId, igUserId)))
    .limit(1);

  if (!targetRows[0]) {
    return false;
  }

  const now = new Date();

  await dbClient
    .update(instagramAccounts)
    .set({ isActive: false, updatedAt: now })
    .where(eq(instagramAccounts.clerkUserId, clerkUserId));

  await dbClient
    .update(instagramAccounts)
    .set({ isActive: true, updatedAt: now })
    .where(and(eq(instagramAccounts.clerkUserId, clerkUserId), eq(instagramAccounts.igUserId, igUserId)));

  return true;
}
