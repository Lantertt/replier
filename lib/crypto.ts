import crypto from 'node:crypto';

const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function toKeyBuffer(key: string): Buffer {
  const normalizedKey = key.trim();

  if (/^[0-9a-f]{64}$/i.test(normalizedKey)) {
    return Buffer.from(normalizedKey, 'hex');
  }

  const keyBuffer = Buffer.from(normalizedKey, 'utf8');
  if (keyBuffer.length !== 32) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must be exactly 32 bytes (or 64 hex chars). Received ${keyBuffer.length} bytes`,
    );
  }
  return keyBuffer;
}

export function encryptToken(plain: string, key: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', toKeyBuffer(key), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptToken(payload: string, key: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv('aes-256-gcm', toKeyBuffer(key), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
