import { describe, expect, it } from 'vitest';
import {
  buildOAuthStateExpiry,
  buildSignedOAuthState,
  generateOAuthState,
  isOAuthStateExpired,
  parseSignedOAuthState,
} from '@/lib/oauth-state';

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

  it('builds and verifies signed state', () => {
    const secret = 'test-secret';
    const now = new Date('2026-02-14T00:00:00.000Z');
    const state = buildSignedOAuthState('user_123', secret, now);
    const parsed = parseSignedOAuthState(state, secret, new Date('2026-02-14T00:05:00.000Z'));

    expect(parsed.valid).toBe(true);
    if (parsed.valid) {
      expect(parsed.clerkUserId).toBe('user_123');
    }
  });

  it('rejects expired signed state', () => {
    const secret = 'test-secret';
    const now = new Date('2026-02-14T00:00:00.000Z');
    const state = buildSignedOAuthState('user_123', secret, now);
    const parsed = parseSignedOAuthState(state, secret, new Date('2026-02-14T00:30:00.000Z'));

    expect(parsed.valid).toBe(false);
    if (!parsed.valid) {
      expect(parsed.reason).toBe('expired');
    }
  });
});
