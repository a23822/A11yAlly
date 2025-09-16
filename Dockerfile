# 1. 베이스 이미지 선택 (Node.js 22 버전)
FROM node:22-slim

# 2. 시스템 패키지 업데이트 및 Playwright 종속성 설치
RUN apt-get update && apt-get install -yq libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libgbm1 libasound2

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. pnpm 설치
RUN npm install -g pnpm

# 5. 의존성 설치를 위해 package.json과 pnpm-lock.yaml 복사
COPY package.json pnpm-lock.yaml ./

# 6. pnpm으로 프로덕션 의존성만 설치
RUN pnpm install --prod

# 7. Playwright 브라우저 설치
RUN pnpm playwright install --with-deps

# 8. 나머지 소스 코드 복사
COPY . .

# 9. SvelteKit 프로젝트 빌드
RUN pnpm run build

# 10. 서버 시작을 위한 환경 변수 설정
ENV HOST=0.0.0.0
# Render가 포트를 자동으로 주입해주지만, 기본값을 설정해 둘 수 있습니다.
ENV PORT=10000

# 11. 서버 시작 명령어 설정 (SvelteKit + adapter-node 방식)
CMD [ "node", "build/index.js" ]