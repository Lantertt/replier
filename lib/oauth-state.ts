import crypto from 'node:crypto';

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function buildOAuthStateExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + OAUTH_STATE_TTL_MS);
}

export function isOAuthStateExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}
