import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AdminContextPage from '@/app/(dashboard)/dashboard/admin-context/page';

describe('admin context page', () => {
  it('does not render ad-context input form', () => {
    const html = renderToStaticMarkup(<AdminContextPage />);

    expect(html).not.toContain('Instagram User ID');
    expect(html).not.toContain('관리자 컨텍스트 주입');
  });

  it('renders prompt management section', () => {
    const html = renderToStaticMarkup(<AdminContextPage />);

    expect(html).toContain('운영 프롬프트 관리');
    expect(html).toContain('프롬프트 템플릿 관리');
    expect(html).toContain('사용자 프롬프트 권한 부여');
    expect(html).toContain('운영 프롬프트 자동 생성');
    expect(html).toContain('운영 프롬프트 수정');
    expect(html).toContain('허용할 Instagram username 목록');
    expect(html).toContain('Instagram username 검색');
  });
});
