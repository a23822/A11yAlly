import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.a23822.a11yally",
  appName: "A11yAlly",
  webDir: ".svelte-kit/output/client", // pnpm run build 후 생성되는 디렉토리
  server: {
    url: "https://a11yally-eq6t.onrender.com/", // 배포된 Render 주소
    cleartext: true,
  },
};

export default config;
