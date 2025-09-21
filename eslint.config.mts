import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // --- 무시할 파일 및 폴더 설정 ---
  {
    ignores: [".svelte-kit/", "build/", "dist/", "android/"],
  },

  // --- 기본 플러그인 설정 ---
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier, // Prettier는 항상 마지막에

  // --- 전역 설정 및 규칙 커스터마이징 ---
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 동적 URL 사용 허용
      "svelte/no-navigation-without-resolve": "off",
    },
  },

  // --- Svelte 파일 내 TypeScript 파서 명시 ---
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
];
