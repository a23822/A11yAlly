import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ["firebase"],
  },
  server: {
    headers: {
      // 이 헤더가 Google 로그인 팝업과의 통신을 허용합니다.
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
});
