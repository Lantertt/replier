import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AccountPage from '@/app/(dashboard)/dashboard/account/page';

describe('account page', () => {
  it('shows instagram connect button', () => {
    process.env.NEXT_PUBLIC_META_APP_ID = 'meta-public-id';
    const html = renderToStaticMarkup(<AccountPage />);

    expect(html).toContain('Instagram 연결');
  });

  it('includes facebook sdk script', () => {
    process.env.NEXT_PUBLIC_META_APP_ID = 'meta-public-id';
    const html = renderToStaticMarkup(<AccountPage />);

    expect(html).toContain('https://connect.facebook.net/en_US/sdk.js');
  });
});
