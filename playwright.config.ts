import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3477',
    trace: 'retain-on-failure',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev -p 3477',
    url: 'http://127.0.0.1:3477',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      CLERK_SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      SKIP_CLERK: 'true',
      DATABASE_URL: 'https://example.com/db',
      OPENAI_API_KEY: 'test-openai-key',
      META_APP_ID: 'test-meta-app',
      META_APP_SECRET: 'test-meta-secret',
      META_REDIRECT_URI: 'http://127.0.0.1:3000/api/instagram/callback',
      TOKEN_ENCRYPTION_KEY: '12345678901234567890123456789012',
      ADMIN_CLERK_USER_IDS: '',
    },
  },
});
