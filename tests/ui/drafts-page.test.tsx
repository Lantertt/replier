import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DraftsPage from '@/app/(dashboard)/dashboard/drafts/page';

describe('drafts page', () => {
  it('renders draft history table title', () => {
    const html = renderToStaticMarkup(<DraftsPage />);

    expect(html).toContain('답변 기록');
  });
});
