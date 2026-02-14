import { describe, expect, it } from 'vitest';
import { adminAdContexts, instagramAccounts, replyDrafts } from '@/db/schema';

describe('schema shape', () => {
  it('defines required tables', () => {
    expect(instagramAccounts[Symbol.for('drizzle:Name')]).toBe('instagram_accounts');
    expect(adminAdContexts[Symbol.for('drizzle:Name')]).toBe('admin_ad_contexts');
    expect(replyDrafts[Symbol.for('drizzle:Name')]).toBe('reply_drafts');
  });
});
