# K-Beauty Reply Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Next.js MVP with Clerk + Instagram OAuth + Neon/Drizzle so users can fetch posts/comments, generate AI drafts with admin ad context, and publish real Instagram comment replies.

**Architecture:** Use Next.js App Router with server route handlers for OAuth, Instagram data fetch/publish, admin context CRUD, and AI draft generation. Persist state in Neon via Drizzle, map user OAuth-linked `ig_user_id` to admin-managed ad context, and enforce admin access via environment allowlist.

**Tech Stack:** Next.js 15, TypeScript, Clerk, Drizzle ORM, Neon Postgres, Zod, OpenAI API, Vitest, Playwright.

---

### Task 1: Initialize project, dependencies, and baseline config

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `middleware.ts`
- Create: `.env.example`
- Create: `drizzle.config.ts`
- Create: `vitest.config.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { env } from '@/lib/env';

describe('env bootstrap', () => {
  it('parses required environment variables', () => {
    expect(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeTypeOf('string');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/env.test.ts`
Expected: FAIL with module not found for `@/lib/env`.

**Step 3: Write minimal implementation**

```ts
// lib/env.ts
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  META_APP_ID: z.string().min(1),
  META_APP_SECRET: z.string().min(1),
  META_REDIRECT_URI: z.string().url(),
  ADMIN_CLERK_USER_IDS: z.string().default(''),
});

export const env = schema.parse(process.env);
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/env.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json app/layout.tsx app/page.tsx middleware.ts .env.example drizzle.config.ts vitest.config.ts tests/unit/env.test.ts lib/env.ts
git commit -m "chore: bootstrap nextjs app and environment validation"
```

### Task 2: Implement Drizzle schema and DB client

**Files:**
- Create: `db/schema.ts`
- Create: `db/client.ts`
- Create: `db/migrations/0000_init.sql`
- Create: `tests/unit/schema.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { instagramAccounts, adminAdContexts, replyDrafts } from '@/db/schema';

describe('schema shape', () => {
  it('defines required tables', () => {
    expect(instagramAccounts[Symbol.for('drizzle:Name')]).toBe('instagram_accounts');
    expect(adminAdContexts[Symbol.for('drizzle:Name')]).toBe('admin_ad_contexts');
    expect(replyDrafts[Symbol.for('drizzle:Name')]).toBe('reply_drafts');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/schema.test.ts`
Expected: FAIL, `@/db/schema` missing.

**Step 3: Write minimal implementation**

```ts
// db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const instagramAccounts = pgTable('instagram_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  igUserId: text('ig_user_id').notNull().unique(),
  username: text('username').notNull(),
  accessTokenEncrypted: text('access_token_encrypted').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminAdContexts = pgTable('admin_ad_contexts', {
  id: uuid('id').defaultRandom().primaryKey(),
  targetIgUserId: text('target_ig_user_id').notNull(),
  productName: text('product_name').notNull(),
  uspText: text('usp_text').notNull(),
  salesLink: text('sales_link').notNull(),
  discountCode: text('discount_code').notNull(),
  requiredKeywords: jsonb('required_keywords').$type<string[]>().notNull(),
  bannedKeywords: jsonb('banned_keywords').$type<string[]>().notNull(),
  toneNotes: text('tone_notes').notNull(),
  updatedByAdminClerkId: text('updated_by_admin_clerk_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [index('idx_admin_context_target_ig_user_id').on(t.targetIgUserId)]);

export const replyDrafts = pgTable('reply_drafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  igCommentId: text('ig_comment_id').notNull(),
  targetIgUserId: text('target_ig_user_id').notNull(),
  intent: text('intent').notNull(),
  originalComment: text('original_comment').notNull(),
  aiDraft: text('ai_draft').notNull(),
  status: text('status').notNull(),
  publishedReplyCommentId: text('published_reply_comment_id'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_reply_drafts_ig_comment_id').on(t.igCommentId),
  index('idx_reply_drafts_target_ig_user_id').on(t.targetIgUserId),
]);

export const oauthStates = pgTable('oauth_states', {
  id: uuid('id').defaultRandom().primaryKey(),
  state: text('state').notNull().unique(),
  clerkUserId: text('clerk_user_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/schema.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add db/schema.ts db/client.ts db/migrations/0000_init.sql tests/unit/schema.test.ts
git commit -m "feat: add drizzle schema and neon database client"
```

### Task 3: Add auth guard and admin guard utilities

**Files:**
- Create: `lib/auth.ts`
- Create: `tests/unit/auth.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isAdminUser } from '@/lib/auth';

describe('isAdminUser', () => {
  it('returns true when user is in ADMIN_CLERK_USER_IDS', () => {
    expect(isAdminUser('user_admin', 'user_admin,user_2')).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/auth.test.ts`
Expected: FAIL, `@/lib/auth` missing.

**Step 3: Write minimal implementation**

```ts
export function isAdminUser(userId: string, adminCsv: string): boolean {
  return adminCsv
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .includes(userId);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/auth.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/auth.ts tests/unit/auth.test.ts
git commit -m "feat: add admin authorization helper"
```

### Task 4: Build token crypto + OAuth state helpers

**Files:**
- Create: `lib/crypto.ts`
- Create: `lib/oauth-state.ts`
- Create: `tests/unit/crypto.test.ts`
- Create: `tests/unit/oauth-state.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken } from '@/lib/crypto';

describe('token encryption', () => {
  it('encrypts and decrypts roundtrip', () => {
    const secret = 'abc123';
    const cipher = encryptToken(secret, '32-char-aaaaaaaaaaaaaaaaaaaaaaaa');
    expect(decryptToken(cipher, '32-char-aaaaaaaaaaaaaaaaaaaaaaaa')).toBe(secret);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/crypto.test.ts`
Expected: FAIL, crypto helper missing.

**Step 3: Write minimal implementation**

```ts
import crypto from 'node:crypto';

export function encryptToken(plain: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptToken(payload: string, key: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 16);
  const tag = raw.subarray(16, 32);
  const data = raw.subarray(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/crypto.test.ts tests/unit/oauth-state.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/crypto.ts lib/oauth-state.ts tests/unit/crypto.test.ts tests/unit/oauth-state.test.ts
git commit -m "feat: add token encryption and oauth state helpers"
```

### Task 5: Implement Instagram OAuth connect and callback routes

**Files:**
- Create: `app/api/instagram/connect/route.ts`
- Create: `app/api/instagram/callback/route.ts`
- Create: `lib/instagram/oauth.ts`
- Create: `tests/integration/instagram-oauth.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildMetaOAuthUrl } from '@/lib/instagram/oauth';

describe('meta oauth url', () => {
  it('includes state and required scope', () => {
    const url = buildMetaOAuthUrl('state-123');
    expect(url).toContain('state=state-123');
    expect(url).toContain('instagram_manage_comments');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/instagram-oauth.test.ts`
Expected: FAIL, oauth module missing.

**Step 3: Write minimal implementation**

```ts
export function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    response_type: 'code',
    scope: 'instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement',
    state,
  });

  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/instagram-oauth.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/api/instagram/connect/route.ts app/api/instagram/callback/route.ts lib/instagram/oauth.ts tests/integration/instagram-oauth.test.ts
git commit -m "feat: implement instagram oauth connect and callback"
```

### Task 6: Implement Instagram posts/comments/reply client and API routes

**Files:**
- Create: `lib/instagram/client.ts`
- Create: `app/api/instagram/posts/route.ts`
- Create: `app/api/instagram/posts/[postId]/comments/route.ts`
- Create: `app/api/replies/publish/route.ts`
- Create: `tests/integration/instagram-routes.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeComment } from '@/lib/instagram/client';

describe('instagram comment normalize', () => {
  it('maps graph response to UI shape', () => {
    const mapped = normalizeComment({ id: '1', text: 'hello', username: 'u1' });
    expect(mapped).toEqual({ id: '1', text: 'hello', username: 'u1' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/instagram-routes.test.ts`
Expected: FAIL, client missing.

**Step 3: Write minimal implementation**

```ts
export function normalizeComment(input: { id: string; text: string; username: string }) {
  return {
    id: input.id,
    text: input.text,
    username: input.username,
  };
}
```

Then add fetch wrappers:
- `listPosts(accessToken)`
- `listComments(postId, accessToken)`
- `publishReply(commentId, message, accessToken)`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/instagram-routes.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/instagram/client.ts app/api/instagram/posts/route.ts app/api/instagram/posts/[postId]/comments/route.ts app/api/replies/publish/route.ts tests/integration/instagram-routes.test.ts
git commit -m "feat: add instagram posts comments and reply publish routes"
```

### Task 7: Implement AI intent classification + draft generation route

**Files:**
- Create: `lib/ai/intent.ts`
- Create: `lib/ai/draft.ts`
- Create: `app/api/replies/draft/route.ts`
- Create: `tests/unit/intent.test.ts`
- Create: `tests/unit/draft.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { classifyIntent } from '@/lib/ai/intent';

describe('classifyIntent', () => {
  it('returns lead for purchase questions', () => {
    expect(classifyIntent('어디서 사요? 할인코드 있나요?')).toBe('lead');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/intent.test.ts`
Expected: FAIL, classifier missing.

**Step 3: Write minimal implementation**

```ts
export type Intent = 'lead' | 'qa' | 'reaction' | 'risk';

export function classifyIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/환불|트러블|부작용|늦/.test(t)) return 'risk';
  if (/어디서|구매|할인|코드|링크/.test(t)) return 'lead';
  if (/예뻐|좋아|대박|최고/.test(t)) return 'reaction';
  return 'qa';
}
```

Then implement `generateDraft()` with OpenAI and safety constraints.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/intent.test.ts tests/unit/draft.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ai/intent.ts lib/ai/draft.ts app/api/replies/draft/route.ts tests/unit/intent.test.ts tests/unit/draft.test.ts
git commit -m "feat: add intent classification and draft generation"
```

### Task 8: Implement admin ad-context CRUD routes and validation

**Files:**
- Create: `lib/validation/ad-context.ts`
- Create: `app/api/admin/ad-contexts/route.ts`
- Create: `app/api/admin/ad-contexts/[id]/route.ts`
- Create: `tests/integration/admin-ad-contexts.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { adContextSchema } from '@/lib/validation/ad-context';

describe('ad context schema', () => {
  it('requires target ig user id', () => {
    const parsed = adContextSchema.safeParse({ targetIgUserId: '' });
    expect(parsed.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/admin-ad-contexts.test.ts`
Expected: FAIL, schema missing.

**Step 3: Write minimal implementation**

```ts
import { z } from 'zod';

export const adContextSchema = z.object({
  targetIgUserId: z.string().min(1),
  productName: z.string().min(1),
  uspText: z.string().min(1),
  salesLink: z.string().url(),
  discountCode: z.string().min(1),
  requiredKeywords: z.array(z.string()),
  bannedKeywords: z.array(z.string()),
  toneNotes: z.string().min(1),
});
```

Add route-level admin guard and CRUD operations.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/admin-ad-contexts.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/validation/ad-context.ts app/api/admin/ad-contexts/route.ts app/api/admin/ad-contexts/[id]/route.ts tests/integration/admin-ad-contexts.test.ts
git commit -m "feat: add admin ad context management routes"
```

### Task 9: Build dashboard shell and left sidebar navigation

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `components/dashboard/sidebar.tsx`
- Create: `components/dashboard/header.tsx`
- Create: `tests/ui/dashboard-shell.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import DashboardShell from '@/app/(dashboard)/dashboard/page';

it('renders sidebar entries', () => {
  render(<DashboardShell />);
  expect(screen.getByText('계정 연결')).toBeInTheDocument();
  expect(screen.getByText('게시물 & 댓글')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui/dashboard-shell.test.tsx`
Expected: FAIL, dashboard page missing.

**Step 3: Write minimal implementation**

Create a layout with sidebar links:
- `/dashboard/account`
- `/dashboard/posts-comments`
- `/dashboard/drafts`
- `/dashboard/admin-context` (conditional for admin)

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui/dashboard-shell.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/(dashboard)/layout.tsx app/(dashboard)/dashboard/page.tsx components/dashboard/sidebar.tsx components/dashboard/header.tsx tests/ui/dashboard-shell.test.tsx
git commit -m "feat: add dashboard shell with sidebar navigation"
```

### Task 10: Build Account Connection page and connect action

**Files:**
- Create: `app/(dashboard)/dashboard/account/page.tsx`
- Create: `components/account/connection-card.tsx`
- Create: `tests/ui/account-page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import AccountPage from '@/app/(dashboard)/dashboard/account/page';

it('shows instagram connect button', () => {
  render(<AccountPage />);
  expect(screen.getByRole('button', { name: 'Instagram 연결' })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui/account-page.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Render account status card and button linking to `/api/instagram/connect`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui/account-page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/(dashboard)/dashboard/account/page.tsx components/account/connection-card.tsx tests/ui/account-page.test.tsx
git commit -m "feat: add instagram account connection page"
```

### Task 11: Build Posts & Comments page with draft and publish actions

**Files:**
- Create: `app/(dashboard)/dashboard/posts-comments/page.tsx`
- Create: `components/posts-comments/post-list.tsx`
- Create: `components/posts-comments/comment-list.tsx`
- Create: `components/posts-comments/reply-panel.tsx`
- Create: `tests/ui/posts-comments-page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import PostsCommentsPage from '@/app/(dashboard)/dashboard/posts-comments/page';

it('renders posts and comments sections', () => {
  render(<PostsCommentsPage />);
  expect(screen.getByText('게시물 목록')).toBeInTheDocument();
  expect(screen.getByText('댓글 목록')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui/posts-comments-page.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Build client components that call:
- `GET /api/instagram/posts`
- `GET /api/instagram/posts/:postId/comments`
- `POST /api/replies/draft`
- `POST /api/replies/publish`

UI actions:
- Select post -> load comments
- Select comment -> generate draft
- Click publish -> send reply and refresh status

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui/posts-comments-page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/(dashboard)/dashboard/posts-comments/page.tsx components/posts-comments/post-list.tsx components/posts-comments/comment-list.tsx components/posts-comments/reply-panel.tsx tests/ui/posts-comments-page.test.tsx
git commit -m "feat: add posts comments workflow with draft and publish"
```

### Task 12: Build Draft History page

**Files:**
- Create: `app/(dashboard)/dashboard/drafts/page.tsx`
- Create: `components/drafts/draft-table.tsx`
- Create: `app/api/replies/history/route.ts`
- Create: `tests/ui/drafts-page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import DraftsPage from '@/app/(dashboard)/dashboard/drafts/page';

it('renders draft history table title', () => {
  render(<DraftsPage />);
  expect(screen.getByText('답변 기록')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui/drafts-page.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Add route to fetch latest `reply_drafts` for logged-in user's `ig_user_id` and render table.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui/drafts-page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/(dashboard)/dashboard/drafts/page.tsx components/drafts/draft-table.tsx app/api/replies/history/route.ts tests/ui/drafts-page.test.tsx
git commit -m "feat: add draft history page"
```

### Task 13: Build Admin Context page

**Files:**
- Create: `app/(dashboard)/dashboard/admin-context/page.tsx`
- Create: `components/admin/ad-context-form.tsx`
- Create: `tests/ui/admin-context-page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import AdminContextPage from '@/app/(dashboard)/dashboard/admin-context/page';

it('renders target ig user id input', () => {
  render(<AdminContextPage />);
  expect(screen.getByLabelText('Instagram User ID')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui/admin-context-page.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Render admin-only form with search/create/update capabilities against admin routes.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui/admin-context-page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/(dashboard)/dashboard/admin-context/page.tsx components/admin/ad-context-form.tsx tests/ui/admin-context-page.test.tsx
git commit -m "feat: add admin ad context page"
```

### Task 14: End-to-end flow tests and verification

**Files:**
- Create: `tests/e2e/dashboard-flow.spec.ts`
- Modify: `playwright.config.ts`
- Create: `docs/runbook/local-setup.md`

**Step 1: Write the failing test**

```ts
import { test, expect } from '@playwright/test';

test('user connects account and publishes reply', async ({ page }) => {
  await page.goto('/dashboard/account');
  await expect(page.getByRole('button', { name: 'Instagram 연결' })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/dashboard-flow.spec.ts`
Expected: FAIL before full UI and mocks are wired.

**Step 3: Write minimal implementation**

- Add Playwright test setup/mocks for Instagram endpoints.
- Ensure complete UI flow can run locally.

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/dashboard-flow.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e/dashboard-flow.spec.ts playwright.config.ts docs/runbook/local-setup.md
git commit -m "test: add e2e flow and local runbook"
```

### Task 15: Final verification before completion

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

```md
- [ ] Setup docs include Clerk, Meta OAuth, Neon, Drizzle migration, and admin IDs
```

**Step 2: Run verification commands**

Run in order:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm vitest run`
- `pnpm playwright test`

Expected: all PASS, no warnings blocking release.

**Step 3: Write minimal implementation**

Update `README.md` with:
- Env variable setup
- Migration commands
- How to obtain dev-mode Meta OAuth permissions
- How admin maps `ig_user_id` to ad contexts

**Step 4: Run verification again**

Run:
- `pnpm lint && pnpm typecheck && pnpm vitest run && pnpm playwright test`
Expected: PASS.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: finalize setup and verification instructions"
```

---

## Implementation Notes

- Follow `@test-driven-development` strictly for each task (RED -> GREEN -> REFACTOR).
- Use `@verification-before-completion` before claiming completion.
- Keep all API contracts typed with Zod and shared TS types.
- Prefer server-side token handling; do not expose Instagram tokens to client.
- Keep MVP bounded: development mode accounts only.
