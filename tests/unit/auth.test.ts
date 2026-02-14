import { describe, expect, it } from 'vitest';
import { isAdminUser } from '@/lib/auth';

describe('isAdminUser', () => {
  it('returns true when user is in ADMIN_CLERK_USER_IDS', () => {
    expect(isAdminUser('user_admin', 'user_admin,user_2')).toBe(true);
  });

  it('returns false when user is not in ADMIN_CLERK_USER_IDS', () => {
    expect(isAdminUser('user_3', 'user_admin,user_2')).toBe(false);
  });
});
