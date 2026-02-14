import { describe, expect, it } from 'vitest';
import { decryptToken, encryptToken } from '@/lib/crypto';

describe('token encryption', () => {
  it('encrypts and decrypts roundtrip', () => {
    const secret = 'abc123';
    const key = '12345678901234567890123456789012';
    const cipher = encryptToken(secret, key);

    expect(decryptToken(cipher, key)).toBe(secret);
  });

  it('accepts 64-char hex key and encrypts/decrypts roundtrip', () => {
    const secret = 'reply-token';
    const key = '4f2c9a0d8b7e1f63c5a4d9e2b1f07c6e3d8a9b0c1e2f3a4b5c6d7e8f9a0b1c2d';
    const cipher = encryptToken(secret, key);

    expect(decryptToken(cipher, key)).toBe(secret);
  });
});
