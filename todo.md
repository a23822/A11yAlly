# 프로젝트 할 일 목록 (Shipathon 2025 MVP - D-14)

## 목표: 최적화된 BM(기능 및 접근 제한 모델)을 적용하여 2주 내 출시

---

### [1단계] 인프라 및 결제 시스템 설정 (Day 1-4) - Critical Path!

_결제 시스템 연동은 예상보다 오래 걸리므로 가장 먼저 완료해야 합니다._

- [ ] **BaaS 설정 (Firebase/Supabase):** 프로젝트 생성, Google 로그인 활성화.
- [ ] **Stripe 설정:** 구독 상품(Product) 및 가격(Price ID) 정의 ('Pro Plan').
- [ ] **RevenueCat 설정:** Stripe 연동, Entitlements('pro_access'), Offerings 설정.
- [ ] **DB 스키마 설계:**
  - [ ] `Users` 테이블: `user_id`, `email`, `is_pro`(boolean, 기본값 false).
  - [ ] `Reports` 테이블: `report_id`, `user_id`, `url`, `timestamp`, `score`, `issues_json`(전체 결과 저장).
- [ ] **[핵심] RevenueCat 웹훅 구현:**
  - [ ] 백엔드: RevenueCat 이벤트(결제 성공/취소 등)를 수신할 웹훅 API 개발.
  - [ ] 웹훅 수신 시 `Users` 테이블의 `is_pro` 상태를 안전하게 업데이트하는 로직 구현.
- [ ] **사용자 식별:** 로그인 시 BaaS UID를 RevenueCat App User ID로 동기화.

### [2단계] 핵심 분석 기능 및 API 개발 (Day 5-8)

_목표: 분석 엔진 구현 및 데이터 저장 구조 확립._

- [ ] **최소 분석 기능 구현:** Axe-core 등을 활용한 기본적인 접근성 자동 분석 엔진 개발.
- [ ] **핵심 API 개발 (분석 실행):**
  - [ ] `POST /api/analyze`: 분석 실행 후 결과를 `Reports` 테이블에 저장하는 API 개발 (**최적화 전략: 항상 저장**).
- [ ] **UI 기본 구현:** Stitch/Figma로 생성한 디자인 시안을 기반으로 핵심 컴포넌트(대시보드, 리포트 기본 틀) 개발.

### [3단계] BM 적용: 접근 제한 및 Paywall 연동 (Day 9-12)

_목표: 구독 상태(`is_pro`)에 따라 접근을 제어하고 UI에 반영._

- [ ] **리포트 조회 API 및 기능 제한 구현:**
  - [ ] `GET /api/report/{id}`: 리포트 상세 내용을 조회하는 API 개발.
  - [ ] **[BM 적용]** API 로직: `is_pro`가 false인 경우, `issues_json` 데이터 중 일부(예: 상위 5개)만 반환하고 나머지는 자르기(Truncate). 전체 이슈 개수는 별도 필드(`total_issues_count`)로 반환.
- [ ] **프론트엔드 구현:**
  - [ ] **리포트 페이지:** 분석 결과 UI 개발 (단일 버전).
  - [ ] **[BM 적용]** 무료 사용자에게는 잘린 데이터(5개)를 보여주고, 하단에 "전체 N개 이슈를 보려면 업그레이드하세요" CTA 배치.
  - [ ] **히스토리 페이지 구현 및 접근 제한:**
    - [ ] 과거 분석 기록 리스트 UI 개발.
    - [ ] **[BM 적용]** '내 분석 기록' 페이지 접근 시 `is_pro` 상태 확인. false일 경우 Paywall 페이지로 리디렉션.
  - [ ] **Paywall 페이지:** 구독 유도 화면 및 Stripe Checkout 연결 구현.

### [4단계] 테스트 및 배포 (Day 13-14)

_목표: 전체 흐름 검증 및 배포._

- [ ] **통합 테스트 (매우 중요):**
  - [ ] **무료 사용자 시나리오:** 로그인 -> 분석 -> 제한된 리포트(상위 5개) 확인 -> 히스토리 접근 시 Paywall 노출.
  - [ ] **결제 시나리오:** Paywall -> Stripe 결제(테스트 카드) -> RevenueCat 웹훅 수신 확인 -> `is_pro` 업데이트 확인.
  - [ ] **유료 사용자 시나리오:** 전체 리포트 확인 가능 -> 히스토리 접근 가능 확인.
- [ ] 버그 수정 및 QA.
- [ ] 프로덕션 배포.
