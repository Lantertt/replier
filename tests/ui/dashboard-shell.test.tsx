import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

describe('dashboard shell', () => {
  it('renders sidebar entries', () => {
    const html = renderToStaticMarkup(<DashboardPage />);

    expect(html).toContain('계정 연결');
    expect(html).toContain('게시물 &amp; 댓글');
  });
});
