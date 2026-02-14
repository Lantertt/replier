import { describe, expect, it } from 'vitest';

import { buildInstagramCallbackDebugMeta, fingerprintValue } from '@/lib/instagram/callback-debug';

describe('instagram callback debug', () => {
  it('builds deterministic callback debug metadata', () => {
    const headers = new Headers({
      'user-agent': 'Mozilla/5.0',
      'x-forwarded-for': '1.2.3.4',
      referer: 'https://www.instagram.com/',
    });

    const meta = buildInstagramCallbackDebugMeta({
      requestId: 'req_123',
      requestUrl: 'https://example.com/api/instagram/callback?code=abc&state=def',
      code: 'abc',
      state: 'def',
      headers,
      now: new Date('2026-02-14T00:00:00.000Z'),
    });

    expect(meta).toEqual({
      requestId: 'req_123',
      at: '2026-02-14T00:00:00.000Z',
      path: '/api/instagram/callback',
      codeLength: 3,
      codeFingerprint: fingerprintValue('abc'),
      stateLength: 3,
      stateFingerprint: fingerprintValue('def'),
      userAgent: 'Mozilla/5.0',
      forwardedFor: '1.2.3.4',
      referer: 'https://www.instagram.com/',
    });
  });
});
