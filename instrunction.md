## 1. 목표 및 제약 조건 (Goals & Constraints)

- **목표:** 웹 접근성 분석 SaaS 개발 및 Shipathon 2025 참가.
- **마일스톤:** 2주 내 MVP 배포 (D-14).
- **필수 요구사항:**
  - Google 소셜 로그인 연동.
  - RevenueCat을 통한 구독 관리 및 수익화(BM) 구현.
  - Stripe 연동 (웹 결제 처리).
- **BM 전략 (최적화 버전):**
  - 무료: 점수 + 제한된 리포트(상위 N개 이슈만 표시) + 히스토리 접근 불가.
  - 유료(Pro): 전체 상세 리포트 + 히스토리 접근 가능.

## 2. 기술 스택 (Tech Stack)

- **언어:** TypeScript (Strict Mode 권장)
- **패키지 매니저:** pnpm
- **프론트엔드:** (Next.js 또는 React/Vite 등)
- **스타일링:** Tailwind CSS (Shadcn UI 등 컴포넌트 라이브러리 활용 권장)
- **BaaS:** Firebase (Authentication 및 Firestore) 또는 Supabase
- **수익화:** RevenueCat, Stripe

## 3. 개발 규칙 및 명령어 (Conventions & Commands)

- **TypeScript:** 모든 파일은 `.ts` 또는 `.tsx` 확장자를 사용합니다. `any` 사용을 지양하고 명확한 타입을 정의합니다.
- **환경 변수:** 민감한 정보는 반드시 `.env.local`에서 관리하고 Git에 포함시키지 않습니다. 클라이언트에 노출될 변수는 `NEXT_PUBLIC_` 접두사를 사용합니다 (Next.js 기준).

/
├── public/ # 정적 자산
├── src/
│ ├── app/ # 라우팅 및 페이지 레이아웃
│ │ ├── (auth)/login/ # 인증 관련 페이지
│ │ ├── (dashboard)/ # 인증된 사용자용 그룹 (dashboard, reports, settings)
│ │ ├── api/ # 백엔드 API 라우트
│ │ └── page.tsx # 랜딩 페이지
│ ├── components/ # 재사용 가능한 UI 컴포넌트
│ │ ├── ui/ # 기본 UI 요소 (Button, Input 등)
│ │ └── shared/ # 공통 컴포넌트 (Header, Footer)
│ ├── hooks/ # 커스텀 훅 (useAuth, useSubscriptionStatus)
│ ├── lib/ # 외부 라이브러리 초기화 및 헬퍼
│ │ ├── firebase.ts # Firebase 클라이언트 설정
│ │ ├── firebaseAdmin.ts # (선택) Firebase Admin SDK 설정 (백엔드용)
│ │ ├── revenuecat.ts # RevenueCat SDK 설정
│ │ └── utils.ts
│ ├── types/ # 글로벌 TypeScript 타입 정의
│
├── .env.local # 환경 변수
├── instruction.md # 본 문서
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
