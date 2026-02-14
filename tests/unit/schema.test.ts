import { describe, expect, it } from 'vitest';
import { adminAdContexts, instagramAccounts, promptAssignments, promptTemplates, replyDrafts } from '@/db/schema';

function tableName(table: unknown): string {
  return (table as Record<symbol, string>)[Symbol.for('drizzle:Name')];
}

describe('schema shape', () => {
  it('defines required tables', () => {
    expect(tableName(instagramAccounts)).toBe('instagram_accounts');
    expect(tableName(adminAdContexts)).toBe('admin_ad_contexts');
    expect(tableName(replyDrafts)).toBe('reply_drafts');
    expect(tableName(promptTemplates)).toBe('prompt_templates');
    expect(tableName(promptAssignments)).toBe('prompt_assignments');
  });
});
