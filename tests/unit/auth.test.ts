import { describe, expect, it } from 'vitest';
import { isAdminUser } from '@/lib/auth';

describe('isAdminUser', () => {
  it('returns true for any authenticated user', () => {
    expect(isAdminUser('user_admin', 'user_admin,user_2')).toBe(true);
    expect(isAdminUser('user_3', 'user_admin,user_2')).toBe(true);
  });

  it('returns false when user id is empty', () => {
    expect(isAdminUser('', 'user_admin,user_2')).toBe(false);
  });
});
