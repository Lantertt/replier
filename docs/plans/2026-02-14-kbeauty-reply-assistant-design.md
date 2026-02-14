# K-Beauty Reply Assistant Design

## 1. Goals and Scope

### Goal
Build an MVP dashboard where a logged-in user can:
- Connect their Instagram account via Meta OAuth.
- Load their Instagram posts.
- Select a post and load comments.
- Generate AI reply drafts per comment using ad context.
- Publish replies to Instagram as real comment replies.

### Non-goals (MVP)
- Full production App Review flow for Meta permissions.
- Multi-platform automation beyond Instagram.
- Fully autonomous posting without human confirmation.

## 2. Tech Stack

- Frontend/Backend: Next.js (App Router)
- Auth: Clerk
- DB: Neon Postgres
- ORM: Drizzle ORM
- AI: OpenAI API (draft generation + intent tagging)
- Instagram Integration: Meta OAuth + Instagram Graph API

## 3. Roles and Access Model

- User role (default):
  - Connect Instagram account.
  - Browse own posts/comments.
  - Generate and publish replies for owned context.

- Admin role:
  - Identified by `ADMIN_CLERK_USER_IDS` env var.
  - Manage ad contexts tied to `target_ig_user_id`.

## 4. Information Architecture (Dashboard)

After login, user enters Dashboard with left sidebar:

1. Account Connection
- Connect/reconnect Instagram via OAuth.
- Show connection status (`username`, `ig_user_id`, token expiry).

2. Posts & Comments
- Load posts from connected IG account.
- Select post to load comments.
- Select comment to generate draft.
- Publish generated reply to real Instagram.

3. Draft History
- View generated/published/failed/hold records.

4. Ad Context (admin only)
- Search/select `ig_user_id`.
- Create/update context: USP, link, discount code, required/banned keywords, tone notes.

## 5. Data Model (Neon + Drizzle)

### `users`
- `id` (text, PK, Clerk user id)
- `created_at` (timestamp)

### `instagram_accounts`
- `id` (uuid, PK)
- `clerk_user_id` (text, FK -> users.id)
- `ig_user_id` (text, unique)
- `username` (text)
- `access_token_encrypted` (text)
- `token_expires_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `admin_ad_contexts`
- `id` (uuid, PK)
- `target_ig_user_id` (text, indexed)
- `product_name` (text)
- `usp_text` (text)
- `sales_link` (text)
- `discount_code` (text)
- `required_keywords` (jsonb)
- `banned_keywords` (jsonb)
- `tone_notes` (text)
- `updated_by_admin_clerk_id` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `reply_drafts`
- `id` (uuid, PK)
- `ig_comment_id` (text, indexed)
- `target_ig_user_id` (text, indexed)
- `intent` (text: `lead|qa|reaction|risk`)
- `original_comment` (text)
- `ai_draft` (text)
- `status` (text: `draft|published|failed|hold`)
- `published_reply_comment_id` (text, nullable)
- `error_message` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `oauth_states`
- `id` (uuid, PK)
- `state` (text, unique)
- `clerk_user_id` (text)
- `expires_at` (timestamp)

## 6. API and Flow

### User: OAuth Connect
- `GET /api/instagram/connect`
  - Verify Clerk session.
  - Create `state`, save in `oauth_states`.
  - Redirect to Meta OAuth URL.

- `GET /api/instagram/callback`
  - Validate `state` + expiry.
  - Exchange `code` for token.
  - Load IG user profile (`ig_user_id`, `username`).
  - Upsert `instagram_accounts`.

### User: Posts and Comments
- `GET /api/instagram/posts`
  - Require linked IG account.
  - Read token and load media list from Graph API.

- `GET /api/instagram/posts/:postId/comments`
  - Fetch comments for selected media.

### User: Draft and Publish
- `POST /api/replies/draft`
  - Input: `ig_comment_id`, `comment_text`, `post_id`.
  - Resolve caller's `ig_user_id`.
  - Load admin context by `ig_user_id`.
  - Run intent classifier and draft generator.
  - Save in `reply_drafts`.
  - If intent is `risk`, save as `hold` and return no publish action.

- `POST /api/replies/publish`
  - Input: `ig_comment_id`, `message`.
  - Call Graph API to create reply comment.
  - On success, update status to `published` with reply id.
  - On failure, status `failed` with message.

### Admin
- `GET /api/admin/ad-contexts?igUserId=...`
- `POST /api/admin/ad-contexts`
- `DELETE /api/admin/ad-contexts/:id`
- All admin routes enforce `ADMIN_CLERK_USER_IDS` gate.

## 7. AI Behavior

- Intent categories: `lead`, `qa`, `reaction`, `risk`.
- Prompt includes:
  - Brand context (USP/link/discount keywords).
  - Tone notes.
  - Safety rule: avoid banned terms, no medical cure claims.
- Output:
  - Intent label.
  - Draft text.
- `risk` intent: hold for manual handling.

## 8. Error Handling and Safety

- OAuth state mismatch/expired: reject callback and restart flow.
- Token expired/invalid: show reconnect CTA in Account Connection tab.
- Missing context: allow generic safe draft with no sales claim.
- Graph API posting failure: persist failure reason in `reply_drafts`.
- Encrypt tokens at rest.

## 9. Test Strategy

- Unit tests:
  - Intent classifier mapping.
  - Banned keyword sanitization.
  - Prompt context injection.

- Integration tests:
  - OAuth callback stores `ig_user_id` in DB.
  - Draft creation uses matched `target_ig_user_id` context.
  - Publish updates draft status on success/failure.

- E2E tests:
  - Login -> connect account -> load posts/comments -> draft -> publish.

## 10. MVP Delivery Constraints

- Meta app in development mode.
- Only app role accounts are expected for live posting in MVP.
- UI optimizes for deterministic demo flow over broad production readiness.
