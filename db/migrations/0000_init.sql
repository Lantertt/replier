CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instagram_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  ig_user_id text NOT NULL UNIQUE,
  username text NOT NULL,
  access_token_encrypted text NOT NULL,
  token_expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_ad_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_ig_user_id text NOT NULL,
  product_name text NOT NULL,
  usp_text text NOT NULL,
  sales_link text NOT NULL,
  discount_code text NOT NULL,
  required_keywords jsonb NOT NULL,
  banned_keywords jsonb NOT NULL,
  tone_notes text NOT NULL,
  updated_by_admin_clerk_id text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_context_target_ig_user_id ON admin_ad_contexts(target_ig_user_id);

CREATE TABLE IF NOT EXISTS reply_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_comment_id text NOT NULL,
  target_ig_user_id text NOT NULL,
  intent text NOT NULL,
  original_comment text NOT NULL,
  ai_draft text NOT NULL,
  status text NOT NULL,
  published_reply_comment_id text,
  error_message text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reply_drafts_ig_comment_id ON reply_drafts(ig_comment_id);
CREATE INDEX IF NOT EXISTS idx_reply_drafts_target_ig_user_id ON reply_drafts(target_ig_user_id);

CREATE TABLE IF NOT EXISTS oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL UNIQUE,
  clerk_user_id text NOT NULL,
  expires_at timestamp NOT NULL
);
