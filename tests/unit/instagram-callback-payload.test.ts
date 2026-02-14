import { describe, expect, it } from 'vitest';

import { buildInstagramCallbackPayload, shouldLogInstagramCallbackPayload } from '@/lib/instagram/callback-payload';

describe('instagram callback payload', () => {
  it('builds payload from query params', () => {
    const payload = buildInstagramCallbackPayload(new URLSearchParams('code=abc&state=xyz'));

    expect(payload).toEqual({
      code: 'abc',
      state: 'xyz',
    });
  });

  it('keeps duplicated query keys as array', () => {
    const payload = buildInstagramCallbackPayload(new URLSearchParams('foo=1&foo=2'));

    expect(payload).toEqual({
      foo: ['1', '2'],
    });
  });

  it('logs by default in development', () => {
    expect(
      shouldLogInstagramCallbackPayload({
        NODE_ENV: 'development',
      }),
    ).toBe(true);
  });

  it('requires explicit debug flag in production', () => {
    expect(
      shouldLogInstagramCallbackPayload({
        NODE_ENV: 'production',
      }),
    ).toBe(false);
    expect(
      shouldLogInstagramCallbackPayload({
        NODE_ENV: 'production',
        DEBUG_INSTAGRAM_CALLBACK_PAYLOAD: 'true',
      }),
    ).toBe(true);
  });
});
