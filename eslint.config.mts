import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import css from '@eslint/css';
import scssParser from 'postcss-scss';

export default tseslint.config(
  // --- 기본 설정 ---
  // 빌드 결과물인 dist 폴더와 node_modules는 검사에서 제외
  {
    ignores: ['dist/', 'node_modules/'],
  },

  // --- JavaScript & TypeScript 설정 ---
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      indent: ['error', 2],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },

  // --- JSON 설정 ---
  {
    files: ['**/*.json', '**/*.jsonc'],
    extends: [json.configs.recommended],
    rules: {
      'json/indent': ['error', 2],
    },
  },

  // --- CSS 설정 ---
  {
    files: ['**/*.css'],
    extends: [css.configs.recommended],
    rules: {
      'css/indent': ['error', 2],
      'css/no-empty-source': 'error',
    },
  },
  
  // --- SCSS 설정 ---
  {
    files: ['**/*.scss'],
    extends: [css.configs.recommended],
    languageOptions: {
      parser: scssParser,
    },
    rules: {
      'scss/indent': ['error', 2],
      'scss/no-empty-source': 'error',
    },
  }
);