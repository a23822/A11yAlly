## 1. 목표 및 제약 조건 (Goals & Constraints)

- **목표:** 웹 접근성 분석 SaaS **A11yAlly** 개발 및 Shipathon 2025 참가.
- **마일스톤:** 2주 내 MVP 배포.
- **필수 요구사항:**
  - Google 소셜 로그인 연동.
  - RevenueCat을 통한 구독 관리 및 수익화(BM) 구현.
  - Stripe 연동 (웹 결제 처리).
- **BM 전략 (최적화 버전):**
  - 무료: 점수 + 제한된 리포트(상위 N개 이슈만 표시) + 히스토리 접근 불가.
  - 유료(Pro): 전체 상세 리포트 + 히스토리 접근 가능.

## 2. 기술 스택 (Tech Stack)

- **언어:** TypeScript
- **패키지 매니저:** pnpm
- **프론트엔드:** Vanilla TypeScript, SCSS
- **백엔드:** Node.js, Express
- **BaaS:** Firebase (Authentication 및 Firestore)
- **수익화:** RevenueCat, Stripe
- **자동화/AI:** Playwright, Google Gemini

## 3. 폴더 구조

/
├── public/ # 정적 자산 및 프론트엔드 소스
│ ├── css/ # (Sass 컴파일 결과)
│ ├── js/ # (TypeScript 컴파일 결과)
│ │
│ ├── home/ # 홈페이지
│ ├── report/ # 리포트 상세 페이지
│ ├── history/ # ★ 히스토리 페이지 추가 ★
│ └── scss/ # Sass 소스 파일
│
├── src/ # 백엔드 소스코드
│ ├── api/ # API 라우터
│ ├── controllers/ # API 로직
│ ├── lib/ # Firebase, 외부 라이브러리 설정
│ ├── middleware/ # 인증 등 미들웨어
│ ├── services/ # Playwright, Gemini 등 외부 서비스 로직
│ └── types/ # 타입 정의
│
├── .env.local # 환경 변수
├── package.json
└── tsconfig.json
