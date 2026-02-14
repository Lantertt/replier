import { describe, expect, it } from 'vitest';
import { buildOAuthStateExpiry, generateOAuthState, isOAuthStateExpired } from '@/lib/oauth-state';

describe('oauth state helpers', () => {
  it('generates a non-empty random state', () => {
    const state = generateOAuthState();
    expect(state.length).toBeGreaterThan(20);
  });

  it('creates an expiry in the future', () => {
    const now = new Date('2026-02-14T00:00:00.000Z');
    const expiry = buildOAuthStateExpiry(now);

    expect(expiry.getTime()).toBeGreaterThan(now.getTime());
  });

  it('detects expired state', () => {
    const now = new Date('2026-02-14T00:10:00.000Z');
    const expiresAt = new Date('2026-02-14T00:09:00.000Z');

    expect(isOAuthStateExpired(expiresAt, now)).toBe(true);
  });
});
