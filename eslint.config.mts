import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [".svelte-kit/", "dist/", "build/", "node_modules/"],
  },

  // --- JavaScript & TypeScript 기본 설정 ---
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // --- Svelte 파일 설정 (가장 중요) ---
  ...svelte.configs["flat/recommended"], // 2. Svelte 추천 규칙 모음 적용

  // --- Prettier와 충돌 방지 설정 (가장 마지막에 위치) ---
  prettierConfig,

  // --- 개인 규칙 추가 (선택 사항) ---
  {
    rules: {
      // 여기에 필요한 규칙을 추가하거나 덮어쓸 수 있습니다.
      // 예: 'svelte/no-at-html-tags': 'off'
    },
  }
);
