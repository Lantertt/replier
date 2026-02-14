import { describe, expect, it } from 'vitest';

import SignInPage from '@/app/sign-in/[[...sign-in]]/page';
import SignUpPage from '@/app/sign-up/[[...sign-up]]/page';

describe('auth pages', () => {
  it('renders sign-in page synchronously', () => {
    const rendered = SignInPage();
    expect(rendered).not.toBeInstanceOf(Promise);
  });

  it('renders sign-up page synchronously', () => {
    const rendered = SignUpPage();
    expect(rendered).not.toBeInstanceOf(Promise);
  });
});
