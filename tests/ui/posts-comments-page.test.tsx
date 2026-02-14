import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PostsCommentsPage from '@/app/(dashboard)/dashboard/posts-comments/page';

describe('posts comments page', () => {
  it('renders posts and comments sections', () => {
    const html = renderToStaticMarkup(<PostsCommentsPage />);

    expect(html).toContain('게시물 목록');
    expect(html).toContain('댓글 목록');
  });
});
