import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import DashboardHeader from '@/components/dashboard/header';

vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: () => null,
  UserButton: () => <div data-testid="user-button">user</div>,
}));

describe('dashboard header', () => {
  it('renders profile menu anchor when enabled', () => {
    const html = renderToStaticMarkup(<DashboardHeader showUserMenu />);

    expect(html).toContain('프로필 메뉴');
  });
});
