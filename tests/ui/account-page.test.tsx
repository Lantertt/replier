import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AccountPage from '@/app/(dashboard)/dashboard/account/page';

describe('account page', () => {
  it('shows instagram connect button', () => {
    const html = renderToStaticMarkup(<AccountPage />);

    expect(html).toContain('Instagram 연결');
  });
});
