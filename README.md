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
- `NEXT_PUBLIC_META_APP_ID` (same value as `META_APP_ID`)
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

## Drizzle Migration

```bash
pnpm db:generate
pnpm db:migrate
```

## Test Commands

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm playwright test tests/e2e/dashboard-flow.spec.ts
```

## Meta OAuth (MVP Dev Mode)

- Use Meta OAuth dialog endpoint (`facebook.com/.../dialog/oauth`) flow.
- Keep Meta app in development mode.
- Add app-role accounts (admin/dev/tester) for live OAuth testing.
- OAuth Redirect URI must exactly match `META_REDIRECT_URI`.
  - Example: `http://localhost:3000/api/instagram/callback`
- Required permissions for this MVP:
  - `instagram_basic`
  - `instagram_manage_comments`
  - `pages_show_list`
  - `pages_read_engagement`

## Credentials Note

- Use the Meta app credentials (`META_APP_ID`, `META_APP_SECRET`) from your app.
- No separate env var names are needed for this project.

## Admin Mapping Rule

- Admin page stores ad context by `target_ig_user_id`.
- User OAuth callback stores real `ig_user_id` in `instagram_accounts`.
- Draft generation resolves ad context with matched `ig_user_id` and injects it into reply generation.
