# --- 1단계: 빌더(Builder) 스테이지 ---
# 프로젝트를 빌드하기 위한 환경을 구성합니다.
# 여기서는 devDependencies를 포함한 모든 패키지를 설치합니다.
FROM node:22-slim AS builder

# Playwright 브라우저 설치에 필요한 종속성 설치
RUN apt-get update && apt-get install -yq libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libgbm1 libasound2

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치 (vite 등 devDependencies 포함)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# SvelteKit 타입 파일을 생성합니다. (pnpm run build 이전에 필수)
RUN pnpm run prepare

# 소스 코드 복사
COPY . .

# Playwright 브라우저 설치
RUN pnpm playwright install --with-deps

# 프로젝트 빌드 (vite가 설치된 환경에서 실행)
RUN pnpm run build


# --- 2단계: 프로덕션(Production) 스테이지 ---
# 실제 서버를 실행하기 위한 최종 이미지를 만듭니다.
# 여기서는 프로덕션에 필요한 것들만 가져와서 이미지를 가볍게 만듭니다.
FROM node:22-slim

# Playwright 실행에 필요한 종속성만 설치
RUN apt-get update && apt-get install -yq libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libgbm1 libasound2

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 프로덕션 의존성만 설치 (dependencies)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# 빌더 스테이지에서 빌드된 결과물과 Playwright 브라우저만 복사
COPY --from=builder /app/build ./build
COPY --from=builder /root/.cache/ms-playwright ./ms-playwright

# 서버 시작을 위한 환경 변수 설정
ENV HOST=0.0.0.0
ENV PORT=10000
# Playwright가 복사된 브라우저를 찾도록 경로 설정
ENV PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright

# 서버 시작 명령어 (SvelteKit + adapter-node 방식)
CMD [ "node", "build/index.js" ]