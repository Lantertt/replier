import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AdminContextPage from '@/app/(dashboard)/dashboard/admin-context/page';

describe('admin context page', () => {
  it('renders target ig user id input', () => {
    const html = renderToStaticMarkup(<AdminContextPage />);

    expect(html).toContain('Instagram User ID');
  });
});
