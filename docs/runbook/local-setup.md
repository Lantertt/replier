# Local Setup Runbook

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Configure Environment

Copy `.env.example` to `.env.local` and fill values:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL` (Neon)
- `OPENAI_API_KEY`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`
- `TOKEN_ENCRYPTION_KEY` (32-byte key)
- `ADMIN_CLERK_USER_IDS` (comma-separated Clerk user IDs)

## 3. Run App

```bash
pnpm dev
```

## 4. Run Unit/Integration Tests

```bash
pnpm vitest run
```

## 5. Run E2E Test

```bash
pnpm playwright test tests/e2e/dashboard-flow.spec.ts
```

## 6. OAuth Dev Mode Notes

- Meta app should stay in development mode for MVP.
- Use app role accounts (admin/dev/tester) to verify OAuth and comment publish.
