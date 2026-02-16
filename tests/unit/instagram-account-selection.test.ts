import { describe, expect, it } from 'vitest';

import { resolveSelectedInstagramAccount } from '@/lib/instagram/account-selection';

describe('resolveSelectedInstagramAccount', () => {
  it('returns active account when one is explicitly selected', () => {
    const selected = resolveSelectedInstagramAccount([
      { igUserId: '1780', username: 'alpha', isActive: false },
      { igUserId: '1781', username: 'beta', isActive: true },
    ]);

    expect(selected?.igUserId).toBe('1781');
  });

  it('falls back to first account when none is active', () => {
    const selected = resolveSelectedInstagramAccount([
      { igUserId: '1780', username: 'alpha', isActive: false },
      { igUserId: '1781', username: 'beta', isActive: false },
    ]);

    expect(selected?.igUserId).toBe('1780');
  });

  it('returns null when account list is empty', () => {
    expect(resolveSelectedInstagramAccount([])).toBeNull();
  });
});
