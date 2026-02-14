import { beforeEach, describe, expect, it, vi } from 'vitest';

const REQUIRED_ENV = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
  CLERK_SECRET_KEY: 'sk_test_123',
  DATABASE_URL: 'https://example.com/db',
  OPENAI_API_KEY: 'openai_test_123',
  META_APP_ID: 'meta_app_123',
  META_APP_SECRET: 'meta_secret_123',
  META_REDIRECT_URI: 'https://example.com/callback',
  ADMIN_CLERK_USER_IDS: 'user_1,user_2',
};

beforeEach(() => {
  Object.assign(process.env, REQUIRED_ENV);
  vi.resetModules();
});

describe('env bootstrap', () => {
  it('parses required environment variables', async () => {
    const { env } = await import('@/lib/env');
    expect(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeTypeOf('string');
  });
});
