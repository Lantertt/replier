import { beforeEach, describe, expect, it } from 'vitest';
import { buildMetaOAuthUrl } from '@/lib/instagram/oauth';

beforeEach(() => {
  process.env.META_APP_ID = 'meta-app-id';
  process.env.META_REDIRECT_URI = 'https://example.com/api/instagram/callback';
});

describe('meta oauth url', () => {
  it('includes state and required scope', () => {
    const url = buildMetaOAuthUrl('state-123');

    expect(url).toContain('https://www.instagram.com/oauth/authorize');
    expect(url).toContain('state=state-123');
    expect(url).toContain('force_reauth=true');
    expect(url).toContain('instagram_business_basic');
    expect(url).toContain('instagram_business_manage_messages');
    expect(url).toContain('instagram_business_manage_comments');
    expect(url).toContain('instagram_business_content_publish');
    expect(url).toContain('instagram_business_manage_insights');
  });
});
