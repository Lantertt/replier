import { describe, expect, it } from 'vitest';
import { decryptToken, encryptToken } from '@/lib/crypto';

describe('token encryption', () => {
  it('encrypts and decrypts roundtrip', () => {
    const secret = 'abc123';
    const key = '12345678901234567890123456789012';
    const cipher = encryptToken(secret, key);

    expect(decryptToken(cipher, key)).toBe(secret);
  });
});
