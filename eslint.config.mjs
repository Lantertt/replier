import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
