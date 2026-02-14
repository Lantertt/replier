import { beforeEach, describe, expect, it } from 'vitest';
import { buildMetaOAuthUrl } from '@/lib/instagram/oauth';

beforeEach(() => {
  process.env.META_APP_ID = 'meta-app-id';
  process.env.META_REDIRECT_URI = 'https://example.com/api/instagram/callback';
});

describe('meta oauth url', () => {
  it('includes state and required scope', () => {
    const url = buildMetaOAuthUrl('state-123');

    expect(url).toContain('state=state-123');
    expect(url).toContain('instagram_manage_comments');
  });
});
