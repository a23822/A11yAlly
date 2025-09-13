# 프로젝트 할 일 목록 (Shipathon 2025 MVP)

## 목표: 최적화된 BM(기능 및 접근 제한 모델)을 적용하여 2주 내 출시

---

### [1단계] 인프라 및 결제 시스템 설정 (완료) ✅

- [x] **BaaS 설정 (Firebase):** 프로젝트 생성, Google 로그인 활성화.
- [x] **Stripe 설정:** 구독 상품(Product) 및 가격(Price ID) 정의 ('Pro Plan').
- [x] **RevenueCat 설정:** Stripe 연동, Entitlements('pro_access'), Offerings 설정.
- [x] **DB 스키마 설계:**
  - [x] `Users` 테이블: `user_id`, `email`, `is_pro`(boolean, 기본값 false).
  - [x] `Reports` 테이블: `report_id`, `user_id`, `url`, `timestamp`, `issues_json`.

---

### [2단계] 핵심 분석 기능 및 API 개발 (완료) ✅

- [x] **최소 분석 기능 구현:** Axe-core, Playwright, Gemini AI를 활용한 분석 엔진 개발.
- [x] **핵심 API 개발 (분석 실행):** `POST /api/analyze` 실행 후 결과를 `reports` 테이블에 저장.
- [x] **사용자 정보 저장 API 개발:** `POST /api/user`를 통해 로그인 시 사용자 정보 저장/업데이트.

---

### [3단계] BM 적용: 접근 제한 및 Paywall 연동 (진행 중) 🏃

- [x] **리포트 조회 API 및 기능 제한 구현:**
  - [x] `GET /api/report/:reportId`: 리포트 상세 내용을 조회하는 API 개발.
  - [x] **[BM 적용]** API 로직: `is_pro`가 false인 경우, `issues_json` 데이터 중 일부만 반환.
- [x] **프론트엔드 구현:**
  - [x] **리포트 페이지:** 분석 결과 UI 개발 (`report.html`).
  - [x] **[BM 적용]** 무료 사용자에게는 잘린 데이터를 보여주고, 하단에 "업그레이드하세요" CTA 배치.
- [ ] **히스토리 페이지 구현 및 접근 제한:**
  - [x] 과거 분석 기록 리스트 UI 개발 (`history.html`).
  - [x] **[BM 적용]** '내 분석 기록' 페이지 접근 시 `is_pro` 상태 확인 후 무료 사용자는 Paywall 표시.
- [ ] **Paywall 페이지:** 구독 유도 화면 및 Stripe Checkout 연결 구현.
- [ ] **[핵심] RevenueCat 웹훅 구현:**
  - [ ] 백엔드: RevenueCat 이벤트(결제 성공/취소 등)를 수신할 웹훅 API 개발.
  - [ ] 웹훅 수신 시 `Users` 테이블의 `is_pro` 상태를 안전하게 업데이트하는 로직 구현.

---

### [4단계] 테스트 및 배포 (예정)

- [ ] **통합 테스트 (매우 중요):**
  - [ ] **무료 사용자 시나리오:** 로그인 -> 분석 -> 제한된 리포트 확인 -> 히스토리 접근 시 Paywall 노출.
  - [ ] **결제 시나리오:** Paywall -> Stripe 결제(테스트 카드) -> RevenueCat 웹훅 수신 확인 -> `is_pro` 업데이트 확인.
  - [ ] **유료 사용자 시나리오:** 전체 리포트 확인 가능 -> 히스토리 접근 가능 확인.
- [ ] 버그 수정 및 QA.
- [ ] 프로덕션 배포.
