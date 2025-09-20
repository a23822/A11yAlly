import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [".svelte-kit/", "dist/", "build/", "node_modules/", "android/"],
  },

  // 1. 기본 JavaScript 규칙 적용
  js.configs.recommended,

  // 2. TypeScript 규칙 적용 (모든 파일에 대한 기본 파서 설정)
  ...tseslint.configs.recommended,

  // 3. Svelte 규칙 적용 (.svelte 파일 대상)
  // 이 설정이 TypeScript 규칙보다 뒤에 와서 .svelte 파일의 파서를 재정의합니다.
  ...svelte.configs["flat/recommended"],

  // 4. Prettier와 충돌 방지
  prettierConfig,

  // 5. Svelte 파일에 대한 TypeScript 파서 명시적 지정
  // Svelte 파일 내의 <script> 태그를 TypeScript로 분석하도록 설정합니다.
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 6. 전역 설정
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      // 동적 URL 사용을 허용합니다.
      "svelte/no-navigation-without-resolve": "off",
      // any 타입 사용에 대해 경고만 표시하도록 규칙을 완화합니다.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
