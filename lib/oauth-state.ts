import crypto from 'node:crypto';

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

interface OAuthStatePayload {
  nonce: string;
  clerkUserId: string;
  expiresAt: number;
}

type OAuthStateParseResult =
  | {
      valid: true;
      clerkUserId: string;
      expiresAt: number;
    }
  | {
      valid: false;
      reason: 'invalid' | 'expired';
    };

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function buildOAuthStateExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + OAUTH_STATE_TTL_MS);
}

export function isOAuthStateExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function buildSignedOAuthState(clerkUserId: string, secret: string, now: Date = new Date()): string {
  const payload: OAuthStatePayload = {
    nonce: generateOAuthState(),
    clerkUserId,
    expiresAt: buildOAuthStateExpiry(now).getTime(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function parseSignedOAuthState(state: string, secret: string, now: Date = new Date()): OAuthStateParseResult {
  const [encodedPayload, signature] = state.split('.');
  if (!encodedPayload || !signature) {
    return { valid: false, reason: 'invalid' };
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== providedBuffer.length) {
    return { valid: false, reason: 'invalid' };
  }

  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    return { valid: false, reason: 'invalid' };
  }

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as OAuthStatePayload;
  } catch {
    return { valid: false, reason: 'invalid' };
  }

  if (!payload?.clerkUserId || !payload?.expiresAt) {
    return { valid: false, reason: 'invalid' };
  }

  if (payload.expiresAt <= now.getTime()) {
    return { valid: false, reason: 'expired' };
  }

  return {
    valid: true,
    clerkUserId: payload.clerkUserId,
    expiresAt: payload.expiresAt,
  };
}
