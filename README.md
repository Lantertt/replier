# K-Beauty Reply Assistant (MVP)

Next.js + Clerk + Neon + Drizzle 기반의 인스타 댓글 답글 보조 서비스 MVP입니다.

## Stack

- Next.js (App Router)
- Clerk (Auth)
- Neon Postgres
- Drizzle ORM
- Vitest
- Playwright

## Required Environment Variables

Copy `.env.example` into `.env.local` and fill:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`
- `TOKEN_ENCRYPTION_KEY` (exactly 32 bytes)
- `ADMIN_CLERK_USER_IDS` (comma-separated Clerk user IDs)

## Install and Run

```bash
pnpm install
pnpm dev
```

## Drizzle Schema Sync

```bash
pnpm db:push
```

## Test Commands

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm playwright test tests/e2e/dashboard-flow.spec.ts
```

## Instagram Login OAuth (MVP Dev Mode)

- In Meta App Dashboard, add **Instagram API with Instagram Login** product.
- Keep app in development mode while testing.
- Add tester accounts in App Roles for live OAuth test.
- Set OAuth Redirect URI to the same value as `META_REDIRECT_URI`.
  - Example: `http://localhost:3000/api/instagram/callback`
- Required scopes for this MVP:
  - `instagram_business_basic`
  - `instagram_business_manage_comments`

## Credentials Note

- Use the Meta app credentials (`META_APP_ID`, `META_APP_SECRET`) from the app where Instagram Login product is enabled.
- No separate env var names are needed for this project.

## Admin Mapping Rule

- Admin page stores ad context by `target_ig_user_id`.
- User OAuth callback stores real `ig_user_id` in `instagram_accounts`.
- Draft generation resolves ad context with matched `ig_user_id` and injects it into reply generation.
