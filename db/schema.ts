import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const instagramAccounts = pgTable(
  'instagram_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkUserId: text('clerk_user_id').notNull(),
    igUserId: text('ig_user_id').notNull().unique(),
    username: text('username').notNull(),
    accessTokenEncrypted: text('access_token_encrypted').notNull(),
    tokenExpiresAt: timestamp('token_expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_instagram_accounts_clerk_user_id').on(table.clerkUserId),
    index('idx_instagram_accounts_username').on(table.username),
  ],
);

export const adminAdContexts = pgTable(
  'admin_ad_contexts',
  {
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
  },
  (table) => [index('idx_admin_context_target_ig_user_id').on(table.targetIgUserId)],
);

export const replyDrafts = pgTable(
  'reply_drafts',
  {
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
  },
  (table) => [
    index('idx_reply_drafts_ig_comment_id').on(table.igCommentId),
    index('idx_reply_drafts_target_ig_user_id').on(table.targetIgUserId),
  ],
);

export const oauthStates = pgTable('oauth_states', {
  id: uuid('id').defaultRandom().primaryKey(),
  state: text('state').notNull().unique(),
  clerkUserId: text('clerk_user_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const promptTemplates = pgTable(
  'prompt_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    productName: text('product_name').notNull(),
    promptBody: text('prompt_body').notNull(),
    updatedByAdminClerkId: text('updated_by_admin_clerk_id').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('idx_prompt_templates_product_name').on(table.productName)],
);

export const promptAssignments = pgTable(
  'prompt_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    targetIgUserId: text('target_ig_user_id').notNull(),
    promptTemplateId: uuid('prompt_template_id').notNull(),
    grantedByAdminClerkId: text('granted_by_admin_clerk_id').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_prompt_assignments_target_ig_user_id').on(table.targetIgUserId),
    index('idx_prompt_assignments_prompt_template_id').on(table.promptTemplateId),
    uniqueIndex('uq_prompt_assignments_target_prompt').on(table.targetIgUserId, table.promptTemplateId),
  ],
);
