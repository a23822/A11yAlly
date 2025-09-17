# 1. 목표 및 제약 조건 (Goals & Constraints)

- **목표:** 웹 접근성 분석 SaaS **A11yAlly** 개발 및 Shipathon 2025 참가.
- **마일스톤:** 2주 내 SvelteKit 기반의 MVP 배포.
- **필수 요구사항:**
  - Google 소셜 로그인 연동.
  - RevenueCat을 통한 구독 관리 및 수익화(BM) 구현.
- **BM 전략 (최종 MVP 버전):**
  - **무료**: 점수 + 제한된 리포트(상위 3개 이슈만 표시) + 히스토리 접근 불가.
  - **유료(Pro)**: 전체 상세 리포트 + 히스토리 접근 가능.
  - **결제 방식**: Stripe/Paddle의 국가 정책 및 테스트 환경 이슈로 인해, MVP에서는 실제 결제 대신 **'결제 시뮬레이션'** 방식을 채택. Paywall의 버튼 클릭 시, 서버가 RevenueCat REST API를 직접 호출하여 사용자에게 Pro 등급을 부여.

# 2. 기술 스택 (Tech Stack)

- **언어:** TypeScript
- **패키지 매니저:** pnpm
- **프레임워크:** SvelteKit (Svelte 5)
- **BaaS (백엔드 서비스):** Firebase (Authentication 및 Firestore)
- **구독 관리:** RevenueCat (REST API를 통한 Entitlement 관리)
- **결제 대행사:** Paddle (연동 계획)
- **자동화/AI:** Playwright, Google Gemini API
- **배포**: Render (Docker)

# 3. 폴더 구조 (SvelteKit 기준)

/
├── static/ # favicon, robots.txt 등 정적 파일
│
├── src/ # SvelteKit 소스코드
│ ├── lib/ # 앱 전역에서 사용하는 모듈
│ │ ├── server/ # 서버에서만 실행되는 코드 (Firebase Admin, Playwright 등)
│ │ ├── stores/ # 전역 상태 관리 (사용자 인증 스토어)
│ │ ├── types/ # TypeScript 타입 정의
│ │ └── styles/ # 공통 SCSS 파일
│ │
│ ├── routes/ # 파일 시스템 기반 라우팅
│ │ ├── +page.svelte # 홈페이지 UI
│ │ ├── report/ # 리포트 상세 페이지 라우트
│ │ │ ├── +page.server.ts # 페이지 로딩 전 서버 데이터 처리
│ │ │ └── +page.svelte # 리포트 상세 UI
│ │ │
│ │ └── api/ # API 엔드포인트
│ │ └─── analyze/
│ │ └─── └── +server.ts # /api/analyze API 로직
│ │
│ ├── .env # 환경 변수
│ ├── app.d.ts # 전역 타입 선언
│ ├── hooks.server.ts # 서버 요청을 가로채는 훅 (인증 처리)
│ └── svelte.config.js # SvelteKit 설정 파일
│
├── Dockerfile # Render 배포용 설정
└── package.json
