import { describe, expect, it } from 'vitest';
import { isProtectedPath } from '@/lib/protected-routes';

describe('isProtectedPath', () => {
  it('protects dashboard pages', () => {
    expect(isProtectedPath('/dashboard/account')).toBe(true);
  });

  it('protects api routes', () => {
    expect(isProtectedPath('/api/instagram/connect')).toBe(true);
  });

  it('does not protect landing page', () => {
    expect(isProtectedPath('/')).toBe(false);
  });
});
