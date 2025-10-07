// @ts-check
'use strict';

const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'dist/**'],
  },
  // JS config
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off', // Handled by TypeScript
    },
  },
  // TypeScript config
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  // Next.js config
  ...compat.extends('plugin:@next/next/recommended'),
  ...compat.extends('plugin:@next/next/core-web-vitals'),
  
  // Custom rules
  {
    rules: {
      // Disable problematic rules
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for any types
      '@next/next/no-img-element': 'warn', // Warn instead of error for img elements
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-useless-escape': 'off', // Disable as it's causing false positives
    },
  },
  // Environment specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
];
