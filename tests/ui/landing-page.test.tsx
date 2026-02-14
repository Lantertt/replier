import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

describe('landing page', () => {
  it('shows signup-first guidance', () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('회원가입 후');
  });
});
