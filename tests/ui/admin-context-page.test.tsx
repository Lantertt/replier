import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AdminContextPage from '@/app/(dashboard)/dashboard/admin-context/page';

describe('admin context page', () => {
  it('renders target ig user id input', () => {
    const html = renderToStaticMarkup(<AdminContextPage />);

    expect(html).toContain('Instagram User ID');
  });

  it('renders prompt management section', () => {
    const html = renderToStaticMarkup(<AdminContextPage />);

    expect(html).toContain('프롬프트 템플릿 관리');
    expect(html).toContain('사용자 프롬프트 권한 부여');
  });
});
